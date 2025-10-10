document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const photoInput = document.getElementById('photoInput');
  const fileInfoDisplay = document.getElementById('file-info-display');
  const previewFileName = document.getElementById('selected-file-name');
  const previewFileSize = document.getElementById('selected-file-size');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const imagePreviewSection = document.getElementById('image-preview-section');
  const previewImage = document.getElementById('preview-image');
  const removePreviewBtn = document.getElementById('remove-preview-btn');
  const fileError = document.getElementById('file-error');
  const previewImageName = document.getElementById('preview-image-name');

  let currentFile = null;
  let previewUrl = null;

  // Initialize password fields on page load
  initializePasswordFields();

  // Validate file type & size
  const validateFile = (file) => {
    fileError.textContent = '';
    fileError.style.display = 'none';

    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (!acceptedTypes.includes(file.type)) {
      fileError.textContent = 'Invalid file type. Please upload a JPG or PNG image.';
      fileError.style.display = 'block';
      return false;
    }

    if (file.size > maxFileSize) {
      fileError.textContent = 'File is too large. Maximum size is 10MB.';
      fileError.style.display = 'block';
      return false;
    }

    return true;
  };

  // Format bytes to readable size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Display selected file info
  const displayFileInfo = (file) => {
    const name = file.name;
    const size = formatFileSize(file.size);

    if (previewFileName) {
      previewFileName.textContent = name;
      previewFileName.title = name;
    }
    
    if (previewFileSize) {
      previewFileSize.textContent = size;
    }

    if (previewImageName) {
      previewImageName.textContent = name;
      previewImageName.title = name;
    }

    fileInfoDisplay.style.display = 'block';
  };

  // Create preview image
  const createPreview = (file) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    imagePreviewSection.style.display = 'block';
  };

  // Clear selected file and reset UI
  const clearFileSelection = () => {
    currentFile = null;
    photoInput.value = '';

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    fileInfoDisplay.style.display = 'none';
    imagePreviewSection.style.display = 'none';
    fileError.style.display = 'none';

    previewImage.src = '';
    
    if (previewFileName) previewFileName.textContent = '';
    if (previewFileSize) previewFileSize.textContent = '';
    if (previewImageName) previewImageName.textContent = '';
    
    fileError.textContent = '';
  };

  // On file input change
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      clearFileSelection();
      return;
    }

    if (validateFile(file)) {
      currentFile = file;
      displayFileInfo(file);
      createPreview(file);
    } else {
      clearFileSelection();
    }
  });

  // Remove file (from preview or details)
  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearFileSelection();
    });
  }

  if (removePreviewBtn) {
    removePreviewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearFileSelection();
    });
  }

  // Clean up preview URL
  window.addEventListener('beforeunload', () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  });

  // Form validation
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      if (photoInput.required && !currentFile) {
        e.preventDefault();
        fileError.textContent = 'Please select a photo to upload.';
        fileError.style.display = 'block';
        return false;
      }
    });
  }

  // FIXED NAVIGATION - Initialize navigation properly
  initializeNavigation();
});

// Initialize password fields to be hidden by default
function initializePasswordFields() {
  // Find all password input fields
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  passwordFields.forEach(field => {
    // Ensure the input type is set to password (hidden)
    field.type = 'password';
    
    // Find the associated toggle icon
    const toggleIcon = field.nextElementSibling?.querySelector('i');
    if (toggleIcon) {
      // Set icon to eye-slash (indicating password is hidden)
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    }
  });
}

// Updated toggle password function with corrected initial logic
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector('i');

  if (input.type === 'password') {
    // Currently hidden, so show it
    input.type = 'text';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  } else {
    // Currently visible, so hide it
    input.type = 'password';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  }
}

document.getElementById('registerForm').addEventListener('submit', (e) => {
  const pass = document.getElementById('password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (pass !== confirmPass) {
    e.preventDefault();
    showNotification("Passwords do not match!", "error");
  }
});

// Notification system
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Mobile menu toggle
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('mobile-open');
}

// FIXED NAVIGATION FUNCTION
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Only prevent default for placeholder links (#, empty, or null)
      if (href === "#" || href === "" || href === null) {
        e.preventDefault();
        console.log('Navigation prevented for placeholder link');
      } else {
        // Allow normal navigation for real links like dashboard.html
        console.log(`Navigating to: ${href}`);
      }
      
      // Update active state for visual feedback
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      // Optional: Create ripple effect if function exists
      if (typeof createRipple === "function") {
        createRipple(e, this);
      }
      
      const section = this.getAttribute('data-section');
      console.log(`Section: ${section}`);
    });
  });
}