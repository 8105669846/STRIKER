#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

BluetoothSerial SerialBT;
Preferences preferences;

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE);

#define BUTTON_PIN 14
#define BUZZER_PIN 27
#define BUZZER_OFF_PIN 26
#define HEART_PIN 36
#define SOUND_PIN 35
#define SOS_BUTTON_PIN 32
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17

bool configComplete = false;
unsigned long buttonPressTime = 0;
bool buttonPressed = false;
unsigned long lastMonitorTime = 0;
const unsigned long MONITOR_INTERVAL = 15000;
bool buzzerOn = false;

TinyGPSPlus gps;
HardwareSerial GPSSerial(2); // Use Serial2 for GPS

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
    enterConfigurationMode(); // Retry
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
    enterConfigurationMode(); // Retry everything
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

void sendSOSAlert() {
  preferences.begin("STRIker", true);
  String name = preferences.getString("name", "");
  String phone1 = preferences.getString("phone1", "");
  String phone2 = preferences.getString("phone2", "");
  String email = preferences.getString("email", "");
  preferences.end();

  if (WiFi.status() == WL_CONNECTED) {
    String url = "http://api.thingspeak.com/update?api_key=" + preferences.getString("apiKey", "") +
                 "&field3=" + String(gps.location.lat(), 6) +
                 "&field4=" + String(gps.location.lng(), 6) +
                 "&field5=1"; // SOS status active
    
    HTTPClient http;
    http.begin(url);
    http.GET();
    http.end();

    // Send to custom dashboard
    String alertUrl = "https://striker-police-dashboard.firebaseio.com/sos_collection.json";
    String jsonData = "{\"name\":\"" + name + "\","
                     "\"phone1\":\"" + phone1 + "\","
                     "\"phone2\":\"" + phone2 + "\","
                     "\"email\":\"" + email + "\","
                     "\"latitude\":" + String(gps.location.lat(), 6) + ","
                     "\"longitude\":" + String(gps.location.lng(), 6) + ","
                     "\"status\":\"active\","
                     "\"timestamp\":" + String(millis()) + "}";
    
    http.begin(alertUrl);
    http.addHeader("Content-Type", "application/json");
    http.POST(jsonData);
    http.end();
  }
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
      enterConfigurationMode(); // Retry all
      return;
    }

    configComplete = true;
    preferences.begin("STRIker", true);
    String name = preferences.getString("name", "User");
    preferences.end();
    displayMessage("👋 Welcome " + name);
    delay(2500);
  }

  GPSSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
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

  // =============================
  // ✅ SENSOR MONITORING SECTION
  // =============================
  if (configComplete && millis() - lastMonitorTime > MONITOR_INTERVAL) {
    lastMonitorTime = millis();

    int heartRaw = analogRead(HEART_PIN);
    int soundRaw = analogRead(SOUND_PIN);
    int heartRate = map(heartRaw, 0, 4095, 50, 150);

    // Show sensor values
    u8g2.clearBuffer();
    u8g2.setCursor(0, 20); u8g2.print("HR: "); u8g2.print(heartRate);
    u8g2.setCursor(0, 40); u8g2.print("Sound: "); u8g2.print(soundRaw);
    u8g2.sendBuffer();

    // Trigger buzzer
    if ((heartRate > 120 || soundRaw > 700) && !buzzerOn) {
      digitalWrite(BUZZER_PIN, HIGH);
      buzzerOn = true;
    }

    // Manual buzzer off
    if (buzzerOn && digitalRead(BUZZER_OFF_PIN) == LOW) {
      digitalWrite(BUZZER_PIN, LOW);
      buzzerOn = false;
      displayMessage("🔕 Buzzer Off");
      delay(1000);
    }

    // Send to ThingSpeak
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

  // GPS Reading
  while (GPSSerial.available() > 0) {
    if (gps.encode(GPSSerial.read())) {
      if (gps.location.isValid()) {
        // GPS data is valid
      }
    }
  }

  // SOS Button Check
  if (digitalRead(SOS_BUTTON_PIN) == LOW) {
    if (gps.location.isValid()) {
      sendSOSAlert();
      displayMessage("🚨 SOS Sent!");
      delay(2000);
    } else {
      displayMessage("⚠️ Waiting for GPS");
      delay(1000);
    }
  }
}
