// Leave management functions
// leaveManagement.js

// Leave Management Functions
function renderUserLeaveRequests() {
    const container = document.getElementById('leaveRequestsList');
    if (!container) return;
    
    const userRequests = leaveRequests.filter(req => 
        req.employee === currentUser.name || req.employee === 'Current User'
    );

    if (userRequests.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">No leave requests found</div>';
        return;
    }

    container.innerHTML = userRequests.map(request => {
        let durationText = `${request.duration} day${request.duration !== 1 ? 's' : ''}`;
        if (request.duration === 'halfday') {
            durationText = `Half Day${request.halfDayPeriod ? ` (${request.halfDayPeriod})` : ''}`;
        }
        
        let dateText = request.startDate === request.endDate ? 
            request.startDate : 
            `${request.startDate} - ${request.endDate}`;

        return `
            <div class="leave-item">
                <div class="leave-header">
                    <div class="leave-title">
                        ${request.type}
                        <span class="status-badge status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                    </div>
                </div>
                <div class="leave-details">
                    ${request.reason}<br>
                    Duration: ${dateText} (${durationText})
                </div>
                <div class="leave-meta">
                    <div style="font-size: 0.85rem; color: #666;">
                        Submitted: ${request.submitted}
                        ${request.approved ? `<br>Approved: ${request.approved}` : ''}
                        ${request.comments ? `<br>Comments: ${request.comments}` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPendingApprovals() {
    const container = document.getElementById('pendingLeaveApprovals');
    if (!container) return;
    
    const pending = leaveRequests.filter(req => req.status === 'pending');

    if (pending.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">No pending approvals at the moment</div>';
        return;
    }

    container.innerHTML = pending.map(request => `
        <div class="approval-card">
            <div class="approval-header">
                <div class="employee-info">
                    <h4>${request.employee}</h4>
                    <p>${request.department}</p>
                </div>
                <div class="leave-actions">
                    <button class="btn btn-success" onclick="approveLeaveRequest(${request.id})">
                        ✓ Approve
                    </button>
                    <button class="btn btn-danger" onclick="rejectLeaveRequest(${request.id})">
                        ✕ Reject
                    </button>
                </div>
            </div>
            <div class="approval-details">
                <div class="detail-item">
                    <div class="detail-label">Leave Type:</div>
                    <div class="detail-value">${request.type}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duration:</div>
                    <div class="detail-value">${request.duration} days</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Start Date:</div>
                    <div class="detail-value">${request.startDate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">End Date:</div>
                    <div class="detail-value">${request.endDate}</div>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Reason:</div>
                <div class="detail-value">${request.reason}</div>
            </div>
        </div>
    `).join('');
}

function updateHRLeaveStats() {
    const pending = leaveRequests.filter(req => req.status === 'pending').length;
    const approved = leaveRequests.filter(req => req.status === 'approved').length;
    const rejected = leaveRequests.filter(req => req.status === 'rejected').length;
    
    const totalElement = document.getElementById('hrTotalRequests');
    const pendingElement = document.getElementById('hrPendingRequests');
    const approvedElement = document.getElementById('hrApprovedRequests');
    const rejectedElement = document.getElementById('hrRejectedRequests');
    
    if (totalElement) totalElement.textContent = leaveRequests.length;
    if (pendingElement) pendingElement.textContent = pending;
    if (approvedElement) approvedElement.textContent = approved;
    if (rejectedElement) rejectedElement.textContent = rejected;
}

function approveLeaveRequest(id) {
    const request = leaveRequests.find(req => req.id === id);
    if (request) {
        request.status = 'approved';
        request.approved = new Date().toISOString().split('T')[0];
        renderPendingApprovals();
        updateHRLeaveStats();
        showNotification('Leave request approved successfully!', 'success');
    }
}

function rejectLeaveRequest(id) {
    const request = leaveRequests.find(req => req.id === id);
    if (request) {
        request.status = 'rejected';
        renderPendingApprovals();
        updateHRLeaveStats();
        showNotification('Leave request rejected!', 'success');
    }
}

// Enhanced Leave Content Initialization with Role-Based UI Control
function initializeLeaveContent() {
    console.log('Initializing leave content for role:', currentUser.role);
    
    // Get tab elements
    const leaveRequestsTab = document.querySelector('[onclick*="leave-requests"]');
    const applyLeaveTab = document.querySelector('[onclick*="leave-apply"]');
    const leaveHistoryTab = document.querySelector('[onclick*="leave-history"]');
    
    // Get content sections
    const leaveRequestsSection = document.getElementById('leave-requests');
    const applyLeaveSection = document.getElementById('leave-apply');
    const leaveHistorySection = document.getElementById('leave-history');
    
    // Role-based tab visibility control
    if (hasPermission('leave', 'canViewRequests')) {
        // HR Access - Show all tabs
        if (leaveRequestsTab) leaveRequestsTab.style.display = 'inline-block';
        if (applyLeaveTab) applyLeaveTab.style.display = 'inline-block';
        if (leaveHistoryTab) leaveHistoryTab.style.display = 'inline-block';
        
        // Initialize HR functionalities
        if (leaveRequestsSection) {
            updateHRLeaveStats();
            renderPendingApprovals();
        }
        
        // Set default active tab for HR to Leave Requests
        setActiveLeaveTab('leave-requests');
        
    } else {
        // Employee Access - Hide Leave Requests tab, show only Apply and History
        if (leaveRequestsTab) leaveRequestsTab.style.display = 'none';
        if (applyLeaveTab) applyLeaveTab.style.display = 'inline-block';
        if (leaveHistoryTab) leaveHistoryTab.style.display = 'inline-block';
        
        // Hide the leave requests content section
        if (leaveRequestsSection) leaveRequestsSection.style.display = 'none';
        
        // Set default active tab for employees to Apply Leave
        setActiveLeaveTab('leave-apply');
    }
    
    // Initialize form handlers for all users who can apply
    if (hasPermission('leave', 'canApply')) {
        initializeLeaveFormHandlers();
    }
    
    // Initialize history for all users who can view history
    if (hasPermission('leave', 'canViewHistory')) {
        renderUserLeaveHistory();
    }
}

// Helper function to set active leave tab
function setActiveLeaveTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('#leave-content .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('#leave-content .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    const targetTab = document.querySelector(`[onclick*="${tabName}"]`);
    const targetContent = document.getElementById(tabName);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

function renderUserLeaveHistory() {
    if (!hasPermission('leave', 'canViewHistory')) return;
    
    const container = document.getElementById('leave-history');
    if (!container) return;
    
    // Get user's leave history
    const userHistory = leaveRequests.filter(req => 
        req.employee === currentUser.name || 
        req.employeeId === currentUser.employeeId ||
        req.employee === 'Current User'
    );
    
    const tableContainer = container.querySelector('.table-container tbody');
    if (!tableContainer) return;
    
    if (userHistory.length === 0) {
        tableContainer.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666; padding: 2rem;">No leave history found</td></tr>';
        return;
    }
    
    tableContainer.innerHTML = userHistory.map(request => `
        <tr>
            <td>${request.type}</td>
            <td>${request.startDate}</td>
            <td>${request.endDate}</td>
            <td>${request.duration}</td>
            <td><span class="status-badge status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span></td>
            <td>${request.submitted}</td>
        </tr>
    `).join('');
}

// Enhanced form initialization functions
function initializeLeaveApplicationForm() {
    const fromDate = document.getElementById('leaveFromDate');
    const toDate = document.getElementById('leaveToDate');
    const leaveDays = document.getElementById('leaveDays');
    
    if (fromDate && toDate && leaveDays) {
        function calculateDays() {
            if (fromDate.value && toDate.value) {
                const start = new Date(fromDate.value);
                const end = new Date(toDate.value);
                const timeDiff = end.getTime() - start.getTime();
                const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                leaveDays.value = dayDiff > 0 ? dayDiff : 0;
            }
        }
        
        fromDate.addEventListener('change', calculateDays);
        toDate.addEventListener('change', calculateDays);
    }
}

function initializeLeaveFormHandlers() {
    // Initialize leave date calculation
    const fromDate = document.getElementById('leaveFromDate');
    const toDate = document.getElementById('leaveToDate');
    const leaveDays = document.getElementById('leaveDays');
    
    function calculateDays() {
        if (fromDate.value && toDate.value) {
            const start = new Date(fromDate.value);
            const end = new Date(toDate.value);
            const timeDiff = end.getTime() - start.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            leaveDays.value = dayDiff > 0 ? dayDiff : 0;
        }
    }
    
    if (fromDate) fromDate.addEventListener('change', calculateDays);
    if (toDate) toDate.addEventListener('change', calculateDays);
}

// Leave application form handlers
function updateLeaveDateFields() {
    const numberOfDays = document.getElementById('numberOfDays').value;
    
    // Get all form groups
    const singleDateGroup = document.getElementById('singleDateGroup');
    const halfDayPeriodGroup = document.getElementById('halfDayPeriodGroup');
    const startDateGroup = document.getElementById('startDateGroup');
    const endDateGroup = document.getElementById('endDateGroup');
    const customDurationGroup = document.getElementById('customDurationGroup');
    
    // Hide all groups first
    [singleDateGroup, halfDayPeriodGroup, startDateGroup, endDateGroup, customDurationGroup]
        .forEach(group => group?.classList.add('hidden'));
    
    // Clear previous values
    clearLeaveDateFields();
    
    // Show appropriate fields based on selection
    if (numberOfDays === 'halfday') {
        // Half Day - show single date and period selection
        singleDateGroup?.classList.remove('hidden');
        halfDayPeriodGroup?.classList.remove('hidden');
        updateTotalDaysField('halfday');
    } else if (numberOfDays === '1') {
        // One Day - show single date only
        singleDateGroup?.classList.remove('hidden');
        updateTotalDaysField('1');
    } else if (numberOfDays === 'custom') {
        // Custom duration - show date range and custom input
        startDateGroup?.classList.remove('hidden');
        endDateGroup?.classList.remove('hidden');
        customDurationGroup?.classList.remove('hidden');
    } else if (numberOfDays && parseInt(numberOfDays) > 1) {
        // Multi-day (2-5 days) - show date range
        startDateGroup?.classList.remove('hidden');
        endDateGroup?.classList.remove('hidden');
    }
}

function clearLeaveDateFields() {
    // Clear all date inputs and calculated fields
    const fields = ['singleDate', 'startDate', 'endDate', 'customDuration', 'totalDays', 'calculatedDays'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    // Clear radio buttons
    const radioButtons = document.querySelectorAll('input[name="halfDayPeriod"]');
    radioButtons.forEach(radio => radio.checked = false);
}

function updateTotalDaysField(days) {
    const totalDaysField = document.getElementById('totalDays');
    if (totalDaysField) {
        totalDaysField.value = days;
    }
}

function calculateLeaveDuration() {
    const startDateField = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    const calculatedDaysField = document.getElementById('calculatedDays');
    const numberOfDaysField = document.getElementById('numberOfDays');
    
    if (!startDateField || !endDateField || !calculatedDaysField) return;
    
    const startDate = startDateField.value;
    const endDate = endDateField.value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate that end date is after start date
        if (end < start) {
            showMessage('End date must be after start date', 'error');
            endDateField.value = '';
            calculatedDaysField.value = '';
            return;
        }
        
        // Calculate difference in days
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        calculatedDaysField.value = daysDiff;
        
        // For custom duration, validate minimum days
        const selectedDuration = numberOfDaysField.value;
        if (selectedDuration === 'custom' && daysDiff < 6) {
            showMessage('Custom duration requires minimum 6 days. Please adjust your dates or select a different duration option.', 'error');
        } else if (selectedDuration !== 'custom' && parseInt(selectedDuration) !== daysDiff) {
            // If calculated days don't match selected duration, show warning
            if (daysDiff > 5) {
                showMessage(`Calculated duration (${daysDiff} days) requires "More than 5 Days" option. Please select the correct duration.`, 'error');
            } else {
                showMessage(`Calculated duration (${daysDiff} days) doesn't match selected duration (${selectedDuration} days). Please adjust dates or duration selection.`, 'error');
            }
        }
    }
}

