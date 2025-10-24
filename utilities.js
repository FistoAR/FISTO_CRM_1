// Utility functions and helpers
// utilities.js

// ---------------------- IST TIME UTILITY ----------------------

/**
 * Returns a Date object adjusted to IST (UTC+5:30),
 * regardless of system time zone.
 */
function getISTDate() {
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(utcMs + IST_OFFSET);
}

/**
 * Returns an IST-formatted string like: "Friday, Sep 13, 2025, 14:42:10"
 */
function getFormattedISTDate() {
    const istDate = getISTDate();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
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
(function() {
    // Private variables - won't conflict with other scripts
    let serverTimeOffset = 0;
    let clockInitialized = false;

    /**
     * Fetch server time ONCE and calculate offset
     */
     async function initializeServerTime() {
        try {
            const response = await fetch("https://www.fist-o.com/web_crm/timedisplay.php");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("✅ Server response:", data);
            
            // Use timestamp for accurate time
            const serverTime = new Date(data.timestamp * 1000);
            const localTime = new Date();
            
            serverTimeOffset = serverTime.getTime() - localTime.getTime();
            clockInitialized = true;
            
            console.log("✅ Server time synchronized");
            
        } catch (error) {
            console.error("❌ Failed to sync server time:", error);
            
            // Fallback: Calculate IST offset
            const now = new Date();
            const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
            const IST_OFFSET = 5.5 * 60 * 60 * 1000;
            serverTimeOffset = utcMs + IST_OFFSET - now.getTime();
            clockInitialized = true;
            
            console.warn("⚠️ Using fallback IST calculation");
        }
    }

//     function displayTime() {
//     if (!isInitialized) return;
    
//     const elapsed = Date.now() - syncTime;
//     const now = new Date(serverDateTime.getTime() + elapsed);
    
//     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
//     const dayName = days[now.getDay()];
//     const dayNum = now.getDate();
//     const monthName = months[now.getMonth()];
//     const yearNum = now.getFullYear();
    
//     // ✅ Convert to 12-hour format
//     let hr = now.getHours();
//     const ampm = hr >= 12 ? 'PM' : 'AM';
//     hr = hr % 12;
//     hr = hr ? hr : 12; // Convert 0 to 12 for midnight
//     const hrFormatted = String(hr).padStart(2, '0');
    
//     const min = String(now.getMinutes()).padStart(2, '0');
//     const sec = String(now.getSeconds()).padStart(2, '0');
    
//     // ✅ Format: "Friday 24 Oct, 2025, 03:28:15 PM"
//     const display = `${dayName} ${dayNum} ${monthName}, ${yearNum}, ${hrFormatted}:${min}:${sec} ${ampm}`;
    
//     // Update dashboard
//     const dashElement = document.getElementById('dateTimeDisplay');
//     if (dashElement) dashElement.textContent = display;
    
//     // Update modal
//     const modalElement = document.getElementById('modalClock');
//     if (modalElement) modalElement.textContent = display;
// }


    /**
     * Update time display (runs locally without server calls)
     */
    function updateDateTime() {
    if (!clockInitialized) return;
    
    // Calculate current IST time using the pre-calculated offset
    const currentTime = new Date(new Date().getTime() + serverTimeOffset);
    
    // Format the time for DASHBOARD (with full date)
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };
    
    const formattedTime = currentTime.toLocaleString('en-IN', options);
    
    // ✅ ONLY update dashboard time display
    const dateTimeElement = document.getElementById('dateTimeDisplay');
    if (dateTimeElement) {
        dateTimeElement.textContent = formattedTime;
    }
    
    // ❌ REMOVE THIS - Let attendanceManagement.js handle modal clock
    // const modalTimeElement = document.getElementById('modalClock');
    // if (modalTimeElement) {
    //     modalTimeElement.textContent = formattedTime;
    // }
}


    // Initialize on page load
    document.addEventListener("DOMContentLoaded", async () => {
        console.log("🚀 Initializing time display...");
        
        // Fetch server time ONCE on page load
        await initializeServerTime();
        
        // Update display immediately
        updateDateTime();
        
        // Update display every second (locally, NO server calls)
        setInterval(updateDateTime, 1);
        
        // Re-sync with server every 10 minutes
        setInterval(initializeServerTime, 600000);
    });
})(); // ✅ CLOSE IIFE HERE - AFTER ALL FUNCTIONS

