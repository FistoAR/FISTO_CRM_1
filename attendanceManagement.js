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

    const timeString = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata', // Keep this to show IST time
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    currentTimeElement.textContent = timeString;
}



function updateModalClock() {
    const now = getServerNow();
    if (!modalClock) return;
    
    // Only show time, no date
    const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    modalClock.textContent = timeStr; // Will show: "04:44:08 PM"
}



    // Set current date and time in modal

    // ---- Use for modals/forms (NO fetch) ----
   function setCurrentDateTime() {
    const serverNow = getServerNow();
    
    // ✅ CHANGED: Use IST timezone
    if (attendanceDateInput) {
        attendanceDateInput.value = serverNow.toLocaleDateString('en-CA', {
            timeZone: 'Asia/Kolkata'
        });
    }
    
    if (attendanceTimeInput) {
        attendanceTimeInput.value = serverNow.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata', // ✅ ADD THIS
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }
    
    if (loginTime && loginTimeInput) {
        loginTimeInput.value = loginTime;
    } else if (loginTimeInput) {
        const loginTimeStr = serverNow.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata', // ✅ ADD THIS
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
    // async function syncServerTime() {
    //     try {
    //         const res = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
    //         const data = await res.json();
    //         const serverDate = new Date(data.time); // ISO8601 string with timezone will be parsed correctly!
    //         const localDate = new Date();

    //         serverTimeOffset = serverDate.getTime() - localDate.getTime();
    //         console.log("✅ Server time synced:", serverDate, "Offset:", serverTimeOffset);
    //     } catch (err) {
    //         console.error("❌ Failed to sync server time:", err);
    //     }
    // }

    // Locally calculate "server" time using stored offset
function getServerNow() {
    // Check if we have a server offset
    if (serverTimeOffset !== 0) {
        const now = new Date(Date.now() + serverTimeOffset);
        // console.log("⏰ Using offset-based server time:", now.toISOString());
        return now;
    }
    
    // Check localStorage for cached offset
    const serverTimeFetched = Number(localStorage.getItem('serverTimeFetched'));
    const clientTimeFetched = Number(localStorage.getItem('clientTimeFetched'));
    
    if (serverTimeFetched && clientTimeFetched) {
        const offset = serverTimeFetched - clientTimeFetched;
        const now = new Date(Date.now() + offset);
        console.log("⏰ Using cached server time:", now.toISOString());
        return now;
    }
    
    // Fallback to local time (with warning)
    console.warn("⚠️ No server offset available - using local time!");
    return new Date();
}



    // UI clock update (local only; do not fetch!)
    setInterval(() => {
        const now = getServerNow();
        // ...update UI with "now"...
    }, 60000);


async function syncServerTime() {
    try {
        console.log("⏰ Syncing with server time...");
        
        const clientTime = Date.now();
        
        const response = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
        const data = await response.json();
        
        console.log("📥 Server response:", data);
        
        // Parse server time (assumes format: "2025-10-24 18:15:30")
        const serverTimeString = data.time.replace(' ', 'T') + '+05:30';
        const serverTime = new Date(serverTimeString).getTime();
        
        // Calculate offset
        serverTimeOffset = serverTime - clientTime;
        
        // Store in localStorage
        localStorage.setItem('serverTimeOffset', serverTimeOffset);
        localStorage.setItem('serverTimeFetched', serverTime);
        localStorage.setItem('clientTimeFetched', clientTime);
        
        console.log("✅ Server time synced successfully");
        console.log("📊 Server time:", new Date(serverTime).toISOString());
        console.log("📊 Client time:", new Date(clientTime).toISOString());
        console.log("📊 Offset (ms):", serverTimeOffset);
        
        return true;
    } catch (error) {
        console.error("❌ Failed to sync server time:", error);
        
        // Try to use cached offset
        const cachedOffset = localStorage.getItem('serverTimeOffset');
        if (cachedOffset) {
            serverTimeOffset = Number(cachedOffset);
            console.log("📦 Using cached offset:", serverTimeOffset, "ms");
            return true;
        }
        
        return false;
    }
}




    let ticksSinceLastSync = 0;

    function updateAttendanceTime() {
    const now = getServerNow();
    if (!attendanceTimeInput) return;
    const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata', // ✅ ADD THIS LINE
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    attendanceTimeInput.value = timeStr;
}


 document.addEventListener("DOMContentLoaded", async () => {
    // Sync server time ONCE
    await syncServerTime();
    
    // Initialize displays
    updateTime();
    updateModalClock();
    updateAttendanceTime();
    
    // Update every second (NO MORE FETCHING)
    setInterval(() => {
        updateTime();
        updateModalClock();
        updateAttendanceTime();
    }, 1000);
    
    // Initialize attendance management
    if (document.getElementById('punchModal')) {
        initializeAttendanceManagement();
    }
    
    // Dropdown listener
    const attendanceTypeDropdown = document.getElementById('attendanceType') || 
                                   document.querySelector('select[name="attendance_type"]');
    
    if (attendanceTypeDropdown) {
        attendanceTypeDropdown.addEventListener('change', async function() {
            const selectedType = this.value.toLowerCase();
            console.log("📋 Attendance type changed to:", selectedType);
            
            const empId = sessionStorage.getItem("employeeId");
            const currentDate = getCurrentDate();
            
            if (empId && currentDate) {
                const attendanceStatus = await checkAttendanceStatus(empId, currentDate);
                updateRadioStates(attendanceStatus);
            }
        });
    }
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

    const attendanceTypeDropdown = document.getElementById('attendanceType') || 
                                   document.querySelector('select[name="attendance_type"]');
    const attendanceType = attendanceTypeDropdown ? attendanceTypeDropdown.value.toLowerCase() : 'morning';

    console.log("🔘 === RADIO BUTTON UPDATE ===");
    console.log("📋 Attendance Type:", attendanceType);
    console.log("📊 Status:", attendanceStatus);

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

    // ✅ Handle null, undefined, or error status
    if (!attendanceStatus || attendanceStatus.status === 'error' || !attendanceStatus.record_id) {
        console.log("🆕 No record - enable IN only");
        radioIn.disabled = false;
        radioIn.checked = true;
        radioOut.disabled = true;
        isLoggedIn = false;
        updateStatus();
        return;
    }

    // ✅ Use boolean flags from backend
    if (attendanceType === 'morning') {
        // ===== MORNING ATTENDANCE =====
        console.log("☀️ MORNING:", {
            login: attendanceStatus.has_login_morning,
            logout: attendanceStatus.has_logout_morning
        });

        if (attendanceStatus.has_login_morning && !attendanceStatus.has_logout_morning) {
            // Morning IN done, need OUT
            console.log("🟡 Enable OUT (logged in, need logout)");
            radioIn.disabled = true;
            radioOut.disabled = false;
            radioOut.checked = true;
            isLoggedIn = true;
        } else if (attendanceStatus.has_login_morning && attendanceStatus.has_logout_morning) {
            // Both morning punches complete
            console.log("🔴 Both punches complete");
            radioIn.disabled = true;
            radioOut.disabled = true;
            isLoggedIn = false;
            // showCompletionMessage();
        } else {
            // Need morning IN
            console.log("🟢 Enable IN (need login)");
            radioIn.disabled = false;
            radioIn.checked = true;
            radioOut.disabled = true;
            isLoggedIn = false;
        }
    } else {
        // ===== AFTERNOON ATTENDANCE =====
        console.log("🌙 AFTERNOON:", {
            login: attendanceStatus.has_login_afternoon,
            logout: attendanceStatus.has_logout_afternoon
        });

        if (attendanceStatus.has_login_afternoon && !attendanceStatus.has_logout_afternoon) {
            // Afternoon IN done, need OUT
            console.log("🟡 Enable OUT (logged in, need logout)");
            radioIn.disabled = true;
            radioOut.disabled = false;
            radioOut.checked = true;
            isLoggedIn = true;
        } else if (attendanceStatus.has_login_afternoon && attendanceStatus.has_logout_afternoon) {
            // Both afternoon punches complete
            console.log("🔴 Both punches complete");
            radioIn.disabled = true;
            radioOut.disabled = true;
            isLoggedIn = false;
            // showCompletionMessage();
        } else {
            // Need afternoon IN
            console.log("🟢 Enable IN (need login)");
            radioIn.disabled = false;
            radioIn.checked = true;
            radioOut.disabled = true;
            isLoggedIn = false;
        }
    }

    updateStatus();
    console.log("✅ Radio state updated. isLoggedIn:", isLoggedIn);
    console.log("============================");
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




    // function showCompletionMessage() {
    //     const messageDiv = document.createElement('div');
    //     messageDiv.className = 'attendance-complete-message';
    //     messageDiv.style.cssText = `
    //         background: #d4edda;
    //         color: #155724;
    //         padding: 10px;
    //         margin: 10px 0;
    //         border: 1px solid #c3e6cb;
    //         border-radius: 4px;
    //         text-align: center;
    //         font-size: 14px;
    //     `;
    //     messageDiv.textContent = '✅ Attendance already completed for today.';
        
    //     // Insert after radio buttons
    //     const radioContainer = document.querySelector('.attendance-radio-group') || radioOut.parentNode;
    //     if (radioContainer && !radioContainer.querySelector('.attendance-complete-message')) {
    //         radioContainer.appendChild(messageDiv);
    //     }
    // }
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
    const today = getServerNow();
    
    const parts = today.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kolkata', // ✅ ADD THIS
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).split('/');
    
    const formattedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
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

    await setCurrentDateTime();

    const empIdFromSession = sessionStorage.getItem("employeeId");
    const empNameFromSession = sessionStorage.getItem("employeeName");

    if (!empIdFromSession || !empNameFromSession) {
        alert("Session expired or not logged in. Please log in again.");
        hideModal();
        return;
    }

    if (empIdInput) empIdInput.value = empIdFromSession;
    if (empNameInput) empNameInput.value = empNameFromSession;

    const currentDate = getCurrentDate();
    const attendanceStatus = await checkAttendanceStatus(empIdFromSession, currentDate);

        // ✅ DEBUG: Log the response
    console.log("=== API RESPONSE DEBUG ===");
    console.log("Full response:", JSON.stringify(attendanceStatus, null, 2));
    console.log("has_login_morning:", attendanceStatus?.has_login_morning);
    console.log("has_logout_morning:", attendanceStatus?.has_logout_morning);
    console.log("has_login_afternoon:", attendanceStatus?.has_login_afternoon);
    console.log("has_logout_afternoon:", attendanceStatus?.has_logout_afternoon);
    console.log("=========================");

    // ✅ Set login time with 12-hour format
    if (loginTimeInput && attendanceStatus) {
        if (attendanceStatus.login_time_display) {
            // Backend already returns 12-hour format
            loginTimeInput.value = attendanceStatus.login_time_display;
        } else {
            // Current time in 12-hour format
            const serverNow = getServerNow();
            const currentLoginTime = serverNow.toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true // ✅ 12-hour format
            });
            loginTimeInput.value = currentLoginTime;
        }
    }

    updateRadioStates(attendanceStatus);

    if (attendanceStatus && attendanceStatus.record_id) {
        currentAttendanceId = attendanceStatus.record_id;
    }

    updateModalClock();
    if (modalClockInterval) {
        clearInterval(modalClockInterval);
    }
    modalClockInterval = setInterval(updateModalClock, 1000);
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
        modal.classList.remove('show');
        body.classList.remove('modal-open');

        const completionMsg = modal.querySelector('.attendance-complete-message');
        if (completionMsg) {
            completionMsg.remove();
        }

        // ✅ This is correct - stops the modal clock
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
    const now = getServerNow(); // ✅ CHANGE from new Date()
    const timeString = now.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata', // ✅ ADD THIS
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

    function attendanceupdateDateTime() {
        const dateTimeElement = document.getElementById('dateTimeDisplay');
        if (!dateTimeElement) return;
        dateTimeElement.textContent = getFormattedISTDate();
    }


    // Handle form submission
    // Enhanced form submission with better validation
async function handleAttendanceSubmission(e) {
    e.preventDefault();
    console.log("🚀 Starting attendance submission...");

    const selectedAction = document.querySelector('input[name="action"]:checked');
    if (!selectedAction) {
        alert('✅ Attendance already completed for today.');
        return;
    }

    const type = selectedAction.value;
    const empId = empIdInput ? empIdInput.value : sessionStorage.getItem("employeeId");
    const empName = empNameInput ? empNameInput.value : sessionStorage.getItem("employeeName");

    const attendanceTypeDropdown = document.getElementById('attendanceType') || 
                                   document.querySelector('select[name="attendance_type"]');
    const attendanceType = attendanceTypeDropdown ? attendanceTypeDropdown.value.toLowerCase() : 'morning';

    if (!empId) {
        alert('Employee ID is missing. Please log in again.');
        return;
    }

    // ✅ USE SERVER-SYNCED TIME (NOT LOCAL TIME)
    const now = getServerNow();
    
    // ✅ CRITICAL: Format as IST timestamp
    const punchTimestamp = formatToIST(now);
    const punchDate = punchTimestamp.split(' ')[0];

    console.log("📅 Server-synced time:", now);
    console.log("🕐 IST timestamp for DB:", punchTimestamp);
    console.log("📆 Date:", punchDate);

    const bodyData = new URLSearchParams({
        employee_id: empId,
        employee_name: empName,
        date: punchDate,
        attendance_type: attendanceType,
        [type === 'in' ? 'log_in_time' : 'log_out_time']: punchTimestamp
    });

    const endpoint = 'https://www.fist-o.com/web_crm/punch.php';

    console.log("📤 Sending timestamp:", punchTimestamp);

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
                
                if (loginTimeInput) {
                    const time12Hour = now.toLocaleTimeString('en-US', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    loginTimeInput.value = time12Hour;
                }
            } else {
                isLoggedIn = false;
            }

            const currentDate = getCurrentDate();
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

// ✅ NEW: Helper function to format Date object as IST timestamp
function formatToIST(date) {
    // Ensure the date is in IST
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}





    // fetch("https://www.fist-o.com/web_crm/timedisplay.php")
    //     .then(res => res.json())
    //     .then(data => {
    //         console.log("Server Time:", data.time);
    //     });


    // Initialize attendance management
    function initializeAttendanceManagement() {
    console.log("🔧 Initializing attendance management...");
    
    if (attendanceBtn) {
        attendanceBtn.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("🖱️ Attendance button clicked!");
            showModal();
        });
        console.log("✅ Attendance button listener attached");
    } else {
        console.warn("⚠️ Attendance button not found!");
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            hideModal();
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', handleAttendanceSubmission);
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            hideModal();
        }
    });

    if (currentTimeElement) {
        updateTime();
        setInterval(updateTime, 1000);
    }

    updateStatus();
    updateActivityList();
    
    console.log("✅ Attendance management initialized");
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
    window.updateModalClock = updateModalClock;
    window.syncServerTime = syncServerTime;
    window.getServerNow = getServerNow;
    window.setCurrentDateTime = setCurrentDateTime;