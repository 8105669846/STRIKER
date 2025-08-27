import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
  authDomain: "striker-e07d7.firebaseapp.com",
  projectId: "striker-e07d7",
  storageBucket: "striker-e07d7.firebasestorage.app",
  messagingSenderId: "220201380562",
  appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get current station info
const currentStation = localStorage.getItem('currentStation') || 'Unknown Station';

// Function to send response
window.sendResponse = async (alertData, responseText) => {
  try {
    await addDoc(collection(db, "responses"), {
      alertId: alertData.id,
      station: alertData.station,
      responseText,
      respondedBy: currentStation,
      timestamp: new Date(),
      status: 'pending'
    });
    console.log("Response sent successfully");
  } catch (error) {
    console.error("Error sending response:", error);
  }
};

// Function to show response modal
window.showResponse = (alertData) => {
  const responseContainer = document.getElementById('response-container');
  const responseOverlay = document.getElementById('response-overlay');
  const responseTitle = document.getElementById('response-title');
  const responseDetails = document.getElementById('response-details');

  responseTitle.textContent = `Respond to Alert from ${alertData.station}`;
  responseDetails.innerHTML = `
    <p><strong>Location:</strong> ${alertData.location}</p>
    <p><strong>Time:</strong> ${new Date(alertData.timestamp?.toDate()).toLocaleTimeString()}</p>
    <p><strong>Message:</strong> ${alertData.message || 'No message provided'}</p>
  `;

  responseContainer.classList.add('show');
  responseOverlay.classList.add('show');
};

// Function to close response modal
window.closeResponse = () => {
  const responseContainer = document.getElementById('response-container');
  const responseOverlay = document.getElementById('response-overlay');
  responseContainer.classList.remove('show');
  responseOverlay.classList.remove('show');
};

// Listen for messages for current station
const messagesRef = query(
  collection(db, "responses"),
  where("station", "==", currentStation),
  orderBy("timestamp", "desc")
);

onSnapshot(messagesRef, (snapshot) => {
  const messagesList = document.getElementById('messages-list');
  messagesList.innerHTML = '';

  snapshot.forEach((doc) => {
    const data = doc.data();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
      <div class="message-header">
        <div class="message-sender">${data.respondedBy}</div>
        <div class="message-time">${new Date(data.timestamp?.toDate()).toLocaleString()}</div>
      </div>
      <div class="message-content">${data.responseText}</div>
      <div class="message-status ${data.status}">${data.status}</div>
    `;
    messagesList.appendChild(messageDiv);
  });
}); 