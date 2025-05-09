#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <Firebase_ESP_Client.h>

// OLED & Bluetooth
BluetoothSerial SerialBT;
Preferences preferences;
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// Pins
#define BUTTON_PIN 14
#define BUZZER_PIN 27
#define BUZZER_OFF_PIN 26
#define HEART_PIN 36
#define SOUND_PIN 35
#define SOS_BUTTON_PIN 25

// States
bool configComplete = false;
unsigned long buttonPressTime = 0;
bool buttonPressed = false;
unsigned long lastMonitorTime = 0;
const unsigned long MONITOR_INTERVAL = 15000;
bool buzzerOn = false;
bool sosTriggered = false;

// Firebase & GPS
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Neo6M GPS

void formatPreferences() {
  preferences.begin("STRIker", false);
  preferences.clear();
  preferences.end();
}

void displayMessage(String message) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_ncenB08_tr);
  u8g2.drawStr(0, 20, message.c_str());
  u8g2.sendBuffer();
}

void promptAndReceive(String label, String &value) {
  displayMessage("Enter: " + label);
  while (!SerialBT.available()) {
    delay(100);
  }
  value = SerialBT.readStringUntil('\n');
  value.trim();
}

void enterConfigurationMode() {
  SerialBT.begin("STRIker");
  displayMessage("📲 Pair to Send");
  delay(2000);

  String name, phone1, phone2, email, wifiSSID, wifiPASS, apiKey;
  promptAndReceive("Name", name);
  promptAndReceive("Phone 1", phone1);
  promptAndReceive("Phone 2", phone2);
  promptAndReceive("Email", email);
  promptAndReceive("WiFi SSID", wifiSSID);
  promptAndReceive("WiFi Password", wifiPASS);
  promptAndReceive("ThingSpeak Key", apiKey);

  if (apiKey.length() == 0) {
    displayMessage("❌ API Key Req.");
    delay(2000);
    enterConfigurationMode();
    return;
  }

  WiFi.begin(wifiSSID.c_str(), wifiPASS.c_str());
  displayMessage("📡 Connecting...");
  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 8000) {
    delay(500);
  }

  if (WiFi.status() != WL_CONNECTED) {
    displayMessage("❌ WiFi Fail");
    delay(2000);
    enterConfigurationMode();
    return;
  }

  preferences.begin("STRIker", false);
  preferences.putString("name", name);
  preferences.putString("phone1", phone1);
  preferences.putString("phone2", phone2);
  preferences.putString("email", email);
  preferences.putString("wifiSSID", wifiSSID);
  preferences.putString("wifiPASS", wifiPASS);
  preferences.putString("apiKey", apiKey);
  preferences.end();

  displayMessage("✅ Saved!");
  delay(2000);
  SerialBT.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUZZER_OFF_PIN, INPUT_PULLUP);
  pinMode(HEART_PIN, INPUT);
  pinMode(SOUND_PIN, INPUT);
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);
  digitalWrite(BUZZER_PIN, LOW);

  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);

  preferences.begin("STRIker", false);
  String apiKey = preferences.getString("apiKey", "");
  String ssid = preferences.getString("wifiSSID", "");
  String pass = preferences.getString("wifiPASS", "");
  preferences.end();

  if (apiKey == "") {
    displayMessage("🔧 First Time");
    delay(2000);
    enterConfigurationMode();
    configComplete = true;
  } else {
    WiFi.begin(ssid.c_str(), pass.c_str());
    displayMessage("📶 Connecting...");
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 8000) {
      delay(500);
    }

    if (WiFi.status() != WL_CONNECTED) {
      displayMessage("❌ WiFi Fail");
      delay(2000);
      enterConfigurationMode();
      return;
    }

    configComplete = true;
    preferences.begin("STRIker", true);
    String name = preferences.getString("name", "User");
    preferences.end();
    displayMessage("👋 Welcome " + name);
    delay(2500);
  }

  // Firebase
  config.api_key = "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI";  // 🛑 REQUIRED
  auth.user.email = "sinchanakulkarni4749@gmail.com";            // 🛑 REQUIRED
  auth.user.password = "123456";      // 🛑 REQUIRED
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // Neo6M on Serial2
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);

  if (buttonState == LOW) {
    if (!buttonPressed) {
      buttonPressTime = millis();
      buttonPressed = true;
    } else if (millis() - buttonPressTime >= 3000) {
      displayMessage("⚠️ Formatting...");
      formatPreferences();
      delay(3000);
      ESP.restart();
    }
  } else if (buttonPressed) {
    if (millis() - buttonPressTime < 1000) {
      displayMessage("😴 Sleep...");
      delay(1000);
      esp_deep_sleep_start();
    }
    buttonPressed = false;
  }

  // SENSOR MONITORING
  if (configComplete && millis() - lastMonitorTime > MONITOR_INTERVAL) {
    lastMonitorTime = millis();

    int heartRaw = analogRead(HEART_PIN);
    int soundRaw = analogRead(SOUND_PIN);
    int heartRate = map(heartRaw, 0, 4095, 50, 150);

    u8g2.clearBuffer();
    u8g2.setCursor(0, 20); u8g2.print("HR: "); u8g2.print(heartRate);
    u8g2.setCursor(0, 40); u8g2.print("Sound: "); u8g2.print(soundRaw);
    u8g2.sendBuffer();

    if ((heartRate > 120 || soundRaw > 700) && !buzzerOn) {
      digitalWrite(BUZZER_PIN, HIGH);
      buzzerOn = true;
    }

    if (buzzerOn && digitalRead(BUZZER_OFF_PIN) == LOW) {
      digitalWrite(BUZZER_PIN, LOW);
      buzzerOn = false;
      displayMessage("🔕 Buzzer Off");
      delay(1000);
    }

    preferences.begin("STRIker", true);
    String apiKey = preferences.getString("apiKey", "");
    preferences.end();

    if (WiFi.status() == WL_CONNECTED && apiKey != "") {
      String url = "http://api.thingspeak.com/update?api_key=" + apiKey +
                   "&field1=" + String(heartRate) +
                   "&field2=" + String(soundRaw);
      HTTPClient http;
      http.begin(url);
      http.GET();
      http.end();
    }
  }

  // SOS BUTTON & GPS ALERT
  if (digitalRead(SOS_BUTTON_PIN) == LOW && !sosTriggered) {
    sosTriggered = true;
    displayMessage("🚨 SOS Triggered");
    delay(1000);

    unsigned long gpsStart = millis();
    while (millis() - gpsStart < 5000) {
      while (gpsSerial.available()) gps.encode(gpsSerial.read());
      if (gps.location.isValid()) break;
    }

    double lat = gps.location.isValid() ? gps.location.lat() : 0.0;
    double lng = gps.location.isValid() ? gps.location.lng() : 0.0;

    String docPath = "sos_collection/" + String((int)random(100000, 999999));
    String content = "{\"fields\": {\"timestamp\": {\"timestampValue\": \"" + String(millis()) + "\"}," +
                     "\"latitude\": {\"doubleValue\": " + String(lat, 6) + "}," +
                     "\"longitude\": {\"doubleValue\": " + String(lng, 6) + "}}}";

    String projectId = "striker-police-dashboard"; // Your Firestore project ID

    if (Firebase.Firestore.createDocument(&fbdo, projectId.c_str(), "", docPath.c_str(), content)) {
      displayMessage("✅ SOS Sent");
    } else {
      displayMessage("❌ SOS Fail");
    }

    delay(3000);
    sosTriggered = false;
  }
}


