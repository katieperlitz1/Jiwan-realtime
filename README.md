# Signal Visualizer (JavaScript Version)

A browser-based web application for real-time visualization of sensor data via Bluetooth Low Energy (BLE).  
No installation required—just visit the website, connect your sensor, and start exploring data.

## Live Demo

[Open the Web App](https://signalvisualizerwebapp.netlify.app/web_client_imu/main)

[Watch the Web App in Action](https://youtu.be/-YaN8vxHmMo)

## Overview

This tool allows you to:

- Connect to a BLE sensor (e.g., Seeed XIAO) directly from your browser
- Choose between IMU or Analog mode
- View data in four visualization types:
  - Time-series line graph
  - Vertical bar chart
  - Horizontal bar chart
  - Grid heatmap
- Rename channels, adjust graph scale, and record data as CSV

## Requirements

- Chrome or Edge browser (Web Bluetooth supported)
- A BLE sensor broadcasting as `XIAO`
- Compatible firmware sending either:
  - 17-byte IMU packets
  - 32-byte Analog packets

## How to Use

### 1. Connect the Sensor

1. Power on your sensor and ensure its name is set to `XIAO`.
2. Open the web app and click **Connect Device**.
3. Select your sensor from the Bluetooth prompt.

If connection fails, make sure the device name is `XIAO`.

### 2. Choose Data Mode

- Use the **Select Mode** dropdown to choose either IMU or Analog mode.
- The mode must match your firmware's data format.
- If nothing appears, click **Restart Data Stream**.

### 3. Customize Visuals

- Rename channels using the input fields. These names will translate to all visualizations and the CSV data file. 
- Adjust Min and Max scale values to zoom in/out.
- Use checkboxes to toggle which channels appear in each graph.

### 4. Record and Download CSV

- Click **Start Recording** to begin.
- Click **Stop Recording** when finished.
- Then click **Download CSV** to export the data.

## Data Format

### IMU Mode (17 bytes)

- 1 byte: label
- 4 bytes: timestamp
- 6 values (2 bytes each): AccX, AccY, AccZ, GyrX, GyrY, GyrZ

### Analog Mode (32 bytes)

- 8 channels × 4 bytes each (32-bit unsigned integers)

To add a new mode, create a handler in `callback.js` and update the mode dropdown.

## Troubleshooting

- **No data showing?** Check your mode, click Restart Data Stream, and verify your firmware matches the expected format.
- **Can't connect?** Ensure the sensor name is `XIAO` and Bluetooth is enabled.
- **Unsupported browser?** Use Chrome or Edge.

## Partial Project Structure

| File           | Description                              |
|----------------|------------------------------------------|
| `main.js`      | UI and visualizations (p5.js)            |
| `callback.js`  | BLE notification handlers                |
| `download.js`  | CSV recording and export                 |
| `main.html`    | HTML structure                           |

## Use Cases

Designed for:

- Classroom sensor projects
- IMU-based activity recognition
- Sensor prototyping and debugging
- Live demos without coding