function handleLeaveApplicationSubmit(event) {
    event.preventDefault();
    
    const leaveType = document.getElementById('leaveType');
    const numberOfDays = document.getElementById('numberOfDays');
    const reason = document.getElementById('leaveReason');
    
    if (!leaveType || !numberOfDays || !reason) {
        showMessage('Form fields not found. Please refresh the page.', 'error');
        return;
    }
    
    if (!leaveType.value || !numberOfDays.value || !reason.value.trim()) {
        showMessage('Please fill all required fields', 'error');
        return;
    }
    
    let startDate = '';
    let endDate = '';
    let duration = 0;
    let halfDayPeriod = '';
    
    // Helper function to format date as YYYY-MM-DD
    function formatDate(dateInput) {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Process Half Day and 1 Day leaves
    if (numberOfDays.value === 'halfday' || numberOfDays.value === '1') {
        const singleDateField = document.getElementById('singleDate');
        
        if (!singleDateField || !singleDateField.value) {
            showMessage('Please select a leave date', 'error');
            if (singleDateField) singleDateField.focus();
            return;
        }
        
        // Format the date
        startDate = formatDate(singleDateField.value);
        
        if (!startDate) {
            showMessage('Invalid date format. Please select a valid date.', 'error');
            return;
        }
        
        // IMPORTANT: Set both from_date and to_date to the same value
        endDate = startDate;
        
        duration = numberOfDays.value === 'halfday' ? 0.5 : 1;
        
        // Validate half-day period selection
        if (numberOfDays.value === 'halfday') {
            const period = document.querySelector('input[name="halfDayPeriod"]:checked');
            if (!period) {
                showMessage('Please select Morning or Afternoon for half-day leave', 'error');
                return;
            }
            halfDayPeriod = period.value;
        }
        
        console.log('Single day leave - from_date and to_date are the same:', {
            from_date: startDate,
            to_date: endDate,
            are_equal: startDate === endDate
        });
        
    } else if (numberOfDays.value === 'custom') {
        // Custom duration handling
        const startDateField = document.getElementById('startDate');
        const endDateField = document.getElementById('endDate');
        const customDurationField = document.getElementById('customDuration');
        
        if (!startDateField || !endDateField || !customDurationField) {
            showMessage('Date fields not found', 'error');
            return;
        }
        
        if (!startDateField.value || !endDateField.value || !customDurationField.value) {
            showMessage('Please fill all date and duration fields for custom leave', 'error');
            return;
        }
        
        const customValue = parseInt(customDurationField.value);
        if (!customValue || customValue < 6) {
            showMessage('Please enter a valid custom duration (minimum 6 days)', 'error');
            return;
        }
        
        startDate = formatDate(startDateField.value);
        endDate = formatDate(endDateField.value);
        
        if (!startDate || !endDate) {
            showMessage('Invalid date format. Please select valid dates.', 'error');
            return;
        }
        
        duration = customValue;
        
    } else {
        // Multi-day leave (2-5 days)
        const startDateField = document.getElementById('startDate');
        const endDateField = document.getElementById('endDate');
        
        if (!startDateField || !endDateField) {
            showMessage('Date fields not found', 'error');
            return;
        }
        
        if (!startDateField.value || !endDateField.value) {
            showMessage('Please select both start and end dates', 'error');
            return;
        }
        
        startDate = formatDate(startDateField.value);
        endDate = formatDate(endDateField.value);
        
        if (!startDate || !endDate) {
            showMessage('Invalid date format. Please select valid dates.', 'error');
            return;
        }
        
        const start = new Date(startDateField.value);
        const end = new Date(endDateField.value);
        const timeDiff = end.getTime() - start.getTime();
        const calculatedDuration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        if (calculatedDuration <= 0) {
            showMessage('End date must be after start date', 'error');
            return;
        }
        
        duration = calculatedDuration;
    }
    
    // Final validation
    if (!startDate || !endDate) {
        showMessage('Error: Could not format dates properly. Please try again.', 'error');
        return;
    }
    
    // Create leave application object
    const leaveApplication = {
        leaveType: leaveType.value,
        startDate: startDate,
        endDate: endDate,
        duration: duration,
        halfDayPeriod: halfDayPeriod,
        reason: reason.value,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    };
    
    console.log('Submitting leave application:', leaveApplication);
    
    // Submit the application
    submitLeaveApplication(leaveApplication);
}


// Add this helper to ensure currentUser data is available
function getCurrentUserData() {
    // Retrieve from localStorage or session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        return JSON.parse(storedUser);
    }
    
    // Fallback to global currentUser variable
    return window.currentUser || { 
        employeeId: 'UNKNOWN', 
        name: 'Unknown User' 
    };
}


