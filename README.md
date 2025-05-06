# STRIker – Women’s Safety Device

**STRIker** is a compact, wearable safety system designed to provide real-time alerts in distress situations using a combination of sensors, emergency logic, and cloud integration. It uses the ESP32 microcontroller and supports solar charging for independent power.

---

## Features

- **Real-time Monitoring**
  - Heart rate detection
  - AI-based scream/voice distress detection
- **Emergency Actions**
  - Sends SMS alerts to parents/caretakers
  - Updates data to ThingSpeak (cloud)
  - Activates buzzer & flashlight
  - Sends police alerts only after SOS activation
- **Dual Alert System**
  - Online mode: Cloud + Dashboard (Firebase)
  - Offline mode: ESP-NOW broadcast to local police device
- **Secure SOS Trigger**
  - Protected long-press with verification
  - Manual buzzer cancel option
- **First-time Setup**
  - Bluetooth keyboard input for email, phone, and cloud keys
  - OLED display guidance for rural users

---

## Folder Structure

STRIker/
├── firmware/ # ESP32 code (Arduino or PlatformIO)
├── dashboard/ # Police dashboard frontend (HTML/JS/CSS)
├── hardware/ # Wiring diagrams, power setup notes
├── docs/ # Images, flowcharts, setup guides
└── README.md # This file


---

## Getting Started

### Requirements
- ESP32 DevKit V1
- OLED Display (I2C)
- Buzzer, LED Flashlight
- SIM800L (for SMS)
- Heart-rate sensor, microphone module
- TP4056, XL6009, 18650 battery, solar panel

### Setting Up Firmware
1. Install **Arduino IDE**
2. Add ESP32 board support
3. Flash code from `firmware/` to ESP32
4. Connect Bluetooth keyboard and follow OLED instructions

### Running the Dashboard
1. Open `dashboard/index.html`
2. Make sure Firebase config is added in `dashboard.js`
3. Log in as police user to view alerts

---

## Demonstration

*(Insert screenshots, diagrams, or demo GIFs here)*

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

---

## License

MIT License — free to use and modify with attribution.

