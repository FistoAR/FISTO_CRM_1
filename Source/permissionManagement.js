// Permission management functions
// permissionManagement.js

// Initialize permission requests data
if (!window.permissionRequests) {
    window.permissionRequests = [
        {
            id: 1,
            employee: 'Current User',
            date: '2024-08-25',
            expectedTime: '09:00',
            actualTime: '09:30',
            delayMinutes: 30,
            status: 'approved',
            approvedBy: 'HR Manager'
        }
    ];
}

// Enhanced Permission Content Initialization with Role-Based UI Control
function initializePermissionContent() {
    console.log('Initializing permission content for role:', currentUser.role);
    
    // Get tab elements
    const requestPermissionTab = document.querySelector('[onclick*="permission-request"]');
    const permissionPendingTab = document.querySelector('[onclick*="permission-pending"]');
    const permissionHistoryTab = document.querySelector('[onclick*="permission-history"]');
    
    // Get content sections
    const requestPermissionSection = document.getElementById('permission-request');
    const permissionPendingSection = document.getElementById('permission-pending');
    const permissionHistorySection = document.getElementById('permission-history');
    
    // Role-based tab visibility control
    if (hasPermission('permission', 'canViewRequests')) {
        // HR Access - Show all tabs
        if (requestPermissionTab) requestPermissionTab.style.display = 'inline-block';
        if (permissionPendingTab) permissionPendingTab.style.display = 'inline-block';
        if (permissionHistoryTab) permissionHistoryTab.style.display = 'inline-block';
        
        // Initialize HR functionalities
        if (permissionPendingSection) {
            updateHRPermissionStats();
            renderPendingPermissionApprovals();
        }
        
        // Set default active tab for HR to Pending Requests
        setActivePermissionTab('permission-pending');
        
    } else {
        // Employee Access - Hide Pending Requests tab, show only Request and History
        if (requestPermissionTab) requestPermissionTab.style.display = 'inline-block';
        if (permissionPendingTab) permissionPendingTab.style.display = 'none';
        if (permissionHistoryTab) permissionHistoryTab.style.display = 'inline-block';
        
        // Hide the pending requests content section
        if (permissionPendingSection) permissionPendingSection.style.display = 'none';
        
        // Set default active tab for employees to Request Permission
        setActivePermissionTab('permission-request');
    }
    
    // Initialize form handlers for all users who can request
    if (hasPermission('permission', 'canRequest')) {
        initializePermissionFormHandlers();
    }
    
    // Initialize history for all users who can view history
    if (hasPermission('permission', 'canViewHistory')) {
        renderUserPermissionHistory();
    }
}

// Helper function to set active permission tab
function setActivePermissionTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('#permission-content .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('#permission-content .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    const targetTab = document.querySelector(`[onclick*="${tabName}"]`);
    const targetContent = document.getElementById(tabName);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
}

function renderUserPermissionHistory() {
    if (!hasPermission('permission', 'canViewHistory')) return;
    
    const container = document.getElementById('permission-history');
    if (!container) return;
    
    const userHistory = window.permissionRequests.filter(req => 
        req.employee === currentUser.name || 
        req.employeeId === currentUser.employeeId ||
        req.employee === 'Current User'
    );
    
    const tableContainer = container.querySelector('.table-container tbody');
    if (!tableContainer) return;
    
    if (userHistory.length === 0) {
        tableContainer.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666; padding: 2rem;">No permission history found</td></tr>';
        return;
    }
    
    tableContainer.innerHTML = userHistory.map(request => `
        <tr>
            <td>${request.date}</td>
            <td>${request.expectedTime}</td>
            <td>${request.actualTime || 'N/A'}</td>
            <td>${request.delayMinutes || 0}</td>
            <td><span class="status-badge status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span></td>
            <td>${request.approvedBy || 'Pending'}</td>
        </tr>
    `).join('');
}

