#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Firebase_ESP_Client.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

// Firebase Credentials
#define API_KEY "YOUR_FIREBASE_API_KEY"
#define USER_EMAIL "YOUR_AUTH_EMAIL"
#define USER_PASSWORD "YOUR_AUTH_PASSWORD"
#define PROJECT_ID "striker-police-dashboard"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

BluetoothSerial SerialBT;
Preferences preferences;

U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE);

#define BUTTON_PIN 14
#define BUZZER_PIN 27
#define BUZZER_OFF_PIN 26
#define HEART_PIN 36
#define SOUND_PIN 35
#define SOS_BUTTON 32

bool configComplete = false;
bool buttonPressed = false;
unsigned long buttonPressTime = 0;
unsigned long lastMonitorTime = 0;
const unsigned long MONITOR_INTERVAL = 15000;
bool buzzerOn = false;

// SOS-related
bool sosReady = false;
unsigned long sosPressStart = 0;
bool gpsLock = false;
float currentLat = 0.0, currentLng = 0.0;
TinyGPSPlus gps;
HardwareSerial ss(1); // for GPS module

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

void uploadToFirestore(float lat, float lng) {
  preferences.begin("STRIker", true);
  String name = preferences.getString("name", "");
  String phone1 = preferences.getString("phone1", "");
  String phone2 = preferences.getString("phone2", "");
  String email = preferences.getString("email", "");
  preferences.end();

  if (Firebase.ready()) {
    String documentPath = "sos_collection/" + String(random(100000, 999999));
    FirebaseJson content;
    content.set("fields/name/stringValue", name);
    content.set("fields/phone1/stringValue", phone1);
    content.set("fields/phone2/stringValue", phone2);
    content.set("fields/email/stringValue", email);
    content.set("fields/latitude/doubleValue", lat);
    content.set("fields/longitude/doubleValue", lng);
    content.set("fields/time/stringValue", String(millis()));
    content.set("fields/device/stringValue", "STRIker");

    if (Firebase.Firestore.createDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), content.raw())) {
      displayMessage("📤 Alert Sent");
    } else {
      displayMessage("❌ Alert Fail");
    }
    delay(1500);
  }
}

void setup() {
  Serial.begin(115200);
  ss.begin(9600, SERIAL_8N1, 33, 34); // GPS RX, TX

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUZZER_OFF_PIN, INPUT_PULLUP);
  pinMode(SOS_BUTTON, INPUT_PULLUP);
  pinMode(HEART_PIN, INPUT);
  pinMode(SOUND_PIN, INPUT);
  digitalWrite(BUZZER_PIN, LOW);

  u8g2.begin();
  u8g2.setFont(u8g2_font_ncenB08_tr);

  preferences.begin("STRIker", false);
  String apiKey = preferences.getString("apiKey", "");
  String ssid = preferences.getString("wifiSSID", "");
  String pass = preferences.getString("wifiPASS", "");
  preferences.end();

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

  // Firebase Setup
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = NULL;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  configComplete = true;

  preferences.begin("STRIker", true);
  String name = preferences.getString("name", "User");
  preferences.end();
  displayMessage("👋 Welcome " + name);
  delay(2500);
}

void loop() {
  // Power Button Handling
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    if (!buttonPressed) {
      buttonPressTime = millis();
      buttonPressed = true;
    } else if (millis() - buttonPressTime >= 3000) {
      displayMessage("⚠ Formatting...");
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

  // SOS Button Handling
  int sosState = digitalRead(SOS_BUTTON);
  if (sosState == LOW) {
    if (!sosReady) {
      sosPressStart = millis();
      displayMessage("📡 Waiting GPS...");
      while (millis() - sosPressStart < 4000 && !gps.location.isValid()) {
        while (ss.available()) gps.encode(ss.read());
        if (gps.location.isUpdated()) {
          gpsLock = true;
          currentLat = gps.location.lat();
          currentLng = gps.location.lng();
          break;
        }
        delay(100);
      }
      if (!gpsLock) {
        currentLat = 0.0;
        currentLng = 0.0;
      }
      sosReady = true;
      displayMessage("📍 SOS Ready");
      delay(1000);
    } else {
      displayMessage("🚨 Sending SOS...");
      uploadToFirestore(currentLat, currentLng);
      sosReady = false;
    }
  }

  // Manual Buzzer Off
  if (buzzerOn && digitalRead(BUZZER_OFF_PIN) == LOW) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerOn = false;
    displayMessage("🔕 Buzzer Off");
    delay(1000);
  }

  // Periodic Sensor Monitoring
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

    if ((heartRate > 120 || soundRaw > 700) && !buzzerOn) {
      digitalWrite(BUZZER_PIN, HIGH);
      buzzerOn = true;
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
}
