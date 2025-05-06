
// #include <Wire.h>
// #include <U8g2lib.h>
// #include <BluetoothSerial.h>
// #include <Preferences.h>
// #include "esp_sleep.h"

// // OLED SH1106: GPIO 21 = SDA, 22 = SCL
// U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE, /* clock=*/ 22, /* data=*/ 21);

// // Button config
// #define BUTTON_PIN 14
// #define SHORT_PRESS_DURATION 100  // ms
// #define LONG_PRESS_DURATION 3000  // ms

// // Bluetooth + EEPROM
// BluetoothSerial SerialBT;
// Preferences preferences;

// // Input fields
// String fields[6] = {"Name", "Email", "Phone", "WiFi SSID", "WiFi Password", "ThingSpeak API Key"};
// String inputs[6];
// String buffer = "";
// int currentField = 0;
// bool configComplete = false;
// unsigned long lastEnterTime = 0;

// // Track button timing
// unsigned long buttonPressTime = 0;
// bool buttonWasPressed = false;
// bool wokeFromSleep = true;
// bool greetedUser = false;

// void setup() {
//   pinMode(BUTTON_PIN, INPUT_PULLUP); // Active LOW
//   u8g2.begin();
//   u8g2.setFont(u8g2_font_ncenB08_tr);
//   SerialBT.begin("STRIker-Setup");
//   preferences.begin("striker", false);

//   checkButtonOnBoot(); // Handle long press at boot (format)

//   // Check if setup already done
//   String apiKey = preferences.getString("apiKey", "");
//   if (apiKey.length() > 5) {
//     configComplete = true;
//     displayMessage("✅ STRIker Ready!");
//     delay(2000);
//   } else {
//     displayMessage("👋 Welcome!\nBluetooth Setup...");
//     delay(1500);
//     displayNextField();
//   }
// }

// void loop() {
//   handleButton();

//   // 👋 Welcome user after wakeup + second short press
//   if (configComplete && wokeFromSleep && !greetedUser) {
//     String name = preferences.getString("name", "User");
//     displayMessage("👋 Welcome, " + name);
//     greetedUser = true;
//     delay(2000);
//     // You can start your sensors or monitoring logic here
//   }

//   // Bluetooth setup if not completed
//   if (!configComplete && SerialBT.available()) {
//     char c = SerialBT.read();

//     if ((c == '\n' || c == '\r') && millis() - lastEnterTime > 300) {
//       lastEnterTime = millis();
//       inputs[currentField] = buffer;
//       buffer = "";
//       currentField++;

//       if (currentField >= 6) {
//         saveAll();
//         displayMessage("✅ Setup Done!\nMonitoring Ready");
//         configComplete = true;
//         delay(3000);
//       } else {
//         displayNextField();
//       }
//     } else if (c == 8 || c == 127) {
//       if (buffer.length() > 0) {
//         buffer.remove(buffer.length() - 1);
//         displayBuffer(fields[currentField] + ": " + buffer);
//       }
//     } else if (c >= 32 && c <= 126) {
//       buffer += c;
//       displayBuffer(fields[currentField] + ": " + buffer);
//     }
//   }
// }

// // ========= FEATURES ==========

// // Show prompt on OLED
// void displayNextField() {
//   buffer = "";
//   delay(200);
//   u8g2.clearBuffer();
//   u8g2.drawStr(0, 15, "Enter:");
//   u8g2.drawStr(0, 35, fields[currentField].c_str());
//   u8g2.sendBuffer();
// }

// // Show message on OLED
// void displayMessage(String msg) {
//   u8g2.clearBuffer();
//   u8g2.drawStr(0, 20, msg.c_str());
//   u8g2.sendBuffer();
// }

// // Show typed input
// void displayBuffer(String msg) {
//   u8g2.clearBuffer();
//   u8g2.drawStr(0, 15, "Enter:");
//   u8g2.drawStr(0, 35, msg.c_str());
//   u8g2.sendBuffer();
// }

// // Save all inputs to flash
// void saveAll() {
//   preferences.putString("name", inputs[0]);
//   preferences.putString("email", inputs[1]);
//   preferences.putString("phone", inputs[2]);
//   preferences.putString("ssid", inputs[3]);
//   preferences.putString("pass", inputs[4]);
//   preferences.putString("apiKey", inputs[5]);
// }

