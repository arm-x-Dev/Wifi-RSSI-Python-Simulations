# WiFi RSSI & CSI Python Simulations

This repository contains Python-based simulations and data visualizations for **WiFi Signal Analysis**, specifically focusing on **RSSI (Received Signal Strength Indication)** and **CSI (Channel State Information)** mapping.

## 🚀 Project Overview
The goal of this project is to simulate and visualize how WiFi signals behave in different environments. By using heatmaps, we can analyze signal propagation and the impact of physical activities (like moving or jumping) on signal stability.

## 📂 Repository Structure
* **`CSI_Map/`**: Contains notebooks for simulating Channel State Information data.
* **`Heatmap/`**: Visualizations of signal density in various room states (Still, Moving, Jumping).
* **`Wifi_Heatmap/`**: Database-driven heatmap generation based on scanned WiFi data.
* **`Data/`**: Sample datasets including `.csv` and `.txt` scans.

## 🛠️ Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git](https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git)
   cd Wifi-RSSI-Python-Simulations
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## 📊 Visualizations
The project generates heatmaps to represent signal strength distribution. These simulations help in understanding:
- Signal attenuation over distance.
- Interference caused by human movement.
- Spatial mapping for indoor localization.

## 📜 License
This project is open-source. Feel free to use and modify the simulations for research and educational purposes.
