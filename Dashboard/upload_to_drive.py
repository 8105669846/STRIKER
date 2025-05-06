from __future__ import print_function
import os.path
import firebase_admin
from firebase_admin import credentials, firestore
import requests

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# SCOPES for accessing Drive
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Upload file from SD card
def upload_to_drive(filename):
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            'client_secret_193777279254-jgj7r4am8lcetjc9otq84vlb7a2umh3h.apps.googleusercontent.com.json', SCOPES)
        creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('drive', 'v3', credentials=creds)
    
    file_metadata = {'name': filename}
    media = MediaFileUpload(filename, mimetype='audio/wav')  # or mp3 etc
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    file_id = file.get('id')
    
    # Make it public
    service.permissions().create(fileId=file_id, body={'role': 'reader', 'type': 'anyone'}).execute()
    file_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    
    print("✅ Uploaded:", file_link)
    return file_link

# Push to Firebase
def push_to_firebase(download_url):
    cred = credentials.Certificate("striker-police-dashboard-firebase-adminsdk-fbsvc-01e90506ae.json")  # Your Firebase admin key
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    db.collection("sos_alerts").add({
        "type": "audio",
        "url": download_url
    })
    print("📌 Pushed to Firebase")

# Push to ThingSpeak
def push_to_thingspeak(download_url, api_key):
    requests.get(f"https://api.thingspeak.com/update?api_key={api_key}&field1={download_url}")
    print("📤 Pushed to ThingSpeak")

if __name__ == '__main__':
    filename = "recording.wav"  # Saved by ESP32 to SD card
    drive_link = upload_to_drive(filename)
    push_to_firebase(drive_link)
    push_to_thingspeak(drive_link, "9XYIO0KC6004TKFY")
