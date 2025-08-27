const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
   apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
   authDomain: "striker-e07d7.firebaseapp.com",
   projectId: "striker-e07d7",
   storageBucket: "striker-e07d7.firebasestorage.app",
   messagingSenderId: "220201380562",
   appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Global variables
  let alerts = [];
  let messages = [];
  
  // Function to display alerts
  function displayAlerts() {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;
  
    alertsList.innerHTML = alerts.map(alert => `
      <div class="alert-item" data-id="${alert.id}">
        <div class="alert-icon ${alert.type}">
          <i class="fas ${alert.type === 'critical' ? 'fa-exclamation' : alert.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info'}"></i>
        </div>
        <div class="alert-content">
          <div class="alert-title">${alert.title}</div>
          <div class="alert-description">${alert.description}</div>
          <div class="alert-time">${alert.time}</div>
          <div class="alert-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${alert.location}</span>
          </div>
        </div>
        <button class="respond-btn" onclick="showResponse(${JSON.stringify(alert).replace(/"/g, '&quot;')})">
          <i class="fas fa-reply"></i>
          Respond
        </button>
        <button class="resolve-btn" onclick="resolveAlert('${alert.id}')">
          <i class="fas fa-check"></i>
          Mark as Resolved
        </button>
      </div>
    `).join('');
  
    // Update total alerts count
    document.getElementById('total-alerts').textContent = `${alerts.length} new alerts`;
  }
  
  // Function to resolve an alert
  function resolveAlert(alertId) {
    db.collection('alerts').doc(alertId).update({
      status: 'resolved',
      resolvedAt: new Date()
    })
    .then(() => {
      showNotification('Alert marked as resolved', 'success');
    })
    .catch(error => {
      showNotification('Error resolving alert', 'error');
      console.error('Error resolving alert:', error);
    });
  }
  
  // Real-time alert listener
  function setupAlertListener() {
    db.collection('alerts')
      .where('status', '==', 'active')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const alert = {
              id: change.doc.id,
              ...change.doc.data()
            };
            alerts.unshift(alert);
            showNotification(`New alert: ${alert.title}`, 'info');
          } else if (change.type === 'modified') {
            const index = alerts.findIndex(a => a.id === change.doc.id);
            if (index !== -1) {
              alerts[index] = {
                id: change.doc.id,
                ...change.doc.data()
              };
            }
          } else if (change.type === 'removed') {
            alerts = alerts.filter(a => a.id !== change.doc.id);
          }
        });
        displayAlerts();
      });
  }
  
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
    setupAlertListener();
    showSection('dashboard');
  }); 