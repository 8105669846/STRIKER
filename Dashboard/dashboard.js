const firebaseConfig = {
   apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
   authDomain: "striker-e07d7.firebaseapp.com",
   databaseURL: "https://striker-e07d7-default-rtdb.asia-southeast1.firebasedatabase.app",
   projectId: "striker-e07d7",
   storageBucket: "striker-e07d7.firebasestorage.app",
   messagingSenderId: "220201380562",
   appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Global variables
  let messages = [];
  
  // Function to show response modal
  function showResponse(item) {
    currentResponseItem = item;
    const container = document.getElementById('response-container');
    const overlay = document.getElementById('response-overlay');
    const title = document.getElementById('response-title');
    const details = document.getElementById('response-details');
  
    title.textContent = 'Respond to Alert';
    details.innerHTML = `
      <div class="alert-item">
        <div class="alert-icon ${item.type}">
          <i class="fas ${item.type === 'critical' ? 'fa-exclamation' : item.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info'}"></i>
        </div>
        <div class="alert-content">
          <div class="alert-title">${item.title}</div>
          <div class="alert-description">${item.description}</div>
          <div class="alert-time">${item.time}</div>
          <div class="alert-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${item.location}</span>
          </div>
        </div>
      </div>
    `;
  
    container.classList.add('show');
    overlay.classList.add('show');
  }
  
  // Function to send response
  function sendResponse() {
    const responseText = document.getElementById('response-text').value.trim();
    if (responseText && currentResponseItem) {
      db.collection('responses').add({
        alertId: currentResponseItem.id,
        text: responseText,
        timestamp: new Date(),
        officerId: 'current_user_id' // Replace with actual user ID
      })
      .then(() => {
        showNotification('Response sent successfully', 'success');
        closeResponse();
      })
      .catch(error => {
        showNotification('Error sending response', 'error');
        console.error('Error sending response:', error);
      });
    } else {
      showNotification('Please enter a response', 'error');
    }
  }
  
  // Function to show notification
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // showSection function is defined in script.js, so we don't need to call it here
    console.log('Dashboard initialized');
  }); 