function submitLeaveApplication(applicationData) {
    console.log('Submitting leave application:', applicationData);
    
    // Prepare data for PHP API
    const leaveRequestData = {
        emp_id: currentUser.employeeId || currentUser.emp_id || '',
        emp_name: currentUser.name || currentUser.emp_name || '',
        leave_type: applicationData.leaveType,
        from_date: applicationData.startDate,
        to_date: applicationData.endDate,
        number_of_days: applicationData.duration === 0.5 ? 'Half Day' : 
                        applicationData.duration === 1 ? '1 Day' : 
                        applicationData.duration + ' Days',
        session: applicationData.halfDayPeriod || 'Full',
        reason: applicationData.reason
    };
    
    // Validate dates are not empty
    if (!leaveRequestData.from_date || !leaveRequestData.to_date) {
        showMessage('Error: Dates cannot be empty', 'error');
        return;
    }
    
    // Send to PHP API
    fetch('https://www.fist-o.com/web_crm/leave_report.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaveRequestData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        
        let summaryText = `Leave Application Submitted Successfully!
        
Leave Type: ${applicationData.leaveType}
Start Date: ${applicationData.startDate}
End Date: ${applicationData.endDate}
Duration: ${applicationData.duration} day(s)`;

        if (applicationData.halfDayPeriod) {
            summaryText += `
Half Day Period: ${applicationData.halfDayPeriod}`;
        }

        summaryText += `
Reason: ${applicationData.reason}
Status: Pending Approval`;

        showMessage(summaryText, 'success');
        
        // Reset form
        document.getElementById('leaveApplicationForm').reset();
        clearLeaveDateFields();
        
        // Hide all dynamic groups
        const groups = ['singleDateGroup', 'halfDayPeriodGroup', 'startDateGroup', 'endDateGroup', 'customDurationGroup'];
        groups.forEach(groupId => {
            document.getElementById(groupId)?.classList.add('hidden');
        });
        
        // Refresh leave history if available
        if (typeof renderUserLeaveHistory === 'function') {
            renderUserLeaveHistory();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage(`Failed to submit leave request: ${error.error || error.message || 'Unknown error'}`, 'error');
    });
}


