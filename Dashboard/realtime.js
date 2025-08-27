      import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
  
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
      const alertsRef = collection(db, "sos_collection");

// Make markAlertAsHandled function globally available
window.markAlertAsHandled = async function(alertId) {
  try {
    const alertRef = doc(db, "sos_collection", alertId);
    await updateDoc(alertRef, {
      status: 'handled',
      handledAt: new Date()
    });
    console.log(`Alert ${alertId} marked as handled`);
    
    // Force a UI update by triggering a new snapshot
    const alertItem = document.querySelector(`.alert-item[data-id="${alertId}"]`);
    if (alertItem) {
      alertItem.remove();
    }
  } catch (error) {
    console.error("Error marking alert as handled:", error);
  }
};
  
      // Live update map and alerts based on Firebase data
      const q = query(alertsRef, orderBy("timestamp", "desc"));
      onSnapshot(q, (snapshot) => {
        const alerts = [];
  const handledAlerts = [];
        let latestAlert = null;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const alert = {
            id: doc.id,
            latitude: data.latitude,
            longitude: data.longitude,
            location: data.location || `${data.latitude}, ${data.longitude}`,
            timestamp: data.timestamp.toDate().toLocaleTimeString(),
            status: data.status || 'active',
            type: data.type || 'critical'
          };
    
    if (alert.status === 'handled') {
      handledAlerts.push(alert);
    } else {
          alerts.push(alert);
          if (!latestAlert) latestAlert = alert;
    }
        });
 
        // Update map with latest alert location
        if (latestAlert) {
          document.getElementById("map-iframe").src = `https://maps.google.com/maps?q=${latestAlert.latitude},${latestAlert.longitude}&z=15&output=embed`;
          document.getElementById("current-location").textContent = latestAlert.location;
        }
 
  // Update active alerts display
        const alertContainer = document.getElementById("alert-container");
  if (alertContainer) {
        alertContainer.innerHTML = alerts.map(alert => `
      <div class="alert-item" data-id="${alert.id}">
        <div class="alert-icon ${alert.type}">
          <i class="fas fa-exclamation"></i>
        </div>
        <div class="alert-content">
          <div class="alert-title">SOS Alert</div>
          <div class="alert-description">Emergency signal received</div>
          <div class="alert-time">${alert.timestamp}</div>
          <div class="alert-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${alert.location}</span>
          </div>
        </div>
        <div class="alert-actions">
          <button class="alert-response-btn" onclick="showResponse(${JSON.stringify(alert).replace(/"/g, '&quot;')})">
            <i class="fas fa-reply"></i>
            Respond
          </button>
          <button class="alert-handle-btn" onclick="window.markAlertAsHandled('${alert.id}')">
            <i class="fas fa-check"></i>
            Mark as Handled
          </button>
        </div>
      </div>
    `).join('');
  }

  // Update historical alerts display
  const historyContainer = document.getElementById("history-alerts-container");
  if (historyContainer) {
    historyContainer.innerHTML = handledAlerts.map(alert => `
      <div class="alert-item" data-id="${alert.id}">
        <div class="alert-icon ${alert.type}">
              <i class="fas fa-exclamation"></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">SOS Alert</div>
              <div class="alert-description">Emergency signal received</div>
              <div class="alert-time">${alert.timestamp}</div>
              <div class="alert-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${alert.location}</span>
              </div>
            </div>
        <div class="alert-actions">
          <button class="alert-response-btn" onclick="showResponse(${JSON.stringify(alert).replace(/"/g, '&quot;')})">
              <i class="fas fa-reply"></i>
              Respond
            </button>
        </div>
          </div>
        `).join('');
  }
 
        // Update dashboard counters
  document.getElementById("total-triggers").textContent = alerts.length + handledAlerts.length;
        document.getElementById("total-alerts").textContent = `${alerts.length} new alerts`;
      });
  
      // Handle mock alert form for testing
      document.getElementById("mockAlertForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const lat = parseFloat(document.getElementById("mock-lat").value);
        const lng = parseFloat(document.getElementById("mock-lng").value);
        const location = document.getElementById("mock-location").value;
        try {
          await addDoc(alertsRef, {
            latitude: lat,
            longitude: lng,
            location,
            timestamp: new Date()
          });
          alert("Mock alert pushed to Firebase!");
        } catch (error) {
          alert("Error pushing mock alert: " + error.message);
        }
      });