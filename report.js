// Report Tab Switching Function
// Enhanced Report Management System with API Integration

// Report Tab Switching Function
function switchReportTab(tabName) {
    console.log('Switching to report tab:', tabName);
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('#report-content .tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('#report-content .tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
        
        // Load data based on selected tab
        switch(tabName) {
            case 'daily-report':
                // Daily reports are static in HTML, no need to load
                break;
            case 'leave-report':
                loadLeaveReports();
                break;
            case 'permission-report':
                loadPermissionReports();
                break;
        }
    }
}

// Daily Report Filter Functions
function filterDailyReportByDate() {
    const filterDate = document.getElementById('dailyReportDate').value;
    const table = document.getElementById('dailyReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    console.log('Filtering daily reports by date:', filterDate);
    
    for (let i = 0; i < rows.length; i++) {
        const dateCell = rows[i].getElementsByTagName('td')[0];
        if (dateCell) {
            const rowDate = dateCell.textContent.trim();
            if (!filterDate || rowDate === filterDate) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function clearDailyReportFilter() {
    document.getElementById('dailyReportDate').value = '';
    const table = document.getElementById('dailyReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
    console.log('Daily report filter cleared');
}

// Helper function to format date from yyyy-mm-dd to dd/mm/yyyy
function formatDate(dateString) {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    return `${day}/${month}/${year}`;
}

// Helper function to get status class
function getStatusClass(status) {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    
    return 'status-pending';
}

// Load Leave Reports from API
async function loadLeaveReports() {
    try {
        console.log('Loading leave reports from API...');
        
        const response = await fetch('https://www.fist-o.com/web_crm/get_leave_report.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Leave reports data received:', result);
        
        const tbody = document.querySelector("#leaveReportsTable tbody");
        tbody.innerHTML = ''; // Clear existing rows
        
        if (result.data && result.data.length > 0) {
            result.data.forEach((row) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.emp_id || ''}</td>
                    <td>${row.emp_name || ''}</td>
                    <td>${row.leave_type || ''}</td>
                    <td>${formatDate(row.from_date)}</td>
                    <td>${formatDate(row.to_date)}</td>
                    <td>${row.number_of_days || ''}</td>
                    <td>${row.session || ''}</td>
                    <td>${row.reason || ''}</td>
                    <td><span class="status-badge ${getStatusClass(row.status)}">${row.status || 'Pending'}</span></td>
                `;
                tbody.appendChild(tr);
            });
            
            console.log(`✅ Successfully loaded ${result.data.length} leave report(s)`);
        } else {
            // Show empty state
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div class="empty-content">
                            <i class="fas fa-calendar-times"></i>
                            <p>No leave reports found</p>
                            <small>Leave requests will appear here once submitted</small>
                        </div>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Error loading leave reports:", error);
        
        const tbody = document.querySelector("#leaveReportsTable tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load leave reports</p>
                        <small>Error: ${error.message}</small>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLeaveReports();
});


// Helper function to format date from yyyy-mm-dd to dd/mm/yyyy
function formatDate(dateString) {
    if (!dateString) return '';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    return `${day}/${month}/${year}`;
}

// Helper function to get status class
function getStatusClass(status) {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    
    return 'status-pending';
}

// Load Permission Reports from API
async function loadPermissionReports() {
    try {
        console.log('Loading permission reports from API...');
        
        const response = await fetch('https://www.fist-o.com/web_crm/get_permission_report.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Permission reports data received:', result);
        
        const tbody = document.querySelector("#permissionReportsTable tbody");
        tbody.innerHTML = ''; // Clear existing rows
        
        // FIX: Check for result.data directly (no result.success in API response)
        if (result.data && result.data.length > 0) {
            result.data.forEach((row) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.emp_id || ''}</td>
                    <td>${row.employeeName || row.emp_name || ''}</td>
                    <td>${formatDate(row.permission_date)}</td>
                    <td>${row.from_time ? row.from_time.substring(0, 5) : ''}</td>
                    <td>${row.to_time ? row.to_time.substring(0, 5) : ''}</td>
                    <td>${row.delay_duration || ''}</td>
                    <td>${row.reason || ''}</td>
                    <td>${row.created_at ? formatDate(row.created_at.split(' ')[0]) : ''}</td>
                    <td><span class="status-badge ${getStatusClass(row.status)}">${row.status || 'Pending'}</span></td>
                `;
                tbody.appendChild(tr);
            });
            
            console.log(`✅ Successfully loaded ${result.data.length} permission report(s)`);
        } else {
            // Show empty state
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div class="empty-content">
                            <i class="fas fa-user-clock"></i>
                            <p>No permission reports found</p>
                            <small>Permission requests will appear here once submitted</small>
                        </div>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Error loading permission reports:", error);
        
        const tbody = document.querySelector("#permissionReportsTable tbody");
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load permission reports</p>
                        <small>Error: ${error.message}</small>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Make sure to call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLeaveReports();
    loadPermissionReports();
});


// Helper function to get status CSS class
function getStatusClass(status) {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    switch(statusLower) {
        case 'approved':
            return 'status-progress';
        case 'rejected':
            return 'status-completed';
        case 'pending':
        default:
            return 'status-pending';
    }
}

// Leave Report Filter Functions
function filterLeaveReportByMonth() {
    const filterMonth = document.getElementById('leaveReportDate').value;
    const table = document.getElementById('leaveReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    console.log('Filtering leave reports by month:', filterMonth);
    
    for (let i = 0; i < rows.length; i++) {
        // Skip empty state rows
        if (rows[i].querySelector('.empty-state')) continue;
        
        const fromDateCell = rows[i].getElementsByTagName('td')[3];
        if (fromDateCell) {
            const fromDate = fromDateCell.textContent.trim();
            const monthYear = fromDate.substring(0, 7); // Get YYYY-MM format
            if (!filterMonth || monthYear === filterMonth) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function filterLeaveReportByStatus() {
    const filterStatus = document.getElementById('leaveReportStatus').value.toLowerCase();
    const table = document.getElementById('leaveReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    console.log('Filtering leave reports by status:', filterStatus);
    
    for (let i = 0; i < rows.length; i++) {
        // Skip empty state rows
        if (rows[i].querySelector('.empty-state')) continue;
        
        const statusCell = rows[i].getElementsByTagName('td')[8];
        if (statusCell) {
            const statusSpan = statusCell.querySelector('.status-badge');
            const status = statusSpan ? statusSpan.textContent.toLowerCase().trim() : '';
            
            if (!filterStatus || status.includes(filterStatus)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function clearLeaveReportFilter() {
    document.getElementById('leaveReportDate').value = '';
    document.getElementById('leaveReportStatus').value = '';
    const table = document.getElementById('leaveReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
    console.log('Leave report filters cleared');
}

// Permission Report Filter Functions
function filterPermissionReportByDate() {
    const filterDate = document.getElementById('permissionReportDate').value;
    const table = document.getElementById('permissionReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    console.log('Filtering permission reports by date:', filterDate);
    
    for (let i = 0; i < rows.length; i++) {
        // Skip empty state rows
        if (rows[i].querySelector('.empty-state')) continue;
        
        const dateCell = rows[i].getElementsByTagName('td')[2];
        if (dateCell) {
            const rowDate = dateCell.textContent.trim();
            if (!filterDate || rowDate === filterDate) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function filterPermissionReportByStatus() {
    const filterStatus = document.getElementById('permissionReportStatus').value.toLowerCase();
    const table = document.getElementById('permissionReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    console.log('Filtering permission reports by status:', filterStatus);
    
    for (let i = 0; i < rows.length; i++) {
        // Skip empty state rows
        if (rows[i].querySelector('.empty-state')) continue;
        
        const statusCell = rows[i].getElementsByTagName('td')[8];
        if (statusCell) {
            const statusSpan = statusCell.querySelector('.status-badge');
            const status = statusSpan ? statusSpan.textContent.toLowerCase().trim() : '';
            
            if (!filterStatus || status.includes(filterStatus)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

function clearPermissionReportFilter() {
    document.getElementById('permissionReportDate').value = '';
    document.getElementById('permissionReportStatus').value = '';
    const table = document.getElementById('permissionReportsTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
    console.log('Permission report filters cleared');
}

// Initialize Report System
document.addEventListener('DOMContentLoaded', function() {
    console.log('Report management system initialized');
    
    // Set up event listeners for filter inputs
    const dailyReportDate = document.getElementById('dailyReportDate');
    if (dailyReportDate) {
        dailyReportDate.addEventListener('change', filterDailyReportByDate);
    }
    
    const leaveReportDate = document.getElementById('leaveReportDate');
    if (leaveReportDate) {
        leaveReportDate.addEventListener('change', filterLeaveReportByMonth);
    }
    
    const leaveReportStatus = document.getElementById('leaveReportStatus');
    if (leaveReportStatus) {
        leaveReportStatus.addEventListener('change', filterLeaveReportByStatus);
    }
    
    const permissionReportDate = document.getElementById('permissionReportDate');
    if (permissionReportDate) {
        permissionReportDate.addEventListener('change', filterPermissionReportByDate);
    }
    
    const permissionReportStatus = document.getElementById('permissionReportStatus');
    if (permissionReportStatus) {
        permissionReportStatus.addEventListener('change', filterPermissionReportByStatus);
    }
    
    // Load initial data when reports section is accessed
    const reportContent = document.getElementById('report-content');
    if (reportContent && reportContent.classList.contains('active')) {
        const activeTab = reportContent.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            if (tabId === 'leave-report') {
                loadLeaveReports();
            } else if (tabId === 'permission-report') {
                loadPermissionReports();
            }
        }
    }
});

// Refresh functions for manual reload
function refreshLeaveReports() {
    console.log('Manually refreshing leave reports...');
    loadLeaveReports();
}

function refreshPermissionReports() {
    console.log('Manually refreshing permission reports...');
    loadPermissionReports();
}