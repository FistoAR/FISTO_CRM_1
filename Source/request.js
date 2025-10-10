// Tab switching functionality for Request Management
function switchEmployeeTab(tabName) {
    console.log('Switching to tab:', tabName); // Debug log
    
    // Hide all tab contents in employee view
    const allTabContents = document.querySelectorAll('#leave-content .tab-content');
    allTabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons in employee view
    const allTabButtons = document.querySelectorAll('#leave-content .tab-btn');
    allTabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log('Activated tab:', tabName); // Debug log
    } else {
        console.error('Tab not found:', tabName); // Debug log
    }
    
    // Add active class to the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Main function to handle leave date fields update - CONSOLIDATED VERSION
function updateLeaveDateFields() {
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    const customDaysGroup = document.getElementById('customDaysGroup');
    const customDaysInput = document.getElementById('customDaysInput');
    const singleDateGroup = document.getElementById('singleDateGroup');
    const halfDayPeriodGroup = document.getElementById('halfDayPeriodGroup');
    const startDateGroup = document.getElementById('startDateGroup');
    const calculatedDuration = document.getElementById('calculatedDuration');
    
    if (!numberOfDaysSelect) return;
    
    const selectedValue = numberOfDaysSelect.value;
    
    // Hide all conditional groups first
    hideElement(singleDateGroup);
    hideElement(halfDayPeriodGroup);
    hideElement(startDateGroup);
    hideElement(customDaysGroup);
    hideElement(calculatedDuration);
    
    // Clear custom input and remove required attribute when switching away
    if (customDaysInput && selectedValue !== 'custom' && selectedValue !== 'more') {
        customDaysInput.value = '';
        customDaysInput.removeAttribute('required');
    }
    
    // Show appropriate groups based on selection
    switch(selectedValue) {
        case 'halfday':
            showElement(singleDateGroup);
            showElement(halfDayPeriodGroup);
            break;
            
        case '1':
            showElement(singleDateGroup);
            break;
            
        case 'custom':
        case 'more':
            // Handle both 'custom' and 'more' values for "More than 5 days"
            showCustomDaysInput(customDaysGroup, customDaysInput);
            showElement(startDateGroup);
            showElement(calculatedDuration);
            break;
            
        default:
            // For 2, 3, 4, 5 days
            if (selectedValue && selectedValue !== '' && selectedValue !== 'halfday' && selectedValue !== '1') {
                showElement(startDateGroup);
            }
            break;
    }
}

// Helper functions for showing/hiding elements
function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
        element.style.display = 'block';
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
    }
}


// Function to show custom days input with proper setup
function showCustomDaysInput(customDaysGroup, customDaysInput) {
    if (customDaysGroup) {
        customDaysGroup.classList.remove('hidden');
        customDaysGroup.style.display = 'block';
        
        // Add animation class if available
        if (customDaysGroup.classList.contains('show')) {
            customDaysGroup.classList.add('show');
        }
    }
    
    if (customDaysInput) {
        customDaysInput.setAttribute('required', 'required');
        
        // Focus on input after a short delay for better UX
        setTimeout(() => {
            customDaysInput.focus();
        }, 200);
    }
}

// Updated custom days calculation function
function calculateCustomLeaveDuration() {
    const customDaysInput = document.getElementById('customDaysInput');
    const startDateInput = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    const durationText = document.getElementById('durationText');
    
    if (!customDaysInput || !startDateInput) {
        return;
    }
    
    const customDays = parseInt(customDaysInput.value);
    const startDate = startDateInput.value;
    
    // Validate custom days input
    if (customDays && customDays >= 6) {
        customDaysInput.setCustomValidity('');
        
        if (startDate && endDateField) {
            // Calculate end date based on custom days
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + customDays - 1);
            
            // Format date as YYYY-MM-DD for input field
            const formattedEndDate = end.toISOString().split('T')[0];
            endDateField.value = formattedEndDate;
            
            // Update duration display if element exists
            if (durationText) {
                const startFormatted = start.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const endFormatted = end.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                durationText.innerHTML = `
                    <strong>${customDays} days</strong> from ${startFormatted} to ${endFormatted}
                `;
            }
        } else if (durationText) {
            durationText.innerHTML = `<strong>${customDays} days</strong> - Please select start date to calculate end date`;
        }
    } else if (customDays && customDays < 6) {
        customDaysInput.setCustomValidity('Please enter 6 or more days for custom duration.');
        if (durationText) {
            durationText.innerHTML = 'Please enter a valid number of days (6 or more)';
        }
        if (endDateField) {
            endDateField.value = '';
        }
    } else {
        customDaysInput.setCustomValidity('');
        if (durationText) {
            durationText.innerHTML = 'Enter the number of days to see duration calculation';
        }
        if (endDateField) {
            endDateField.value = '';
        }
    }
}

