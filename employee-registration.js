// Modal Functions
function openEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    resetForm();
}

// Job Role Toggle
function toggleJobRoleFields() {
    const onroleRadio = document.querySelector('input[name="jobrole"][value="onrole"]');
    const internRadio = document.querySelector('input[name="jobrole"][value="intern"]');
    const onroleArea = document.getElementById('onrole-area');
    const internArea = document.getElementById('intern-area');

    if (onroleRadio.checked) {
        onroleArea.classList.remove('hidden');
        internArea.classList.add('hidden');
    } else if (internRadio.checked) {
        onroleArea.classList.add('hidden');
        internArea.classList.remove('hidden');
    }
}

// Calculate intern duration
function calculateDuration() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            alert('End date cannot be before start date');
            document.getElementById('end-date').value = '';
            return;
        }
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.round(diffDays / 30.44);
        document.getElementById('duration').value = months + ' months';
    }
}

// Password toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

// Global storage for multiple file uploads with details
const fileDetailsStore = {
  id_proof: [],
  certificates: [],
  other_docs: []
};

// Handle single file uploads (photo, resume)
function handleSingleFileChange(event, fileNum, fileType) {
  const file = event.target.files[0];
  const card = event.target.closest('.upload-card');
  const preview = card.querySelector('.preview-image');
  const filename = card.querySelector('.filename');
  
  if (!file) return;
  
  // Show file name
  filename.textContent = file.name;
  
  // Show preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      card.querySelector('.upload-icon').style.display = 'none';
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = 'none';
    card.querySelector('.upload-icon').style.display = 'block';
  }
  
  card.classList.add('has-file');
}

// Remove single file
function removeSingleFile(fileNum) {
  const input = document.getElementById(`file${fileNum}`);
  const card = input.closest('.upload-card');
  const preview = card.querySelector('.preview-image');
  const filename = card.querySelector('.filename');
  const icon = card.querySelector('.upload-icon');
  
  input.value = '';
  preview.src = '';
  preview.style.display = 'none';
  icon.style.display = 'block';
  
  // Reset filename text
  if (fileNum === 1) filename.textContent = 'Employee Photo';
  else if (fileNum === 2) filename.textContent = 'Resume/CV';
  
  card.classList.remove('has-file');
}

// Handle multiple file uploads with details
function handleMultipleFileUpload(event, fileType) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const listElementId = fileType === 'id_proof' ? 'idProofList' : 
                        fileType === 'certificates' ? 'certificatesList' : 
                        'otherDocsList';
  
  const listElement = document.getElementById(listElementId);
  
  // Don't clear existing - allow adding more files
  // listElement.innerHTML = '';
  // fileDetailsStore[fileType] = [];

  // Create input for each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileId = `${fileType}_${Date.now()}_${i}`;
    
    // Store file reference
    fileDetailsStore[fileType].push({
      id: fileId,
      file: file,
      details: ''
    });

    // Create UI element
    const fileItem = document.createElement('div');
    fileItem.className = 'file-detail-item';
    fileItem.setAttribute('data-file-id', fileId);
    fileItem.innerHTML = `
      <div class="file-name">
        <i class="fas fa-file"></i> ${file.name} 
        <small style="color: #6b7280;">(${(file.size / 1024).toFixed(2)} KB)</small>
      </div>
      <input type="text" 
             placeholder="Enter details (e.g., 'Aadhar Card', 'Degree Certificate')" 
             data-file-id="${fileId}"
             data-file-type="${fileType}"
             onchange="updateFileDetails('${fileId}', '${fileType}', this.value)"
             required>
      <button type="button" class="remove-file-btn" onclick="removeMultipleFile('${fileId}', '${fileType}')">
        <i class="fas fa-times"></i> Remove
      </button>
    `;
    
    listElement.appendChild(fileItem);
  }

  // Clear the input to allow re-selecting same files
  event.target.value = '';

  console.log(`${files.length} file(s) added for ${fileType}. Total: ${fileDetailsStore[fileType].length}`);
}

// Update file details when user types
function updateFileDetails(fileId, fileType, details) {
  const fileData = fileDetailsStore[fileType].find(f => f.id === fileId);
  if (fileData) {
    fileData.details = details;
    console.log(`Updated details for ${fileId}:`, details);
  }
}

// Remove a specific file from multiple uploads
function removeMultipleFile(fileId, fileType) {
  // Remove from store
  fileDetailsStore[fileType] = fileDetailsStore[fileType].filter(f => f.id !== fileId);
  
  // Remove from UI
  const listElementId = fileType === 'id_proof' ? 'idProofList' : 
                        fileType === 'certificates' ? 'certificatesList' : 
                        'otherDocsList';
  
  const listElement = document.getElementById(listElementId);
  const itemToRemove = listElement.querySelector(`[data-file-id="${fileId}"]`);
  if (itemToRemove) {
    itemToRemove.remove();
  }

  console.log(`Removed file ${fileId} from ${fileType}. Remaining: ${fileDetailsStore[fileType].length}`);
}

