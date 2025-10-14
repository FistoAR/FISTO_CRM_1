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

function updateTime() {
    const now = getServerNow();  // ✅ Server time
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

function updateModalClock() {
    const now = getServerNow();  // ✅ Server time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    modalClock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}


// Set current date and time in modal
async function setCurrentDateTime() {
    try {
        const response = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
        const data = await response.json();

        const serverTime = new Date(data.time); // Use PHP server time

        // Date in YYYY-MM-DD
        const dateStr = serverTime.toISOString().split('T')[0];
        attendanceDateInput.value = dateStr;

        // Time in 12-hour format
        const timeStr = serverTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        attendanceTimeInput.value = timeStr;

        // Login time handling
        if (loginTime) {
            loginTimeInput.value = loginTime;
        } else {
            const loginTimeStr = serverTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            loginTimeInput.value = loginTimeStr;
        }
    } catch (error) {
        console.error("❌ Failed to fetch server time:", error);
    }
}

// Keep server time offset in ms
let serverTimeOffset = 0;

// Sync local clock with server clock
async function syncServerTime() {
    try {
        const res = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
        const data = await res.json();
        const serverDate = new Date(data.time);
        const localDate = new Date();

        serverTimeOffset = serverDate.getTime() - localDate.getTime();
        console.log("✅ Server time synced:", serverDate, "Offset:", serverTimeOffset);
    } catch (err) {
        console.error("❌ Failed to sync server time:", err);
    }
}

// Always return corrected server time
function getServerNow() {
    return new Date(Date.now() + serverTimeOffset);
}


let ticksSinceLastSync = 0;

function updateAttendanceTime() {
    const now = getServerNow();

    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    if (attendanceTimeInput) {
        attendanceTimeInput.value = timeStr;
    }

    ticksSinceLastSync++;

    // Optional: Force re-sync every 60 ticks (if you don’t want to rely only on setInterval)
    if (ticksSinceLastSync >= 60) {
        syncServerTime();
        ticksSinceLastSync = 0;
    }
}



document.addEventListener("DOMContentLoaded", async () => {
    await syncServerTime();
    // setInterval(syncServerTime, 60000); // re-sync every 1 min

    if (document.getElementById('punchModal')) {
        initializeAttendanceManagement();
    }

    // ✅ Start attendance clock here
    updateAttendanceTime();
    setInterval(updateAttendanceTime, 1000);
});




// Update status and radio button availability
function updateStatus() {
    if (!statusBadge) return;
    
    if (isLoggedIn) {
        statusBadge.textContent = 'Logged In';
        statusBadge.className = 'status logged-in';
    } else {
        statusBadge.textContent = 'Logged Out';
        statusBadge.className = 'status logged-out';
    }
    const stageLabels = {
        'none': 'Not Started',
        'waiting_login_morning': 'Ready for Morning Login',
        'waiting_logout_morning': 'Morning Logged In',
        'waiting_login_afternoon': 'Ready for Afternoon Login',
        'waiting_logout_afternoon': 'Afternoon Logged In',
        'complete': 'Day Complete'
    };
    
    const stageClasses = {
        'none': 'status-default',
        'waiting_login_morning': 'status-waiting',
        'waiting_logout_morning': 'status-logged-in',
        'waiting_login_afternoon': 'status-waiting',
        'waiting_logout_afternoon': 'status-logged-in',
        'complete': 'status-complete'
    };
    
    statusBadge.textContent = stageLabels[currentAttendanceStage] || 'Unknown';
    statusBadge.className = 'status ' + (stageClasses[currentAttendanceStage] || 'status-default');
}

// Update radio button states based on attendance status
// Enhanced radio state update with logging
function updateRadioStates(attendanceStatus = null) {
    const radioIn = document.getElementById('radioIn');
    const radioOut = document.getElementById('radioOut');

    if (!radioIn || !radioOut) {
        console.error("❌ Radio buttons not found!");
        return;
    }

    console.log("🔘 Updating radio states with status:", attendanceStatus);

    // Reset states
    radioIn.disabled = false;
    radioOut.disabled = false;
    radioIn.checked = false;
    radioOut.checked = false;

    // Remove any existing completion messages
    const existingMsg = document.querySelector('.attendance-complete-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    if (attendanceStatus && attendanceStatus.status === 'success') {
        const hasLoginTime = !!(attendanceStatus.login_time || attendanceStatus.punched_in);
        const hasLogoutTime = !!(attendanceStatus.logout_time || attendanceStatus.punched_out);

        console.log("📊 Status analysis:", { hasLoginTime, hasLogoutTime });

        if (!hasLoginTime && !hasLogoutTime) {
            // No attendance record or empty record - Enable IN only
            console.log("🟢 State: Enable IN only");
            radioIn.disabled = false;
            radioIn.checked = true;
            radioOut.disabled = true;
            isLoggedIn = false;
            
        } else if (hasLoginTime && !hasLogoutTime) {
            // Has login time but no logout - Enable OUT only
            console.log("🟡 State: Enable OUT only");
            radioIn.disabled = true;
            radioOut.disabled = false;
            radioOut.checked = true;
            isLoggedIn = true;
            
        } else if (hasLoginTime && hasLogoutTime) {
            // Both login and logout exist - Disable both
            console.log("🔴 State: Disable both - attendance complete");
            radioIn.disabled = true;
            radioOut.disabled = true;
            isLoggedIn = false;
            
            // Show completion message
            showCompletionMessage();
        }
    } else {
        // Default state or no valid data - enable IN only
        console.log("🆕 State: Default - Enable IN only");
        radioIn.disabled = false;
        radioIn.checked = true;
        radioOut.disabled = true;
        isLoggedIn = false;
    }

    updateStatus();
    console.log("🔘 Radio states updated. isLoggedIn:", isLoggedIn);
}




function showCompletionMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'attendance-complete-message';
    messageDiv.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
    `;
    messageDiv.textContent = '✅ Attendance already completed for today.';
    
    // Insert after radio buttons
    const radioContainer = document.querySelector('.radio-group') || radioOut.parentNode;
    if (radioContainer && !radioContainer.querySelector('.attendance-complete-message')) {
        radioContainer.appendChild(messageDiv);
    }
}
// NEW: Update UI based on attendance stage
function updateAttendanceUI(attendanceStatus) {
    console.log("🎨 Updating attendance UI with status:", attendanceStatus);
    
    // Remove existing stage info
    const existingInfo = document.querySelector('.attendance-stage-info');
    if (existingInfo) existingInfo.remove();
    
    const existingComplete = document.querySelector('.attendance-complete-message');
    if (existingComplete) existingComplete.remove();
    
    // Hide all action buttons first
    hideAllActionButtons();
    
    if (!attendanceStatus || !attendanceStatus.attendance_stage) {
        currentAttendanceStage = 'none';
        showActionButton('login-morning');
        showStageInfo('Morning Login', 'Please punch in for morning session');
        updateStatus();
        return;
    }
    
    currentAttendanceStage = attendanceStatus.attendance_stage;
    const nextAction = attendanceStatus.next_action;
    
    console.log("📊 Current stage:", currentAttendanceStage, "Next action:", nextAction);
    
    switch(currentAttendanceStage) {
        case 'none':
            showActionButton('login-morning');
            showStageInfo('Morning Login', 'Please punch in for morning session');
            break;
            
        case 'waiting_logout_morning':
            showActionButton('logout-morning');
            showStageInfo('Morning Logout', 'You are logged in. Punch out for lunch break');
            break;
            
        case 'waiting_login_afternoon':
            showActionButton('login-afternoon');
            showStageInfo('Afternoon Login', 'Please punch in for afternoon session');
            break;
            
        case 'waiting_logout_afternoon':
            showActionButton('logout-afternoon');
            showStageInfo('Afternoon Logout', 'You are logged in. Punch out to end your day');
            break;
            
        case 'complete':
            showCompletionMessage('✅ All attendance punches completed for today');
            break;
            
        default:
            showActionButton('login-morning');
            showStageInfo('Morning Login', 'Please punch in for morning session');
    }
    
    updateStatus();
}

// Hide all action buttons
function hideAllActionButtons() {
    const buttons = ['login-morning', 'logout-morning', 'login-afternoon', 'logout-afternoon'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId + '-btn');
        if (btn) {
            btn.style.display = 'none';
            btn.disabled = true;
        }
    });
}
// Check attendance status for the current employee and date
async function checkAttendanceStatus(empId, date) {
    console.log("🔍 Checking attendance status for:", { empId, date });
    
    try {
        const url = `https://www.fist-o.com/web_crm/check_attendance.php?employee_id=${encodeURIComponent(empId)}&date=${encodeURIComponent(date)}`;
        console.log("🌐 Fetching from URL:", url);
        
        const response = await fetch(url);
        const text = await response.text();
        console.log("📄 Raw response text:", text);

        // Try to parse as single JSON first
        try {
            const singleJson = JSON.parse(text);
            console.log("✅ Successfully parsed as single JSON:", singleJson);
            return singleJson;
        } catch (singleParseError) {
            console.log("⚠️ Single JSON parse failed, trying multiple JSON parsing...");
        }

        // Handle multiple JSON objects
        const parts = text.split('}{');
        console.log("📦 Split into parts:", parts.length);

        let attendanceData = null;

        for (let i = 0; i < parts.length; i++) {
            let jsonStr = parts[i];
            if (i > 0) jsonStr = '{' + jsonStr;
            if (i < parts.length - 1) jsonStr = jsonStr + '}';

            console.log(`🔧 Processing part ${i + 1}:`, jsonStr);

            try {
                const parsed = JSON.parse(jsonStr);
                console.log(`✅ Parsed part ${i + 1}:`, parsed);

                if (parsed.hasOwnProperty('punched_in') || parsed.hasOwnProperty('login_time') || parsed.hasOwnProperty('status')) {
                    attendanceData = parsed;
                    console.log("🎯 Found attendance data:", attendanceData);
                    break;
                }
            } catch (parseError) {
                console.error(`❌ Failed to parse part ${i + 1}:`, parseError);
            }
        }

        console.log("🏁 Final attendance data:", attendanceData);
        return attendanceData;
    } catch (error) {
        console.error("❌ Failed to fetch attendance status:", error);
        return null;
    }
}


