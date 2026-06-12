import { rawScanData } from './scan1_data.js';

// --- Global Simulation Constants ---
const SCALE_PX_TO_METER = 80; // 80 pixels = 1 meter
const REF_RSSI_1M = -35;      // Transmit power RSSI at 1m (dBm)
const DATASET_ROWS = 5;
const DATASET_COLS = 8;

const WALL_TYPES = {
  concrete: { color: '#8b929a', attenuation: 12, name: 'Concrete' },
  wood: { color: '#a05a2c', attenuation: 3, name: 'Wood' },
  metal: { color: '#00e5ff', attenuation: 20, name: 'Metal' },
  glass: { color: '#e0f7fa', attenuation: 2, name: 'Glass' }
};

// --- App State ---
const state = {
  mode: 'routers', // 'routers', 'walls', 'device', 'empirical'
  aps: [
    { id: 'ap-1', x: 150, y: 150, txPower: 20, freq: 2400, name: 'AP 1 (M21)', color: '#00e5ff' }
  ],
  activeApId: 'ap-1',
  walls: [],
  device: { x: 450, y: 280 },
  empiricalAp: 'RSSI_M21',
  ple: 2.5,
  showRays: true,
  showGridLabels: true,
  palette: 'coolwarm',
  resolution: 'normal',
  selectedMaterial: 'concrete',
  activeDragObject: null, // { type: 'ap'|'device', id: string|null }
  tempWallStart: null,    // { x, y }
  selectedWallIndex: -1,
  hoveredWallIndex: -1,
  empiricalData: [],      // Parsed scan1.txt data
  deviceRssiHistory: [],  // Historical telemetry array
  lastFpsUpdate: 0,
  fps: 0,
  frameCount: 0
};

// --- DOM Elements Cache ---
const el = {
  canvasContainer: document.getElementById('canvas-container'),
  heatmapCanvas: document.getElementById('heatmap-canvas'),
  interactionCanvas: document.getElementById('interaction-canvas'),
  statusMessage: document.getElementById('status-message'),
  valPle: document.getElementById('val-ple'),
  sliderPle: document.getElementById('slider-ple'),
  apListContainer: document.getElementById('ap-list-container'),
  btnAddAp: document.getElementById('btn-add-ap'),
  btnClearWalls: document.getElementById('btn-clear-walls'),
  btnReset: document.getElementById('btn-reset'),
  telemetryPanel: document.getElementById('telemetry-panel'),
  telAp: document.getElementById('tel-ap'),
  telRssi: document.getElementById('tel-rssi'),
  rssiFill: document.getElementById('rssi-fill'),
  miniChart: document.getElementById('mini-chart'),
  resNormal: document.getElementById('res-normal'),
  resHigh: document.getElementById('res-high'),
  toggleRays: document.getElementById('toggle-rays'),
  toggleGrid: document.getElementById('toggle-grid'),
  valFps: document.getElementById('val-fps'),
  valApCount: document.getElementById('val-ap-count'),
  valWallsCount: document.getElementById('val-walls-count'),
  empiricalPanel: document.getElementById('empirical-panel'),
  selectEmpiricalAp: document.getElementById('select-empirical-ap'),
  welcomeOverlay: document.getElementById('welcome-overlay'),
  btnEnterSandbox: document.getElementById('btn-enter-sandbox'),
  btnDeleteWall: document.getElementById('btn-delete-wall')
};

// Contexts
const hCtx = el.heatmapCanvas.getContext('2d');
const iCtx = el.interactionCanvas.getContext('2d');
const chartCtx = el.miniChart.getContext('2d');

// --- Helper Math Functions ---

// Get minimum distance from point P to line segment AB
function getDistanceToSegment(p, a, b) {
  const l2 = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  if (l2 === 0) return Math.sqrt((p.x - a.x) * (p.x - a.x) + (p.y - a.y) * (p.y - a.y));
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y)
  };
  const dx = p.x - proj.x;
  const dy = p.y - proj.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Draw the length of walls dynamically on layout
function drawLengthLabel(lengthMeters, x, y) {
  const text = `${lengthMeters.toFixed(1)} m`;
  iCtx.font = '11px Outfit';
  const textWidth = iCtx.measureText(text).width;
  
  iCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  iCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  iCtx.lineWidth = 1;
  
  const padX = 8;
  const padY = 4;
  const boxW = textWidth + padX * 2;
  const boxH = 18;
  
  iCtx.beginPath();
  iCtx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 4);
  iCtx.fill();
  iCtx.stroke();
  
  iCtx.fillStyle = '#ffffff';
  iCtx.textAlign = 'center';
  iCtx.textBaseline = 'middle';
  iCtx.fillText(text, x, y);
}

// Check line-segment intersection
function getLineIntersection(p1, p2, p3, p4) {
  const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (den === 0) return null;

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / den;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / den;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y)
    };
  }
  return null;
}

