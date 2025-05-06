# import serial

# ESP32_PORT = 'COM5'
# BAUD_RATE = 115200

# def listen_for_upload():
#     try:
#         ser = serial.Serial(ESP32_PORT, BAUD_RATE, timeout=5)
#         print("Listening for data from ESP32...")

#         while True:
#             if ser.in_waiting > 0:
#                 line = ser.readline().decode('utf-8', errors='ignore').strip()
#                 print("Received:", line)

#                 if "SOS_TRIGGERED" in line:
#                     print("✅ SOS triggered! Proceeding with upload...")
#     except Exception as e:
#         print("❌ Error:", e)

# listen_for_upload()
import serial

try:
    ser = serial.Serial('COM5', 115200, timeout=5)
    print("✅ Connected to ESP32 on COM5. Listening...")

    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode('utf-8', errors='ignore').strip()
            print("Received:", data)

except Exception as e:
    print("❌ Error:", e)


