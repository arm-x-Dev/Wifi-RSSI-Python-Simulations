# WiFi RSSI & CSI Python Simulations 📶

This repository provides a framework for simulating and visualizing **WiFi Channel State Information (CSI)** and **RSSI** data. It models signal propagation, multipath effects, and environmental interference to create high-fidelity spatial heatmaps.

## 🚀 Overview
Wireless signals don't just travel in a straight line; they bounce, fade, and are absorbed by the environment. This project uses Python to:
1. **Simulate CSI**: Modeling amplitude and phase at the subcarrier level.
2. **Model Path Loss**: Using the Log-Distance Path Loss model to predict signal decay.
3. **Generate Heatmaps**: Visualizing signal "dead zones" and coverage areas in 2D space.

## 📂 Repository Structure
- **`CSI_Map/`**: 
    - `SimulatedCSI.ipynb`: Simulates complex-valued CSI ($H(f)$) across multiple OFDM subcarriers.
- **`Heatmap/`**: 
    - `Heatmap.ipynb`: Core visualization engine. It calculates signal strength (RSSI) across a grid and renders 2D heatmaps.
    - `Data/`: CSV datasets representing different room dynamics (**Still**, **Moving**, and **Jumping** states).
- **`Wifi_Heatmap/`**: 
    - `Wifi_Heatmap_Databased.ipynb`: Maps real-world RSSI scans into spatial visualizations.

## 🔬 Technical Methodology

### 1. Log-Distance Path Loss Model
The heatmaps are generated based on the standard propagation model:
$$PL = PL_0 + 10n \log_{10}\left(\frac{d}{d_0}\right) + X_{\sigma}$$
Where:
- $PL$: Total path loss.
- $n$: Path loss exponent (e.g., 2.0 for free space, 3.0+ for indoors).
- $d$: Distance from the Access Point (AP).
- $X_{\sigma}$: Gaussian noise (shadowing).

### 2. Environmental Scenarios
The project analyzes how human activity impacts signal variance:
| Scenario | Description | Signal Impact |
| :--- | :--- | :--- |
| **Still** | Empty or static room. | High stability, low variance ($X_{\sigma} \approx 0$). |
| **Moving** | Walking through the space. | Moderate fading and phase shifts. |
| **Jumping** | Intense localized movement. | High burst interference and rapid RSSI drops. |

## 🛠️ Installation & Setup

1. **Clone the Repo:**
   ```bash
   git clone [https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git](https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git)
   cd Wifi-RSSI-Python-Simulations
   ```
2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the Notebooks:**
   Launch Jupyter and open `Heatmap.ipynb` to see the signal propagation plots.

## 📊 Sample Heatmap Visuals
The notebooks produce color-coded maps where:
- **Red/Yellow**: Strong signal ($>-40$ dBm) near the Access Point.
- **Green/Blue**: Weakening signal ($<-70$ dBm) as distance or obstacles increase.

## 🤝 Contributing
Open to PRs! Future goals include adding **Ray Tracing** for more realistic indoor multipath simulations.
