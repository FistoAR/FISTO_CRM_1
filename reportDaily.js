// Reports and daily functions
// reportsDaily.js

// Initialize reports and daily management when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date for date inputs
    const today = new Date().toISOString().split('T')[0];
    const reportDateInput = document.getElementById('reportDate');
    const permissionDateInput = document.getElementById('permissionDate');
    
    if (reportDateInput) reportDateInput.value = today;
    if (permissionDateInput) permissionDateInput.value = today;
});

// Filter reports by date
function filterByDate() {
    const inputDate = document.getElementById("reportDate").value;
    const table = document.getElementById("reportsTable");
    
    if (!table) {
        console.warn("Reports table not found");
        return;
    }
    
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        let dateCell = rows[i].getElementsByTagName("td")[2]; // Date is 3rd column
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

// Daily report form submission handler
function handleDailyReportSubmit(event) {
    event.preventDefault();
    
    const reportDate = document.getElementById('reportDate');
    const projectName = document.getElementById('projectName');
    const taskDescription = document.getElementById('taskDescription');
    const timeSpent = document.getElementById('timeSpent');
    const status = document.getElementById('status');
    const comments = document.getElementById('comments');
    
    // Validate required fields
    if (!reportDate?.value || !projectName?.value || !taskDescription?.value || !timeSpent?.value || !status?.value) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const reportData = {
        date: reportDate.value,
        project: projectName.value,
        task: taskDescription.value,
        timeSpent: timeSpent.value,
        status: status.value,
        comments: comments?.value || '',
        submittedBy: currentUser.name || 'Current User',
        submittedAt: new Date().toISOString()
    };
    
    console.log('Daily report submitted:', reportData);
    
    showNotification('Daily report submitted successfully!', 'success');
    
    // Reset form but keep today's date
    event.target.reset();
    if (reportDate) reportDate.value = new Date().toISOString().split('T')[0];
}

// Task status update handler
function updateTaskStatus(taskId, newStatus) {
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    
    // Find the task element and update its status badge
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        const statusBadge = taskElement.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = `status-badge status-${newStatus.toLowerCase()}`;
            statusBadge.textContent = newStatus;
        }
    }
    
    showNotification(`Task status updated to ${newStatus}`, 'success');
}

// Project progress calculation
function calculateProjectProgress(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

// Generate reports summary
function generateReportsSummary() {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = getWeekDates();
    const thisMonth = getMonthDates();
    
    const summary = {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        total: 0
    };
    
    // This would typically fetch from a database
    // For now, using mock data
    summary.today = Math.floor(Math.random() * 5) + 1;
    summary.thisWeek = Math.floor(Math.random() * 15) + 5;
    summary.thisMonth = Math.floor(Math.random() * 50) + 20;
    summary.total = Math.floor(Math.random() * 200) + 100;
    
    updateReportsSummaryDisplay(summary);
    
    return summary;
}

// Update reports summary display
function updateReportsSummaryDisplay(summary) {
    const todayElement = document.getElementById('reportsToday');
    const weekElement = document.getElementById('reportsThisWeek');
    const monthElement = document.getElementById('reportsThisMonth');
    const totalElement = document.getElementById('reportsTotal');
    
    if (todayElement) todayElement.textContent = summary.today;
    if (weekElement) weekElement.textContent = summary.thisWeek;
    if (monthElement) monthElement.textContent = summary.thisMonth;
    if (totalElement) totalElement.textContent = summary.total;
}

// Get week date range
function getWeekDates() {
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
    };
}

// Get month date range
function getMonthDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
    };
}

// Export reports functionality
function exportReports(format = 'csv') {
    const reports = gatherReportsData();
    
    switch(format.toLowerCase()) {
        case 'csv':
            exportToCSV(reports);
            break;
        case 'excel':
            exportToExcel(reports);
            break;
        case 'pdf':
            exportToPDF(reports);
            break;
        default:
            showNotification('Unsupported export format', 'error');
    }
}