function getCurrentDate() {
    const today = getServerNow ? getServerNow() : new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    
    // Return in DD-MM-YYYY format (as your PHP expects)
    const formattedDate = `${dd}-${mm}-${yyyy}`;
    console.log("📅 Formatted current date:", formattedDate);
    return formattedDate;
}

// Enhanced show modal function with better status checking
async function showModal() {
    console.log("🎭 Opening attendance modal...");
    
    const modal = document.getElementById('punchModal');
    const body = document.body;

    if (!modal) {
        console.error("❌ Modal element not found!");
        return;
    }

    modal.classList.add('show');
    body.classList.add('modal-open');

    // Set current date/time
    await setCurrentDateTime();

    // Load employee info from sessionStorage
    const empIdFromSession = sessionStorage.getItem("employeeId");
    const empNameFromSession = sessionStorage.getItem("employeeName");

    console.log("👤 Session data:", { empIdFromSession, empNameFromSession });

    if (!empIdFromSession || !empNameFromSession) {
        alert("Session expired or not logged in. Please log in again.");
        hideModal();
        return;
    }

    // Fill input fields
    if (empIdInput) empIdInput.value = empIdFromSession;
    if (empNameInput) empNameInput.value = empNameFromSession;

    // Check attendance status with detailed logging
    const currentDate = getCurrentDate();
    console.log("🔍 Checking attendance status for modal...");
    const attendanceStatus = await checkAttendanceStatus(empIdFromSession, currentDate);

    // Update radio states based on attendance status
    updateRadioStates(attendanceStatus);

    // Store attendance ID if exists
    if (attendanceStatus && attendanceStatus.record_id) {
        currentAttendanceId = attendanceStatus.record_id;
        console.log("💾 Stored attendance ID:", currentAttendanceId);
    }

    // Start modal clock
    updateModalClock();
    if (modalClockInterval) {
        clearInterval(modalClockInterval);
    }
    modalClockInterval = setInterval(updateModalClock, 100);
}