// // Long press at boot = format
// void checkButtonOnBoot() {
//   if (digitalRead(BUTTON_PIN) == LOW) {
//     delay(100); // debounce
//     unsigned long start = millis();
//     while (digitalRead(BUTTON_PIN) == LOW) {
//       if (millis() - start >= LONG_PRESS_DURATION) {
//         formatDevice();
//         break;
//       }
//     }
//   }
// }

// // Handle button runtime
// void handleButton() {
//   if (digitalRead(BUTTON_PIN) == LOW && !buttonWasPressed) {
//     buttonPressTime = millis();
//     buttonWasPressed = true;
//   } else if (digitalRead(BUTTON_PIN) == HIGH && buttonWasPressed) {
//     unsigned long pressDuration = millis() - buttonPressTime;
//     buttonWasPressed = false;

//     if (pressDuration >= LONG_PRESS_DURATION) {
//       formatDevice();
//     } else if (pressDuration >= SHORT_PRESS_DURATION) {
//       if (wokeFromSleep && configComplete && !greetedUser) {
//         // Let loop handle the greeting
//       } else {
//         goToSleep();
//       }
//     }
//   }
// }

// // Format = clear memory
// void formatDevice() {
//   displayMessage("🧽 Formatting...");
//   delay(1500);
//   preferences.clear();
//   preferences.end();
//   displayMessage("🔁 Rebooting...");
//   delay(1000);
//   esp_restart();  // reboot clean
// }

// // Sleep function
// void goToSleep() {
//   displayMessage("😴 Going to sleep...");
//   delay(1000);
//   esp_deep_sleep_start(); // wakes with full reset
// }
// #include <Wire.h>
// #include <U8g2lib.h>
// #include <BluetoothSerial.h>
// #include <Preferences.h>
// #include "esp_sleep.h"

// // OLED SH1106: GPIO 21 = SDA, 22 = SCL
// U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE, /* clock=*/ 22, /* data=*/ 21);

// // Button config
// #define BUTTON_PIN 14
// #define SHORT_PRESS_DURATION 100  // ms
// #define LONG_PRESS_DURATION 3000  // ms

// BluetoothSerial SerialBT;
// Preferences preferences;

// String fields[6] = {"Name", "Email", "Phone", "WiFi SSID", "WiFi Password", "ThingSpeak API Key"};
// String inputs[6];
// String buffer = "";
// int currentField = 0;
// bool configComplete = false;
// unsigned long lastEnterTime = 0;

// unsigned long buttonPressTime = 0;
// bool buttonWasPressed = false;

// void setup() {
//   pinMode(BUTTON_PIN, INPUT_PULLUP);
//   u8g2.begin();
//   u8g2.setFont(u8g2_font_ncenB08_tr);
//   SerialBT.begin("STRIker-Setup");
//   preferences.begin("striker", false);

//   esp_sleep_enable_ext0_wakeup((gpio_num_t)BUTTON_PIN, 0); // wake when button pressed (LOW)

//   // Detect wake-up cause
//   if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
//     String name = preferences.getString("name", "STRIker");
//     displayMessage("👋 Welcome " + name + "!");
//     delay(2500);
//     return;  // Skip setup
//   }

//   checkButtonOnBoot();

//   String apiKey = preferences.getString("apiKey", "");
//   if (apiKey.length() > 5) {
//     configComplete = true;
//     displayMessage("✅ STRIker Ready!");
//     delay(2000);
//   } else {
//     displayMessage("👋 Welcome!\nBluetooth Setup...");
//     delay(1500);
//     displayNextField();
//   }
// }

// void loop() {
//   handleButton();

//   if (!configComplete && SerialBT.available()) {
//     char c = SerialBT.read();

//     if ((c == '\n' || c == '\r') && millis() - lastEnterTime > 300) {
//       lastEnterTime = millis();
//       inputs[currentField] = buffer;
//       buffer = "";
//       currentField++;

//       if (currentField >= 6) {
//         saveAll();
//         displayMessage("✅ Setup Done!\nMonitoring Ready");
//         configComplete = true;
//         delay(3000);
//       } else {
//         displayNextField();
//       }
//     } else if (c == 8 || c == 127) {
//       if (buffer.length() > 0) {
//         buffer.remove(buffer.length() - 1);
//         displayBuffer(fields[currentField] + ": " + buffer);
//       }
//     } else if (c >= 32 && c <= 126) {
//       buffer += c;
//       displayBuffer(fields[currentField] + ": " + buffer);
//     }
//   }
// }

