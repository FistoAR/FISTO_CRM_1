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


    // ---- UI clock functions ----

    function updateTime() {
        const now = getServerNow();
        if (!currentTimeElement) return;
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
        const now = getServerNow();
        if (!modalClock) return;
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        modalClock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }


    // Set current date and time in modal

    // ---- Use for modals/forms (NO fetch) ----
    function setCurrentDateTime() {
        const serverNow = getServerNow();
        if (attendanceDateInput) attendanceDateInput.value = serverNow.toISOString().split('T')[0];
        if (attendanceTimeInput) attendanceTimeInput.value = serverNow.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        if (loginTime && loginTimeInput) {
            loginTimeInput.value = loginTime;
        } else if (loginTimeInput) {
            const loginTimeStr = serverNow.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            loginTimeInput.value = loginTimeStr;
        }
    }

    // Keep server time offset in ms
    let serverTimeOffset = 0;

    // Sync local clock with server clock
    async function syncServerTime() {
        try {
            const res = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
            const data = await res.json();
            const serverDate = new Date(data.time); // ISO8601 string with timezone will be parsed correctly!
            const localDate = new Date();

            serverTimeOffset = serverDate.getTime() - localDate.getTime();
            console.log("✅ Server time synced:", serverDate, "Offset:", serverTimeOffset);
        } catch (err) {
            console.error("❌ Failed to sync server time:", err);
        }
    }

    // Locally calculate "server" time using stored offset
    function getServerNow() {
        const serverTimeFetched = Number(localStorage.getItem('serverTimeFetched'));
        const clientTimeFetched = Number(localStorage.getItem('clientTimeFetched'));
        if (!serverTimeFetched || !clientTimeFetched) return new Date();
        return new Date(Date.now() + (serverTimeFetched - clientTimeFetched));
    }


    // UI clock update (local only; do not fetch!)
    setInterval(() => {
        const now = getServerNow();
        // ...update UI with "now"...
    }, 1000);

    async function syncServerTime() {
        try {
            const res = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
            const data = await res.json();
            const serverDate = new Date(data.time);
            const localDate = new Date();
            serverTimeOffset = serverDate.getTime() - localDate.getTime();
            console.log("✅ Server time synced:", serverDate, "Offset:", serverTimeOffset);

            // Update clocks immediately
            updateTime();
            updateModalClock();

            // Restart the interval for updating the clocks
            if (window.clockInterval) clearInterval(window.clockInterval);
            window.clockInterval = setInterval(() => {
                updateTime();
                updateModalClock();
            }, 1000);
        } catch (err) {
            console.error("❌ Failed to sync server time:", err);
        }
    }



    let ticksSinceLastSync = 0;

    function updateAttendanceTime() {
        const now = getServerNow();
        if (!attendanceTimeInput) return;
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        attendanceTimeInput.value = timeStr;
    }

    document.addEventListener("DOMContentLoaded", async () => {
        // Only FETCH once when there's no saved offset (first login/session)
        if (!localStorage.getItem('serverTimeFetched')) {
            await fetchAndStoreServerTime();
        }
        updateTime();
        updateModalClock();
        updateAttendanceTime();
        setInterval(() => {
            updateTime();
            updateModalClock();
            updateAttendanceTime();
        }, 1000); // the above update functions use getServerNow()
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
   // ✅ UPDATED: Radio buttons now respond to dropdown selection
function updateRadioStates(attendanceStatus = null) {
    const radioIn = document.getElementById('radioIn');
    const radioOut = document.getElementById('radioOut');

    if (!radioIn || !radioOut) {
        console.error("❌ Radio buttons not found!");
        return;
    }

    // ✅ GET ATTENDANCE TYPE FROM DROPDOWN
    const attendanceTypeDropdown = document.getElementById('attendanceType') || document.querySelector('select[name="attendance_type"]');
    const attendanceType = attendanceTypeDropdown ? attendanceTypeDropdown.value.toLowerCase() : 'morning';

    console.log("🔘 Updating radio states with type:", attendanceType, "status:", attendanceStatus);

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

    if (!attendanceStatus) {
        // Default: enable IN only
        radioIn.disabled = false;
        radioIn.checked = true;
        radioOut.disabled = true;
        isLoggedIn = false;
        updateStatus();
        return;
    }

    // ✅ CHECK BASED ON ATTENDANCE TYPE
    if (attendanceType === 'morning') {
        // MORNING LOGIC
        if (attendanceStatus.login_time_morning && !attendanceStatus.logout_time_morning) {
            // Morning IN done, need OUT
            console.log("🟡 Morning: IN done, enable OUT");
            radioIn.disabled = true;
            radioOut.disabled = false;
            radioOut.checked = true;
            isLoggedIn = true;
        } else if (attendanceStatus.login_time_morning && attendanceStatus.logout_time_morning) {
            // Both morning punches done
            console.log("🔴 Morning: Both punches complete");
            radioIn.disabled = true;
            radioOut.disabled = true;
            isLoggedIn = false;
            showCompletionMessage();
        } else {
            // Need morning IN
            console.log("🟢 Morning: Need IN");
            radioIn.disabled = false;
            radioIn.checked = true;
            radioOut.disabled = true;
            isLoggedIn = false;
        }
    } else {
        // AFTERNOON LOGIC
        if (attendanceStatus.login_time_afternoon && !attendanceStatus.logout_time_afternoon) {
            // Afternoon IN done, need OUT
            console.log("🟡 Afternoon: IN done, enable OUT");
            radioIn.disabled = true;
            radioOut.disabled = false;
            radioOut.checked = true;
            isLoggedIn = true;
        } else if (attendanceStatus.login_time_afternoon && attendanceStatus.logout_time_afternoon) {
            // Both afternoon punches done
            console.log("🔴 Afternoon: Both punches complete");
            radioIn.disabled = true;
            radioOut.disabled = true;
            isLoggedIn = false;
            showCompletionMessage();
        } else {
            // Need afternoon IN
            console.log("🟢 Afternoon: Need IN");
            radioIn.disabled = false;
            radioIn.checked = true;
            radioOut.disabled = true;
            isLoggedIn = false;
        }
    }

    updateStatus();
    console.log("🔘 Radio states updated. isLoggedIn:", isLoggedIn);
}

// ✅ ADD THIS: Listen for attendance type dropdown changes
document.addEventListener("DOMContentLoaded", () => {
    // Your existing initialization...
    if (document.getElementById('punchModal')) {
        initializeAttendanceManagement();
    }
    
    // ✅ NEW: Dropdown listener
    const attendanceTypeDropdown = document.getElementById('attendanceType') || document.querySelector('select[name="attendance_type"]');
    
    if (attendanceTypeDropdown) {
        attendanceTypeDropdown.addEventListener('change', async function() {
            const selectedType = this.value.toLowerCase();
            console.log("📋 Attendance type changed to:", selectedType);
            
            // Get current attendance status and update radio buttons
            const empId = sessionStorage.getItem("employeeId");
            const currentDate = getCurrentDate();
            
            if (empId && currentDate) {
                const attendanceStatus = await checkAttendanceStatus(empId, currentDate);
                updateRadioStates(attendanceStatus); // This now checks the dropdown internally
            }
        });
    }
    
    // Start attendance clock
    updateAttendanceTime();
    setInterval(updateAttendanceTime, 1000);
});




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
        // updateModalClock();
        // if (modalClockInterval) {
        //     clearInterval(modalClockInterval);
        // }
        // modalClockInterval = setInterval(updateModalClock, 100);
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

    // Call once (e.g. after login or first load)
    async function fetchAndStoreServerTime() {
        try {
            const response = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
            const data = await response.json();
            localStorage.setItem('serverTimeFetched', new Date(data.time).getTime());
            localStorage.setItem('clientTimeFetched', Date.now());
            console.log("✅ Fetched and stored server time:", data.time);
        } catch (err) {
            console.error("❌ Failed to fetch server time:", err);
        }
    }
    function convertToIsoTimestamp(timeStr, dateStr) {
    // Example: timeStr = "12:00:45 PM", dateStr = "2025-10-22"
    const [time, meridian] = timeStr.split(' '); // ["12:00:45","PM"]
    let [hours, minutes, seconds] = time.split(':');
    hours = parseInt(hours, 10);
    if (meridian.toUpperCase() === "PM" && hours !== 12) {
        hours += 12;
    } else if (meridian.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
    }
    const hoursStr = String(hours).padStart(2, '0');
    return `${dateStr} ${hoursStr}:${minutes}:${seconds}`;
    }


  function getISTDate() {
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; // +5:30 in ms
    return new Date(utcMs + IST_OFFSET);
}

/**
 * Returns an IST-formatted string like: "Friday, Sep 13, 2025, 14:42:10"
 */
function getFormattedISTDate() {
    const istDate = getISTDate();
    const options = {
        timeZone: 'Asia/Kolkata',     // ✅ Force IST display
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    return istDate.toLocaleString('en-IN', options);
}

    // ---------------------- BASIC UTILITIES ----------------------

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function showNotification(message, type = 'success') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ---------------------- DASHBOARD TIME DISPLAY ----------------------

    function updateDateTime() {
        const dateTimeElement = document.getElementById('dateTimeDisplay');
        if (!dateTimeElement) return;
        dateTimeElement.textContent = getFormattedISTDate();
    }


    // Handle form submission
    // Enhanced form submission with better validation
    // Handle form submission
    // Enhanced form submission with better validation and time fix
  async function handleAttendanceSubmission(e) {
    e.preventDefault();
    console.log("🚀 Starting attendance submission...");

    const selectedAction = document.querySelector('input[name="action"]:checked');
    if (!selectedAction) {
        alert('Please select an action (IN or OUT)');
        return;
    }

    const type = selectedAction.value; // 'in' or 'out'
    const empId = empIdInput ? empIdInput.value : sessionStorage.getItem("employeeId");
    const empName = empNameInput ? empNameInput.value : sessionStorage.getItem("employeeName");

    // ✅ GET THE ATTENDANCE TYPE FROM DROPDOWN
    const attendanceTypeDropdown = document.getElementById('attendanceType') || document.querySelector('select[name="attendance_type"]');
    const attendanceType = attendanceTypeDropdown ? attendanceTypeDropdown.value.toLowerCase() : 'morning'; // 'morning' or 'afternoon'

    if (!empId) {
        alert('Employee ID is missing. Please log in again.');
        return;
    }

    const currentDate = getCurrentDate();
    const latestData = await checkAttendanceStatus(empId, currentDate);

    // Validation based on attendance_stage (keep your existing validation)
    if (latestData && latestData.attendance_stage) {
        const stage = latestData.attendance_stage;
        
        if (stage === 'waiting_logout_morning' || stage === 'waiting_logout_afternoon') {
            if (type === 'out') {
                alert('❌ You need to punch IN first.');
                return;
            }
        } else if (stage === 'waiting_login_afternoon') {
            if (type === 'in') {
                alert('❌ You need to punch OUT first.');
                return;
            }
        } else if (stage === 'complete') {
            alert('✅ All attendance punches are complete for today.');
            return;
        }
    }

    // Fetch fresh server time
    const serverTimeResp = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
    const serverTimeData = await serverTimeResp.json();
    const now = new Date(serverTimeData.time);

    const punchTimestamp = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

    const punchDate = punchTimestamp.split(' ')[0];

    // ✅ SEND ATTENDANCE TYPE TO BACKEND
    const bodyData = new URLSearchParams({
        employee_id: empId,
        employee_name: empName,
        date: punchDate,
        attendance_type: attendanceType, // 'morning' or 'afternoon'
        [type === 'in' ? 'log_in_time' : 'log_out_time']: punchTimestamp
    });

    const endpoint = 'https://www.fist-o.com/web_crm/punch.php';

    console.log("📤 Sending to:", endpoint);
    console.log("📤 Attendance Type:", attendanceType);
    console.log("📤 Punch timestamp:", punchTimestamp);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: bodyData.toString()
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.status === 'success') {
            alert(`✅ ${data.message || `Punch ${type.toUpperCase()} successful!`}`);

            if (type === 'in') {
                isLoggedIn = true;
                if (loginTimeInput) loginTimeInput.value = punchTimestamp.split(' ')[1];
            } else {
                isLoggedIn = false;
            }

            const updatedStatus = await checkAttendanceStatus(empId, currentDate);
            updateRadioStates(updatedStatus);
            updateStatus();
            
            if (typeof addActivity === 'function') addActivity(type);
            hideModal();
        } else {
            alert('❌ ' + (data.message || 'Unknown error occurred'));
        }
    } catch (error) {
        console.error(`❌ Error during Punch ${type.toUpperCase()}:`, error);
        alert(`❌ Failed to punch ${type}. Please try again.`);
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
    window.updateModalClock = updateModalClock;
    window.updateTime = updateTime;
    window.setCurrentDateTime = setCurrentDateTime;