// Enhanced form validation for leave application
function validateLeaveApplication() {
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    const customDaysInput = document.getElementById('customDaysInput');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (!numberOfDaysSelect) return false;
    
    const selectedValue = numberOfDaysSelect.value;
    
    // Validate custom days selection
    if ((selectedValue === 'custom' || selectedValue === 'more') && customDaysInput) {
        const customDays = parseInt(customDaysInput.value);
        
        if (!customDays || customDays < 6) {
            alert('Please enter a valid number of days (6 or more) for custom duration.');
            customDaysInput.focus();
            return false;
        }
        
        if (startDate && endDate && startDate.value && endDate.value) {
            // Verify the dates match the custom days input
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            if (diffDays !== customDays) {
                alert(`The selected date range (${diffDays} days) doesn't match your specified duration (${customDays} days). Please adjust.`);
                return false;
            }
        }
    }
    
    return true;
}

// Calculate leave duration from date selection
function calculateLeaveDuration() {
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const customDaysInput = document.getElementById('customDaysInput');
    const durationText = document.getElementById('durationText');
    
    if (!startDateInput || !endDateInput || !startDateInput.value || !endDateInput.value) {
        return;
    }
    
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const selectedValue = numberOfDaysSelect ? numberOfDaysSelect.value : '';
    
    if ((selectedValue === 'custom' || selectedValue === 'more') && customDaysInput && durationText) {
        // Update custom days input and duration display
        customDaysInput.value = diffDays;
        
        const startFormatted = start.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const endFormatted = end.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        durationText.innerHTML = `
            <strong>${diffDays} days</strong> from ${startFormatted} to ${endFormatted}
        `;
    } else if (numberOfDaysSelect && diffDays <= 5) {
        // Update dropdown for non-custom selections
        numberOfDaysSelect.value = diffDays.toString();
        updateLeaveDateFields(); // Refresh the display
    }
}


function toggleOtherLeaveType() {
            const leaveType = document.getElementById('leaveType').value;
            const otherLeaveDiv = document.getElementById('otherLeaveTypeDiv');
            const otherLeaveInput = document.getElementById('otherLeaveType');
            
            if (leaveType === 'other') {
                otherLeaveDiv.classList.remove('hidden');
                otherLeaveInput.required = true;
                otherLeaveInput.focus(); // Focus on the input when it appears
            } else {
                otherLeaveDiv.classList.add('hidden');
                otherLeaveInput.required = false;
                otherLeaveInput.value = ''; // Clear the input when hidden
            }
        }

// Load time slots for meeting scheduling
function loadTimeSlots() {
    const timeSlots = document.getElementById('timeSlots');
    if (!timeSlots) return;
    
    const sampleSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', 
        '02:00 PM', '03:00 PM', '04:00 PM'
    ];
    
    timeSlots.innerHTML = '';
    sampleSlots.forEach((slot, index) => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot';
        slotDiv.innerHTML = `
            <input type="radio" name="timeSlot" value="${slot}" id="slot${index}">
            <label for="slot${index}">${slot}</label>
        `;
        timeSlots.appendChild(slotDiv);
    });
}

// Load time slots for HR meeting scheduling
function loadHRTimeSlots() {
    const timeSlots = document.getElementById('hrTimeSlots');
    if (!timeSlots) return;
    
    const sampleSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', 
        '02:00 PM', '03:00 PM', '04:00 PM'
    ];
    
    timeSlots.innerHTML = '';
    sampleSlots.forEach((slot, index) => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot';
        slotDiv.innerHTML = `
            <input type="radio" name="hrTimeSlot" value="${slot}" id="hrSlot${index}">
            <label for="hrSlot${index}">${slot}</label>
        `;
        timeSlots.appendChild(slotDiv);
    });
}

