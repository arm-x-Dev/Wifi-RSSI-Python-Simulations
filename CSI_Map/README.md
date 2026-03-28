# WiFi RSSI & CSI Python Simulations 📶

This repository provides a framework for simulating and visualizing **WiFi Channel State Information (CSI)** and **RSSI** data. It is designed to model how WiFi signals behave in indoor environments, accounting for multipath effects, noise, and human interference.

## 🚀 Overview
Unlike basic RSSI, which only provides signal strength, **CSI** provides fine-grained information about the amplitude and phase of individual subcarriers in an OFDM system. This project simulates these complex signals to create high-fidelity heatmaps for indoor localization and activity recognition.

## 📂 Project Structure
- **`CSI_Map/`**: 
    - `SimulatedCSI.ipynb`: The core engine. Simulates complex CSI data, calculating **Amplitude** and **Phase** across multiple subcarriers.
- **`Heatmap/`**: 
    - `Heatmap.ipynb`: Visualizes signal distribution across a 2D space.
    - `Data/`: Contains environmental datasets (Still, Moving, and Jumping room states).
- **`Wifi_Heatmap/`**: 
    - `Wifi_Heatmap_Databased.ipynb`: Maps real-world or database-driven signal scans into spatial visualizations.

## 🛠️ Technical Features
- **Signal Modeling**: Simulates CSI using the complex-valued representation:
  $$H(f) = |H(f)| e^{j \angle H(f)}$$
  where $|H(f)|$ is the amplitude and $\angle H(f)$ is the phase.
- **Environmental Impact**: Includes data for "Jumping," "Moving," and "Still" scenarios to analyze how physical activity affects signal variance.
- **Heatmap Generation**: Generates 2D spatial maps representing signal coverage and dead zones.

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Jupyter Notebook / Lab

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git](https://github.com/arm-x-Dev/Wifi-RSSI-Python-Simulations.git)
   cd Wifi-RSSI-Python-Simulations
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 📊 Sample Output
The simulation generates subcarrier-level data, allowing for the analysis of:
- **Multipath Fading**: How signals bounce off walls.
- **Shadowing**: Signal loss due to obstacles.
- **Temporal Variance**: How signal phase shifts when a person moves through the environment.

## 🤝 Contributing
Contributions are welcome! If you have ideas for more realistic propagation models or better visualization techniques, feel free to open an issue or a PR.
