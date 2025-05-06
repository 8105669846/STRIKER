// Utility functions
export function showNotification(message, type = 'info') {
    const notificationBar = document.getElementById('notificationBar');
    const notificationMessage = document.getElementById('notificationMessage');
    
    // Clear any existing timeout
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    // Set message and type
    notificationMessage.textContent = message;
    notificationBar.className = `notification-bar ${type}`;
    
    // Show notification with animation
    notificationBar.style.display = 'block';
    notificationBar.style.animation = 'slideDown 0.3s ease-out';
    
    // Auto-hide after 3 seconds
    window.notificationTimeout = setTimeout(() => {
        notificationBar.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            notificationBar.style.display = 'none';
        }, 300);
    }, 3000);
}

export function closeNotification() {
    const notificationBar = document.getElementById('notificationBar');
    notificationBar.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => {
        notificationBar.style.display = 'none';
    }, 300);
}

export function showSection(sectionId) {
    const sections = document.querySelectorAll('.main-content > div');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// Officer details update
export async function updateOfficerDetails() {
    console.log('Update Officer Details button clicked'); // Debug log
    
    // Get input values
    const stationName = document.getElementById('stationName').value.trim();
    const stationNumber = document.getElementById('stationNumber').value.trim();
    const fileInput = document.getElementById('officerFile');
    
    // Validate inputs
    if (!stationName || !stationNumber) {
        showNotification('Please enter both station name and number', 'error');
        return;
    }

    if (!fileInput.files || !fileInput.files[0]) {
        showNotification('Please upload a file', 'error');
        return;
    }

    try {
        // Show processing modal
        document.getElementById('ai-processing-modal').classList.add('show');
        
        const file = fileInput.files[0];
        console.log('Processing file:', file.name); // Debug log
        
        // Process the file
        const officerData = await processExcelFile(file, stationName, stationNumber);
        
        if (officerData) {
            // Update UI
            document.getElementById('officerName').textContent = officerData.name;
            document.getElementById('officerRank').textContent = officerData.rank;
            document.getElementById('officerStation').textContent = officerData.station;
            document.getElementById('officerStationNumber').textContent = officerData.stationNumber;
            
            // Update profile display
            document.getElementById('officer-name-display').textContent = officerData.name;
            document.getElementById('officer-rank-display').textContent = officerData.rank;
            
            // Close processing modal
            document.getElementById('ai-processing-modal').classList.remove('show');
            
            showNotification('Officer details updated successfully', 'success');
        } else {
            document.getElementById('ai-processing-modal').classList.remove('show');
            showNotification('No matching officer found', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('ai-processing-modal').classList.remove('show');
        showNotification(error.message, 'error');
    }
}

// File processing functions
async function processExcelFile(file, stationName, stationNumber) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                // Get headers (first row)
                const headers = jsonData[0].map(h => h.toString().toLowerCase().trim());
                
                // Find column indices
                const nameIndex = headers.findIndex(h => h.includes('name'));
                const rankIndex = headers.findIndex(h => h.includes('rank'));
                const stationIndex = headers.findIndex(h => h.includes('station'));
                const numberIndex = headers.findIndex(h => h.includes('number'));
                
                if (nameIndex === -1 || rankIndex === -1 || stationIndex === -1 || numberIndex === -1) {
                    throw new Error('Required columns not found in Excel file');
                }
                
                // Find matching officer
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row[stationIndex] && row[numberIndex] && 
                        row[stationIndex].toString().toLowerCase() === stationName.toLowerCase() && 
                        row[numberIndex].toString() === stationNumber) {
                        resolve({
                            name: row[nameIndex] || '',
                            rank: row[rankIndex] || '',
                            station: row[stationIndex] || '',
                            stationNumber: row[numberIndex] || ''
                        });
                        return;
                    }
                }
                resolve(null);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(new Error('Error reading file'));
        reader.readAsArrayBuffer(file);
    });
}

function updateOfficerUI(officerData) {
    document.getElementById('officerName').textContent = officerData.name;
    document.getElementById('officerRank').textContent = officerData.rank;
    document.getElementById('officerStation').textContent = officerData.station;
    document.getElementById('officerStationNumber').textContent = officerData.stationNumber;
}

// UI Event Handlers
export function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

export function toggleProfileActions() {
    const profileActions = document.querySelector('.profile-actions');
    profileActions.classList.toggle('show');
}

