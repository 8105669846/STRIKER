      import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
  
      const firebaseConfig = {
  apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
  authDomain: "striker-e07d7.firebaseapp.com",
  databaseURL: "https://striker-e07d7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "striker-e07d7",
  storageBucket: "striker-e07d7.firebasestorage.app",
  messagingSenderId: "220201380562",
  appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
};

  
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const alertsRef = collection(db, "sos_collection");
      
      console.log("Firebase initialized successfully");
      console.log("Database reference:", db);
      console.log("Alerts collection reference:", alertsRef);
      
      // Test function to add a sample alert if none exist
      window.addTestAlert = async function() {
        try {
          await addDoc(alertsRef, {
            latitude: 28.6139,
            longitude: 77.2090,
            location: "New Delhi, India",
            name: "Officer John Smith",
            timestamp: new Date(),
            status: 'active',
            type: 'critical'
          });
          console.log("Test alert added successfully");
        } catch (error) {
          console.error("Error adding test alert:", error);
        }
      };

      // Function to show alert location on map
      window.showAlertOnMap = function(latitude, longitude, location, officerName) {
        console.log(`Showing alert location: ${location} for ${officerName}`);
        
        // Update the map iframe to show the specific location
        const mapIframe = document.getElementById("map-iframe");
        if (mapIframe) {
          mapIframe.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
        }
        
        // Update the current location display
        const locationDisplay = document.getElementById("current-location");
        if (locationDisplay) {
          locationDisplay.textContent = `${location} (${officerName})`;
        }
        
        // Show notification
        if (window.showNotification) {
          window.showNotification(`Viewing location: ${location}`, 'info');
        } else {
          alert(`Viewing location: ${location} for ${officerName}`);
        }
      };

      // Sound alert functionality
      let lastAlertCount = 0;
      let soundEnabled = true;

      // Create audio context for sound alerts
      let audioContext;
      function initAudioContext() {
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
      }

      // Function to play SOS alert sound
      function playSOSAlertSound() {
        if (!soundEnabled) return;
        
        try {
          initAudioContext();
          
          // Create a beep sound for SOS alert
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // SOS pattern: ... --- ... (3 short, 3 long, 3 short)
          const sosPattern = [
            { freq: 800, duration: 0.1 }, // S
            { freq: 800, duration: 0.1 }, // S
            { freq: 800, duration: 0.1 }, // S
            { freq: 0, duration: 0.1 },   // pause
            { freq: 800, duration: 0.3 }, // O
            { freq: 800, duration: 0.3 }, // O
            { freq: 800, duration: 0.3 }, // O
            { freq: 0, duration: 0.1 },   // pause
            { freq: 800, duration: 0.1 }, // S
            { freq: 800, duration: 0.1 }, // S
            { freq: 800, duration: 0.1 }  // S
          ];
          
          let currentTime = audioContext.currentTime;
          
          sosPattern.forEach((note, index) => {
            if (note.freq > 0) {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              
              osc.connect(gain);
              gain.connect(audioContext.destination);
              
              osc.frequency.setValueAtTime(note.freq, currentTime);
              gain.gain.setValueAtTime(0.3, currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
              
              osc.start(currentTime);
              osc.stop(currentTime + note.duration);
            }
            currentTime += note.duration;
          });
          
        } catch (error) {
          console.log('Audio not supported or blocked:', error);
        }
      }

      // Function to show sound alert indicator
      function showSoundAlertIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'sound-alert-indicator';
        indicator.innerHTML = '🚨 NEW SOS ALERT 🚨';
        document.body.appendChild(indicator);
        
        // Show indicator
        indicator.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
          indicator.style.display = 'none';
          document.body.removeChild(indicator);
        }, 3000);
      }

      // Function to toggle sound alerts
      window.toggleSoundAlerts = function() {
        soundEnabled = !soundEnabled;
        
        // Update button icon
        const soundBtn = document.querySelector('.sound-toggle-btn i');
        if (soundBtn) {
          soundBtn.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
        
        // Update button class
        const soundButton = document.querySelector('.sound-toggle-btn');
        if (soundButton) {
          if (soundEnabled) {
            soundButton.classList.remove('muted');
          } else {
            soundButton.classList.add('muted');
          }
        }
        
        if (window.showNotification) {
          window.showNotification(
            soundEnabled ? 'Sound alerts enabled' : 'Sound alerts disabled', 
            soundEnabled ? 'success' : 'info'
          );
        }
        return soundEnabled;
      };

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
      console.log("Setting up Firebase listener for sos_collection...");
      const q = query(alertsRef, orderBy("timestamp", "desc"));
      onSnapshot(q, (snapshot) => {
        console.log("Firebase snapshot received:", snapshot.size, "documents");
        const alerts = [];
        const handledAlerts = [];
        let latestAlert = null;
        
        // Process all documents first
        const allAlerts = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Processing document:", doc.id, data);
          
          const alert = {
            id: doc.id,
            latitude: data.latitude,
            longitude: data.longitude,
            location: data.location || `${data.latitude}, ${data.longitude}`,
            name: data.name || data.officerName || 'Unknown Officer',
            timestamp: data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : 
                      data.timestamp && data.timestamp.seconds ? new Date(data.timestamp.seconds * 1000) :
                      new Date(),
            status: data.status || 'active',
            type: data.type || 'critical'
          };
          
          // Format timestamp for display
          const date = alert.timestamp;
          const timeString = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
          const dateString = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          alert.displayTime = `${timeString} • ${dateString}`;
          
          allAlerts.push(alert);
        });
        
        // Sort all alerts by timestamp (newest first for display, but oldest first for priority)
        allAlerts.sort((a, b) => b.timestamp - a.timestamp);
        
        // Separate active and handled alerts
        allAlerts.forEach(alert => {
          if (alert.status === 'handled') {
            handledAlerts.push(alert);
          } else {
            alerts.push(alert);
            if (!latestAlert) latestAlert = alert;
          }
        });
        
        // For priority display, sort active alerts by oldest first (first come first serve)
        alerts.sort((a, b) => a.timestamp - b.timestamp);
 
        // Update map with latest alert location
        if (latestAlert) {
          document.getElementById("map-iframe").src = `https://maps.google.com/maps?q=${latestAlert.latitude},${latestAlert.longitude}&z=15&output=embed`;
          document.getElementById("current-location").textContent = latestAlert.location;
        }
 
  // Update active alerts display
        const alertContainer = document.getElementById("alert-container");
        console.log("Alert container found:", !!alertContainer);
        console.log("Active alerts count:", alerts.length);
  if (alertContainer) {
        alertContainer.innerHTML = alerts.map(alert => `
      <div class="alert-item" data-id="${alert.id}">
        <div class="alert-icon ${alert.type}" onclick="showAlertOnMap(${alert.latitude}, ${alert.longitude}, '${alert.location}', '${alert.name}')" style="cursor: pointer;" title="Click to view on map">
          <i class="fas fa-exclamation"></i>
        </div>
        <div class="alert-content">
          <div class="alert-title">SOS Alert from ${alert.name}</div>
          <div class="alert-description">Emergency signal received from officer</div>
          <div class="alert-time">${alert.displayTime}</div>
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
        <div class="alert-icon ${alert.type}" onclick="showAlertOnMap(${alert.latitude}, ${alert.longitude}, '${alert.location}', '${alert.name}')" style="cursor: pointer;" title="Click to view on map">
              <i class="fas fa-exclamation"></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">SOS Alert from ${alert.name}</div>
              <div class="alert-description">Emergency signal received from officer</div>
              <div class="alert-time">${alert.displayTime}</div>
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
 
        // Check for new alerts and trigger sound
        if (alerts.length > lastAlertCount) {
          console.log(`New alert detected! Playing SOS sound...`);
          playSOSAlertSound();
          showSoundAlertIndicator();
          
          // Show notification for new alert
          if (window.showNotification && alerts.length > 0) {
            const latestAlert = alerts[alerts.length - 1];
            window.showNotification(`New SOS Alert from ${latestAlert.name}`, 'error');
          }
        }
        lastAlertCount = alerts.length;

        // Update dashboard counters
  document.getElementById("total-triggers").textContent = alerts.length + handledAlerts.length;
        document.getElementById("total-alerts").textContent = `${alerts.length} new alerts`;
      }, (error) => {
        console.error("Error in Firebase listener:", error);
      });
  
      // Handle mock alert form for testing
      const mockForm = document.getElementById("mockAlertForm");
      if (mockForm) {
        mockForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const lat = parseFloat(document.getElementById("mock-lat").value);
          const lng = parseFloat(document.getElementById("mock-lng").value);
          const location = document.getElementById("mock-location").value;
          const name = document.getElementById("mock-name") ? document.getElementById("mock-name").value : "Test Officer";
          try {
            await addDoc(alertsRef, {
              latitude: lat,
              longitude: lng,
              location,
              name,
              timestamp: new Date()
            });
            alert("Mock alert pushed to Firebase!");
          } catch (error) {
            alert("Error pushing mock alert: " + error.message);
          }
        });
      }