// Tab switching functionality for leave management
function switchLeaveTab(tabName) {
    // Hide all leave tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(`leave${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
    event.target.classList.add('active');
}

function openNewLeaveRequestModal() {
    document.getElementById('newLeaveRequestModal').style.display = 'block';
}

function closeLeaveModal() {
    document.getElementById('newLeaveRequestModal').style.display = 'none';
}

function handleLeaveDaysChange() {
    const value = document.getElementById('numberOfDays').value;
    const singleDate = document.getElementById('singleLeaveDate');
    const halfDayPeriod = document.getElementById('halfDayPeriodGroup');
    const startDate = document.getElementById('startLeaveDate');
    const endDate = document.getElementById('endLeaveDate');
    const customDuration = document.getElementById('customLeaveDuration');
    
    // Hide all date fields first
    singleDate.style.display = 'none';
    halfDayPeriod.style.display = 'none';
    startDate.style.display = 'none';
    endDate.style.display = 'none';
    customDuration.style.display = 'none';
    
    if (value === 'halfday') {
        singleDate.style.display = 'block';
        halfDayPeriod.style.display = 'block';
    } else if (value === '1') {
        singleDate.style.display = 'block';
    } else if (value && value !== 'custom') {
        startDate.style.display = 'block';
        endDate.style.display = 'block';
    } else if (value === 'custom') {
        startDate.style.display = 'block';
        endDate.style.display = 'block';
        customDuration.style.display = 'block';
    }
}