export function handleLogout() {
    console.log('Logout button clicked'); // Debug log
    try {
        // Clear any stored data
        localStorage.clear();
        
        // Show logout notification
        showNotification('Logged out successfully', 'success');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error during logout', 'error');
    }
}

// Response System
export function showResponse(type, message) {
    const responseContainer = document.getElementById('responseContainer');
    const responseContent = document.getElementById('responseContent');
    responseContent.textContent = message;
    responseContainer.style.display = 'block';
}

export function closeResponse() {
    const responseContainer = document.getElementById('responseContainer');
    responseContainer.style.display = 'none';
}

export function sendResponse() {
    const responseInput = document.getElementById('responseInput');
    const response = responseInput.value.trim();
    
    if (response) {
        // Implement response sending logic
        showNotification('Response sent successfully', 'success');
        closeResponse();
        responseInput.value = '';
    } else {
        showNotification('Please enter a response', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Debug log
    
    // Set up event listeners
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.querySelector('.logout-option'); // Changed to use class selector
    const closeResponseBtn = document.getElementById('closeResponse');
    const sendResponseBtn = document.getElementById('sendResponseBtn');
    const updateOfficerBtn = document.getElementById('updateOfficerBtn');

    // Debug log to check if buttons are found
    console.log('Buttons found:', {
        toggleSidebarBtn: !!toggleSidebarBtn,
        profileBtn: !!profileBtn,
        logoutBtn: !!logoutBtn,
        closeResponseBtn: !!closeResponseBtn,
        sendResponseBtn: !!sendResponseBtn,
        updateOfficerBtn: !!updateOfficerBtn
    });

    if (toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
    if (profileBtn) profileBtn.addEventListener('click', toggleProfileActions);
    if (logoutBtn) {
        console.log('Adding event listener to logout button');
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.error('Logout button not found!');
    }
    if (closeResponseBtn) closeResponseBtn.addEventListener('click', closeResponse);
    if (sendResponseBtn) sendResponseBtn.addEventListener('click', sendResponse);
    
    // Add event listener for update officer button with debug logging
    if (updateOfficerBtn) {
        console.log('Adding event listener to updateOfficerBtn');
        updateOfficerBtn.addEventListener('click', () => {
            console.log('Update Officer button clicked');
            updateOfficerDetails();
        });
    } else {
        console.error('Update Officer button not found!');
    }

    // Handle dropdown menus
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
});

const messages = [
  {
    id: 1,
    sender: "Control Room",
    time: "10:30 AM",
    content: "New SOS signal received from Sector 12"
  },
  {
    id: 2,
    sender: "Dispatch Unit",
    time: "09:45 AM",
    content: "Unit 5 responding to distress call"
  },
  {
    id: 3,
    sender: "System Alert",
    time: "09:15 AM",
    content: "System maintenance completed"
  }
];

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "SOS Signal Detected",
    description: "Emergency signal received from Sector 12, immediate response required",
    time: "10:30 AM",
    location: "Sector 12, New Delhi"
  },
  {
    id: 2,
    type: "warning",
    title: "System Overload",
    description: "High number of concurrent connections detected",
    time: "09:45 AM",
    location: "Control Room"
  },
  {
    id: 3,
    type: "info",
    title: "System Update",
    description: "New security patches installed successfully",
    time: "09:15 AM",
    location: "System"
  }
];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main');
    const overlay = document.getElementById('overlay');
    const hamburger = document.querySelector('.hamburger-menu');
    
    // Set initial states based on screen size
    if (window.innerWidth <= 992) {
        sidebar.classList.add('collapsed');
        main.classList.add('expanded');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }

    // Toggle Sidebar Function
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
        overlay.classList.toggle('active');
        
        // Update hamburger icon
        if (sidebar.classList.contains('collapsed')) {
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        } else {
            hamburger.innerHTML = '<i class="fas fa-times"></i>';
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
        
        // Handle large screens
        if (window.innerWidth >= 1920) {
            if (sidebar.classList.contains('collapsed')) {
                sidebar.style.transform = 'translateX(-100%)';
            } else {
                sidebar.style.transform = 'translateX(0)';
            }
        }
    }

    // Add click event to hamburger menu
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });

    // Add click event to overlay
    overlay.addEventListener('click', function() {
        if (!sidebar.classList.contains('collapsed')) {
            toggleSidebar();
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 1920) {
                // Large screen behavior
                sidebar.style.transform = sidebar.classList.contains('collapsed') ? 'translateX(-100%)' : 'translateX(0)';
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            } else if (window.innerWidth > 992) {
                // Desktop behavior
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            } else {
                // Mobile behavior
                if (sidebar.classList.contains('collapsed')) {
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                } else {
                    overlay.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    hamburger.innerHTML = '<i class="fas fa-times"></i>';
                }
            }
        }, 250);
    });

    // Touch event handlers
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        
        // Only handle horizontal swipes
        if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
            const minSwipeDistance = window.innerWidth >= 1920 ? 100 : 50;
            
            if (Math.abs(swipeDistanceX) >= minSwipeDistance) {
                if (swipeDistanceX > 0 && sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                } else if (swipeDistanceX < 0 && !sidebar.classList.contains('collapsed')) {
                    toggleSidebar();
                }
            }
        }
    }

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !sidebar.classList.contains('collapsed')) {
            toggleSidebar();
        }
    });

    // Get all the necessary containers
    const dashboardContent = document.getElementById('dashboard-content');
    const messagesContainer = document.getElementById('messages-container');
    const alertsContainer = document.getElementById('alerts-container');
    const settingsContainer = document.getElementById('settings-container');

    // Get all sidebar menu items
    const menuItems = document.querySelectorAll('.sidebar ul li');

    // Hide all sections except dashboard initially
    messagesContainer.style.display = 'none';
    alertsContainer.style.display = 'none';
    settingsContainer.style.display = 'none';

    // Add click event listeners to menu items
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');

            // Hide all containers first
            dashboardContent.style.display = 'none';
            messagesContainer.style.display = 'none';
            alertsContainer.style.display = 'none';
            settingsContainer.style.display = 'none';

            // Show the appropriate container based on clicked item
            const text = this.querySelector('span').textContent.trim().toLowerCase();
            
            switch(text) {
                case 'dashboard':
                    dashboardContent.style.display = 'block';
                    break;
                case 'messages':
                    messagesContainer.style.display = 'block';
                    break;
                case 'alerts':
                    alertsContainer.style.display = 'block';
                    break;
                case 'settings':
                    settingsContainer.style.display = 'block';
                    break;
            }

            // If on mobile, close the sidebar after selection
            if (window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    });
});

