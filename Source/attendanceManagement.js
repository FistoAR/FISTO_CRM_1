// Attendance and time tracking functions
// attendanceManagement.js

let loginTime = null; // Store login time

// Elements
const modal = document.getElementById('punchModal');
const attendanceBtn = document.getElementById('attendanceBtn');
const closeBtn = document.querySelector('.close');
const submitBtn = document.getElementById('submitBtn');
const statusBadge = document.getElementById('statusBadge');
const currentTimeElement = document.getElementById('currentTime');
const activityList = document.getElementById('activityList');

// Modal form elements
const empIdInput = document.getElementById('empId');
const empNameInput = document.getElementById('empName');
const attendanceDateInput = document.getElementById('attendanceDate');
const attendanceTimeInput = document.getElementById('attendanceTime');
const loginTimeInput = document.getElementById('loginTime');
const radioIn = document.getElementById('radioIn');
const radioOut = document.getElementById('radioOut');
const modalClock = document.getElementById('modalClock');

let modalClockInterval = null;

// Update modal clock
function updateModalClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    modalClock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}


// Update current time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    currentTimeElement.textContent = timeString;
}

// Set current date and time in modal
function setCurrentDateTime() {
    const now = new Date();

    // Set current date in YYYY-MM-DD format (readonly)
    const dateStr = now.toISOString().split('T')[0];
    attendanceDateInput.value = dateStr;

    // Set current time in 12-hour format with AM/PM (e.g., 02:45:30 PM)
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    attendanceTimeInput.value = timeStr;

    // Set login time if user is logged in, otherwise show current time
    if (loginTime) {
        loginTimeInput.value = loginTime;
    } else {
        const loginTimeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        loginTimeInput.value = loginTimeStr;
    }
}

function updateAttendanceTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    if (attendanceTimeInput) {
        attendanceTimeInput.value = timeStr;
    }
    document.addEventListener("DOMContentLoaded", () => {
    updateAttendanceTime(); // Set immediately
    setInterval(updateAttendanceTime, 1000); // Then keep updating
});
    
}



// Update status and radio button availability
function updateStatus() {
    if (isLoggedIn) {
        statusBadge.textContent = 'Logged In';
        statusBadge.className = 'status logged-in';
    } else {
        statusBadge.textContent = 'Logged Out';
        statusBadge.className = 'status logged-out';
    }
}

// Update radio button states
function updateRadioStates() {
    const radioIn = document.getElementById("radioIn");
    const radioOut = document.getElementById("radioOut");
    const radioInLabel = document.querySelector('label[for="radioIn"]');
    const radioOutLabel = document.querySelector('label[for="radioOut"]');

    if (!radioIn || !radioOut || !radioInLabel || !radioOutLabel) {
        console.error("Radio elements not found in DOM");
        return;
    }

    if (isLoggedIn) {
        // Already punched in: allow only "Out"
        radioIn.disabled = true;
        radioIn.checked = false;
        radioOut.disabled = false;
        radioOut.checked = true;

        radioInLabel.classList.add('disabled');
        radioOutLabel.classList.remove('disabled');
    } else {
        // Not punched in yet: allow only "In"
        radioIn.disabled = false;
        radioIn.checked = true;
        radioOut.disabled = true;
        radioOut.checked = false;

        radioInLabel.classList.remove('disabled');
        radioOutLabel.classList.add('disabled');
    }
}


function getCurrentDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function showModal() {
    const modal = document.getElementById('punchModal');
    const body = document.body;

    if (!modal) return;

    modal.classList.add('show');
    body.classList.add('modal-open');

    setCurrentDateTime(); // Sets current date/time in modal

    // Load employee info from sessionStorage
    const empIdFromSession = sessionStorage.getItem("employeeId");
    const empNameFromSession = sessionStorage.getItem("employeeName");

    if (!empIdFromSession || !empNameFromSession) {
        alert("Session expired or not logged in. Please log in again.");
        hideModal();
        return;
    }

    // Fill input fields
    if (empIdInput) empIdInput.value = empIdFromSession;
    if (empNameInput) empNameInput.value = empNameFromSession;

    try {
        const response = await fetch(`https://www.fist-o.com/web_crm/test/check_attendance.php?employee_id=${encodeURIComponent(empIdFromSession)}&date=${encodeURIComponent(getCurrentDate())}`);

        const text = await response.text();
        console.log("Raw response:", text);

        // Parse multiple JSON objects by splitting on '}{'
        const parts = text.split('}{');
        let attendanceData = null;

        for (let i = 0; i < parts.length; i++) {
            let jsonStr = parts[i];
            
            // Reconstruct valid JSON by adding back missing braces
            if (i > 0) jsonStr = '{' + jsonStr;
            if (i < parts.length - 1) jsonStr = jsonStr + '}';
            
            try {
                const parsed = JSON.parse(jsonStr);
                console.log(`Parsed object ${i + 1}:`, parsed);
                
                // Look for the attendance data (object with punched_in property)
                if (parsed.hasOwnProperty('punched_in')) {
                    attendanceData = parsed;
                    break;
                }
            } catch (parseError) {
                console.error(`Failed to parse JSON part ${i + 1}:`, jsonStr, parseError);
            }
        }

        // Process the attendance data
        if (attendanceData && attendanceData.status === 'success') {
            isLoggedIn = attendanceData.punched_in || false;
            currentAttendanceId = attendanceData.record_id || null;
            console.log("Attendance status:", { isLoggedIn, currentAttendanceId });
        } else {
            console.log("No valid attendance data found or error in response");
            isLoggedIn = false;
            currentAttendanceId = null;
        }

        updateRadioStates();

    } catch (error) {
        console.error("❌ Failed to fetch attendance status:", error);
        isLoggedIn = false;
        currentAttendanceId = null;
        updateRadioStates();
    }

    updateModalClock();

    modalClockInterval = setInterval(() => {
        updateModalClock();
    }, 1000);
}




