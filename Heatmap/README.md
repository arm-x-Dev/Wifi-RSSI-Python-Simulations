# Wi-Fi CSI & RSSI Heatmap Visualization (CSV Data)

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge&logo=python&logoColor=white)

This subdirectory contains the visualization engine for plotting and analyzing Wi-Fi Channel State Information (CSI) and Received Signal Strength Indication (RSSI) data imported from logged CSV files.

Unlike simulations, this module is built to ingest structural logs (from files like ESP32-CSI-Tool output) to visualize spatial and temporal channel variance in real or simulated rooms.

---

## Overview
The core of this module is the [Heatmap.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/Heatmap.ipynb) Jupyter Notebook. It loads and visualizes structural CSI data from the `Data/` folder across three environmental datasets:

1. **Still Room (`Data/stillroom.csv`)**: Data recorded in an empty or static room. Features highly stable amplitude, flat phase distributions, and steady RSSI.
2. **Moving Room (`Data/movingroom.csv`)**: Data recorded while a person is walking through the space. Displays smooth, periodic oscillations and phase wrapping patterns over time.
3. **Jumping Room (`Data/jumpingroom.csv`)**: Data recorded during rapid, high-impact movement. Characterized by high-frequency noise bursts, scattered phase angles, and deep RSSI dropouts.

---

## Directory Structure

* **`Data/`**: Contains the logged CSI datasets.
  * [stillroom.csv](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/Data/stillroom.csv)
  * [movingroom.csv](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/Data/movingroom.csv)
  * [jumpingroom.csv](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/Data/jumpingroom.csv)
* [Heatmap.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/Heatmap.ipynb): The notebook containing visualization cells split by scenario.
* [README.md](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/README.md): This documentation.

---

## Processing Pipeline
The notebook processes the CSV log files using the following steps:
1. **Column Verification**: Ensures columns for `SubCarrier_index`, `amplitude`, `phase`, and `RSSI` exist.
2. **Subcarrier Inference**: Automatically determines the number of subcarriers per packet based on the maximum index.
3. **Packet Filtering & Reshaping**: Filters out trailing incomplete packets and reshapes the flat CSV array into a 2D matrix:
   $$\text{Matrix Dimensions: } (\text{Packets} \times \text{Subcarriers})$$
4. **Heatmap Generation**: Plots a 3-panel figure representing:
   * **Amplitude**: Signal strength per subcarrier using the `viridis` colormap.
   * **Phase**: Cyclical phase angle shifts utilizing the `twilight` colormap.
   * **RSSI**: Global packet power profile utilizing the `hot` colormap.

---

## Running the Notebook

To view and generate the heatmaps:

1. **Activate your virtual environment**:
   ```cmd
   # Windows Command Prompt:
   venv\Scripts\activate.bat
   
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   ```
2. **Launch Jupyter Lab/Notebook**:
   ```bash
   jupyter notebook
   ```
3. **Select Kernel**:
   Inside the notebook editor, ensure your active kernel is set to the virtual environment `venv`.
4. **Run Cells**:
   Run the helper configuration cell (`Cell 1`) and then run individual scenario code cells. The Still Room cell is configured to hide the verbose `df.info()` output.
