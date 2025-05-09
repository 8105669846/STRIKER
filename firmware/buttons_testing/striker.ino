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

// WiFi connection settings
const int WIFI_TIMEOUT = 20000; // 20 seconds timeout
const int WIFI_RETRY_DELAY = 500; // 500ms between retries

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

bool connectToWiFi(const char* ssid, const char* password) {
  WiFi.disconnect(true);
  delay(1000);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < WIFI_TIMEOUT) {
    displayMessage("📡 Connecting...");
    delay(WIFI_RETRY_DELAY);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    displayMessage("✅ WiFi Connected");
    delay(1000);
    return true;
  } else {
    displayMessage("❌ WiFi Failed");
    delay(1000);
    return false;
  }
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

  if (!connectToWiFi(wifiSSID.c_str(), wifiPASS.c_str())) {
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
    if (!connectToWiFi(ssid.c_str(), pass.c_str())) {
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
  config.api_key = "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI";
  auth.user.email = "sinchanakulkarni4749@gmail.com";
  auth.user.password = "123456";
  config.database_url = "https://striker-police-dashboard.firebaseio.com"; // Add your Firebase database URL
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
}

// ... rest of the code remains the same ... 