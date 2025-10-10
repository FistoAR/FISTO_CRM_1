// ─────────────────────────────────────────────
//  Profile Modal Functions for SPA Integration
// ─────────────────────────────────────────────

// Show Profile Modal
function showProfileModal() {
  const modal = document.getElementById('profileModal');
  loadUserProfile();
  modal.classList.add('show');
  document.body.classList.add('modal-open');
}

// Hide Profile Modal
function hideProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
}

// Load and display user profile data
function loadUserProfile() {
  const user = JSON.parse(sessionStorage.getItem("currentUser")) || {};

  const userData = {
    employeeId: user.employee_id || sessionStorage.getItem('employeeId') || 'EMP000',
    employeeName: user.employee_name || sessionStorage.getItem('employeeName') || 'User',
    designation: user.designation || sessionStorage.getItem('designation') || 'Employee', // Used as designation
    emailOffice: user.mail || sessionStorage.getItem('mail') || 'user@fisto.com',
    joinDate: user.dateofjoin || sessionStorage.getItem('dateofjoin') || '01/01/2023',
    gender: user.gender || sessionStorage.getItem('gender') || 'Male',
    dateOfBirth: user.dob || sessionStorage.getItem('dob') || '01/01/1990',
    phone: sessionStorage.getItem('phone') || '+91 0000000000',
    Addres: user.Addres || sessionStorage.getItem('addres') || 'Address not available'
  };

  // Map user data to profile modal fields
  const profileFields = {
    'profileEmpId': userData.employeeId,
    'profileEmpName': userData.employeeName,
    'profileDesignation': userData.designation,
    'profileEmail': userData.emailOffice,
    'profileJoinDate': formatDate(userData.joinDate),
    'profileGender': userData.gender,
    'profileDOB': formatDate(userData.dateOfBirth),
    'profilePhone': userData.phone,
    'profileAddress': userData.Addres
  };

  Object.entries(profileFields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    } else {
      console.warn(`Element '${id}' not found.`);
    }
  });

  updateSidebarWelcome(userData);
}

// Format date to DD/MM/YYYY
function formatDate(dateString) {
  if (!dateString) return 'Not available';

  try {
    let date;
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      date = new Date(year, month - 1, day);
    } else if (dateString.includes('-')) {
      date = new Date(dateString);
    } else {
      return dateString;
    }
    return date.toLocaleDateString('en-GB');
  } catch (error) {
    console.warn('Date formatting error:', error);
    return dateString;
  }
}

// Update welcome message in sidebar
function updateSidebarWelcome(userData) {
  const userWelcomeElement = document.getElementById('userWelcome');
  const userRoleElement = document.getElementById('userRole');
  const userIdElement = document.getElementById('userId');

  const prefix = userData.gender?.toLowerCase() === 'female' ? 'Ms' : 'Mr';

  if (userWelcomeElement) {
    userWelcomeElement.textContent = `Welcome, ${prefix} ${userData.employeeName}`;
  }

  if (userRoleElement) {
    userRoleElement.textContent = `Role: ${userData.designation}`;
  }

  if (userIdElement) {
    userIdElement.textContent = `ID: ${userData.employeeId}`;
  }
}

// Handle profile image change and preview
function handleProfileImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showNotification('Please select a valid image file.', 'error');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Image size should be less than 5MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const result = e.target.result;

    const currentImg = document.getElementById('currentProfileImg');
    const sidebarImg = document.querySelector('.profile-img');

    if (currentImg) currentImg.src = result;
    if (sidebarImg) sidebarImg.src = result;

    try {
      sessionStorage.setItem('userProfileImage', result);
    } catch (err) {
      console.warn('Failed to store image in sessionStorage:', err);
    }

    uploadProfileImage(file);
  };
  reader.readAsDataURL(file);
}

// Upload image to server (simulated)
function uploadProfileImage(file) {
  const employeeId = sessionStorage.getItem('employeeId') || 'EMP000';

  const formData = new FormData();
  formData.append('profileImage', file);
  formData.append('employeeId', employeeId);

  showNotification('Uploading profile image...', 'info');

  // Simulated upload
  setTimeout(() => {
    showNotification('Profile image updated successfully!', 'success');
  }, 1500);

  // Replace with actual API call if needed
  /*
  fetch('/api/upload-profile-image', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showNotification('Profile image updated successfully!', 'success');
      } else {
        showNotification('Failed to update profile image.', 'error');
      }
    })
    .catch(err => {
      console.error('Upload error:', err);
      showNotification('Error uploading profile image.', 'error');
    });
  */
}

// Show notification (SPA-friendly fallback)
function showNotification(message, type = 'info') {
  if (window.dashboardSPA?.showNotification) {
    window.dashboardSPA.showNotification(message, type);
  } else {
    alert(message);
  }
}

// Load saved profile image on startup
function loadSavedProfileImage() {
  const savedImage = sessionStorage.getItem('userProfileImage');
  if (savedImage) {
    const currentImg = document.getElementById('currentProfileImg');
    const sidebarImg = document.querySelector('.profile-img');
    if (currentImg) currentImg.src = savedImage;
    if (sidebarImg) sidebarImg.src = savedImage;
  }
}

// Close modal on outside click
window.addEventListener('click', function (event) {
  const profileModal = document.getElementById('profileModal');
  if (event.target === profileModal) {
    hideProfileModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    const profileModal = document.getElementById('profileModal');
    if (profileModal?.classList.contains('show')) {
      hideProfileModal();
    }
  }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  loadSavedProfileImage();
  loadUserProfile(); // Optional: load profile immediately
});

// Expose functions for SPA integration
window.showProfileModal = showProfileModal;
window.hideProfileModal = hideProfileModal;
window.loadUserProfile = loadUserProfile;
window.handleProfileImageChange = handleProfileImageChange;
