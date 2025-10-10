// Report Tab Switching Function
function switchReportTab(tabName) {
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('#report-content .tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('#report-content .tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
}

// Daily Report Filter Functions
function filterDailyReportByDate() {
    const filterDate = document.getElementById('dailyReportDate').value;
    const table = document.getElementById('dailyReportsTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const dateCell = rows[i].getElementsByTagName('td')[0];
        if (dateCell) {
            const rowDate = dateCell.textContent;
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
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
}

// Leave Report Filter Functions
function filterLeaveReportByMonth() {
    const filterMonth = document.getElementById('leaveReportDate').value;
    const table = document.getElementById('leaveReportsTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const fromDateCell = rows[i].getElementsByTagName('td')[3];
        if (fromDateCell) {
            const fromDate = fromDateCell.textContent;
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
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const statusCell = rows[i].getElementsByTagName('td')[8];
        if (statusCell) {
            const status = statusCell.textContent.toLowerCase();

                // Clear previous status classes
                statusCell.classList.remove('status-approved', 'status-pending', 'status-rejected');

                // Add corresponding class
                if (status === 'approved') {
                    statusCell.classList.add('status-approved');
                } else if (status === 'pending') {
                    statusCell.classList.add('status-pending');
                } else if (status === 'rejected') {
                    statusCell.classList.add('status-rejected');
                }

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
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
}

// Permission Report Filter Functions
function filterPermissionReportByDate() {
    const filterDate = document.getElementById('permissionReportDate').value;
    const table = document.getElementById('permissionReportsTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const dateCell = rows[i].getElementsByTagName('td')[2];
        if (dateCell) {
            const rowDate = dateCell.textContent;
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
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const statusCell = rows[i].getElementsByTagName('td')[9];
        if (statusCell) {
            const status = statusCell.textContent.toLowerCase();

                // Clear previous status classes
                statusCell.classList.remove('status-approved', 'status-pending', 'status-rejected');

                // Add corresponding class
                if (status === 'approved') {
                    statusCell.classList.add('status-approved');
                } else if (status === 'pending') {
                    statusCell.classList.add('status-pending');
                } else if (status === 'rejected') {
                    statusCell.classList.add('status-rejected');
                }

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
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
}