// Hide modal function
function hideModal() {
    const modal = document.getElementById('punchModal');
    const body = document.body;
    
    if (modal) {
        // Remove show class from modal
        modal.classList.remove('show');
        
        // Allow body scrolling again
        body.classList.remove('modal-open');
        
        // Stop modal updates
        if (modalClockInterval) {
            clearInterval(modalClockInterval);
            modalClockInterval = null;
        }
    }
}




// Initialize modal event listeners
function initializeModalListeners() {
    const modal = document.getElementById('punchModal');
    const attendanceBtn = document.getElementById('attendanceBtn');
    const closeBtn = document.querySelector('.close');
    const submitBtn = document.getElementById('submitBtn');
    const overlay = document.querySelector('.modal-overlay');

    // Open modal
    if (attendanceBtn) {
        attendanceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });
    }

    // Close modal via close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal();
        });
    }

    // Close modal via overlay click
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideModal();
            }
        });
    }

    // Handle form submission
    if (submitBtn) {
        submitBtn.addEventListener('click', handleAttendanceSubmission);
    }

    // Close modal via escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            hideModal();
        }
    });
}

// Alternative: Generic modal functions that can work with any modal
function showGenericModal(modalId) {
    const modal = document.getElementById(modalId);
    const body = document.body;
    
    if (modal) {
        modal.classList.add('show');
        body.classList.add('modal-open');
    }
}

// Add activity to list
function addActivity(type) {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const currentDevice = detectDevice();

    activities.unshift({
        type: type,
        time: `Today - ${timeString}`,
        device: currentDevice
    });

    // Keep only last 5 activities
    if (activities.length > 5) {
        activities = activities.slice(0, 5);
    }

    updateActivityList();
}

// Update activity list
function updateActivityList() {
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No recent activity</div>';
        return;
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';

        const typeClass = activity.type === 'in' ? 'punch-in-activity' : 'punch-out-activity';
        const typeText = activity.type === 'in' ? 'Punch In' : 'Punch Out';
        const deviceIcon = getDeviceIcon(activity.device);

        activityItem.innerHTML = `
            <div class="activity-left">
                <span class="activity-type ${typeClass}">${typeText}</span>
                <span class="activity-device">
                    <span class="device-icon">${deviceIcon}</span>
                    ${activity.device}
                </span>
            </div>
            <span class="activity-time">${activity.time}</span>
        `;
        activityList.appendChild(activityItem);
    });
}


// Handle form submission
// function handleAttendanceSubmission(e) {
//     e.preventDefault();

//     const selectedAction = document.querySelector('input[name="action"]:checked');
//     if (!selectedAction) {
//         alert('Please select In or Out');
//         return;
//     }

    const type = selectedAction.value;
    const date = attendanceDateInput.value;
    const time = attendanceTimeInput.value;
    const empId = empIdInput.value;
    const empName = empNameInput.value;

    // if (!empId || !empName || !date || !time) {
    //     alert('Please fill in all required fields');
    //     return;
    // }

    // const endpoint = (type === 'in') 
    //     ? 'https://www.fist-o.com/web_crm/punch_in.php'
    //     : 'https://www.fist-o.com/web_crm/punch_out.php';

    // const bodyData = new URLSearchParams({
    //     employee_id: empId,
    //     employee_name: empName,
    //     date: date,
    //     [type === 'in' ? 'log_in_time' : 'log_out_time']: time
    // });
// fetch(endpoint, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: bodyData.toString()
// })
// .then(res => res.text())   // get raw text instead of json yet
// .then(text => {
//     console.log('Raw response:', text);  // <-- Add this to debug
//     return JSON.parse(text);              // now parse JSON explicitly
// })
// .then(data => {
//     if (data.status === 'success') {
//         alert(`✅ Punch ${type.toUpperCase()} successful!`);
//         // ... rest of success logic
//     } else {
//         alert('❌ ' + data.message);
//     }
// })
// .catch(error => {
//     console.error(`❌ Error during Punch ${type.toUpperCase()}:`, error);
//     alert(`❌ Failed to punch ${type}. Please try again.`);
// });
// }


// Initialize attendance management
function initializeAttendanceManagement() {
    // Check if elements exist before adding listeners
    if (attendanceBtn) {
        attendanceBtn.addEventListener("click", showModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", hideModal);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', handleAttendanceSubmission);
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Initialize time updates
    if (currentTimeElement) {
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    updateStatus();
    updateActivityList();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Only initialize if attendance elements exist on the page
    if (document.getElementById('punchModal')) {
        initializeAttendanceManagement();
    }
});

// Make functions globally available
window.updateModalClock = updateModalClock;
window.updateTime = updateTime;
window.setCurrentDateTime = setCurrentDateTime;
window.updateStatus = updateStatus;
window.updateRadioStates = updateRadioStates;
window.showModal = showModal;
window.hideModal = hideModal;
window.addActivity = addActivity;
window.updateActivityList = updateActivityList;
window.handleAttendanceSubmission = handleAttendanceSubmission;
window.initializeAttendanceManagement = initializeAttendanceManagement;
window.showGenericModal = showGenericModal;
window.hideGenericModal = hideGenericModal;