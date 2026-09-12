#  Project Striker

### IoT-Based Women Safety Alert & Location Tracking System

**Project Striker** is an IoT-based women safety device that allows a user to trigger an emergency alert with a **single physical button press**. The device captures the user's location using a **NEO-6M GPS module** and transmits the alert and location data to a web-based **Striker Dashboard** through **Firebase**.

The system is built around an **ESP32**, leveraging its built-in **Wi-Fi and Bluetooth** capabilities.

---

##  How It Works

```text
        USER
          │
          │ Press Emergency Button
          ▼
   ┌──────────────┐
   │    ESP32     │
   └──────┬───────┘
          │
          ├──────────────► NEO-6M GPS
          │                    │
          │              Latitude/Longitude
          │                    │
          └──────────┬─────────┘
                     │ Wi-Fi
                     ▼
              ┌─────────────┐
              │  Firebase   │
              └──────┬──────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Striker Dashboard│
            │   HTML/CSS/JS   │
            └─────────────────┘
```

### Emergency Flow

1. User presses the **4-legged tactile push button**.
2. ESP32 detects the button press.
3. ESP32 obtains the current **latitude and longitude** from the NEO-6M GPS module.
4. Alert and location data are sent over **Wi-Fi** to Firebase.
5. The **Striker Dashboard** retrieves and displays the emergency alert and associated user/location information.

---

##  Key Features

*  **One-Press Emergency Alert**
*  **GPS Location Tracking** using NEO-6M
*  **Wi-Fi Communication** through ESP32
*  **Bluetooth-Based Initial Setup**
*  **User Information Configuration**
*  **Firebase Backend**
*  **Real-Time Web Dashboard**
*  **LED-Based Device Setup/Status Indication**

---

##  Hardware

| Component                        | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| **ESP32**                        | Main controller, Wi-Fi & Bluetooth communication |
| **NEO-6M GPS**                   | Obtains latitude and longitude                   |
| **4-Legged Tactile Push Button** | Emergency trigger                                |
| **LED**                          | Setup/status indication                          |
| **Bluetooth Keyboard**           | Initial user information entry                   |

### Why ESP32?

ESP32 provides **Wi-Fi and Bluetooth inbuilt**, making it suitable for both device configuration and cloud communication without requiring separate wireless modules.

---

##  Software Stack

**Device:** ESP32 firmware
**Dashboard:** HTML, CSS, JavaScript
**Backend:** Firebase
**Location:** NEO-6M GPS

---

##  Initial Device Setup

During initial setup, the device uses the LED to indicate the setup process. The user enters essential information such as **name, phone number, and other required details** using a Bluetooth keyboard through the device's Bluetooth interface.

Once configured, the device is ready to operate as a safety alert device.

---

##  System Architecture

```text
NEO-6M GPS ──► ESP32 ──Wi-Fi──► Firebase ──► Striker Dashboard
                  │
                  └── Bluetooth ──► Initial User Configuration
                  
Emergency Button ──► ESP32
```

---

##  Technologies

* **ESP32**
* **NEO-6M GPS**
* **Bluetooth**
* **Wi-Fi**
* **Firebase**
* **HTML**
* **CSS**
* **JavaScript**

---

##  Future Scope

* SMS/call-based emergency notifications
* Interactive map-based location visualization
* Mobile application
* Multiple emergency contacts
* Improved power management
* Offline/low-connectivity alert mechanisms
* Secure user authentication and data handling

---

##  Project Status

**Prototype**

Project Striker demonstrates the integration of **embedded systems, GPS, wireless communication, cloud backend infrastructure, and web technologies** into a compact emergency-alert system.
