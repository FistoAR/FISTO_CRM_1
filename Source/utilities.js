// Animation
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

// Chart
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

// Password Toggle
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

// File Upload Handling
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

// Device detection
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

// Report Filtering
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

// Message display
function showMessage(message, type = 'success') {
    const messageArea = document.getElementById('messageArea');
    if (messageArea) {
        messageArea.innerHTML = `<div class="alert ${type === 'error' ? 'error' : ''}">${message}</div>`;
        setTimeout(() => {
            messageArea.innerHTML = '';
        }, 5000);
    }
}

// Export for CommonJS modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        showNotification,
        updateDateTime,
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
window.updateDateTime = updateDateTime;
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
