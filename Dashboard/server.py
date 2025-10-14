from flask import Flask, jsonify
import pyrebase

app = Flask(__name__)

# Firebase configuration
config = {
    # "apiKey": "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI",
    # "authDomain": "striker-police-dashboard.firebaseapp.com",
    # "databaseURL": r"https://striker-police-dashboard.firebaseio.com",
    # "projectId": "striker-police-dashboard",
    # "storageBucket": "striker-police-dashboard.firebasestorage.app",
    # "messagingSenderId": "534590523839",
    # "appId": "1:534590523839:web:861fb206f474b3b2bff90a"
    apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
    authDomain: "striker-e07d7.firebaseapp.com",
    databaseURL: "https://striker-e07d7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "striker-e07d7",
    storageBucket: "striker-e07d7.firebasestorage.app",
    messagingSenderId: "220201380562",
    appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
}
# Initialize Firebase
firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

# Generate Bearer Token
def generate_token():
    user = auth.sign_in_with_email_and_password("striker@esp32.com", "STRIker")
    id_token = user['idToken']
    return id_token

@app.route('/get-token', methods=['GET'])
def get_token():
    token = generate_token()
    return jsonify({'token': token})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