// Export to CSV
function exportToCSV(data) {
    const headers = ['Date', 'Employee', 'Project', 'Task', 'Time Spent', 'Status'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.date,
            `"${row.employee}"`,
            `"${row.project}"`,
            `"${row.task}"`,
            `"${row.timeSpent}"`,
            row.status
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'reports.csv', 'text/csv');
}

// Export to Excel (simplified CSV format)
function exportToExcel(data) {
    exportToCSV(data); // For simplicity, using CSV format
    showNotification('Excel export completed!', 'success');
}

// Export to PDF (mock function)
function exportToPDF(data) {
    showNotification('PDF export functionality coming soon!', 'info');
}

// Download file helper
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showNotification(`${fileName} downloaded successfully!`, 'success');
}

// Team performance metrics
function calculateTeamMetrics() {
    const metrics = {
        totalTasks: 45,
        completedTasks: 32,
        inProgressTasks: 8,
        pendingTasks: 5,
        averageCompletionTime: '2.5 days',
        productivityScore: 85
    };
    
    updateTeamMetricsDisplay(metrics);
    return metrics;
}

// Update team metrics display
function updateTeamMetricsDisplay(metrics) {
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');
    const inProgressTasksElement = document.getElementById('inProgressTasks');
    const pendingTasksElement = document.getElementById('pendingTasks');
    const productivityElement = document.getElementById('productivityScore');
    
    if (totalTasksElement) totalTasksElement.textContent = metrics.totalTasks;
    if (completedTasksElement) completedTasksElement.textContent = metrics.completedTasks;
    if (inProgressTasksElement) inProgressTasksElement.textContent = metrics.inProgressTasks;
    if (pendingTasksElement) pendingTasksElement.textContent = metrics.pendingTasks;
    if (productivityElement) productivityElement.textContent = `${metrics.productivityScore}%`;
}

// Time tracking functionality
function startTimeTracking(taskId) {
    const startTime = new Date().toISOString();
    sessionStorage.setItem(`task_${taskId}_start`, startTime);
    
    updateTimeTrackingUI(taskId, 'started');
    showNotification('Time tracking started', 'success');
}

function stopTimeTracking(taskId) {
    const startTime = sessionStorage.getItem(`task_${taskId}_start`);
    if (!startTime) {
        showNotification('No active time tracking found for this task', 'error');
        return;
    }
    
    const endTime = new Date();
    const start = new Date(startTime);
    const duration = Math.round((endTime - start) / 1000 / 60); // minutes
    
    sessionStorage.removeItem(`task_${taskId}_start`);
    sessionStorage.setItem(`task_${taskId}_duration`, duration);
    
    updateTimeTrackingUI(taskId, 'stopped', duration);
    showNotification(`Time tracking stopped. Duration: ${duration} minutes`, 'success');
}

function updateTimeTrackingUI(taskId, status, duration = null) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskElement) return;
    
    const timeButton = taskElement.querySelector('.time-track-btn');
    const durationDisplay = taskElement.querySelector('.duration-display');
    
    if (status === 'started') {
        if (timeButton) {
            timeButton.textContent = 'Stop';
            timeButton.classList.add('tracking');
        }
    } else if (status === 'stopped') {
        if (timeButton) {
            timeButton.textContent = 'Start';
            timeButton.classList.remove('tracking');
        }
        if (durationDisplay && duration) {
            durationDisplay.textContent = `${duration}m`;
        }
    }
}

// Report analytics
function generateAnalytics() {
    const analytics = {
        dailyProductivity: calculateDailyProductivity(),
        weeklyTrends: calculateWeeklyTrends(),
        topPerformers: getTopPerformers(),
        projectHealth: assessProjectHealth()
    };
    
    displayAnalytics(analytics);
    return analytics;
}

function calculateDailyProductivity() {
    // Mock calculation - would use real data in production
    return Math.floor(Math.random() * 100) + 1;
}

function calculateWeeklyTrends() {
    // Mock data - would calculate from real metrics
    return [65, 72, 68, 85, 91, 88, 76];
}

function getTopPerformers() {
    return [
        { name: 'Alice Johnson', score: 95 },
        { name: 'Bob Smith', score: 92 },
        { name: 'Carol Davis', score: 89 }
    ];
}