function disableAllPunchOptions() {
    const radioIn = document.getElementById('radioIn');
    const radioOut = document.getElementById('radioOut');

    if (radioIn) {
        radioIn.disabled = true;
        radioIn.checked = false;
    }
    if (radioOut) {
        radioOut.disabled = true;
        radioOut.checked = false;
    }

    alert("✅ Attendance already completed for today.");
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

        // Clear completion message
        const completionMsg = modal.querySelector('.attendance-complete-message');
        if (completionMsg) {
            completionMsg.remove();
        }

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
// Enhanced form submission with better validation
async function handleAttendanceSubmission(e) {
    e.preventDefault();
    console.log("🚀 Starting attendance submission...");

    const selectedAction = document.querySelector('input[name="action"]:checked');
    if (!selectedAction) {
        alert('Your Log IN/OUT is done Today!!');
        return;
    }

    const type = selectedAction.value;
    console.log("📝 Selected action:", type);

    // Get employee data
    const empId = empIdInput ? empIdInput.value : sessionStorage.getItem("employeeId");
    const empName = empNameInput ? empNameInput.value : sessionStorage.getItem("employeeName");
    
    console.log("👤 Employee data:", { empId, empName });

    if (!empId) {
        alert('Employee ID is missing. Please log in again.');
        return;
    }

    // Get current date in the format your system expects
    const currentDate = getCurrentDate();
    console.log("📅 Current date:", currentDate);

    // Check current attendance status with detailed logging
    console.log("🔍 Checking current attendance status...");
    const latestData = await checkAttendanceStatus(empId, currentDate);

    if (latestData) {
        console.log("📊 Current attendance status:", {
            login_time: latestData.login_time,
            logout_time: latestData.logout_time,
            punched_in: latestData.punched_in,
            punched_out: latestData.punched_out,
            attendance_complete: latestData.attendance_complete
        });

        // Strict validation based on current status
        if (type === 'in') {
            if (latestData.login_time || latestData.punched_in) {
                console.log("❌ Blocking punch in - already punched in");
                alert('❌ You are already punched in today. Please punch out first.');
                return;
            }
        } else if (type === 'out') {
            if (!latestData.login_time && !latestData.punched_in) {
                console.log("❌ Blocking punch out - not punched in yet");
                alert('❌ You haven\'t punched in yet today. Please punch in first.');
                return;
            }
            if (latestData.logout_time || latestData.punched_out) {
                console.log("❌ Blocking punch out - already punched out");
                alert('❌ You have already punched out today. Attendance is complete.');
                return;
            }
        }
    } else {
        console.log("ℹ️ No existing attendance data found");
        if (type === 'out') {
            alert('❌ No punch-in record found for today. Please punch in first.');
            return;
        }
    }

    console.log("✅ Validation passed, proceeding with submission...");

    // Get form data
    const date = attendanceDateInput ? attendanceDateInput.value : currentDate;
    const time = attendanceTimeInput ? attendanceTimeInput.value : getServerNow().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    console.log("📋 Form data:", { empId, empName, date, time, type });

    const endpoint = 'https://www.fist-o.com/web_crm/punch.php';
    const bodyData = new URLSearchParams({
        employee_id: empId,
        employee_name: empName,
        date: date,
        [type === 'in' ? 'log_in_time' : 'log_out_time']: time
    });

    console.log("📤 Sending to:", endpoint);
    console.log("📤 Body data:", bodyData.toString());

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: bodyData.toString()
        });

        const text = await response.text();
        console.log('📥 Raw response:', text);
        
        const data = JSON.parse(text);
        console.log('📥 Parsed response:', data);

        if (data.status === 'success') {
            console.log(`✅ Punch ${type} successful!`);
            alert(`✅ ${data.message || `Punch ${type.toUpperCase()} successful!`}`);

            // Update local state
            if (type === 'in') {
                isLoggedIn = true;
                if (loginTimeInput) loginTimeInput.value = time;
            } else if (type === 'out') {
                isLoggedIn = false;
            }

            // Update UI
            updateRadioStates();
            updateStatus();
            
            // Add activity if function exists
            if (typeof addActivity === 'function') {
                addActivity(type);
            }
            
            // Close modal
            hideModal();
        } else {
            console.log('❌ Server returned error:', data.message);
            alert('❌ ' + (data.message || 'Unknown error occurred'));
        }
    } catch (error) {
        console.error(`❌ Network/Parse error during Punch ${type.toUpperCase()}:`, error);
        alert(`❌ Failed to punch ${type}. Please check your connection and try again.`);
    }
}

// fetch("https://www.fist-o.com/web_crm/timedisplay.php")
//     .then(res => res.json())
//     .then(data => {
//         console.log("Server Time:", data.time);
//     });


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
    // Start attendance clock
    updateAttendanceTime();
    setInterval(updateAttendanceTime, 1000);
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