// Calculate intersection count and total attenuation
function getWallAttenuation(start, end) {
  let attenuationSum = 0;
  const intersections = [];

  for (const wall of state.walls) {
    const intersect = getLineIntersection(start, end, { x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 });
    if (intersect) {
      const wallAttr = WALL_TYPES[wall.material];
      // 5 GHz frequency has higher attenuation
      const multiplier = (state.aps.find(ap => ap.id === state.activeApId)?.freq === 5000) ? 1.5 : 1.0;
      attenuationSum += wallAttr.attenuation * multiplier;
      intersections.push(intersect);
    }
  }

  return { attenuation: attenuationSum, points: intersections };
}

// Get free space path loss based on frequency (MHz)
function getFSPL(d, freq) {
  // Free space path loss: 20 log10(d) + 20 log10(f) - 27.55
  // Convert distance in scale meters (prevent division by 0)
  const distMeters = Math.max(d / SCALE_PX_TO_METER, 0.5);
  return 20 * Math.log10(distMeters) + 20 * Math.log10(freq) - 27.55;
}

// Calculate RSSI from AP to a point
function calculateRSSI(ap, targetX, targetY) {
  const dx = targetX - ap.x;
  const dy = targetY - ap.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const fspl = getFSPL(distance, ap.freq);
  const wallEffects = getWallAttenuation({ x: ap.x, y: ap.y }, { x: targetX, y: targetY });

  // Transmit power + Antenna gain baseline - FSPL - Path Loss Exponent correction - Wall loss
  // If PLE is higher than free space (2.0), we subtract extra attenuation
  const pleOffset = 10 * (state.ple - 2.0) * Math.log10(Math.max(distance / SCALE_PX_TO_METER, 1.0));
  
  let rssi = ap.txPower + REF_RSSI_1M - fspl - pleOffset - wallEffects.attenuation;
  
  // Bound RSSI reasonably
  return Math.min(Math.max(rssi, -100), -30);
}

// Map RSSI value to Color palette HSL/RGB
function getColorForRSSI(rssi, palette) {
  // Normalize RSSI range from -95 (weak) to -30 (strong)
  const minRssi = -95;
  const maxRssi = -30;
  const normalized = Math.min(Math.max((rssi - minRssi) / (maxRssi - minRssi), 0), 1);

  if (palette === 'coolwarm') {
    // Blue (weak) to Gray (medium) to Red (strong)
    const r = Math.round(255 * normalized);
    const g = Math.round(200 * (1 - Math.abs(normalized - 0.5) * 2));
    const b = Math.round(255 * (1 - normalized));
    return [r, g, b];
  } else if (palette === 'viridis') {
    // Purple -> Blue -> Green -> Yellow
    const r = Math.round(253 * Math.pow(normalized, 2));
    const g = Math.round(225 * normalized);
    const b = Math.round(150 * (1 - normalized) + 50);
    return [r, g, b];
  } else {
    // Magma: Black -> Purple -> Orange -> Yellow
    const r = Math.round(255 * Math.pow(normalized, 1.5));
    const g = Math.round(200 * Math.pow(normalized, 3.0));
    const b = Math.round(150 * Math.pow(normalized, 4.0) + 15 * (1 - normalized));
    return [r, g, b];
  }
}

// --- Data Parsing ---
function parseEmpiricalData() {
  const rows = rawScanData.trim().split('\n');
  const parsed = [];
  
  // Skip header
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(',');
    parsed.push({
      tile: parseInt(cols[0]),
      RSSI_M21: parseInt(cols[2]),
      RSSI_A34: parseInt(cols[4]),
      RSSI_Home: parseInt(cols[6])
    });
  }

  // Average pairs of rows for each tile (like in the python code)
  const averaged = [];
  for (let i = 0; i < parsed.length; i += 2) {
    if (!parsed[i+1]) break;
    averaged.push({
      tile: parsed[i].tile,
      RSSI_M21: (parsed[i].RSSI_M21 + parsed[i+1].RSSI_M21) / 2,
      RSSI_A34: (parsed[i].RSSI_A34 + parsed[i+1].RSSI_A34) / 2,
      RSSI_Home: (parsed[i].RSSI_Home + parsed[i+1].RSSI_Home) / 2
    });
  }
  
  state.empiricalData = averaged;
}

// --- Rendering Engines ---

// Draw the real-time heatmap propagation
let offscreenCanvas = null;
let offscreenCtx = null;