function assessProjectHealth() {
    return {
        onTrack: 8,
        atRisk: 2,
        delayed: 1
    };
}

function displayAnalytics(analytics) {
    const productivityElement = document.getElementById('dailyProductivity');
    const trendsElement = document.getElementById('weeklyTrends');
    const performersElement = document.getElementById('topPerformers');
    
    if (productivityElement) {
        productivityElement.textContent = `${analytics.dailyProductivity}%`;
    }
    
    if (performersElement) {
        performersElement.innerHTML = analytics.topPerformers.map(performer => 
            `<div class="performer-item">${performer.name} - ${performer.score}%</div>`
        ).join('');
    }
}

// Notification and reminder system
function scheduleReportReminder() {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(17, 0, 0, 0); // 5 PM reminder
    
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
        showReportReminder();
        // Schedule next day's reminder
        scheduleReportReminder();
    }, timeUntilReminder);
}

function showReportReminder() {
    if (Notification.permission === 'granted') {
        new Notification('Daily Report Reminder', {
            body: 'Don\'t forget to submit your daily report!',
            icon: '/favicon.ico'
        });
    } else {
        showNotification('Reminder: Please submit your daily report!', 'info');
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('Notifications enabled!', 'success');
                scheduleReportReminder();
            }
        });
    }
}

// Initialize reports functionality
function initializeReportsModule() {
    console.log('Initializing reports module...');
    
    // Generate initial summaries
    generateReportsSummary();
    calculateTeamMetrics();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Set up form handlers
    const dailyReportForm = document.getElementById('dailyReportForm');
    if (dailyReportForm) {
        dailyReportForm.addEventListener('submit', handleDailyReportSubmit);
    }
    
    // Add export button handlers
    const exportButtons = document.querySelectorAll('.export-btn');
    exportButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const format = e.target.dataset.format || 'csv';
            exportReports(format);
        });
    });
    
    console.log('Reports module initialized');
}

// Auto-save draft functionality
function autoSaveDraft() {
    const formData = {
        reportDate: document.getElementById('reportDate')?.value,
        projectName: document.getElementById('projectName')?.value,
        taskDescription: document.getElementById('taskDescription')?.value,
        timeSpent: document.getElementById('timeSpent')?.value,
        status: document.getElementById('status')?.value,
        comments: document.getElementById('comments')?.value
    };
    
    // Only save if there's actual content
    const hasContent = Object.values(formData).some(value => value && value.trim());
    if (hasContent) {
        sessionStorage.setItem('dailyReportDraft', JSON.stringify(formData));
    }
}

// Load saved draft
function loadSavedDraft() {
    const savedDraft = sessionStorage.getItem('dailyReportDraft');
    if (!savedDraft) return;
    
    try {
        const formData = JSON.parse(savedDraft);
        
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element && formData[key]) {
                element.value = formData[key];
            }
        });
        
        showNotification('Draft loaded', 'info');
    } catch (error) {
        console.error('Error loading draft:', error);
    }
}

// Clear saved draft
function clearSavedDraft() {
    sessionStorage.removeItem('dailyReportDraft');
}

// Auto-save every 30 seconds
setInterval(autoSaveDraft, 30000);

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved draft
    setTimeout(loadSavedDraft, 500);
    
    // Initialize reports module
    initializeReportsModule();
});


// Make functions globally available
window.filterByDate = filterByDate;
window.handleDailyReportSubmit = handleDailyReportSubmit;
window.updateTaskStatus = updateTaskStatus;
window.calculateProjectProgress = calculateProjectProgress;
window.generateReportsSummary = generateReportsSummary;
window.exportReports = exportReports;
window.calculateTeamMetrics = calculateTeamMetrics;
window.startTimeTracking = startTimeTracking;
window.stopTimeTracking = stopTimeTracking;
window.generateAnalytics = generateAnalytics;
window.scheduleReportReminder = scheduleReportReminder;
window.requestNotificationPermission = requestNotificationPermission;
window.initializeReportsModule = initializeReportsModule;
window.autoSaveDraft = autoSaveDraft;
window.loadSavedDraft = loadSavedDraft;
window.clearSavedDraft = clearSavedDraft;