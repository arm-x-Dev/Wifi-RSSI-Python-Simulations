# Wi-Fi RSSI Database-driven Heatmap Visualization

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge&logo=python&logoColor=white)

This subdirectory contains the visualization engine that maps scanned RSSI (Received Signal Strength Indicator) metrics across physical grid coordinates. 

Instead of theoretical simulations, this notebook processes actual logged values from spatial scans of a physical hall structure.

---

## Overview
The core of this module is the [Wifi_Heatmap_Databased.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Wifi_Heatmap/Wifi_Heatmap_Databased.ipynb) Jupyter Notebook. It loads log files from the `Data/` folder containing RSSI measurements for three distinct Wi-Fi devices or access points:

* **`RSSI_M21`**: Scan results for Access Point M21.
* **`RSSI_A34`**: Scan results for Alok's A34.
* **`RSSI_Home 2.4GHz`**: Scan results for Home 2.4GHz network.

---

## Directory Structure

* **`Data/`**: Contains the spatial log files.
  * [scan1.txt](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Wifi_Heatmap/Data/scan1.txt)
* [Wifi_Heatmap_Databased.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Wifi_Heatmap/Wifi_Heatmap_Databased.ipynb): The notebook containing data processing and single-device heatmap cells.
* [README.md](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Wifi_Heatmap/README.md): This documentation.

---

## Processing & Mapping Logic
The notebook cleanses and formats the spatial data as follows:

1. **Duplicate Averaging**: Scans often cover the same grid tile multiple times. The script iterates over pairs of consecutive measurements for each tile and averages their values to stabilize noise.
2. **2D Grid Mapping**: The hall layout is represented as a grid of **5 rows by 8 columns** (40 tiles total). Tile IDs (1 to 40) are mapped to indices using the formulas:
   $$\text{Row Index} = \frac{\text{Tile} - 1}{8} \pmod 5$$
   $$\text{Column Index} = (\text{Tile} - 1) \pmod 8$$
3. **Heatmap Generation**: Plots are styled with:
   * The `coolwarm` color spectrum (blue represents weaker signals, red represents stronger signals).
   * A premium dark theme (black background, white label colors).
   * Spatial interpolation (`gaussian`) and grid lines for enhanced read stability.

---

## Running the Notebook

To view the heatmaps:

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
   Run the setup cell (`Cell 1`) first to import modules, load data, and define the helper function. Run subsequent code cells one-by-one to render the heatmaps for each individual device.