// REFACTORED FORM SUBMISSION FUNCTION
function handleFormSubmit(event) {
    event.preventDefault();

    console.log('Form submission started');

    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Basic field validation
    const requiredFields = ['employee-id-reg', 'employee-name-reg', 'email-personal'];
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            alert(`Please fill in the ${field.previousElementSibling?.textContent || fieldId} field`);
            field.focus();
            return;
        }
    }

    const form = document.getElementById('employeeForm');
    const formData = new FormData(form);

    // Handle job role and date of birth
    const jobRole = document.querySelector('input[name="jobrole"]:checked')?.value || '';
    let dateOfBirth = '';

    if (jobRole === 'onrole') {
        const dobInput = document.getElementById('dob-onrole');
        if (dobInput) dateOfBirth = dobInput.value.trim();
    } else if (jobRole === 'intern') {
        const dobInput = document.getElementById('dob-intern');
        if (dobInput) dateOfBirth = dobInput.value.trim();
    }

    if (dateOfBirth) {
        formData.set('date_of_birth', dateOfBirth);
    }

    // Clear existing file entries
    formData.delete('photo');
    formData.delete('resume');
    formData.delete('id_proof');
    formData.delete('certificates');
    formData.delete('other_docs');

    // Add photo as file1 (single file)
    const photoInput = document.querySelector('input[name="photo"]');
    if (photoInput && photoInput.files.length > 0) {
        formData.append('file1', photoInput.files[0]);
        console.log('Photo added as file1:', photoInput.files[0].name);
    }

    // Add resume as file2 (single file)
    const resumeInput = document.querySelector('input[name="resume"]');
    if (resumeInput && resumeInput.files.length > 0) {
        formData.append('file2', resumeInput.files[0]);
        console.log('Resume added as file2:', resumeInput.files[0].name);
    }

    // Add ID Proof files with details (file3[] and file3_details[])
    if (fileDetailsStore.id_proof.length > 0) {
        for (let i = 0; i < fileDetailsStore.id_proof.length; i++) {
            const fileData = fileDetailsStore.id_proof[i];
            if (!fileData.details.trim()) {
                alert(`Please enter details for ID Proof file: ${fileData.file.name}`);
                return;
            }
            formData.append('file3[]', fileData.file);
            formData.append('file3_details[]', fileData.details);
            console.log(`ID Proof ${i + 1}:`, fileData.file.name, '- Details:', fileData.details);
        }
    }

    // Add Certificate files with details (file4[] and file4_details[])
    if (fileDetailsStore.certificates.length > 0) {
        for (let i = 0; i < fileDetailsStore.certificates.length; i++) {
            const fileData = fileDetailsStore.certificates[i];
            if (!fileData.details.trim()) {
                alert(`Please enter details for Certificate file: ${fileData.file.name}`);
                return;
            }
            formData.append('file4[]', fileData.file);
            formData.append('file4_details[]', fileData.details);
            console.log(`Certificate ${i + 1}:`, fileData.file.name, '- Details:', fileData.details);
        }
    }

    // Add Other Documents files with details (file5[] and file5_details[])
    if (fileDetailsStore.other_docs.length > 0) {
        for (let i = 0; i < fileDetailsStore.other_docs.length; i++) {
            const fileData = fileDetailsStore.other_docs[i];
            if (!fileData.details.trim()) {
                alert(`Please enter details for document: ${fileData.file.name}`);
                return;
            }
            formData.append('file5[]', fileData.file);
            formData.append('file5_details[]', fileData.details);
            console.log(`Other Document ${i + 1}:`, fileData.file.name, '- Details:', fileData.details);
        }
    }

    console.log('=== Final Form Data ===');
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(key + ': [FILE] ' + value.name);
        } else {
            console.log(key + ': ' + value);
        }
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;

    fetch('https://www.fist-o.com/web_crm/registration.php', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.status === 405) {
                throw new Error('Method Not Allowed - Server configuration issue');
            } else if (response.status === 404) {
                throw new Error('Registration script not found');
            } else if (response.status === 500) {
                throw new Error('Server internal error');
            } else if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response.text();
        })
        .then(text => {
            console.log('Raw response:', text);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);

                if (data.status === 'success') {
                    let message = 'Employee registered successfully!';
                    if (data.documents_uploaded > 0) {
                        message += ` ${data.documents_uploaded} document(s) uploaded.`;
                    }

                    if (typeof employeeManager !== 'undefined' && employeeManager.showToast) {
                        employeeManager.showToast('Success!', message, 'success');
                    } else {
                        alert(message);
                    }

                    form.reset();
                    resetForm();
                    closeEmployeeModal();

                    if (typeof employeeManager !== 'undefined' && employeeManager.refreshFromDatabase) {
                        employeeManager.refreshFromDatabase();
                    }
                } else {
                    const errorMsg = data.message || 'Registration failed';
                    if (typeof employeeManager !== 'undefined' && employeeManager.showToast) {
                        employeeManager.showToast('Error', errorMsg, 'error');
                    } else {
                        alert('Error: ' + errorMsg);
                    }

                    if (data.debug) {
                        console.log('Debug info:', data.debug);
                    }
                }
            } catch (e) {
                console.error('JSON parse error:', e);
                console.log('Response was not valid JSON:', text);

                if (text.includes('<html>') || text.includes('<body>') || text.includes('Fatal error')) {
                    alert('Server error occurred. Please check the console for details.');
                    console.error('Server error response:', text);
                } else {
                    alert('Server returned response: ' + text.substring(0, 100));
                }
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            let errorMessage = 'An error occurred during registration.';

            if (error.message.includes('Method Not Allowed')) {
                errorMessage = 'Server configuration error: The server is not accepting POST requests.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'Registration script not found. Please check the URL.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error: Unable to connect to server. Check your connection.';
            } else {
                errorMessage = error.message;
            }

            if (typeof employeeManager !== 'undefined' && employeeManager.showToast) {
                employeeManager.showToast('Network Error', errorMessage, 'error');
            } else {
                alert('Error: ' + errorMessage);
            }
        });
}

function handleFileChange(event, index) {
  const fileInput = event.target;
  const files = fileInput.files;

  // Clear previous previews in upload-card section
  const previewImage = document.getElementById(`preview${index}`);
  const filenameLabel = document.getElementById(`filename${index}`);
  if (files.length > 0) {
    const firstFile = files[0];
    filenameLabel.textContent = firstFile.name;

    if (firstFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
      };
      reader.readAsDataURL(firstFile);
    } else {
      previewImage.src = ""; // Remove image if it's not an image file
    }
  } else {
    filenameLabel.textContent = "Choose File";
    previewImage.src = "";
  }

  // ========== Preview in Section Below ==========
  let previewTarget;
  if (index === 3) previewTarget = document.getElementById("preview-list-id");
  else if (index === 4) previewTarget = document.getElementById("preview-list-certificates");
  else if (index === 5) previewTarget = document.getElementById("preview-list-other");
  else return;

  // Clear old previews
  previewTarget.innerHTML = "";

  // Append new file previews
  Array.from(files).forEach(file => {
    const fileDiv = document.createElement("div");
    fileDiv.className = "file-item";

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        fileDiv.innerHTML = `<img src="${e.target.result}" alt="${file.name}" class="preview-thumb">`;
        previewTarget.appendChild(fileDiv);
      };
      reader.readAsDataURL(file);
    } else {
      fileDiv.textContent = file.name;
      previewTarget.appendChild(fileDiv);
    }
  });
}

// Handle file uploads - routes to single or multiple file handler
function handleFileChange(event, fileNum) {
  const input = event.target;
  const isMultiple = input.hasAttribute('multiple');
  
  if (isMultiple) {
    handleMultipleFileChange(event, fileNum);
  } else {
    handleSingleFileChange(event, fileNum);
  }
}

