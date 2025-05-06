# This is for firebase SOS alert authentication
# SERVICE_ACCOUNT_FILE = r"C:\Users\sinch\Downloads\striker-police-dashboard-firebase-adminsdk-fbsvc-edca4e553e.json"
from flask import Flask, jsonify
from google.oauth2 import service_account
from google.auth.transport.requests import Request

app = Flask(__name__)

# 🔐 Path to your downloaded service account file
SERVICE_ACCOUNT_FILE = r"C:\Users\sinch\Downloads\striker-police-dashboard-firebase-adminsdk-fbsvc-edca4e553e.json"

@app.route('/get-token', methods=['GET'])
def get_token():
    try:
        # ✅ Load credentials every time (ensures freshness)
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/datastore"]
        )

        # 🔁 Force refresh to get token
        request = Request()
        credentials.refresh(request)

        return jsonify({"token": credentials.token})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