// ---------------------- ANIMATION ----------------------

function initializeCardAnimations() {
    const cards = document.querySelectorAll('.dashboard-card');

    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('slide-up');

        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ---------------------- CHART ----------------------

function createPieChart(ctx, labels, data, colors) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 2000,
                easing: 'easeInBounce'
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// ---------------------- PASSWORD TOGGLE ----------------------

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const icon = input.nextElementSibling?.querySelector('i');
    if (!icon) return;

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

// ---------------------- FILE UPLOAD HANDLING ----------------------

function handleFileChange(event, index) {
    const file = event.target.files[0];
    const card = event.target.closest('.upload-card');
    const preview = document.getElementById(`preview${index}`);
    const filename = document.getElementById(`filename${index}`);

    if (file) {
        filename.textContent = file.name;
        card.classList.add('has-file');

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
            const uploadIcon = card.querySelector('.upload-icon');
            if (file.type.includes('pdf')) {
                uploadIcon.className = 'fas fa-file-pdf upload-icon';
            } else if (file.type.includes('word')) {
                uploadIcon.className = 'fas fa-file-word upload-icon';
            } else {
                uploadIcon.className = 'fas fa-file upload-icon';
            }
        }
    }
}

function removeFile(index) {
    const fileInput = document.getElementById(`file${index}`);
    const preview = document.getElementById(`preview${index}`);
    const filename = document.getElementById(`filename${index}`);
    const card = fileInput.closest('.upload-card');
    const uploadIcon = card.querySelector('.upload-icon');

    fileInput.value = '';
    preview.src = '';
    preview.style.display = 'none';
    card.classList.remove('has-file');

    const cardType = card.dataset.type;
    const defaultNames = {
        'photo': 'Employee Photo',
        'resume': 'Resume/CV',
        'id': 'ID Proof',
        'certificate': 'Certificates',
        'other': 'Other Documents'
    };
    filename.textContent = defaultNames[cardType];

    const defaultIcons = {
        'photo': 'fas fa-camera upload-icon',
        'resume': 'fas fa-file-alt upload-icon',
        'id': 'fas fa-id-card upload-icon',
        'certificate': 'fas fa-certificate upload-icon',
        'other': 'fas fa-file upload-icon'
    };
    uploadIcon.className = defaultIcons[cardType];
}

// ---------------------- DEVICE DETECTION ----------------------

function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
        return 'Mobile';
    } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
}

function getDeviceIcon(device) {
    switch (device) {
        case 'Mobile': return '📱';
        case 'Tablet': return '📱';
        case 'Desktop': return '💻';
        default: return '💻';
    }
}

// ---------------------- REPORT FILTERING ----------------------

function filterByDate() {
    const inputDate = document.getElementById("reportDate").value;
    const table = document.getElementById("reportsTable");
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        let dateCell = rows[i].getElementsByTagName("td")[2];
        if (dateCell) {
            let rowDate = dateCell.textContent.trim();
            if (inputDate === "" || rowDate === inputDate) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

// ---------------------- MESSAGE DISPLAY ----------------------

function showMessage(message, type = 'success') {
    const messageArea = document.getElementById('messageArea');
    if (messageArea) {
        messageArea.innerHTML = `<div class="alert ${type === 'error' ? 'error' : ''}">${message}</div>`;
        setTimeout(() => {
            messageArea.innerHTML = '';
        }, 5000);
    }
}

// ---------------------- EXPORTS ----------------------

// Export for CommonJS modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        showNotification,
        initializeCardAnimations,
        createPieChart,
        togglePassword,
        handleFileChange,
        removeFile,
        detectDevice,
        getDeviceIcon,
        filterByDate,
        showMessage,
        getISTDate,
        getFormattedISTDate
    };
}

// Make functions globally accessible in browser
window.formatDate = formatDate;
window.showNotification = showNotification;
window.initializeCardAnimations = initializeCardAnimations;
window.createPieChart = createPieChart;
window.togglePassword = togglePassword;
window.handleFileChange = handleFileChange;
window.removeFile = removeFile;
window.detectDevice = detectDevice;
window.getDeviceIcon = getDeviceIcon;
window.filterByDate = filterByDate;
window.showMessage = showMessage;
window.getISTDate = getISTDate;
window.getFormattedISTDate = getFormattedISTDate;