function uploadProfilePicture() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.querySelector('.user-info img').src = e.target.result;
        showNotification('Profile picture updated', 'success');
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
  document.querySelector('.profile-actions').classList.remove('active');
}

// Dark Mode Functionality
const darkModeToggle = document.getElementById('darkModeToggle');

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});

function updateMapLocation() {
  // This would typically use the Google Maps API to get the current location
  // For now, we'll simulate getting the location from the map
  const mapIframe = document.getElementById('map-iframe');
  const locationDisplay = document.getElementById('current-location');
  
  // Simulate getting location from map
  // In a real implementation, you would use the Google Maps API
  // const locations = [
  //   'New Delhi, India',
  //   'Mumbai, India',
  //   'Bangalore, India',
  //   'Chennai, India',
  //   'Kolkata, India'
  // ];
  
  // Update location every 5 seconds (simulation)
  setInterval(() => {
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    locationDisplay.textContent = randomLocation;
  }, 5000);
}

// Initialize dashboard
showSection('dashboard');

function displayAlerts() {
  // Implementation of displayAlerts function
}

function displayMessages() {
  // Implementation of displayMessages function
}

// Handle dropdown menus
document.querySelectorAll('.dropdown').forEach(dropdown => {
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
});

// Handle dropdown menu item clicks
document.querySelectorAll('.dropdown-menu li').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const text = item.querySelector('span').textContent;
    console.log(`Selected: ${text}`);
    // Add your navigation logic here
  });
});

// Handle nested dropdowns
document.querySelectorAll('.nested-dropdown').forEach(dropdown => {
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
});

// Handle nested menu item clicks
document.querySelectorAll('.nested-menu li').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const text = item.querySelector('span').textContent;
    console.log(`Selected: ${text}`);
    // Add your navigation logic here
  });
});

// Close all dropdowns when clicking outside
document.addEventListener('click', (e) => {
  document.querySelectorAll('.dropdown, .nested-dropdown').forEach(dropdown => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
});