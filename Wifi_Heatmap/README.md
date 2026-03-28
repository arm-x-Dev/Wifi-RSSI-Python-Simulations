### 📝 Final Comprehensive `README.md`


# WiFi RSSI & CSI Python Simulations 📶

This repository provides an end-to-end framework for simulating, processing, and visualizing **WiFi Channel State Information (CSI)** and **RSSI** data. It transforms raw signal scans from CSV/TXT files into high-fidelity spatial heatmaps.

## 🚀 Overview
Wireless signal analysis is critical for indoor positioning and motion detection. This project uses Python to:
1. **Simulate CSI**: Modeling amplitude and phase at the subcarrier level.
2. **Predict Path Loss**: Using the Log-Distance Path Loss model to map signal decay.
3. **Data-Driven Mapping**: Processing real-world or simulated `.csv` and `.txt` signal scans into 2D heatmaps.

## 📂 Repository Structure
- **`CSI_Map/`**: 
    - `SimulatedCSI.ipynb`: Simulates complex-valued CSI ($H(f)$) across multiple OFDM subcarriers.
- **`Heatmap/`**: 
    - `Heatmap.ipynb`: Core visualization engine using theoretical propagation models.
- **`Wifi_Heatmap/`**: 
    - `Wifi_Heatmap_Databased.ipynb`: The data processor. It reads localized scans to generate intensity maps based on historical or captured signal data.
- **`Data/`**: 
    - `jumpingroom.csv`, `movingroom.csv`, `stillroom.csv`: Datasets representing signal variance under different human activities.
    - `scan1.txt`: Raw WiFi scan logs for database-driven mapping.

## 🔬 Technical Methodology

### 1. Propagation Modeling
The heatmaps utilize the **Log-Distance Path Loss Model**:
$$PL = PL_0 + 10n \log_{10}\left(\frac{d}{d_0}\right) + X_{\sigma}$$
This allows the simulation of different environments (Free space $n=2$, Indoor office $n=3$, etc.).

### 2. Data-Driven Heatmapping
The `Wifi_Heatmap_Databased` notebook performs the following:
- **Data Parsing**: Extracting RSSI values from structured CSV/TXT files.
- **Interpolation**: Filling in the gaps between discrete scan points to create a continuous heatmap.
- **Activity Analysis**: Comparing signal "noise" (variance) across different room states:
    - **Still**: High stability (Reference baseline).
    - **Moving**: Moderate fading due to human interference.
    - **Jumping**: High-frequency signal drops and multipath disruptions.

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
   Launch Jupyter and open `Wifi_Heatmap_Databased.ipynb` to process the provided datasets.

## 📊 Sample Visuals
The generated heatmaps use a color gradient to represent signal quality:
- **Warm Colors (Red/Yellow)**: High Signal Strength ($>-45$ dBm).
- **Cold Colors (Blue/Purple)**: Low Signal Strength ($<-80$ dBm) or high interference zones.

## 🤝 Contributing
Contributions for adding 3D signal modeling or real-time CSI capture integration are welcome!
