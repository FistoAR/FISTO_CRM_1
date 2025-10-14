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
  
  // New element for displaying image name next to preview title
  const previewImageName = document.getElementById('preview-image-name');

  let currentFile = null;
  let previewUrl = null;

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

    // Update the preview section elements
    if (previewFileName) {
      previewFileName.textContent = name;
      previewFileName.title = name;
    }
    
    if (previewFileSize) {
      previewFileSize.textContent = size;
    }

    // Update the image name next to preview title
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

  // Prevent form submit if required photo is missing
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

// Password show/hide toggle
const setupPasswordToggle = (inputId, toggleId) => {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(toggleId);
  
  if (!passwordInput || !toggleButton) return;
  
  const eyeIcon = toggleButton.querySelector('.eye-icon');
  const eyeOffIcon = toggleButton.querySelector('.eye-off-icon');

  // Initial icon state
  if (passwordInput.type === 'password') {
    eyeIcon.style.display = 'none';
    eyeOffIcon.style.display = 'block';
  } else {
    eyeIcon.style.display = 'block';
    eyeOffIcon.style.display = 'none';
  }

  toggleButton.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    if (!isPassword) {
      eyeIcon.style.display = 'none';
      eyeOffIcon.style.display = 'block';
    } else {
      eyeIcon.style.display = 'block';
      eyeOffIcon.style.display = 'none';
    }
  });
};

// Password match check
const setupPasswordMatchCheck = (passwordId, confirmId, messageId) => {
  const passwordInput = document.getElementById(passwordId);
  const confirmInput = document.getElementById(confirmId);
  const messageEl = document.getElementById(messageId);

  if (!passwordInput || !confirmInput || !messageEl) return;

  const checkMatch = () => {
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (password && confirm) {
      if (password === confirm) {
        messageEl.textContent = '✅ Passwords match';
        messageEl.style.color = 'green';
      } else {
        messageEl.textContent = '❌ Passwords do not match';
        messageEl.style.color = 'red';
      }
    } else {
      messageEl.textContent = '';
    }
  };

  passwordInput.addEventListener('input', checkMatch);
  confirmInput.addEventListener('input', checkMatch);
};

// Run on DOM load
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle('password', 'toggle-password');
  setupPasswordToggle('confirm-password', 'toggle-confirm-password');
  setupPasswordMatchCheck('password', 'confirm-password', 'password-match-message');
});

  // Initialize both password toggles
  setupPasswordToggle('password', 'toggle-password');
  setupPasswordToggle('confirm-password', 'toggle-confirm-password');
});