// // Display functions
// void displayNextField() {
//   buffer = "";
//   delay(200);
//   u8g2.clearBuffer();
//   u8g2.drawStr(0, 15, "Enter:");
//   u8g2.drawStr(0, 35, fields[currentField].c_str());
//   u8g2.sendBuffer();
// }

// void displayMessage(String msg) {
//   u8g2.clearBuffer();
//   u8g2.drawStr(0, 20, msg.c_str());
//   u8g2.sendBuffer();
// }

// void displayBuffer(String msg) {
//   u8g2.clearBuffer();
//   u8g2.drawStr(0, 15, "Enter:");
//   u8g2.drawStr(0, 35, msg.c_str());
//   u8g2.sendBuffer();
// }

// void saveAll() {
//   preferences.putString("name", inputs[0]);
//   preferences.putString("email", inputs[1]);
//   preferences.putString("phone", inputs[2]);
//   preferences.putString("ssid", inputs[3]);
//   preferences.putString("pass", inputs[4]);
//   preferences.putString("apiKey", inputs[5]);
// }

// // Button checks
// void checkButtonOnBoot() {
//   if (digitalRead(BUTTON_PIN) == LOW) {
//     delay(100);
//     unsigned long start = millis();
//     while (digitalRead(BUTTON_PIN) == LOW) {
//       if (millis() - start >= LONG_PRESS_DURATION) {
//         formatDevice();
//         break;
//       }
//     }
//   }
// }

// void handleButton() {
//   if (digitalRead(BUTTON_PIN) == LOW && !buttonWasPressed) {
//     buttonPressTime = millis();
//     buttonWasPressed = true;
//   } else if (digitalRead(BUTTON_PIN) == HIGH && buttonWasPressed) {
//     unsigned long pressDuration = millis() - buttonPressTime;
//     buttonWasPressed = false;

//     if (pressDuration >= LONG_PRESS_DURATION) {
//       formatDevice();
//     } else if (pressDuration >= SHORT_PRESS_DURATION) {
//       goToSleep();
//     }
//   }
// }

// // Formatting
// void formatDevice() {
//   displayMessage("🧽 Formatting...");
//   delay(1500);
//   preferences.clear();
//   preferences.end();
//   displayMessage("🔁 Rebooting...");
//   delay(1000);
//   esp_restart();
// }

// // Sleep
// void goToSleep() {
//   displayMessage("😴 Going to sleep...");
//   delay(1000);
//   esp_deep_sleep_start(); // wakes up via button
// }

#include <Wire.h>
#include <U8g2lib.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_sleep.h"

// OLED SH1106: GPIO 21 = SDA, 22 = SCL
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE, /* clock=*/ 22, /* data=*/ 21);

// Button config
#define BUTTON_PIN 14
#define SHORT_PRESS_DURATION 100  // ms
#define LONG_PRESS_DURATION 3000  // ms

// Bluetooth + EEPROM
BluetoothSerial SerialBT;
Preferences preferences;

// Input fields
String fields[6] = {"Name", "Email", "Phone", "WiFi SSID", "WiFi Password", "ThingSpeak API Key"};
String inputs[6];
String buffer = "";
int currentField = 0;
bool configComplete = false;
unsigned long lastEnterTime = 0;

// Button tracking
unsigned long buttonPressTime = 0;
bool buttonWasPressed = false;

// Monitoring
bool monitoringStarted = false;
String userName = "";
String apiKey = "";

// Setup
void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  SerialBT.begin("STRIker-Setup");
  preferences.begin("striker", false);

  checkButtonOnBoot(); // Long press formatting

  // Load API key and user name
  apiKey = preferences.getString("apiKey", "");
  userName = preferences.getString("name", "");

  if (apiKey.length() > 5) {
    configComplete = true;
    displayMessage("👋 Welcome " + userName);
    delay(2000);
    startMonitoring(); // Begin after waking
  } else {
    displayMessage("👋 Welcome!\nBluetooth Setup...");
    delay(1500);
    displayNextField();
  }
}