function renderHeatmap() {
  const width = el.heatmapCanvas.width;
  const height = el.heatmapCanvas.height;

  if (width === 0 || height === 0) return;

  // Empirical mode rendering
  if (state.mode === 'empirical') {
    hCtx.fillStyle = '#0f172a';
    hCtx.fillRect(0, 0, width, height);

    const tileW = width / DATASET_COLS;
    const tileH = height / DATASET_ROWS;

    // Draw the 5x8 grid cells
    for (const row of state.empiricalData) {
      const tileIndex = row.tile - 1;
      const colIdx = tileIndex % DATASET_COLS;
      const rowIdx = Math.floor(tileIndex / DATASET_COLS);

      let rssiVal = 0;
      if (state.empiricalAp === 'RSSI_M21') rssiVal = row.RSSI_M21;
      else if (state.empiricalAp === 'RSSI_A34') rssiVal = row.RSSI_A34;
      else rssiVal = row.RSSI_Home;

      const rgb = getColorForRSSI(rssiVal, state.palette);
      hCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      hCtx.fillRect(colIdx * tileW, rowIdx * tileH, tileW - 1, tileH - 1);
    }
    return;
  }

  // standard / math simulation resolution
  const gridW = state.resolution === 'normal' ? 80 : 160;
  const gridH = state.resolution === 'normal' ? 50 : 100;

  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas');
  }
  if (offscreenCanvas.width !== gridW || offscreenCanvas.height !== gridH) {
    offscreenCanvas.width = gridW;
    offscreenCanvas.height = gridH;
    offscreenCtx = offscreenCanvas.getContext('2d');
  }

  const imgData = offscreenCtx.createImageData(gridW, gridH);
  const data = imgData.data;

  // Ratio mapping from offscreen coordinates to physical coordinates
  const scaleX = width / gridW;
  const scaleY = height / gridH;

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      // Find coordinates in layout
      const lx = (gx + 0.5) * scaleX;
      const ly = (gy + 0.5) * scaleY;

      // Compound RSSI is the max RSSI at that point from any active AP
      let maxRSSI = -100;
      if (state.aps.length > 0) {
        for (const ap of state.aps) {
          const rssi = calculateRSSI(ap, lx, ly);
          if (rssi > maxRSSI) maxRSSI = rssi;
        }
      }

      const rgb = getColorForRSSI(maxRSSI, state.palette);
      const pixelIdx = (gy * gridW + gx) * 4;
      data[pixelIdx] = rgb[0];
      data[pixelIdx + 1] = rgb[1];
      data[pixelIdx + 2] = rgb[2];
      data[pixelIdx + 3] = 255; // Alpha
    }
  }

  offscreenCtx.putImageData(imgData, 0, 0);

  // Clear and scale offscreen image onto main canvas with bilinear smoothing
  hCtx.clearRect(0, 0, width, height);
  hCtx.imageSmoothingEnabled = true;
  hCtx.drawImage(offscreenCanvas, 0, 0, width, height);
}