// Handle single file uploads (photo, resume) with enhanced image preview
function handleSingleFileChange(event, fileNum) {
  const file = event.target.files[0];
  const card = event.target.closest('.upload-card');
  
  if (!file) return;
  
  const fileSize = (file.size / 1024).toFixed(2);
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  console.log('=== SINGLE FILE UPLOAD DEBUG ===');
  console.log('File selected:', file.name, 'Type:', file.type, 'Size:', fileSize + 'KB');
  console.log('Card element:', card);
  
  // Find or create preview elements
  let preview = card.querySelector('.preview-image');
  let filename = card.querySelector('.filename');
  let uploadIcon = card.querySelector('.upload-icon');
  
  console.log('Preview element:', preview);
  console.log('Filename element:', filename);
  console.log('Upload icon element:', uploadIcon);
  
  // If preview image doesn't exist, create it
  if (!preview) {
    console.log('Creating new preview image element');
    preview = document.createElement('img');
    preview.className = 'preview-image';
    preview.style.display = 'none';
    card.appendChild(preview);
  }
  
  // Update filename with size
  if (filename) {
    filename.textContent = `${file.name} (${fileSize} KB)`;
    filename.style.fontSize = '12px';
    filename.style.color = '#374151';
  }
  
  // Check if it's an image
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension) || 
                  file.type.startsWith('image/');
  
  console.log('Is image?', isImage);
  
  if (isImage) {
    console.log('Processing image preview...');
    
    // Show loading state
    if (uploadIcon) {
      uploadIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log('FileReader loaded successfully');
      console.log('Data URL length:', e.target.result.length);
      
      const img = new Image();
      
      img.onload = function() {
        console.log('✓ Image loaded successfully:', img.width, 'x', img.height);
        
        // Set image source
        preview.src = e.target.result;
        
        // Style the preview image
        preview.style.display = 'block';
        preview.style.width = '100%';
        preview.style.height = 'auto';
        preview.style.maxHeight = '150px';
        preview.style.objectFit = 'contain';
        preview.style.borderRadius = '8px';
        preview.style.border = '2px solid #e5e7eb';
        preview.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        preview.style.marginTop = '25px';
        preview.style.marginLeft = '15px';
        
        console.log('Preview src set:', preview.src.substring(0, 50) + '...');
        console.log('Preview display:', preview.style.display);
        
        // Hide upload icon
        if (uploadIcon) {
          uploadIcon.style.display = 'none';
        }
        
        // Remove any existing success badge
        const existingBadge = card.querySelector('.success-badge');
        if (existingBadge) {
          existingBadge.remove();
        }
        
        // Add success indicator
        // const successBadge = document.createElement('div');
        // successBadge.className = 'success-badge';
        // successBadge.innerHTML = '<i class="fas fa-check-circle"></i> Ready';
        // successBadge.style.cssText = `
        //   position: absolute;
        //   top: 10px;
        //   right: 10px;
        //   background: rgba(16, 185, 129, 0.9);
        //   color: white;
        //   padding: 4px 8px;
        //   border-radius: 4px;
        //   font-size: 11px;
        //   font-weight: 600;
        //   z-index: 1;
        // `;
        // card.style.position = 'relative';
        // card.appendChild(successBadge);
        
        // console.log('✓ Image preview complete');
      };
      
      img.onerror = function() {
        console.error('✗ Image failed to load');
        preview.style.display = 'none';
        if (uploadIcon) {
          uploadIcon.style.display = 'block';
          uploadIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>';
        }
        if (filename) {
          filename.textContent = file.name + ' (Failed to load)';
          filename.style.color = '#ef4444';
        }
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = function(error) {
      console.error('✗ FileReader error:', error);
      preview.style.display = 'none';
      if (uploadIcon) {
        uploadIcon.style.display = 'block';
        uploadIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>';
      }
      if (filename) {
        filename.textContent = 'Error reading file';
        filename.style.color = '#ef4444';
      }
    };
    
    reader.readAsDataURL(file);
    
  } else {
    // For non-image files (PDF, DOC, etc.)
    console.log('Processing non-image file');
    preview.style.display = 'none';
    
    const iconMap = {
      'pdf': 'fa-file-pdf',
      'doc': 'fa-file-word',
      'docx': 'fa-file-word',
      'xls': 'fa-file-excel',
      'xlsx': 'fa-file-excel',
      'txt': 'fa-file-alt'
    };
    
    const icon = iconMap[fileExtension] || 'fa-file';
    
    if (uploadIcon) {
      uploadIcon.style.display = 'block';
      uploadIcon.innerHTML = `<i class="fas ${icon}" style="font-size: 48px; color: #4f46e5;"></i>`;
    }
    
    // Remove any existing success badge
    const existingBadge = card.querySelector('.success-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Add success indicator
    // const successBadge = document.createElement('div');
    // successBadge.className = 'success-badge';
    // successBadge.innerHTML = '<i class="fas fa-check-circle"></i> Ready';
    // successBadge.style.cssText = `
    //   position: absolute;
    //   top: 10px;
    //   right: 10px;
    //   background: rgba(16, 185, 129, 0.9);
    //   color: white;
    //   padding: 4px 8px;
    //   border-radius: 4px;
    //   font-size: 11px;
    //   font-weight: 600;
    //   z-index: 1;
    // `;
    // card.style.position = 'relative';
    // card.appendChild(successBadge);
  }
  
  card.classList.add('has-file');
  console.log('=== FILE UPLOAD DEBUG END ===');
}

// Reset form
function resetForm() {
    document.getElementById('employeeForm').reset();
    document.getElementById('onrole-area').classList.add('hidden');
    document.getElementById('intern-area').classList.add('hidden');
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeEmployeeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeEmployeeModal();
    }
});

// Preview functions for view/edit modal
function previewMultipleFiles(input, fileType, previewElementId) {
    const previewElement = document.getElementById(previewElementId);
    
    if (!input.files || input.files.length === 0) {
        if (previewElement) previewElement.innerHTML = '';
        return;
    }
    
    if (previewElement) {
        previewElement.innerHTML = '';
        
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            const fileName = file.name;
            const fileSize = (file.size / 1024).toFixed(2);
            
            const filePreview = document.createElement('div');
            filePreview.style.cssText = 'display: inline-block; margin: 5px; padding: 8px; background: #f3f4f6; border-radius: 6px; font-size: 11px; max-width: 120px; text-align: center;';
            filePreview.innerHTML = `
                <i class="fas fa-file" style="color: #4f46e5; font-size: 20px; margin-bottom: 5px;"></i>
                <div style="font-weight: 600; word-break: break-word; color: #1f2937;">${fileName}</div>
                <div style="color: #6b7280; margin-top: 2px;">${fileSize} KB</div>
            `;
            
            previewElement.appendChild(filePreview);
        }
    }
    
    const statusMap = {
        'id_proof': 'currentIdProof',
        'certificates': 'currentCertificates',
        'other_docs': 'currentOtherDocs'
    };
    
    const statusElement = document.getElementById(statusMap[fileType]);
    if (statusElement) {
        statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${input.files.length} file(s) ready`;
        statusElement.style.color = '#10b981';
    }
}

// Enhanced preview function for single files (photo/resume)
function previewUpdateFile(input, fileType, previewElementId) {
    const previewElement = previewElementId ? document.getElementById(previewElementId) : null;
    
    if (!input.files || input.files.length === 0) {
        if (previewElement) previewElement.innerHTML = '';
        return;
    }
    
    const file = input.files[0];
    const fileSize = (file.size / 1024).toFixed(2);
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    const statusMap = {
        'photo': 'currentPhoto',
        'resume': 'currentResume',
        'id_proof': 'currentIdProof',
        'certificates': 'currentCertificates',
        'other': 'currentOtherDocs'
    };
    
    const statusElement = document.getElementById(statusMap[fileType]);
    if (statusElement) {
        statusElement.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Ready to upload';
        statusElement.style.color = '#10b981';
    }
    
    if (previewElement) {
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension) || 
                        file.type.startsWith('image/');
        
        if (isImage) {
            previewElement.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #4f46e5;"></i>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 5px;">Loading preview...</div>
                </div>
            `;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                
                img.onload = function() {
                    previewElement.innerHTML = `
                        <div style="position: relative; max-width: 150px; margin: 0 auto;">
                            <img src="${e.target.result}" 
                                 alt="Preview" 
                                 style="width: 100%; height: auto; max-height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: block;" />
                            <div style="position: absolute; top: 5px; right: 5px; background: rgba(16, 185, 129, 0.9); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
                                NEW
                            </div>
                        </div>
                    `;
                };
                
                img.onerror = function() {
                    previewElement.innerHTML = `
                        <div style="text-align: center; padding: 10px; background: #fee2e2; border-radius: 8px;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ef4444;"></i>
                            <div style="font-size: 11px; color: #991b1b;">Failed to load image</div>
                        </div>
                    `;
                };
                
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
            
        } else {
            const iconMap = {
                'pdf': 'fa-file-pdf',
                'doc': 'fa-file-word',
                'docx': 'fa-file-word',
                'xls': 'fa-file-excel',
                'xlsx': 'fa-file-excel',
                'txt': 'fa-file-alt'
            };
            
            const icon = iconMap[fileExtension] || 'fa-file';
            
            previewElement.innerHTML = `
                <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                    <i class="fas ${icon}" style="font-size: 32px; color: #4f46e5; margin-bottom: 5px;"></i>
                    <div style="font-size: 11px; color: #6b7280; word-break: break-word;">
                        ${fileName}
                    </div>
                    <div style="font-size: 10px; color: #10b981; font-weight: 600; margin-top: 3px;">
                        Ready to upload
                    </div>
                </div>
            `;
        }
    }
}

// Keep the rest of your original JavaScript code below this line (ImprovedEmployeeManager class and other functions)