void loop() {
  handleButton();

  if (!configComplete && SerialBT.available()) {
    char c = SerialBT.read();

    if ((c == '\n' || c == '\r') && millis() - lastEnterTime > 300) {
      lastEnterTime = millis();
      inputs[currentField] = buffer;
      buffer = "";
      currentField++;

      if (currentField >= 6) {
        saveAll();
        configComplete = true;
        userName = inputs[0];
        apiKey = inputs[5];
        displayMessage("✅ Setup Done!\nMonitoring Ready");
        delay(3000);
        startMonitoring();
      } else {
        displayNextField();
      }
    } else if (c == 8 || c == 127) {
      if (buffer.length() > 0) {
        buffer.remove(buffer.length() - 1);
        displayBuffer(fields[currentField] + ": " + buffer);
      }
    } else if (c >= 32 && c <= 126) {
      buffer += c;
      displayBuffer(fields[currentField] + ": " + buffer);
    }
  }

  if (configComplete && monitoringStarted) {
    checkHeartRate();
    checkScream();
    delay(5000); // Avoid flooding
  }
}

// ========== Display Functions ==========

void displayNextField() {
  buffer = "";
  delay(200);
  u8g2.clearBuffer();
  u8g2.drawStr(0, 15, "Enter:");
  u8g2.drawStr(0, 35, fields[currentField].c_str());
  u8g2.sendBuffer();
}

void displayMessage(String msg) {
  u8g2.clearBuffer();
  u8g2.drawStr(0, 20, msg.c_str());
  u8g2.sendBuffer();
}

void displayBuffer(String msg) {
  u8g2.clearBuffer();
  u8g2.drawStr(0, 15, "Enter:");
  u8g2.drawStr(0, 35, msg.c_str());
  u8g2.sendBuffer();
}

// ========== Config & Button Logic ==========

void saveAll() {
  preferences.putString("name", inputs[0]);
  preferences.putString("email", inputs[1]);
  preferences.putString("phone", inputs[2]);
  preferences.putString("ssid", inputs[3]);
  preferences.putString("pass", inputs[4]);
  preferences.putString("apiKey", inputs[5]);
}

void checkButtonOnBoot() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(100);
    unsigned long start = millis();
    while (digitalRead(BUTTON_PIN) == LOW) {
      if (millis() - start >= LONG_PRESS_DURATION) {
        formatDevice();
        break;
      }
    }
  }
}

void handleButton() {
  if (digitalRead(BUTTON_PIN) == LOW && !buttonWasPressed) {
    buttonPressTime = millis();
    buttonWasPressed = true;
  } else if (digitalRead(BUTTON_PIN) == HIGH && buttonWasPressed) {
    unsigned long pressDuration = millis() - buttonPressTime;
    buttonWasPressed = false;

    if (pressDuration >= LONG_PRESS_DURATION) {
      formatDevice();
    } else if (pressDuration >= SHORT_PRESS_DURATION) {
      displayMessage("👋 Welcome " + userName);
      delay(2000);
      startMonitoring(); // Resume monitoring
    }
  }
}

void formatDevice() {
  displayMessage("🧽 Formatting...");
  delay(1500);
  preferences.clear();
  preferences.end();
  displayMessage("🔁 Rebooting...");
  delay(1000);
  esp_restart();
}

// ========== Monitoring Logic ==========

void startMonitoring() {
  if (!monitoringStarted) {
    monitoringStarted = true;
    WiFi.begin(preferences.getString("ssid", "").c_str(),
               preferences.getString("pass", "").c_str());

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts++ < 10) {
      delay(500);
    }

    if (WiFi.status() == WL_CONNECTED) {
      displayMessage("📶 Connected\nMonitoring...");
    } else {
      displayMessage("⚠️ No WiFi\nOffline Mode");
    }
    delay(2000);
  }
}

void checkHeartRate() {
  int heartRate = analogRead(34); // Replace with real heart rate logic
  if (heartRate > 1500) { // Adjust threshold
    sendToThingSpeak("heart_rate", heartRate);
  }
}

void checkScream() {
  int micLevel = analogRead(35); // Replace with real sound detection
  if (micLevel > 1800) { // Adjust threshold
    sendToThingSpeak("scream", micLevel);
  }
}

void sendToThingSpeak(String label, int value) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://api.thingspeak.com/update?api_key=" + apiKey + "&field1=" + String(value);
    http.begin(url);
    int httpResponseCode = http.GET();
    http.end();
  }
}