// Draw interaction layers (routers, client, wall outlines, connection vectors)
function renderInteraction() {
  const width = el.interactionCanvas.width;
  const height = el.interactionCanvas.height;

  iCtx.clearRect(0, 0, width, height);

  // Draw Tile Borders and labels in empirical mode
  if (state.mode === 'empirical') {
    const tileW = width / DATASET_COLS;
    const tileH = height / DATASET_ROWS;

    iCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    iCtx.lineWidth = 1;

    for (let r = 0; r <= DATASET_ROWS; r++) {
      iCtx.beginPath();
      iCtx.moveTo(0, r * tileH);
      iCtx.lineTo(width, r * tileH);
      iCtx.stroke();
    }
    for (let c = 0; c <= DATASET_COLS; c++) {
      iCtx.beginPath();
      iCtx.moveTo(c * tileW, 0);
      iCtx.lineTo(c * tileW, height);
      iCtx.stroke();
    }

    if (state.showGridLabels) {
      iCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      iCtx.font = '12px Outfit';
      iCtx.textAlign = 'center';
      iCtx.textBaseline = 'middle';

      for (let tileIdx = 0; tileIdx < 40; tileIdx++) {
        const c = tileIdx % DATASET_COLS;
        const r = Math.floor(tileIdx / DATASET_COLS);
        const dataRow = state.empiricalData[Math.floor(tileIdx / 2)];
        
        let rssiText = 'N/A';
        if (dataRow) {
          let rssiVal = 0;
          if (state.empiricalAp === 'RSSI_M21') rssiVal = dataRow.RSSI_M21;
          else if (state.empiricalAp === 'RSSI_A34') rssiVal = dataRow.RSSI_A34;
          else rssiVal = dataRow.RSSI_Home;
          rssiText = `${rssiVal} dBm`;
        }

        iCtx.fillText(`Tile ${tileIdx + 1}`, c * tileW + tileW/2, r * tileH + tileH/2 - 8);
        iCtx.fillText(rssiText, c * tileW + tileW/2, r * tileH + tileH/2 + 10);
      }
    }
    return;
  }

  // Draw Grid helper lines (Standard resolution UI overlay)
  if (state.showGridLabels) {
    iCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    iCtx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      iCtx.beginPath();
      iCtx.moveTo(x, 0);
      iCtx.lineTo(x, height);
      iCtx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      iCtx.beginPath();
      iCtx.moveTo(0, y);
      iCtx.lineTo(width, y);
      iCtx.stroke();
    }
  }

  // Draw existing walls
  for (let i = 0; i < state.walls.length; i++) {
    const wall = state.walls[i];
    const isSelected = i === state.selectedWallIndex;
    const isHovered = i === state.hoveredWallIndex;
    const styleAttr = WALL_TYPES[wall.material];

    // Highlight selected wall first
    if (isSelected) {
      iCtx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      iCtx.lineWidth = wall.material === 'concrete' ? 14 : 12;
      iCtx.lineCap = 'round';
      iCtx.beginPath();
      iCtx.moveTo(wall.x1, wall.y1);
      iCtx.lineTo(wall.x2, wall.y2);
      iCtx.stroke();
    }

    iCtx.strokeStyle = styleAttr.color;
    iCtx.lineWidth = wall.material === 'concrete' ? 6 : 4;
    iCtx.lineCap = 'round';
    iCtx.beginPath();
    iCtx.moveTo(wall.x1, wall.y1);
    iCtx.lineTo(wall.x2, wall.y2);
    iCtx.stroke();

    // Draw length label if selected or hovered
    if (isSelected || isHovered) {
      const len = Math.sqrt(Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2)) / SCALE_PX_TO_METER;
      const midX = (wall.x1 + wall.x2) / 2;
      const midY = (wall.y1 + wall.y2) / 2;
      drawLengthLabel(len, midX, midY);
    }
  }

  // Draw active drawing wall preview line
  if (state.mode === 'walls' && state.tempWallStart) {
    const activeMaterialAttr = WALL_TYPES[state.selectedMaterial];
    iCtx.strokeStyle = activeMaterialAttr.color;
    iCtx.lineWidth = 4;
    iCtx.setLineDash([6, 4]);
    iCtx.beginPath();
    iCtx.moveTo(state.tempWallStart.x, state.tempWallStart.y);
    iCtx.lineTo(state.device.x, state.device.y); // Use current mouse coordinates stored in device
    iCtx.stroke();
    iCtx.setLineDash([]);

    // Draw dynamic length of wall being drawn
    const len = Math.sqrt(Math.pow(state.device.x - state.tempWallStart.x, 2) + Math.pow(state.device.y - state.tempWallStart.y, 2)) / SCALE_PX_TO_METER;
    const midX = (state.tempWallStart.x + state.device.x) / 2;
    const midY = (state.tempWallStart.y + state.device.y) / 2;
    drawLengthLabel(len, midX, midY);
  }

  // Draw connection ray traces showing attenuation
  if (state.showRays && state.mode === 'device' && state.aps.length > 0) {
    for (const ap of state.aps) {
      const isConnected = ap.id === getBestConnectedAP()?.id;
      const wallEffects = getWallAttenuation({ x: ap.x, y: ap.y }, state.device);

      iCtx.strokeStyle = isConnected ? 'rgba(0, 229, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)';
      iCtx.lineWidth = isConnected ? 2 : 1;
      iCtx.setLineDash(isConnected ? [] : [4, 4]);

      iCtx.beginPath();
      iCtx.moveTo(ap.x, ap.y);
      iCtx.lineTo(state.device.x, state.device.y);
      iCtx.stroke();
      iCtx.setLineDash([]);

      // Draw red dots indicating ray wall intersections
      for (const pt of wallEffects.points) {
        iCtx.fillStyle = '#ff1744';
        iCtx.beginPath();
        iCtx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        iCtx.fill();
        iCtx.strokeStyle = 'white';
        iCtx.lineWidth = 1;
        iCtx.stroke();
      }
    }
  }

  // Draw Access Points (Routers)
  for (const ap of state.aps) {
    const isActive = ap.id === state.activeApId;

    // Glowing AP range ring
    iCtx.strokeStyle = ap.color;
    iCtx.lineWidth = isActive ? 2 : 1;
    iCtx.beginPath();
    iCtx.arc(ap.x, ap.y, isActive ? 45 : 30, 0, Math.PI * 2);
    iCtx.stroke();

    // Pulse animations
    if (isActive) {
      const pulseRadius = 30 + (Date.now() % 1000) / 1000 * 40;
      iCtx.strokeStyle = `rgba(${hexToRgb(ap.color)}, ${1 - (Date.now() % 1000) / 1000})`;
      iCtx.beginPath();
      iCtx.arc(ap.x, ap.y, pulseRadius, 0, Math.PI * 2);
      iCtx.stroke();
    }

    // Outer node border
    iCtx.fillStyle = '#0f172a';
    iCtx.beginPath();
    iCtx.arc(ap.x, ap.y, 16, 0, Math.PI * 2);
    iCtx.fill();
    iCtx.strokeStyle = ap.color;
    iCtx.lineWidth = 3;
    iCtx.stroke();

    // AP Icon symbol
    iCtx.fillStyle = ap.color;
    iCtx.font = '12px Outfit';
    iCtx.textAlign = 'center';
    iCtx.textBaseline = 'middle';
    iCtx.fillText('📶', ap.x, ap.y);
  }

  // Draw Client Device (Receiver)
  if (state.mode === 'device') {
    // Glow ring
    iCtx.strokeStyle = 'var(--accent-cyan)';
    iCtx.lineWidth = 2;
    iCtx.beginPath();
    iCtx.arc(state.device.x, state.device.y, 14, 0, Math.PI * 2);
    iCtx.stroke();

    // Center dot
    iCtx.fillStyle = '#0f172a';
    iCtx.beginPath();
    iCtx.arc(state.device.x, state.device.y, 10, 0, Math.PI * 2);
    iCtx.fill();
    iCtx.strokeStyle = 'white';
    iCtx.lineWidth = 2;
    iCtx.stroke();

    iCtx.fillStyle = 'var(--accent-cyan)';
    iCtx.font = '10px Outfit';
    iCtx.textAlign = 'center';
    iCtx.textBaseline = 'middle';
    iCtx.fillText('📱', state.device.x, state.device.y);
  }
}