// Global function for toggling job role fields in view modal
function toggleViewJobRoleFields() {
    const onroleRadio = document.getElementById('viewOnroleRadio');
    const internRadio = document.getElementById('viewInternRadio');

    const onroleJoin = document.getElementById('view-onrole-join');
    const internStart = document.getElementById('view-intern-start');
    const internEnd = document.getElementById('view-intern-end');
    const internDuration = document.getElementById('view-intern-duration');

    if (!onroleRadio || !internRadio) {
        console.warn('Job role radio buttons not found in view modal');
        return;
    }

    console.log('=== Job Role Toggle Debug ===');
    console.log('Onrole checked:', onroleRadio.checked);
    console.log('Intern checked:', internRadio.checked);

    if (onroleRadio.checked) {
        console.log('Switching to ONROLE mode');

        if (onroleJoin) {
            onroleJoin.style.display = 'block';
            console.log('✓ Showing Join Date field');
        }

        if (internStart) internStart.style.display = 'none';
        if (internEnd) internEnd.style.display = 'none';
        if (internDuration) internDuration.style.display = 'none';

    } else if (internRadio.checked) {
        console.log('Switching to INTERN mode');

        if (onroleJoin) onroleJoin.style.display = 'none';

        if (internStart) {
            internStart.style.display = 'block';
            console.log('✓ Showing Start Date field');
        }
        if (internEnd) {
            internEnd.style.display = 'block';
        }
        if (internDuration) {
            internDuration.style.display = 'block';
        }

        setTimeout(() => calculateViewDuration(), 100);

    } else {
        console.log('No role selected - hiding all role-specific fields');

        if (onroleJoin) onroleJoin.style.display = 'none';
        if (internStart) internStart.style.display = 'none';
        if (internEnd) internEnd.style.display = 'none';
        if (internDuration) internDuration.style.display = 'none';
    }

    console.log('=== Toggle Complete ===');
}

// Global function for calculating duration in view modal
function calculateViewDuration() {
    const startDate = document.getElementById('view-start-date');
    const endDate = document.getElementById('view-end-date');
    const duration = document.getElementById('view-duration');

    if (!startDate || !endDate || !duration) {
        console.warn('Duration calculation elements not found in view modal');
        return;
    }

    const startValue = startDate.value;
    const endValue = endDate.value;

    if (startValue && endValue) {
        const start = new Date(startValue);
        const end = new Date(endValue);

        if (end < start) {
            alert('End date cannot be before start date');
            endDate.value = '';
            duration.value = '';
            return;
        }

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.round(diffDays / 30.44);

        duration.value = months + ' months';
        console.log('Calculated duration:', months + ' months');
    } else {
        duration.value = '';
    }
}

