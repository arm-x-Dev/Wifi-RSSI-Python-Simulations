# Wi-Fi CSI (Channel State Information) Simulation

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge&logo=python&logoColor=white)

This subdirectory contains the dynamic simulation engine and visualizations for **Wi-Fi Channel State Information (CSI)**. 

Unlike basic RSSI, which only represents average signal strength, CSI provides high-granularity, subcarrier-level details about the **amplitude** and **phase** of Wi-Fi signals. This allows for advanced indoor sensing, localization, and activity recognition.

---

## Overview
The core of this module is the [SimulatedCSI.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/CSI_Map/SimulatedCSI.ipynb) Jupyter Notebook. It generates synthetic CSI data mimicking a 52-subcarrier system (like 802.11n 20MHz bandwidth) across three distinct human activity scenarios:

1. **Still Room (Scenario 1)**: Models a static indoor environment. The signal contains only minor Gaussian noise and stable, baseline offsets.
2. **Moving Room (Scenario 2)**: Simulates gradual or steady human movement, resulting in smooth, periodic sinusoidal shifts in amplitude and phase.
3. **Jumping Room (Scenario 3)**: Simulates rapid, high-intensity movement (e.g., jumping) that introduces high-frequency, large-magnitude fluctuations in signal amplitude, phase, and RSSI.

---

## Directory Structure

* [SimulatedCSI.ipynb](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/CSI_Map/SimulatedCSI.ipynb): The notebook containing the simulation generator and visualization cells.
* [README.md](file:///c:/Users/alokm/Desktop/Wifi-RSSI-Python-Simulations-main/CSI_Map/README.md): This documentation.

---

## Technical Signal Modeling
CSI simulates the transmission channel response using complex-valued channel transfer functions (CTF) for each subcarrier $f$:

$$H(f) = |H(f)| e^{j \angle H(f)}$$

* **Amplitude $|H(f)|$**: Indicates subcarrier attenuation due to distance and obstacles.
* **Phase $\angle H(f)$**: Indicates phase shifts (wrapped between $-\pi$ and $\pi$) caused by multipath propagation and reflection paths.
* **RSSI**: Calculated as the overall log-scale power envelope of the transmission.

---

## Running the Notebook

To run the simulation and generate the heatmaps locally:

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
   Run the setup cell first to define the simulation engine, and then run the individual scenario cells to generate the respective heatmaps.