// HR tab switching for the switchTab function used in HR view
function switchTab(tabName) {
    console.log('HR switching to tab:', tabName);
    
    // Hide all HR tab contents
    const allTabContents = document.querySelectorAll('#hr-view .tab-content');
    allTabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all HR tab buttons
    const allTabButtons = document.querySelectorAll('#hr-view .tab-btn');
    allTabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// HR functions for approving/rejecting requests
function approveLeave(requestId) {
    alert(`Leave request ${requestId} approved!`);
    // Add your approval logic here
}

function rejectLeave(requestId) {
    alert(`Leave request ${requestId} rejected!`);
    // Add your rejection logic here
}

function approvePermission(requestId) {
    alert(`Permission request ${requestId} approved!`);
    // Add your approval logic here
}

function rejectPermission(requestId) {
    alert(`Permission request ${requestId} rejected!`);
    // Add your rejection logic here
}

function editMeeting(meetingId) {
    alert(`Edit meeting ${meetingId}`);
    // Add your edit meeting logic here
}

function cancelMeeting(meetingId) {
    if (confirm(`Are you sure you want to cancel meeting ${meetingId}?`)) {
        alert(`Meeting ${meetingId} cancelled!`);
        // Add your cancel meeting logic here
    }
}

// DOM Content Loaded Event Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Leave management system initialized');
    
    // Set up event listeners for custom days input
    const customDaysInput = document.getElementById('customDaysInput');
    if (customDaysInput) {
        // Input validation and calculation
        customDaysInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            // Validate input
            if (this.value && value < 6) {
                this.setCustomValidity('Please enter 6 or more days.');
            } else {
                this.setCustomValidity('');
            }
            
            // Calculate duration
            calculateCustomLeaveDuration();
        });
        
        // Prevent invalid key inputs
        customDaysInput.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter, and arrow keys
            if ([46, 8, 9, 27, 13, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
    
    // Set up start date change listener
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.addEventListener('change', function() {
            calculateCustomLeaveDuration();
            calculateLeaveDuration();
        });
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        startDateInput.setAttribute('min', today);
    }
    
    // Set up end date change listener
    const endDateInput = document.getElementById('endDate');
    if (endDateInput) {
        endDateInput.addEventListener('change', function() {
            calculateLeaveDuration();
        });
    }
    
    // Initialize dropdown state
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    if (numberOfDaysSelect) {
        updateLeaveDateFields(); // Initialize on page load
    }
    
    // Form submission handlers
    const leaveForm = document.getElementById('leaveApplicationForm');
    if (leaveForm) {
        leaveForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateLeaveApplication()) {
                const numberOfDaysSelect = document.getElementById('numberOfDays');
                const customDaysInput = document.getElementById('customDaysInput');
                const leaveTypeSelect = document.getElementById('leaveType');
                const leaveReasonInput = document.getElementById('leaveReason');
                
                // Get form data
                const formData = {
                    leaveType: leaveTypeSelect ? leaveTypeSelect.value : '',
                    numberOfDays: numberOfDaysSelect ? numberOfDaysSelect.value : '',
                    customDays: customDaysInput ? customDaysInput.value : null,
                    startDate: startDateInput ? startDateInput.value : '',
                    endDate: endDateInput ? endDateInput.value : '',
                    reason: leaveReasonInput ? leaveReasonInput.value : ''
                };
                
                let finalDays = formData.numberOfDays;
                if ((formData.numberOfDays === 'custom' || formData.numberOfDays === 'more') && formData.customDays) {
                    finalDays = formData.customDays + ' days';
                }
                
                console.log('Leave application data:', formData);
                alert(`Leave Application Submitted!\n\nLeave Type: ${formData.leaveType}\nDays: ${finalDays}\nReason: ${formData.reason}`);
                
                // Reset form after successful submission
                this.reset();
                updateLeaveDateFields();
            }
        });
    }
    
    // Other form handlers
    const permissionForm = document.getElementById('permissionForm');
    if (permissionForm) {
        permissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Permission request submitted successfully!');
        });
    }
    
    const meetingForm = document.getElementById('meetingForm');
    if (meetingForm) {
        meetingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Meeting scheduled successfully!');
        });
    }
});

 // Apply Tagify to the input
  new Tagify(document.getElementById('attendees'), {
    whitelist: ["EMP001", "EMP002", "EMP003", "EMP004"],
    dropdown: {
      maxItems: 10,
      enabled: 0, // shows dropdown on focus
      closeOnSelect: false
    }
  });

  function initializePermissionTimeCalculation() {
    const fromTime = document.getElementById('fromTime');
    const toTime = document.getElementById('toTime');
    const delayDuration = document.getElementById('delayDuration'); // Add this input to display delay

    function calculateDelay() {
        if (fromTime.value && toTime.value) {
            const [fromH, fromM] = fromTime.value.split(':').map(Number);
            const [toH, toM] = toTime.value.split(':').map(Number);

            const fromDate = new Date(2000, 0, 1, fromH, fromM);
            const toDate = new Date(2000, 0, 1, toH, toM);

            let diffMinutes = Math.round((toDate - fromDate) / (1000 * 60));

            if (diffMinutes < 0) diffMinutes = 0;

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            let delayStr = '';
            if (hours > 0) delayStr += `${hours} hr${hours > 1 ? 's' : ''} `;
            if (minutes > 0) delayStr += `${minutes} min${minutes > 1 ? 's' : ''}`;
            if (!delayStr) delayStr = '0 min';

            delayDuration.value = delayStr.trim();
        }
    }

    fromTime.addEventListener('change', calculateDelay);
    toTime.addEventListener('change', calculateDelay);
}

// Call this after your page content loads
initializePermissionTimeCalculation();