// Enhanced close view modal function
function closeemployeeViewModal() {
    const viewModal = document.getElementById('employeeviewModal');
    if (viewModal) {
        viewModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Improved Employee Manager with file upload support
class ImprovedEmployeeManager {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.searchTerm = '';
        this.jobRoleFilter = '';
        this.workingStatusFilter = '';

        this.baseURL = 'https://www.fist-o.com/web_crm/';
        this.endpoints = {
            fetch: this.baseURL + 'fetch_employees.php',
            delete: this.baseURL + 'delete_employee.php',
            register: this.baseURL + 'registration.php',
            update: this.baseURL + 'update_employee.php'
        }

        this.maxRetries = 3;
        this.retryDelay = 1000;

        this.initializeEventListeners();
        this.loadEmployees();

        setInterval(() => this.loadEmployees(false), 60000);
    }

    initializeEventListeners() {
        const searchInput = document.getElementById('searchInput') || document.querySelector('input[type="search"]');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value;
                    this.applyFilters();
                }, 500);
            });
        }

        const jobRoleFilter = document.getElementById('jobRoleFilter');
        if (jobRoleFilter) {
            jobRoleFilter.addEventListener('change', (e) => {
                this.jobRoleFilter = e.target.value;
                this.applyFilters();
            });
        }

        const workingStatusFilter = document.getElementById('workingStatusFilter');
        if (workingStatusFilter) {
            workingStatusFilter.addEventListener('change', (e) => {
                this.workingStatusFilter = e.target.value;
                this.applyFilters();
            });
        }
    }

    async fetchWithRetry(url, options = {}, retries = 0) {
        try {
            console.log(`Attempting to fetch from: ${url} (attempt ${retries + 1})`);

            const fetchOptions = {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                ...options
            };

            const response = await fetch(url, fetchOptions);

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;

        } catch (error) {
            console.error(`Fetch attempt ${retries + 1} failed:`, error);

            if (retries < this.maxRetries) {
                console.log(`Retrying in ${this.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, options, retries + 1);
            }

            throw error;
        }
    }

    async loadEmployees(showLoading = true) {
        const tbody = document.getElementById('employeeTableBody');

        if (showLoading && tbody) {
            this.showLoading();
        }

        try {
            console.log('Loading employees from database...');

            const response = await this.fetchWithRetry(this.endpoints.fetch);
            const text = await response.text();

            console.log('Raw response (first 200 chars):', text.substring(0, 200));

            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Full response text:', text);

                if (text.includes('<html>') || text.includes('<body>') || text.includes('<!DOCTYPE')) {
                    throw new Error('Server returned HTML instead of JSON. This might be a server error or redirect.');
                } else {
                    throw new Error('Invalid JSON response from server');
                }
            }

            if (result.status === 'success') {
                this.employees = result.data || [];
                this.applyFilters();

                console.log(`Successfully loaded ${this.employees.length} employees`);

                if (showLoading) {
                    this.showToast('Success', `Loaded ${this.employees.length} employees`, 'success');
                }

                this.updateStats();

            } else {
                throw new Error(result.message || 'Failed to load employees');
            }

        } catch (error) {
            console.error('Error loading employees:', error);

            let errorMessage = 'Unknown error occurred';

            if (error.message.includes('CORS')) {
                errorMessage = 'CORS policy error. The server needs to allow cross-origin requests.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('HTML instead of JSON')) {
                errorMessage = 'Server configuration error. The PHP script might not be accessible.';
            } else {
                errorMessage = error.message;
            }

            this.showError(errorMessage);

            if (showLoading) {
                this.showToast('Error', 'Failed to load employees', 'error');
            }
        }
    }

    applyFilters() {
        this.filteredEmployees = this.employees.filter(employee => {
            const matchesSearch = !this.searchTerm ||
                (employee.emp_id && employee.emp_id.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (employee.emp_name && employee.emp_name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (employee.personal_email && employee.personal_email.toLowerCase().includes(this.searchTerm.toLowerCase()));

            const matchesJobRole = !this.jobRoleFilter || employee.job_role === this.jobRoleFilter;
            const matchesWorkingStatus = !this.workingStatusFilter || employee.working_status === this.workingStatusFilter;

            return matchesSearch && matchesJobRole && matchesWorkingStatus;
        });

        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('employeeTableBody');

        if (!tbody) {
            console.warn('Employee table body not found');
            return;
        }

        if (this.filteredEmployees.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                        <div class="empty-content">
                            <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                            <p style="font-size: 18px; margin: 0 0 8px 0;">
                                ${this.employees.length === 0 ? 'No employees found in database' : 'No employees match your search criteria'}
                            </p>
                            <small style="color: #999;">
                                ${this.employees.length === 0 ? 'Click "Add/Edit Employee" to get started' : 'Try adjusting your search or filters'}
                            </small>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = this.filteredEmployees.map((employee, index) => {
            const empId = employee.emp_id || 'N/A';
            const empName = employee.emp_name || 'N/A';
            const designation = this.getDesignationText(employee.designation);
            const jobRole = employee.job_role || 'N/A';
            const workingStatus = employee.working_status || 'N/A';
            const email = employee.personal_email || 'N/A';
            const phone = employee.personal_number || 'N/A';

            return `
                <tr data-employee-index="${index}" style="transition: all 0.2s ease;" 
                    onmouseenter="this.style.backgroundColor='#f1f5f9'; this.style.transform='scale(1.01)'"
                    onmouseleave="this.style.backgroundColor=''; this.style.transform=''">
                    <td><strong style="color: #4f46e5;">${empId}</strong></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                                ${empName.charAt(0).toUpperCase()}
                            </div>
                            <span>${empName}</span>
                        </div>
                    </td>
                    <td><span style="color: #374151;">${designation}</span></td>
                    <td>
                        <span class="badge" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; ${this.getBadgeStyle(jobRole)}">
                            ${jobRole}
                        </span>
                    </td>
                    <td>
                        <span class="working-status" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; ${this.getStatusStyle(workingStatus)}">
                            ${workingStatus}
                        </span>
                    </td>
                    <td style="color: #64748b;">
                        <a href="mailto:${email}" style="color: inherit; text-decoration: none;">
                            <i class="fas fa-envelope" style="margin-right: 6px; color: #4f46e5;"></i>
                            ${email}
                        </a>
                    </td>
                    <td style="color: #64748b;">
                        <a href="tel:${phone}" style="color: inherit; text-decoration: none;">
                            <i class="fas fa-phone" style="margin-right: 6px; color: #4f46e5;"></i>
                            ${phone}
                        </a>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                        <button onclick="window.employeeManager.viewEmployee(${index})" 
                                title="View Employee Details"
                                style="padding: 6px 10px; border: none; border-radius: 6px; background: #3b82f6; color: white; cursor: pointer; font-size: 12px; transition: all 0.2s ease;"
                                onmouseenter="this.style.transform='scale(1.1)'"
                                onmouseleave="this.style.transform='scale(1)'">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                         <button onclick="window.employeeManager.deleteEmployee(${index})" 
                                title="Delete Employee"
                                style="padding: 6px 10px; border: none; border-radius: 6px; background: #ef4444; color: white; cursor: pointer; font-size: 12px; transition: all 0.2s ease;"
                                onmouseenter="this.style.transform='scale(1.1)'"
                                onmouseleave="this.style.transform='scale(1)'">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async testConnection() {
        try {
            console.log('Testing connection to:', this.endpoints.fetch);

            const response = await this.fetchWithRetry(this.endpoints.fetch);
            const result = await response.json();

            console.log('Connection test result:', result);
            this.showToast('Connection Test', 'Successfully connected to database', 'success');

            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showToast('Connection Test Failed', error.message, 'error');

            return false;
        }
    }

    getBadgeStyle(jobRole) {
        const styles = {
            'onrole': 'background: #dcfce7; color: #166534;',
            'intern': 'background: #fef3c7; color: #92400e;',
            'default': 'background: #e5e7eb; color: #374151;'
        };
        return styles[jobRole.toLowerCase()] || styles.default;
    }

    getStatusStyle(status) {
        const styles = {
            'active': 'background: #dcfce7; color: #166534;',
            'inactive': 'background: #fee2e2; color: #991b1b;',
            'default': 'background: #e5e7eb; color: #374151;'
        };
        return styles[status.toLowerCase()] || styles.default;
    }

    getDesignationText(designation) {
        const designations = {
            'CEO': 'Chief Executive Officer',
            'MD': 'Managing Director',
            'SBUHead': 'SBU Head',
            'ProjectHead': 'Project Head',
            'TeamHead': 'Team Head',
            'HR': 'Human Resource',
            'JuniorDeveloper': 'Junior Developer',
            'Developerintern': 'Developer Intern',
            'UI/UX designer': 'UI/UX Designer',
            'uiuxintern': 'UI/UX Intern',
            '3DArtist': '3D Artist',
            '3Dintern': '3D Artist Intern',
            'Admin': 'Admin',
            'Marketing': 'Marketing',
            'Marketingassociate': 'Marketing Associate'
        };
        return designations[designation] || designation || 'N/A';
    }
    
// Replace your existing viewEmployee function with this fixed version
// This correctly displays documents from the employee_documents table

viewEmployee(index) {
    const employee = this.filteredEmployees[index];
    if (!employee) {
        this.showToast('Error', 'Employee not found', 'error');
        return;
    }

    const viewContent = document.getElementById('employeeviewContent');
    if (!viewContent) {
        console.warn('View content element not found');
        return;
    }

    // Debug logging
    console.log('Employee data:', employee);
    console.log('Documents:', employee.documents);
    console.log('Document counts:', employee.document_counts);

    const empId = employee.emp_id || 'N/A';
    const empName = employee.emp_name || 'N/A';
    const designation = employee.designation || 'N/A';
    const jobRole = employee.job_role || 'N/A';
    const workingStatus = employee.working_status || 'N/A';
    const gender = employee.gender || 'N/A';
    const personalEmail = employee.personal_email || 'N/A';
    const officeEmail = employee.office_email || 'N/A';
    const personalPhone = employee.personal_number || 'N/A';
    const officePhone = employee.office_number || 'N/A';
    const address = employee.address || 'N/A';
    const dateOfBirth = employee.date_of_birth || 'N/A';

    // Check if documents exist and have content
    const hasIdProof = employee.documents?.id_proof?.length > 0;
    const hasCertificates = employee.documents?.certification?.length > 0;
    const hasOtherDocs = employee.documents?.other_documents?.length > 0;
    const hasPhoto = employee.photo_path && employee.photo_path !== 'N/A';
    const hasResume = employee.resume_path && employee.resume_path !== 'N/A';

    viewContent.innerHTML = `
    <form id="employeeUpdateForm" style="display: flex; flex-direction: column; height: 100%;">
        <input type="hidden" name="emp_id" value="${empId}">
        
        <div style="flex: 1; overflow-y: auto; padding-right: 0px;">
            <div class="form-grid1">
                <div class="view-grid" style="display: grid; grid-template-columns: repeat(3,1fr); row-gap: 12px; column-gap:25px; margin-bottom: 1.5vw;">
                
                    <!-- Basic Info Fields -->
                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-id-card" style="color: #4f46e5; margin-right: 8px;"></i>Employee ID</label>
                        <input type="text" name="emp_id_display" value="${empId}" readonly style="background: #f3f4f6;" />
                    </div>
                
                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-user" style="color: #4f46e5; margin-right: 8px;"></i>Employee Name</label>
                        <input type="text" name="emp_name" value="${empName}" required />
                    </div>
                
                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-briefcase" style="color: #4f46e5; margin-right: 8px;"></i>Designation</label>
                        <select name="designation" required>
                            <option value="" disabled>Select designation</option>
                            <option value="CEO" ${designation === 'CEO' ? 'selected' : ''}>Chief executive officer</option>
                            <option value="MD" ${designation === 'MD' ? 'selected' : ''}>Managing Director</option>
                            <option value="SBUHead" ${designation === 'SBUHead' ? 'selected' : ''}>SBU Head</option>
                            <option value="ProjectHead" ${designation === 'ProjectHead' ? 'selected' : ''}>Project Head</option>
                            <option value="TeamHead" ${designation === 'TeamHead' ? 'selected' : ''}>Team Head</option>
                            <option value="HR" ${designation === 'HR' ? 'selected' : ''}>Human Resource</option>
                            <option value="JuniorDeveloper" ${designation === 'JuniorDeveloper' ? 'selected' : ''}>Junior Developer</option>
                            <option value="Developerintern" ${designation === 'Developerintern' ? 'selected' : ''}>Developer Intern</option>
                            <option value="UI/UX designer" ${designation === 'UI/UX designer' ? 'selected' : ''}>UI/UX Designer</option>
                            <option value="uiuxintern" ${designation === 'uiuxintern' ? 'selected' : ''}>UI/UX Intern</option>
                            <option value="3DArtist" ${designation === '3DArtist' ? 'selected' : ''}>3D Artist</option>
                            <option value="3Dintern" ${designation === '3Dintern' ? 'selected' : ''}>3D Artist Intern</option>
                            <option value="Admin" ${designation === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option value="Marketing" ${designation === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="Marketingassociate" ${designation === 'Marketingassociate' ? 'selected' : ''}>Marketing Associate</option>
                        </select>
                    </div>
                
                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-user-tie" style="color: #4f46e5; margin-right: 8px;"></i>Job Role</label>
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="radio" name="job_role" value="onrole" id="viewOnroleRadio" ${jobRole === 'onrole' ? 'checked' : ''} onchange="toggleViewJobRoleFields()" style="margin-right: 8px;">
                                <span>Onrole</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="radio" name="job_role" value="intern" id="viewInternRadio" ${jobRole === 'intern' ? 'checked' : ''} onchange="toggleViewJobRoleFields()" style="margin-right: 8px;">
                                <span>Intern</span>
                            </label>
                        </div>
                    </div>
                
                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-chart-line" style="color: #4f46e5; margin-right: 8px;"></i>Working Status</label>
                        <select name="working_status" required>
                            <option value="" disabled>Select Status</option>
                            <option value="working" ${workingStatus === 'working' ? 'selected' : ''}>Working</option>
                            <option value="relieved" ${workingStatus === 'relieved' ? 'selected' : ''}>Relieved</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5vw;">
                         <label><i class="fas fa-venus-mars" style="color: #4f46e5; margin-right: 8px;"></i>Gender</label>
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="radio" name="gender" value="male" id="viewMaleRadio" ${gender === 'male' ? 'checked' : ''} style="margin-right: 8px;">
                                <span>Male</span>
                            </label>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="radio" name="gender" value="female" id="viewFemaleRadio" ${gender === 'female' ? 'checked' : ''} style="margin-right: 8px;">
                                <span>Female</span>
                            </label>
                        </div>
                    </div>
            
                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-envelope" style="color: #4f46e5; margin-right: 8px;"></i>Email (Personal)</label>
                        <input type="email" name="personal_email" value="${personalEmail}" />
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-envelope-open" style="color: #4f46e5; margin-right: 8px;"></i>Email (Office)</label>
                        <input type="email" name="office_email" value="${officeEmail}" />
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-phone" style="color: #4f46e5; margin-right: 8px;"></i>Phone (Personal)</label>
                        <input type="tel" name="personal_number" value="${personalPhone}" />
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-phone-office" style="color: #4f46e5; margin-right: 8px;"></i>Phone (Office)</label>
                        <input type="tel" name="office_number" value="${officePhone}" />
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5vw;">
                        <label><i class="fas fa-birthday-cake" style="color: #4f46e5; margin-right: 8px;"></i>Date of Birth</label>
                        <input type="date" name="date_of_birth" value="${dateOfBirth && dateOfBirth !== 'N/A' ? this.formatDateForInput(dateOfBirth) : ''}" />
                    </div>

                    <div id="view-onrole-join" class="form-group" style="display: ${jobRole === 'onrole' ? 'block' : 'none'}; margin-bottom: 1.5vw;">
                        <label><i class="fas fa-calendar-plus" style="color: #4f46e5; margin-right: 8px;"></i>Join Date</label>
                        <input type="date" name="join_date" value="${employee.join_date && employee.join_date !== 'N/A' ? this.formatDateForInput(employee.join_date) : ''}" />
                    </div>

                    <div id="view-intern-start" class="form-group" style="display: ${jobRole === 'intern' ? 'block' : 'none'}; margin-bottom: 1.5vw;">
                        <label><i class="fas fa-calendar-alt" style="color: #4f46e5; margin-right: 8px;"></i>Intern Start Date</label>
                        <input type="date" name="start_date" id="view-start-date" value="${employee.start_date && employee.start_date !== 'N/A' ? this.formatDateForInput(employee.start_date) : ''}" onchange="calculateViewDuration()" />
                    </div>

                    <div id="view-intern-end" class="form-group" style="display: ${jobRole === 'intern' ? 'block' : 'none'}; margin-bottom: 1.5vw;">
                        <label><i class="fas fa-calendar-check" style="color: #4f46e5; margin-right: 8px;"></i>Intern End Date</label>
                        <input type="date" name="end_date" id="view-end-date" value="${employee.end_date && employee.end_date !== 'N/A' ? this.formatDateForInput(employee.end_date) : ''}" onchange="calculateViewDuration()" />
                    </div>
                    
                    <div id="view-intern-duration" class="form-group" style="display: ${jobRole === 'intern' ? 'block' : 'none'}; margin-bottom: 1.5vw;">
                        <label><i class="fas fa-clock" style="color: #4f46e5; margin-right: 8px;"></i>Duration</label>
                        <input type="text" name="duration" id="view-duration" value="${employee.duration || ''}" readonly style="background: #f3f4f6;" />
                    </div>
                    
                    <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 1.5vw;">
                        <label><i class="fas fa-map-marker-alt" style="color: #4f46e5; margin-right: 8px;"></i>Address</label>
                        <textarea name="address" rows="3" style="width: 100%; padding: 8px;">${address}</textarea>
                    </div>

                    <!-- DOCUMENTS SECTION -->
                    <div class="form-group" style="grid-column: 1 / -1; margin-top: 20px; margin-bottom: 1.5vw;">
                        <h4 style="color: #4f46e5; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                            <i class="fas fa-folder-open" style="margin-right: 8px;"></i>Documents Management
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            
                            <!-- Employee Photo -->
                            <div class="upload-card" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 10px; text-align: center;">
                                <i class="fas fa-camera" style="font-size: 32px; color: #9ca3af; margin-bottom: 10px;"></i>
                                <div style="font-weight: 600; margin-bottom: 5px;">Employee Photo</div>
                                <div id="currentPhoto" style="font-size: 12px; color: #6b7280; margin-bottom: 10px; min-height: 40px;">
                                    ${hasPhoto ? '<i class="fas fa-check-circle" style="color: #10b981;"></i> Uploaded' : '<i class="fas fa-times-circle" style="color: #ef4444;"></i> Not uploaded'}
                                </div>
                                <div id="photoPreview" style="margin: 10px 0; min-height: 60px;"></div>
                                <div style="display: flex; gap: 8px;">
                                    ${hasPhoto ? `<button type="button" onclick="window.employeeManager.downloadFile('${employee.photo_path}', 'photo_${empId}')" 
                                        style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                        <i class="fas fa-download"></i> Download
                                    </button>` : ''}
                                    <label for="updatePhoto" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px; background: #4f46e5; color: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                        <i class="fas fa-upload" style="margin-right: 6px;"></i> ${hasPhoto ? 'Update' : 'Upload'}
                                    </label>
                                </div>
                                <input type="file" id="updatePhoto" name="photo" accept="image/*" style="display: none;" onchange="previewUpdateFile(this, 'photo', 'photoPreview')">
                            </div>

                            <!-- Resume/CV -->
                            <div class="upload-card" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 10px; text-align: center;">
                                <i class="fas fa-file-alt" style="font-size: 32px; color: #9ca3af; margin-bottom: 10px;"></i>
                                <div style="font-weight: 600; margin-bottom: 5px;">Resume/CV</div>
                                <div id="currentResume" style="font-size: 12px; color: #6b7280; margin-bottom: 10px; min-height: 40px;">
                                    ${hasResume ? '<i class="fas fa-check-circle" style="color: #10b981;"></i> Uploaded' : '<i class="fas fa-times-circle" style="color: #ef4444;"></i> Not uploaded'}
                                </div>
                                <div id="resumePreview" style="margin: 10px 0; min-height: 60px;"></div>
                                <div style="display: flex; gap: 8px;">
                                    ${hasResume ? `<button type="button" onclick="window.employeeManager.downloadFile('${employee.resume_path}', 'resume_${empId}')" 
                                        style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                        <i class="fas fa-download"></i> Download
                                    </button>` : ''}
                                    <label for="updateResume" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px; background: #4f46e5; color: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                        <i class="fas fa-upload" style="margin-right: 6px;"></i> ${hasResume ? 'Update' : 'Upload'}
                                    </label>
                                </div>
                                <input type="file" id="updateResume" name="resume" accept=".pdf,.doc,.docx" style="display: none;" onchange="previewUpdateFile(this, 'resume', 'resumePreview')">
                            </div>

                            <!-- ID Proof (Multiple) -->
                            <div class="upload-card" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 10px; text-align: center;">
                                <i class="fas fa-id-card" style="font-size: 32px; color: #9ca3af; margin-bottom: 10px;"></i>
                                <div style="font-weight: 600; margin-bottom: 5px;">ID Proof</div>
                                <div id="currentIdProof" style="font-size: 12px; color: #6b7280; margin-bottom: 10px; min-height: 40px;">
                                    ${hasIdProof ? `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${employee.documents.id_proof.length} file(s)` : '<i class="fas fa-times-circle" style="color: #ef4444;"></i> Not uploaded'}
                                </div>
                                ${hasIdProof ? `
                                    <div style="max-height: 120px; overflow-y: auto; margin: 10px 0; font-size: 11px; text-align: left;">
                                        ${employee.documents.id_proof.map(doc => `
                                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px; background: #f9fafb; margin-bottom: 3px; border-radius: 4px;">
                                                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.details || 'ID Proof'}</span>
                                                <button type="button" onclick="window.employeeManager.downloadFile('${doc.path}', '${doc.details}')" 
                                                    style="padding: 3px 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px; margin-left: 5px;">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div id="idProofPreview" style="margin: 10px 0; min-height: 30px;"></div>
                                <label for="updateIdProof" style="display: flex; align-items: center; justify-content: center; padding: 8px; background: #4f46e5; color: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                    <i class="fas fa-upload" style="margin-right: 6px;"></i> Upload New
                                </label>
                                <input type="file" id="updateIdProof" name="id_proof" accept="image/*,.pdf" multiple style="display: none;" onchange="previewMultipleFiles(this, 'id_proof', 'idProofPreview')">
                            </div>

                            <!-- Certificates (Multiple) -->
                            <div class="upload-card" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 10px; text-align: center;">
                                <i class="fas fa-certificate" style="font-size: 32px; color: #9ca3af; margin-bottom: 10px;"></i>
                                <div style="font-weight: 600; margin-bottom: 5px;">Certificates</div>
                                <div id="currentCertificates" style="font-size: 12px; color: #6b7280; margin-bottom: 10px; min-height: 40px;">
                                    ${hasCertificates ? `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${employee.documents.certification.length} file(s)` : '<i class="fas fa-times-circle" style="color: #ef4444;"></i> Not uploaded'}
                                </div>
                                ${hasCertificates ? `
                                    <div style="max-height: 120px; overflow-y: auto; margin: 10px 0; font-size: 11px; text-align: left;">
                                        ${employee.documents.certification.map(doc => `
                                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px; background: #f9fafb; margin-bottom: 3px; border-radius: 4px;">
                                                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.details || 'Certificate'}</span>
                                                <button type="button" onclick="window.employeeManager.downloadFile('${doc.path}', '${doc.details}')" 
                                                    style="padding: 3px 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px; margin-left: 5px;">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div id="certificatesPreview" style="margin: 10px 0; min-height: 30px;"></div>
                                <label for="updateCertificates" style="display: flex; align-items: center; justify-content: center; padding: 8px; background: #4f46e5; color: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                    <i class="fas fa-upload" style="margin-right: 6px;"></i> Upload New
                                </label>
                                <input type="file" id="updateCertificates" name="certificates" accept=".pdf,.jpg,.jpeg,.png" multiple style="display: none;" onchange="previewMultipleFiles(this, 'certificates', 'certificatesPreview')">
                            </div>

                            <!-- Other Documents (Multiple) -->
                            <div class="upload-card" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 10px; text-align: center;">
                                <i class="fas fa-file" style="font-size: 32px; color: #9ca3af; margin-bottom: 10px;"></i>
                                <div style="font-weight: 600; margin-bottom: 5px;">Other Documents</div>
                                <div id="currentOtherDocs" style="font-size: 12px; color: #6b7280; margin-bottom: 10px; min-height: 40px;">
                                    ${hasOtherDocs ? `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${employee.documents.other_documents.length} file(s)` : '<i class="fas fa-times-circle" style="color: #ef4444;"></i> Not uploaded'}
                                </div>
                                ${hasOtherDocs ? `
                                    <div style="max-height: 120px; overflow-y: auto; margin: 10px 0; font-size: 11px; text-align: left;">
                                        ${employee.documents.other_documents.map(doc => `
                                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px; background: #f9fafb; margin-bottom: 3px; border-radius: 4px;">
                                                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.details || 'Document'}</span>
                                                <button type="button" onclick="window.employeeManager.downloadFile('${doc.path}', '${doc.details}')" 
                                                    style="padding: 3px 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px; margin-left: 5px;">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div id="otherDocsPreview" style="margin: 10px 0; min-height: 30px;"></div>
                                <label for="updateOtherDocs" style="display: flex; align-items: center; justify-content: center; padding: 8px; background: #4f46e5; color: white; border-radius: 6px; cursor: pointer; font-size: 12px;">
                                    <i class="fas fa-upload" style="margin-right: 6px;"></i> Upload New
                                </label>
                                <input type="file" id="updateOtherDocs" name="other_docs" multiple style="display: none;" onchange="previewMultipleFiles(this, 'other_docs', 'otherDocsPreview')">
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div style="position: sticky; bottom: 0; background: #fff; padding: 20px 0; border-top: 1px solid #e5e7eb; text-align: right; z-index: 10;">
            <button type="submit" class="btn btn-primary">Update Employee</button>
        </div>
    </form>
    `;

    // Attach form submit handler
    const updateForm = document.getElementById('employeeUpdateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(updateForm);
            const userConfirmed = confirm("Are you sure you want to update this employee?");
            if (!userConfirmed) return;
            
            try {
                await this.updateEmployeeWithFiles(formData);
            } catch (err) {
                console.error("Error while updating employee:", err);
            }
        });
    }

    // Open the modal
    const viewModal = document.getElementById('employeeviewModal');
    if (viewModal) {
        viewModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}
    formatDateForInput(dateValue) {
        if (!dateValue || dateValue === 'N/A' || dateValue === '' || dateValue === '0000-00-00' || 
            dateValue === '1970-01-01' || dateValue === null || dateValue === undefined) {
            return '';
        }

        try {
            let date;

            if (dateValue instanceof Date) {
                date = dateValue;
            } else {
                date = new Date(dateValue);
            }

            if (isNaN(date.getTime())) {
                console.warn('Invalid date value:', dateValue);
                return '';
            }

            const year = date.getFullYear();
            if (year < 1900 || year > 2100) {
                console.warn('Date year out of reasonable range:', year);
                return '';
            }

            return date.toISOString().split('T')[0];

        } catch (error) {
            console.error('Error formatting date:', dateValue, error);
            return '';
        }
    }

    showEmployeeDeleteModal(empName, empId) {
        return new Promise((resolve) => {
            const modal = document.getElementById('employeeDeleteModal');
            const message = document.getElementById('employeeDeleteMessage');
            const yesBtn = document.getElementById('employeeConfirmYesBtn');
            const noBtn = document.getElementById('employeeConfirmNoBtn');

            message.innerHTML = `Are you sure you want to delete employee <strong>${empName}</strong> (<code>${empId}</code>)?`;

            modal.style.display = 'block';

            const cleanup = () => {
                modal.style.display = 'none';
                yesBtn.removeEventListener('click', onYes);
                noBtn.removeEventListener('click', onNo);
            };

            const onYes = () => {
                cleanup();
                resolve(true);
            };

            const onNo = () => {
                cleanup();
                resolve(false);
            };

            yesBtn.addEventListener('click', onYes);
            noBtn.addEventListener('click', onNo);
        });
    }

    async deleteEmployee(index) {
        const employee = this.filteredEmployees[index];
        if (!employee) {
            this.showToast('Error', 'Employee not found', 'error');
            return;
        }

        const confirmed = await this.showEmployeeDeleteModal(employee.emp_name, employee.emp_id);

        if (!confirmed) {
            this.showToast('Cancelled', 'Delete action was cancelled.', 'info');
            return;
        }

        try {
            this.showToast('Processing', `Deleting ${employee.emp_name}...`, 'info');

            const response = await this.fetchWithRetry(this.endpoints.delete, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `emp_id=${encodeURIComponent(employee.emp_id)}`
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showToast('Success', `${employee.emp_name} deleted successfully`, 'success');
                await this.loadEmployees(false);
            } else {
                throw new Error(result.message || 'Failed to delete employee');
            }

        } catch (error) {
            console.error('Error deleting employee:', error);
            this.showToast('Error', 'Failed to delete employee: ' + error.message, 'error');
        }
    }

    async updateEmployeeWithFiles(formData) {
        console.log('=== UPDATE EMPLOYEE WITH FILES DEBUG START ===');
        
        const empId = formData.get('emp_id') || formData.get('emp_id_display');
        if (!empId) {
            console.error('ERROR: emp_id is missing from formData!');
            this.showToast('Error', 'Employee ID is required for update', 'error');
            return;
        }

        if (!formData.has('emp_id')) {
            formData.set('emp_id', empId);
        }

        console.log('FormData contents being sent:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        try {
            console.log('Sending request to:', this.endpoints.update);
            
            const response = await fetch(this.endpoints.update, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseText = await response.text();
            console.log('Raw response:', responseText.substring(0, 500));

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Full response:', responseText);
                throw new Error('Server returned invalid JSON response');
            }

            console.log('Parsed result:', result);
            console.log('=== UPDATE EMPLOYEE WITH FILES DEBUG END ===');

            if (result.status === 'success') {
                this.showToast('Success', 'Employee updated successfully', 'success');

                const viewModal = document.getElementById('employeeviewModal');
                if (viewModal) {
                    viewModal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }

                await this.loadEmployees(false);

            } else if (result.status === 'warning') {
                this.showToast('Notice', result.message, 'info');
                
                const viewModal = document.getElementById('employeeviewModal');
                if (viewModal) {
                    viewModal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
                await this.loadEmployees(false);
                
            } else {
                this.showToast('Error', result.message || 'Failed to update employee', 'error');
                if (result.debug) {
                    console.error('Server debug info:', result.debug);
                }
            }
        } catch (error) {
            console.error('Update error:', error);
            this.showToast('Error', 'Network/server error: ' + error.message, 'error');
        }
    }

    async updateEmployee(employeeData) {
        const formData = new FormData();
        for (const key in employeeData) {
            if (employeeData[key] !== undefined && employeeData[key] !== null && employeeData[key] !== '') {
                formData.append(key, employeeData[key]);
            }
        }
        return this.updateEmployeeWithFiles(formData);
    }

    showLoading() {
        const tbody = document.getElementById('employeeTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px; color: #4f46e5;"></i>
                        <p style="margin: 0; font-size: 16px;">Loading employees from database...</p>
                        <small style="color: #9ca3af;">This may take a few moments</small>
                    </td>
                </tr>`;
        }
    }

    showError(message) {
        const tbody = document.getElementById('employeeTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px; color: #ef4444; opacity: 0.7;"></i>
                        <p style="margin: 0 0 10px 0; font-size: 18px; color: #ef4444; font-weight: 600;">Failed to Load Employees</p>
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; max-width: 600px; margin-left: auto; margin-right: auto;">${message}</p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="window.employeeManager.loadEmployees()" 
                                    style="padding: 10px 20px; background: #000000ff; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-redo" style="margin-right: 8px;"></i>Try Again
                            </button>
                            <button onclick="window.employeeManager.testConnection()" 
                                    style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-network-wired" style="margin-right: 8px;"></i>Test Connection
                            </button>
                        </div>
                    </td>
                </tr>`;
        }
    }

    updateStats() {
        const totalElement = document.getElementById('totalEmployees');
        const activeElement = document.getElementById('activeEmployees');
        const internElement = document.getElementById('internEmployees');
        const lastUpdatedElement = document.getElementById('lastUpdated');

        if (totalElement) {
            totalElement.textContent = this.employees.length;
        }

        if (activeElement) {
            const activeCount = this.employees.filter(emp => emp.working_status === 'Active').length;
            activeElement.textContent = activeCount;
        }

        if (internElement) {
            const internCount = this.employees.filter(emp => emp.job_role === 'intern').length;
            internElement.textContent = internCount;
        }

        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleTimeString();
        }
    }

    showToast(title, message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const colors = {
            success: { bg: '#10b981', icon: 'check-circle' },
            error: { bg: '#ef4444', icon: 'exclamation-circle' },
            warning: { bg: '#f59e0b', icon: 'exclamation-triangle' },
            info: { bg: '#3b82f6', icon: 'info-circle' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            background: white;
            border-left: 4px solid ${color.bg};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 300px;
            max-width: 400px;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <i class="fas fa-${color.icon}" style="color: ${color.bg}; margin-top: 2px; font-size: 16px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${title}</div>
                    <div style="font-size: 14px; color: #6b7280;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    async refreshFromDatabase() {
        await this.loadEmployees(true);
    }

    getEmployeeById(empId) {
        return this.employees.find(emp => emp.emp_id === empId);
    }

    downloadFile(fileUrl, defaultFileName) {
    if (!fileUrl || fileUrl === 'N/A') {
        this.showToast('Error', 'No file available to download', 'error');
        return;
    }

    console.log('Original file URL:', fileUrl);
    
    // Extract just the filename from the full URL
    // Example: "https://www.fist-o.com/web_crm/uploads/photo_EMP001.jpg" -> "photo_EMP001.jpg"
    const filename = fileUrl.split('/').pop();
    
    console.log('Extracted filename:', filename);
    
    // Create download URL
    const downloadUrl = `https://www.fist-o.com/web_crm/download.php?file=${encodeURIComponent(filename)}`;
    
    console.log('Download URL:', downloadUrl);
    
    // Trigger download
    window.location.href = downloadUrl;
    
    this.showToast('Downloading', 'Starting download...', 'info');
}

    viewFile(fileUrl) {
        if (!fileUrl || fileUrl === 'N/A') {
            this.showToast('Error', 'No file available to view', 'error');
            return;
        }

        window.open(fileUrl, '_blank');
        this.showToast('Opening', 'File opened in new tab', 'info');
    }
}

// Global functions
function refreshEmployeeData() {
    if (typeof window.employeeManager !== 'undefined') {
        window.employeeManager.refreshFromDatabase();
    } else {
        console.warn('Employee manager not initialized');
    }
}

function testConnectionToDatabase() {
    if (typeof window.employeeManager !== 'undefined') {
        window.employeeManager.testConnection();
    } else {
        console.warn('Employee manager not initialized');
    }
}

// Initialize when DOM is ready
let employeeManager;
document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing Improved Employee Manager...');

    employeeManager = new ImprovedEmployeeManager();
    window.employeeManager = employeeManager;

    console.log('Employee Manager initialized successfully');
    console.log('Available methods: loadEmployees(), testConnection(), refreshFromDatabase()');
});

// Also handle case where script loads after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!employeeManager) {
        employeeManager = new ImprovedEmployeeManager();
        window.employeeManager = employeeManager;
    }
}