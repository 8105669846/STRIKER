#include <Wire.h>
#include <U8g2lib.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include "esp_sleep.h"

// OLED SH1106: GPIO 21 = SDA, 22 = SCL
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE, /* clock=*/ 22, /* data=*/ 21);

// Button config
#define BUTTON_PIN 14
#define SHORT_PRESS_DURATION 100  // ms
#define LONG_PRESS_DURATION 3000  // ms

BluetoothSerial SerialBT;
Preferences preferences;

String fields[6] = {"Name", "Email", "Phone", "WiFi SSID", "WiFi Password", "ThingSpeak API Key"};
String inputs[6];
String buffer = "";
int currentField = 0;
bool configComplete = false;
unsigned long lastEnterTime = 0;

unsigned long buttonPressTime = 0;
bool buttonWasPressed = false;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  SerialBT.begin("STRIker-Setup");
  preferences.begin("striker", false);

  esp_sleep_enable_ext0_wakeup((gpio_num_t)BUTTON_PIN, 0); // wake when button pressed (LOW)

  // Detect wake-up cause
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    String name = preferences.getString("name", "STRIker");
    displayMessage("👋 Welcome " + name + "!");
    delay(2500);
    return;  // Skip setup
  }

  checkButtonOnBoot();

  String apiKey = preferences.getString("apiKey", "");
  if (apiKey.length() > 5) {
    configComplete = true;
    displayMessage("✅ STRIker Ready!");
    delay(2000);
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
        displayMessage("✅ Setup Done!\nMonitoring Ready");
        configComplete = true;
        delay(3000);
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
}

// Display functions
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

void saveAll() {
  preferences.putString("name", inputs[0]);
  preferences.putString("email", inputs[1]);
  preferences.putString("phone", inputs[2]);
  preferences.putString("ssid", inputs[3]);
  preferences.putString("pass", inputs[4]);
  preferences.putString("apiKey", inputs[5]);
}

// Button checks
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
      goToSleep();
    }
  }
}

// Formatting
void formatDevice() {
  displayMessage("🧽 Formatting...");
  delay(1500);
  preferences.clear();
  preferences.end();
  displayMessage("🔁 Rebooting...");
  delay(1000);
  esp_restart();
}

// Sleep
void goToSleep() {
  displayMessage("😴 Going to sleep...");
  delay(1000);
  esp_deep_sleep_start(); // wakes up via button
}