// Convert Hex to RGB helpers
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

// Get the router providing the strongest signal to the device
function getBestConnectedAP() {
  if (state.aps.length === 0) return null;
  let bestAp = null;
  let highestRssi = -100;
  for (const ap of state.aps) {
    const rssi = calculateRSSI(ap, state.device.x, state.device.y);
    if (rssi > highestRssi) {
      highestRssi = rssi;
      bestAp = ap;
    }
  }
  return bestAp;
}

// --- Live Telemetry Line Chart ---
function renderTelemetryChart() {
  const width = el.miniChart.width;
  const height = el.miniChart.height;

  chartCtx.clearRect(0, 0, width, height);

  if (state.deviceRssiHistory.length < 2) return;

  chartCtx.strokeStyle = 'var(--accent-cyan)';
  chartCtx.lineWidth = 2;
  chartCtx.beginPath();

  const stepX = width / (state.deviceRssiHistory.length - 1);
  const minVal = -95;
  const maxVal = -30;

  for (let i = 0; i < state.deviceRssiHistory.length; i++) {
    const val = state.deviceRssiHistory[i];
    const x = i * stepX;
    // Normalize RSSI value to chart height
    const normalizedY = (val - minVal) / (maxVal - minVal);
    const y = height - (normalizedY * (height - 10) + 5);

    if (i === 0) chartCtx.moveTo(x, y);
    else chartCtx.lineTo(x, y);
  }
  chartCtx.stroke();
}

// Update text readouts in sidebar
function updateTelemetryText() {
  if (state.mode !== 'device') {
    el.telemetryPanel.style.opacity = '0.3';
    el.telemetryPanel.style.pointerEvents = 'none';
    return;
  }
  el.telemetryPanel.style.opacity = '1';
  el.telemetryPanel.style.pointerEvents = 'auto';

  const bestAp = getBestConnectedAP();
  if (!bestAp) {
    el.telAp.textContent = 'None';
    el.telRssi.textContent = '-100 dBm';
    el.rssiFill.style.width = '0%';
    return;
  }

  const rssi = calculateRSSI(bestAp, state.device.x, state.device.y);
  el.telAp.textContent = bestAp.name;
  el.telRssi.textContent = `${Math.round(rssi)} dBm`;

  // Scale width of progress bar (from 0% at -95dBm to 100% at -30dBm)
  const percent = Math.min(Math.max(((rssi - (-95)) / (-30 - (-95))) * 100, 0), 100);
  el.rssiFill.style.width = `${percent}%`;

  // Push telemetry chart dataset
  state.deviceRssiHistory.push(rssi);
  if (state.deviceRssiHistory.length > 50) {
    state.deviceRssiHistory.shift();
  }
  renderTelemetryChart();
}

