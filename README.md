# 📡 WiFi RSSI & CSI Python Simulations

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-ffffff?style=for-the-badge&logo=matplotlib&logoColor=black)

This repository contains Python-based simulations and data visualizations for **WiFi Signal Analysis**, specifically focusing on **RSSI (Received Signal Strength Indication)** and **CSI (Channel State Information)** mapping.

---

## 🚀 Project Overview
The goal of this project is to simulate and visualize how WiFi signals behave in different environments. By using dynamic heatmaps, we analyze signal propagation and the impact of physical activities—such as moving or jumping—on signal stability and carrier phase.

### Key Analysis Areas:
* **Signal Attenuation:** Modeling decay over distance using path-loss equations.
* **Human Activity Sensing:** Observing signal variance (noise) caused by physical movement.
* **CSI Mapping:** Analyzing sub-carrier data for high-granularity environmental sensing.

---

## 📂 Repository Structure

| Path | Description |
| :--- | :--- |
| **`CSI_Map/`** | Notebooks for simulating and processing Channel State Information data. |
| **`Heatmap/`** | Visualizations of signal density across different states (Still, Moving, Jumping). |
| **`Wifi_Heatmap/`** | Database-driven heatmap generation based on real-world scanned WiFi data. |
| **`Data/`** | Sample datasets including `.csv` and `.txt` signal captures. |

---

## 🛠️ Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git](https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git)
   cd Wifi-RSSI-Python-Simulations.
   
2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate

3. **Install dependencies::**
   ```bash
   pip install -r requirements.txt


## 📊 Visualizations
The simulations generate heatmaps representing signal strength distribution. These help in understanding:

Spatial Mapping: Essential for indoor localization research.

Interference Patterns: Recognizing how human presence "shadows" signal strength.

Data-Driven Insight: Transitioning from raw RSSI values to actionable spatial data.
