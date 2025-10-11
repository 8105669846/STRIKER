function showUploadModal() {
    document.getElementById('upload-modal').classList.add('show');
  }

  function closeUploadModal() {
    document.getElementById('upload-modal').classList.remove('show');
  }

  function updateOfficerDetails() {
    const stationName = document.getElementById('station-name').value;
    const stationNumber = document.getElementById('station-number').value;
    
    if (!stationName || !stationNumber) {
      alert('Please enter both station name and number');
      return;
    }

    // Here you would typically make an API call to get officer details
    // For now, we'll simulate the response
    const officerData = {
      name: 'Unknown Officer',
      rank: 'Unknown Rank',
      station: stationName,
      badge: stationNumber
    };

    updateOfficerDisplay(officerData);
  }

  function updateOfficerDisplay(data) {
    document.getElementById('officer-name').textContent = data.name;
    document.getElementById('officer-rank').textContent = data.rank;
    document.getElementById('officer-station').textContent = data.station;
    document.getElementById('officer-badge').textContent = data.badge;
  }

  // Add event listener for file upload
  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('officer-file').files[0];
    if (!file) return;

    const status = document.getElementById('upload-status');
    status.className = 'upload-status';
    
    try {
      // Here you would typically upload the file to your server
      // and process it to extract officer details
      status.textContent = 'Processing file...';
      status.classList.add('success');
      
      // Simulate file processing
      setTimeout(() => {
        status.textContent = 'File processed successfully! Officer details will be updated automatically.';
        closeUploadModal();
      }, 2000);
    } catch (error) {
      status.textContent = 'Error processing file: ' + error.message;
      status.classList.add('error');
    }
  });
  }

  // Add click handler for upload option in sidebar
  document.querySelector('.sidebar ul li:nth-child(2)').addEventListener('click', showUploadModal);

  function toggleProfileActions() {
    const actions = document.querySelector('.profile-actions');
    actions.classList.toggle('active');
  }

  function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('profile-image').src = e.target.result;
        // Save to localStorage
        localStorage.setItem('profilePhoto', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function fetchProfilePhoto() {
    const stationName = document.getElementById('station-name').value;
    const stationNumber = document.getElementById('station-number').value;
    
    if (!stationName || !stationNumber) {
      alert('Please enter station details first');
      return;
    }

    showAIProcessingModal();
    simulateAIProcessing();
  }

  function showAIProcessingModal() {
    document.getElementById('ai-processing-modal').classList.add('show');
  }

  function closeAIProcessingModal() {
    document.getElementById('ai-processing-modal').classList.remove('show');
  }

  function simulateAIProcessing() {
    const progressBar = document.getElementById('processing-progress');
    const message = document.getElementById('processing-message');
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = `${progress}%`;
      
      if (progress === 20) message.textContent = 'Analyzing station data...';
      if (progress === 40) message.textContent = 'Searching officer database...';
      if (progress === 60) message.textContent = 'Generating profile...';
      if (progress === 80) message.textContent = 'Finalizing details...';
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          closeAIProcessingModal();
          updateOfficerProfile();
        }, 1000);
      }
    }, 500);
  }

  function updateOfficerProfile() {
    const stationName = document.getElementById('station-name').value;
    const stationNumber = document.getElementById('station-number').value;
    
    // Simulate AI-generated data
    const officerData = {
      name: `Officer ${stationNumber}`,
      rank: 'Senior Police Officer',
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${stationNumber}`,
      station: stationName,
      badge: stationNumber
    };

    // Update display
    document.getElementById('profile-image').src = officerData.photo;
    document.getElementById('officer-name-display').textContent = officerData.name;
    document.getElementById('officer-rank-display').textContent = officerData.rank;
    
    // Save to localStorage
    localStorage.setItem('officerData', JSON.stringify(officerData));
  }

  // Load saved data on page load
  window.addEventListener('load', () => {
    const savedPhoto = localStorage.getItem('profilePhoto');
    const savedData = localStorage.getItem('officerData');
    
    if (savedPhoto) {
      document.getElementById('profile-image').src = savedPhoto;
    }
    
    if (savedData) {
      const data = JSON.parse(savedData);
      document.getElementById('officer-name-display').textContent = data.name;
      document.getElementById('officer-rank-display').textContent = data.rank;
    }
  });

  // Close profile actions when clicking outside
  document.addEventListener('click', (e) => {
    const profileContainer = document.querySelector('.profile-image-container');
    if (!profileContainer.contains(e.target)) {
      document.querySelector('.profile-actions').classList.remove('active');
    }
  });

  function showCustomizationModal() {
    document.getElementById('customization-modal').classList.add('show');
    // Load saved preferences
    const savedPrefs = JSON.parse(localStorage.getItem('profilePreferences') || '{}');
    if (savedPrefs.avatarStyle) {
      document.querySelector(`.style-option[onclick*="${savedPrefs.avatarStyle}"]`).classList.add('active');
    }
    if (savedPrefs.profileColor) {
      document.querySelector(`.color-option[style*="${savedPrefs.profileColor}"]`).classList.add('active');
    }
    if (savedPrefs.customName) {
      document.getElementById('custom-name').value = savedPrefs.customName;
    }
    if (savedPrefs.customRank) {
      document.getElementById('custom-rank').value = savedPrefs.customRank;
    }
  }

  function closeCustomizationModal() {
    document.getElementById('customization-modal').classList.remove('show');
  }

  function selectAvatarStyle(style) {
    document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
    event.currentTarget.classList.add('active');
    localStorage.setItem('selectedAvatarStyle', style);
  }

  function selectProfileColor(color) {
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    event.currentTarget.classList.add('active');
    localStorage.setItem('selectedProfileColor', color);
    // Apply color to profile elements
    document.documentElement.style.setProperty('--profile-color', color);
  }

  function saveCustomization() {
    const preferences = {
      avatarStyle: localStorage.getItem('selectedAvatarStyle') || 'avataaars',
      profileColor: localStorage.getItem('selectedProfileColor') || '#3b82f6',
      customName: document.getElementById('custom-name').value,
      customRank: document.getElementById('custom-rank').value
    };

    localStorage.setItem('profilePreferences', JSON.stringify(preferences));
    
    // Update profile display
    updateProfileDisplay(preferences);
    closeCustomizationModal();
    
    // Show success message
    const status = document.createElement('div');
    status.className = 'upload-status success';
    status.textContent = 'Profile customization saved!';
    document.querySelector('.modal-body').appendChild(status);
    setTimeout(() => status.remove(), 3000);
  }

  function updateProfileDisplay(preferences) {
    const profileImage = document.getElementById('profile-image');
    const officerName = document.getElementById('officer-name-display');
    const officerRank = document.getElementById('officer-rank-display');
    
    // Update avatar
    if (preferences.avatarStyle) {
      const stationNumber = document.getElementById('station-number').value || 'default';
      profileImage.src = `https://api.dicebear.com/7.x/${preferences.avatarStyle}/svg?seed=${stationNumber}`;
    }
    
    // Update name and rank
    if (preferences.customName) {
      officerName.textContent = preferences.customName;
    }
    if (preferences.customRank) {
      officerRank.textContent = preferences.customRank;
    }
    
    // Apply color
    if (preferences.profileColor) {
      document.documentElement.style.setProperty('--profile-color', preferences.profileColor);
      profileImage.style.borderColor = preferences.profileColor;
    }
  }

  // Load saved preferences on page load
  window.addEventListener('load', () => {
    const savedPrefs = JSON.parse(localStorage.getItem('profilePreferences') || '{}');
    if (Object.keys(savedPrefs).length > 0) {
      updateProfileDisplay(savedPrefs);
    }
  });
  // Add response handling function
  function showResponse(alertId) {
    const responseContainer = document.getElementById('response-container');
    const responseOverlay = document.getElementById('response-overlay');
    
    // Show response interface
    responseContainer.classList.add('show');
    responseOverlay.classList.add('show');
    
    // Set alert ID for reference
    responseContainer.setAttribute('data-alert-id', alertId);
    
    // Focus on response textarea
    document.getElementById('response-text').focus();
  }

  // Update sendResponse function
  function sendResponse() {
    const alertId = document.getElementById('response-container').getAttribute('data-alert-id');
    const responseText = document.getElementById('response-text').value;
    
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }
    
    // Here you would typically send the response to Firebase
    // For now, we'll simulate the response
    const responseContainer = document.getElementById('response-container');
    const responseOverlay = document.getElementById('response-overlay');
    
    // Show success message
    const status = document.createElement('div');
    status.className = 'upload-status success';
    status.textContent = 'Response sent successfully!';
    responseContainer.querySelector('.response-content').appendChild(status);
    
    // Clear and close after delay
    setTimeout(() => {
      document.getElementById('response-text').value = '';
      responseContainer.classList.remove('show');
      responseOverlay.classList.remove('show');
      status.remove();
    }, 2000);
  }

  // Update closeResponse function
  function closeResponse() {
    const responseContainer = document.getElementById('response-container');
    const responseOverlay = document.getElementById('response-overlay');
    
    responseContainer.classList.remove('show');
    responseOverlay.classList.remove('show');
    document.getElementById('response-text').value = '';
  }