// --- Active AP List Sidebar Panel ---
function renderApListPanel() {
  el.apListContainer.innerHTML = '';
  el.valApCount.textContent = state.aps.length;
  el.valWallsCount.textContent = state.walls.length;

  state.aps.forEach(ap => {
    const item = document.createElement('div');
    item.className = `ap-item ${ap.id === state.activeApId ? 'active' : ''}`;
    
    item.innerHTML = `
      <div class="ap-item-header">
        <span class="ap-name">
          <span class="ap-color-indicator" style="background-color: ${ap.color};"></span>
          ${ap.name}
        </span>
        <button class="btn-small btn-remove-ap" data-ap-id="${ap.id}" style="border-color: var(--accent-red); color: var(--accent-red);">Remove</button>
      </div>
      <div class="slider-container" style="margin-bottom: 8px;">
        <div class="slider-label">
          <span>TX Power (dBm)</span>
          <span>${ap.txPower} dBm</span>
        </div>
        <input type="range" class="slider-ap-power" data-ap-id="${ap.id}" min="5" max="30" value="${ap.txPower}">
      </div>
      <div class="slider-container">
        <div class="slider-label">
          <span>Frequency Band</span>
          <span>${ap.freq === 2400 ? '2.4 GHz' : '5.0 GHz'}</span>
        </div>
        <select class="select-ap-freq" data-ap-id="${ap.id}">
          <option value="2400" ${ap.freq === 2400 ? 'selected' : ''}>2.4 GHz (Long Range)</option>
          <option value="5000" ${ap.freq === 5000 ? 'selected' : ''}>5.0 GHz (High Loss)</option>
        </select>
      </div>
    `;

    // Click AP item to select active
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove-ap') || e.target.closest('input') || e.target.closest('select')) return;
      state.activeApId = ap.id;
      renderApListPanel();
      renderInteraction();
    });

    el.apListContainer.appendChild(item);
  });

  // Attach event listeners to dynamic list inputs
  document.querySelectorAll('.slider-ap-power').forEach(input => {
    input.addEventListener('input', (e) => {
      const apId = e.target.getAttribute('data-ap-id');
      const ap = state.aps.find(a => a.id === apId);
      if (ap) {
        ap.txPower = parseInt(e.target.value);
        e.target.closest('.slider-container').querySelector('.slider-label span:last-child').textContent = `${ap.txPower} dBm`;
        renderHeatmap();
        updateTelemetryText();
      }
    });
  });

  document.querySelectorAll('.select-ap-freq').forEach(select => {
    select.addEventListener('change', (e) => {
      const apId = e.target.getAttribute('data-ap-id');
      const ap = state.aps.find(a => a.id === apId);
      if (ap) {
        ap.freq = parseInt(e.target.value);
        renderHeatmap();
        updateTelemetryText();
        renderApListPanel();
      }
    });
  });

  document.querySelectorAll('.btn-remove-ap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const apId = e.target.getAttribute('data-ap-id');
      state.aps = state.aps.filter(ap => ap.id !== apId);
      if (state.activeApId === apId && state.aps.length > 0) {
        state.activeApId = state.aps[0].id;
      }
      renderApListPanel();
      renderHeatmap();
      renderInteraction();
      updateTelemetryText();
    });
  });
}

// --- Coordinate Conversions ---
function getCanvasMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
    y: ((evt.clientY - rect.top) / rect.height) * canvas.height
  };
}