function submitLeaveRequest() {
    const form = document.getElementById('leaveRequestForm');
    if (form.checkValidity()) {
        alert('Leave request submitted successfully!');
        closeLeaveModal();
        form.reset();
    } else {
        form.reportValidity();
    }
}

function viewLeaveCalendar() {
    alert('Leave calendar feature coming soon!');
}

function viewTeamStatus() {
    alert('Team status feature coming soon!');
}

function exportLeaveReports() {
    alert('Export functionality coming soon!');
}

// Make functions globally available
window.renderUserLeaveRequests = renderUserLeaveRequests;
window.renderPendingApprovals = renderPendingApprovals;
window.updateHRLeaveStats = updateHRLeaveStats;
window.approveLeaveRequest = approveLeaveRequest;
window.rejectLeaveRequest = rejectLeaveRequest;
window.initializeLeaveContent = initializeLeaveContent;
window.setActiveLeaveTab = setActiveLeaveTab;
window.renderUserLeaveHistory = renderUserLeaveHistory;
window.initializeLeaveApplicationForm = initializeLeaveApplicationForm;
window.initializeLeaveFormHandlers = initializeLeaveFormHandlers;
window.updateLeaveDateFields = updateLeaveDateFields;
window.clearLeaveDateFields = clearLeaveDateFields;
window.updateTotalDaysField = updateTotalDaysField;
window.calculateLeaveDuration = calculateLeaveDuration;
window.handleLeaveApplicationSubmit = handleLeaveApplicationSubmit;
window.submitLeaveApplication = submitLeaveApplication;
window.switchLeaveTab = switchLeaveTab;
window.openNewLeaveRequestModal = openNewLeaveRequestModal;
window.closeLeaveModal = closeLeaveModal;
window.handleLeaveDaysChange = handleLeaveDaysChange;
window.submitLeaveRequest = submitLeaveRequest;
window.viewLeaveCalendar = viewLeaveCalendar;
window.viewTeamStatus = viewTeamStatus;
window.exportLeaveReports = exportLeaveReports;