function renderPendingPermissionApprovals() {
    const container = document.getElementById('pendingPermissionApprovals');
    if (!container) return;
    
    const pending = window.permissionRequests.filter(req => req.status === 'pending');

    if (pending.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">No pending permission requests at the moment</div>';
        return;
    }

    container.innerHTML = pending.map(request => `
        <div class="approval-card">
            <div class="approval-header">
                <div class="employee-info">
                    <h4>${request.employee}</h4>
                    <p>Date: ${request.date}</p>
                </div>
                <div class="permission-actions">
                    <button class="btn btn-success" onclick="approvePermissionRequest(${request.id})">
                        ✓ Approve
                    </button>
                    <button class="btn btn-danger" onclick="rejectPermissionRequest(${request.id})">
                        ✕ Reject
                    </button>
                </div>
            </div>
            <div class="approval-details">
                <div class="detail-item">
                    <div class="detail-label">Expected Time:</div>
                    <div class="detail-value">${request.expectedTime}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Actual Time:</div>
                    <div class="detail-value">${request.actualTime || 'Not specified'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Delay Duration:</div>
                    <div class="detail-value">${request.delayMinutes || 0} minutes</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value">${request.reason || 'No reason provided'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateHRPermissionStats() {
    const pending = window.permissionRequests.filter(req => req.status === 'pending').length;
    const approved = window.permissionRequests.filter(req => req.status === 'approved').length;
    const rejected = window.permissionRequests.filter(req => req.status === 'rejected').length;
    
    const totalElement = document.getElementById('hrTotalPermissionRequests');
    const pendingElement = document.getElementById('hrPendingPermissionRequests');
    const approvedElement = document.getElementById('hrApprovedPermissionRequests');
    const rejectedElement = document.getElementById('hrRejectedPermissionRequests');
    
    if (totalElement) totalElement.textContent = window.permissionRequests.length;
    if (pendingElement) pendingElement.textContent = pending;
    if (approvedElement) approvedElement.textContent = approved;
    if (rejectedElement) rejectedElement.textContent = rejected;
}

function approvePermissionRequest(id) {
    const request = window.permissionRequests.find(req => req.id === id);
    if (request) {
        request.status = 'approved';
        request.approvedBy = 'HR Manager';
        request.approvedDate = new Date().toISOString().split('T')[0];
        renderPendingPermissionApprovals();
        updateHRPermissionStats();
        showNotification('Permission request approved successfully!', 'success');
    }
}

function rejectPermissionRequest(id) {
    const request = window.permissionRequests.find(req => req.id === id);
    if (request) {
        request.status = 'rejected';
        request.rejectedBy = 'HR Manager';
        request.rejectedDate = new Date().toISOString().split('T')[0];
        renderPendingPermissionApprovals();
        updateHRPermissionStats();
        showNotification('Permission request rejected!', 'success');
    }
}

function initializePermissionRequestForm() {
    const expectedTime = document.getElementById('expectedTime');
    const actualTime = document.getElementById('actualTime');
    const delayDuration = document.getElementById('delayDuration');
    
    if (expectedTime && actualTime && delayDuration) {
        function calculateDelay() {
            if (expectedTime.value && actualTime.value) {
                const expected = new Date(`2000-01-01T${expectedTime.value}`);
                const actual = new Date(`2000-01-01T${actualTime.value}`);
                const diff = (actual - expected) / (1000 * 60); // difference in minutes
                delayDuration.value = diff > 0 ? Math.round(diff) : 0;
            }
        }
        
        expectedTime.addEventListener('change', calculateDelay);
        actualTime.addEventListener('change', calculateDelay);
    }
}

function initializePermissionFormHandlers() {
    // Initialize permission time calculation
    const expectedTime = document.getElementById('expectedTime');
    const actualTime = document.getElementById('actualTime');
    const delayDuration = document.getElementById('delayDuration');
    
    function calculateDelay() {
        if (expectedTime && actualTime && delayDuration) {
            if (expectedTime.value && actualTime.value) {
                const expected = new Date(`2000-01-01T${expectedTime.value}`);
                const actual = new Date(`2000-01-01T${actualTime.value}`);
                const diff = (actual - expected) / (1000 * 60); // difference in minutes
                delayDuration.value = diff > 0 ? Math.round(diff) : 0;
            }
        }
    }
    
    if (expectedTime) expectedTime.addEventListener('change', calculateDelay);
    if (actualTime) actualTime.addEventListener('change', calculateDelay);

    // Handle permission form submission
    const permissionForm = document.getElementById('permissionForm');
    if (permissionForm) {
        permissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitPermissionRequest();
        });
    }
}

function submitPermissionRequest() {
    const permissionDate = document.getElementById('permissionDate');
    const expectedTime = document.getElementById('expectedTime');
    const actualTime = document.getElementById('actualTime');
    const delayDuration = document.getElementById('delayDuration');
    const reason = document.getElementById('permissionReason');

    // if (!permissionDate?.value || !expectedTime?.value) {
    //     showNotification('Please fill in all required fields', 'error');
    //     return;
    // }

    const newRequest = {
        id: Date.now(),
        employee: currentUser.name || 'Current User',
        employeeId: currentUser.employeeId,
        date: permissionDate.value,
        expectedTime: expectedTime.value,
        actualTime: actualTime?.value || '',
        delayMinutes: parseInt(delayDuration?.value) || 0,
        reason: reason?.value || '',
        status: 'pending',
        submitted: new Date().toISOString().split('T')[0]
    };

    window.permissionRequests.push(newRequest);
    
    showNotification('Permission request submitted successfully!', 'success');
    
    // Reset form
    document.getElementById('permissionForm').reset();
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    if (permissionDate) permissionDate.value = today;
}

// Initialize permission time calculation on page load
function initializePermissionTimeCalculation() {
    const expectedTime = document.getElementById('expectedTime');
    const actualTime = document.getElementById('actualTime');
    const delayDuration = document.getElementById('delayDuration');
    
    function calculateDelay() {
        if (expectedTime && actualTime && delayDuration && expectedTime.value && actualTime.value) {
            const expected = new Date(`2000-01-01T${expectedTime.value}`);
            const actual = new Date(`2000-01-01T${actualTime.value}`);
            const diff = (actual - expected) / (1000 * 60); // difference in minutes
            delayDuration.value = diff > 0 ? Math.round(diff) : 0;
        }
    }
    
    if (expectedTime) expectedTime.addEventListener('change', calculateDelay);
    if (actualTime) actualTime.addEventListener('change', calculateDelay);
}

// Action functions for legacy support
function approvePermission(id) {
    approvePermissionRequest(id);
}

function rejectPermission(id) {
    rejectPermissionRequest(id);
}

// Make functions globally available
window.initializePermissionContent = initializePermissionContent;
window.setActivePermissionTab = setActivePermissionTab;
window.renderUserPermissionHistory = renderUserPermissionHistory;
window.renderPendingPermissionApprovals = renderPendingPermissionApprovals;
window.updateHRPermissionStats = updateHRPermissionStats;
window.approvePermissionRequest = approvePermissionRequest;
window.rejectPermissionRequest = rejectPermissionRequest;
window.initializePermissionRequestForm = initializePermissionRequestForm;
window.initializePermissionFormHandlers = initializePermissionFormHandlers;
window.submitPermissionRequest = submitPermissionRequest;
window.initializePermissionTimeCalculation = initializePermissionTimeCalculation;
window.approvePermission = approvePermission;
window.rejectPermission = rejectPermission;