// --- Interaction Event Listeners ---
function initCanvasEvents() {
  let isDrawing = false;
  let isDragging = false;

  el.interactionCanvas.addEventListener('mousedown', (e) => {
    const mousePos = getCanvasMousePos(el.interactionCanvas, e);

    if (state.mode === 'routers') {
      // Check if clicking existing AP to drag
      for (const ap of state.aps) {
        const dx = mousePos.x - ap.x;
        const dy = mousePos.y - ap.y;
        if (Math.sqrt(dx*dx + dy*dy) < 20) {
          state.activeDragObject = { type: 'ap', id: ap.id };
          state.activeApId = ap.id;
          isDragging = true;
          renderApListPanel();
          return;
        }
      }
      // Click empty space to add new AP
      if (state.aps.length < 5) {
        const id = `ap-${Date.now()}`;
        const newAp = {
          id,
          x: mousePos.x,
          y: mousePos.y,
          txPower: 20,
          freq: 2400,
          name: `AP ${state.aps.length + 1}`,
          color: getRandomColor()
        };
        state.aps.push(newAp);
        state.activeApId = id;
        renderApListPanel();
        renderHeatmap();
        renderInteraction();
      }
    } else if (state.mode === 'walls') {
      // Check if clicking near an existing wall to select it instead of drawing
      let clickedWallIdx = -1;
      for (let i = 0; i < state.walls.length; i++) {
        const w = state.walls[i];
        const dist = getDistanceToSegment(mousePos, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
        if (dist < 12) {
          clickedWallIdx = i;
          break;
        }
      }

      if (clickedWallIdx !== -1) {
        state.selectedWallIndex = clickedWallIdx;
        el.btnDeleteWall.style.display = 'block';
        renderInteraction();
        return;
      }

      // Clear selection if clicking empty space
      state.selectedWallIndex = -1;
      el.btnDeleteWall.style.display = 'none';

      isDrawing = true;
      state.tempWallStart = { x: mousePos.x, y: mousePos.y };
    } else if (state.mode === 'device') {
      // Check if clicking device to drag
      const dx = mousePos.x - state.device.x;
      const dy = mousePos.y - state.device.y;
      if (Math.sqrt(dx*dx + dy*dy) < 20) {
        state.activeDragObject = { type: 'device', id: null };
        isDragging = true;
      }
    }
  });

  el.interactionCanvas.addEventListener('mousemove', (e) => {
    const mousePos = getCanvasMousePos(el.interactionCanvas, e);

    if (isDragging && state.activeDragObject) {
      if (state.activeDragObject.type === 'ap') {
        const ap = state.aps.find(a => a.id === state.activeDragObject.id);
        if (ap) {
          ap.x = mousePos.x;
          ap.y = mousePos.y;
        }
      } else if (state.activeDragObject.type === 'device') {
        state.device.x = mousePos.x;
        state.device.y = mousePos.y;
      }
      renderHeatmap();
      renderInteraction();
      updateTelemetryText();
    } else if (isDrawing && state.mode === 'walls') {
      // Store current drawing coordinates to draw line preview
      state.device.x = mousePos.x;
      state.device.y = mousePos.y;
      renderInteraction();
    } else if (state.mode === 'walls') {
      // Check for hovering near a wall to show length label
      let hoveredIdx = -1;
      for (let i = 0; i < state.walls.length; i++) {
        const w = state.walls[i];
        const dist = getDistanceToSegment(mousePos, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
        if (dist < 12) {
          hoveredIdx = i;
          break;
        }
      }
      if (state.hoveredWallIndex !== hoveredIdx) {
        state.hoveredWallIndex = hoveredIdx;
        renderInteraction();
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (isDragging) {
      isDragging = false;
      state.activeDragObject = null;
    }
    if (isDrawing && state.mode === 'walls' && state.tempWallStart) {
      const mousePos = getCanvasMousePos(el.interactionCanvas, e);
      // Ensure the wall has a physical length
      const dx = mousePos.x - state.tempWallStart.x;
      const dy = mousePos.y - state.tempWallStart.y;
      if (Math.sqrt(dx*dx + dy*dy) > 10) {
        state.walls.push({
          x1: state.tempWallStart.x,
          y1: state.tempWallStart.y,
          x2: mousePos.x,
          y2: mousePos.y,
          material: state.selectedMaterial
        });
        renderHeatmap();
        updateTelemetryText();
      }
      isDrawing = false;
      state.tempWallStart = null;
      renderApListPanel();
      renderInteraction();
    }
  });
}

// Get Random unique colors for multiple AP placement
function getRandomColor() {
  const colors = ['#00e5ff', '#ff007f', '#39ff14', '#ffff00', '#9d00ff'];
  const index = state.aps.length % colors.length;
  return colors[index];
}

// Resizes canvas dynamically to fill layout space while maintaining state positioning
function resizeCanvas() {
  const containerW = el.canvasContainer.clientWidth;
  const containerH = el.canvasContainer.clientHeight;

  // Store scale mapping offsets
  const prevW = el.interactionCanvas.width || containerW;
  const prevH = el.interactionCanvas.height || containerH;

  el.heatmapCanvas.width = containerW;
  el.heatmapCanvas.height = containerH;
  el.interactionCanvas.width = containerW;
  el.interactionCanvas.height = containerH;

  // Scale APs and Device to fit scaled Canvas dimensions
  const factorX = containerW / prevW;
  const factorY = containerH / prevH;

  state.aps.forEach(ap => {
    ap.x *= factorX;
    ap.y *= factorY;
  });
  state.device.x *= factorX;
  state.device.y *= factorY;
  state.walls.forEach(wall => {
    wall.x1 *= factorX;
    wall.y1 *= factorY;
    wall.x2 *= factorX;
    wall.y2 *= factorY;
  });

  renderHeatmap();
  renderInteraction();
}

// --- Menu Controls listeners ---
function initPanelListeners() {
  // Mode selection
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      const modeBtn = e.target.closest('.mode-btn');
      modeBtn.classList.add('active');
      state.mode = modeBtn.getAttribute('data-mode');

      // Reset selection when changing modes
      state.selectedWallIndex = -1;
      state.hoveredWallIndex = -1;
      el.btnDeleteWall.style.display = 'none';

      // Update instructions
      if (state.mode === 'routers') {
        el.statusMessage.textContent = 'Mode: Place Access Points. Click on the canvas to place a router, or drag to move them.';
        el.empiricalPanel.style.display = 'none';
        el.apSettingsPanel.style.display = 'flex';
      } else if (state.mode === 'walls') {
        el.statusMessage.textContent = 'Mode: Draw/Delete Walls. Click-drag to draw. Click on a wall to select and delete it (or press Del/Backspace).';
        el.empiricalPanel.style.display = 'none';
        el.apSettingsPanel.style.display = 'none';
      } else if (state.mode === 'device') {
        el.statusMessage.textContent = 'Mode: Walk Client. Drag the mobile device around the room to inspect real-time connection telemetry.';
        el.empiricalPanel.style.display = 'none';
        el.apSettingsPanel.style.display = 'none';
      } else if (state.mode === 'empirical') {
        el.statusMessage.textContent = 'Mode: Real Scan Data. Reviewing signal strength matching measured baseline values from scan1.txt.';
        el.empiricalPanel.style.display = 'flex';
        el.apSettingsPanel.style.display = 'none';
      }

      renderHeatmap();
      renderInteraction();
      updateTelemetryText();
    });
  });

  // PLE slider
  el.sliderPle.addEventListener('input', (e) => {
    state.ple = parseFloat(e.target.value);
    el.valPle.textContent = state.ple.toFixed(1);
    renderHeatmap();
    updateTelemetryText();
  });

  // Wall material selectors
  document.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
      const matBtn = e.target.closest('.material-btn');
      matBtn.classList.add('active');
      state.selectedMaterial = matBtn.getAttribute('data-material');
    });
  });

  // Empirical AP selector
  el.selectEmpiricalAp.addEventListener('change', (e) => {
    state.empiricalAp = e.target.value;
    renderHeatmap();
    renderInteraction();
  });

  // Action buttons
  el.btnAddAp.addEventListener('click', () => {
    if (state.aps.length >= 5) return;
    const id = `ap-${Date.now()}`;
    state.aps.push({
      id,
      x: el.interactionCanvas.width / 2 + (Math.random() - 0.5) * 100,
      y: el.interactionCanvas.height / 2 + (Math.random() - 0.5) * 100,
      txPower: 20,
      freq: 2400,
      name: `AP ${state.aps.length + 1}`,
      color: getRandomColor()
    });
    state.activeApId = id;
    renderApListPanel();
    renderHeatmap();
    renderInteraction();
  });

  el.btnClearWalls.addEventListener('click', () => {
    state.walls = [];
    state.selectedWallIndex = -1;
    state.hoveredWallIndex = -1;
    el.btnDeleteWall.style.display = 'none';
    renderApListPanel();
    renderHeatmap();
    renderInteraction();
    updateTelemetryText();
  });

  el.btnReset.addEventListener('click', () => {
    state.walls = [];
    state.selectedWallIndex = -1;
    state.hoveredWallIndex = -1;
    el.btnDeleteWall.style.display = 'none';
    state.aps = [{ id: 'ap-1', x: 150, y: 150, txPower: 20, freq: 2400, name: 'AP 1 (M21)', color: '#00e5ff' }];
    state.activeApId = 'ap-1';
    state.device = { x: 450, y: 280 };
    state.ple = 2.5;
    el.sliderPle.value = 2.5;
    el.valPle.textContent = '2.5';
    state.deviceRssiHistory = [];
    renderApListPanel();
    renderHeatmap();
    renderInteraction();
    updateTelemetryText();
  });

  // Viewport action overlays
  el.toggleRays.addEventListener('click', () => {
    state.showRays = !state.showRays;
    el.toggleRays.classList.toggle('active', state.showRays);
    renderInteraction();
  });

  el.toggleGrid.addEventListener('click', () => {
    state.showGridLabels = !state.showGridLabels;
    el.toggleGrid.classList.toggle('active', state.showGridLabels);
    renderInteraction();
  });

  // Heatmap palette selections
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
      const palBtn = e.target.closest('.palette-btn');
      palBtn.classList.add('active');
      state.palette = palBtn.getAttribute('data-palette');
      renderHeatmap();
    });
  });

  // Resolution selectors
  el.resNormal.addEventListener('click', () => {
    el.resNormal.classList.add('active');
    el.resHigh.classList.remove('active');
    state.resolution = 'normal';
    renderHeatmap();
  });

  el.resHigh.addEventListener('click', () => {
    el.resHigh.classList.add('active');
    el.resNormal.classList.remove('active');
    state.resolution = 'high';
    renderHeatmap();
  });

  el.btnDeleteWall.addEventListener('click', deleteSelectedWall);
}

