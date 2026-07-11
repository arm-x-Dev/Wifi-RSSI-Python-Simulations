# Wi-Fi RSSI & CSI Python Simulations & Visualizations

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge&logo=python&logoColor=white)
![Seaborn](https://img.shields.io/badge/Seaborn-4C78A8?style=for-the-badge&logo=python&logoColor=white)

This repository contains an end-to-end Python framework for simulating and visualizing **Wi-Fi Channel State Information (CSI)** and **Received Signal Strength Indication (RSSI)**. It features high-granularity signal modeling and database-driven spatial visualization engines to help analyze signal behavior, path-loss, and the impact of human activity on wireless signals.

---

## Key Modules & Notebooks

The project is structured into three self-contained directories, each featuring interactive notebooks split by scenario or device for step-by-step execution:

### 1. [CSI_Map/](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/CSI_Map)
* **[SimulatedCSI.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/CSI_Map/SimulatedCSI.ipynb)**: Simulates complex CSI transfer functions ($H(f) = |H(f)| e^{j \angle H(f)}$) over 52 subcarriers across three environments (Still Room, Moving Room, and Jumping Room).

### 2. [Heatmap/](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap)
* **[Heatmap.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Heatmap/Heatmap.ipynb)**: Core logger visualizer. Ingests CSV files representing physical states to plot multi-panel heatmaps of signal amplitude, phase angles, and RSSI profiles.
* **`Data/`**: Contains pre-logged CSV datasets (`stillroom.csv`, `movingroom.csv`, `jumpingroom.csv`).

### 3. [Wifi_Heatmap/](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Wifi_Heatmap)
* **[Wifi_Heatmap_Databased.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/Wifi_Heatmap/Wifi_Heatmap_Databased.ipynb)**: Processes database scans, averages duplicate measurements per tile, and projects signal intensities across a 5x8 tile grid representing a hall layout using the `coolwarm` colormap.
* **`Data/`**: Contains raw logs (`scan1.txt`).

---

## Setup & Installation

### Prerequisites
* Python 3.8+
* Jupyter Notebook / Lab

### Setup Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git
   cd Wifi-RSSI-Python-Simulations
   ```

2. **Create and Activate a Virtual Environment**:
   ```cmd
   # Windows Command Prompt:
   python -m venv venv
   venv\Scripts\activate.bat

   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Required Libraries**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch Jupyter**:
   ```bash
   jupyter notebook
   ```
   *Make sure to select the newly created `./venv` kernel in Jupyter to run the cells successfully.*

---

## Visualization Highlights
* **Amplitude Heatmaps (`viridis` / auto-scaled)**: Represents subcarrier power distribution. Useful for identifying static vs. dynamic attenuation.
* **Phase Angle Heatmaps (`twilight` / cyclical)**: Visualizes phase shift wrapping ($-\pi$ to $\pi$) to detect subtle multi-path changes.
* **RSSI Heatmaps (`hot` / log-scale)**: Indicates overall packet signal strength.
* **Spatial RSSI Mapping (`coolwarm` / gaussian)**: Maps room coverage intensities onto a physical 2D layout grid, distinguishing strong (red) vs. weak (blue) coverage zones.
