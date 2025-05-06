import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI",
  authDomain: "striker-police-dashboard.firebaseapp.com",
  projectId: "striker-police-dashboard",
  storageBucket: "striker-police-dashboard.firebasestorage.app",
  messagingSenderId: "534590523839",
  appId: "1:534590523839:web:861fb206f474b3b2bff90a"
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