// Remove the selected wall from layout
function deleteSelectedWall() {
  if (state.selectedWallIndex === -1) return;
  state.walls.splice(state.selectedWallIndex, 1);
  state.selectedWallIndex = -1;
  state.hoveredWallIndex = -1;
  el.btnDeleteWall.style.display = 'none';
  renderHeatmap();
  renderInteraction();
  updateTelemetryText();
  renderApListPanel(); // Recount walls
}

// --- FPS Counter and Animation Loop ---
function animationLoop(timestamp) {
  state.frameCount++;
  if (timestamp - state.lastFpsUpdate >= 1000) {
    state.fps = state.frameCount;
    state.frameCount = 0;
    state.lastFpsUpdate = timestamp;
    el.valFps.textContent = state.fps;
  }

  // Animate AP glow rings inside the loop
  renderInteraction();

  requestAnimationFrame(animationLoop);
}

// --- Initialization ---
function init() {
  parseEmpiricalData();
  
  // Set up chart dimensions
  el.miniChart.width = el.miniChart.parentElement.clientWidth;
  el.miniChart.height = 70;

  // Onboarding Welcome Overlay dismiss handler
  el.btnEnterSandbox.addEventListener('click', () => {
    el.welcomeOverlay.classList.add('fade-out');
  });

  initCanvasEvents();
  initPanelListeners();

  // Delete wall keyboard listener
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedWallIndex !== -1) {
      deleteSelectedWall();
    }
  });
  
  window.addEventListener('resize', resizeCanvas);
  // Initial sizes
  resizeCanvas();

  renderApListPanel();
  updateTelemetryText();

  // Highlight toggles in active status
  el.toggleRays.classList.add('active');
  el.toggleGrid.classList.add('active');

  requestAnimationFrame(animationLoop);
}

document.addEventListener('DOMContentLoaded', init);
