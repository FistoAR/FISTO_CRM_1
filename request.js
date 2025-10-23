// Tab switching functionality for Request Management
function switchEmployeeTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    const allTabContents = document.querySelectorAll('#leave-content .tab-content');
    allTabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const allTabButtons = document.querySelectorAll('#leave-content .tab-btn');
    allTabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log('Activated tab:', tabName);
    } else {
        console.error('Tab not found:', tabName);
    }
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Main function to handle leave date fields update
function updateLeaveDateFields() {
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    const customDaysGroup = document.getElementById('customDaysGroup');
    const customDaysInput = document.getElementById('customDaysInput');
    const singleDateGroup = document.getElementById('singleDateGroup');
    const halfDayPeriodGroup = document.getElementById('halfDayPeriodGroup');
    const startDateGroup = document.getElementById('startDateGroup');
    const calculatedDuration = document.getElementById('calculatedDuration');
    
    const singleDateFull = document.getElementById('singleDateFull');
    const singleDateHalf = document.getElementById('singleDateHalf');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const sessionInputs = document.getElementsByName('session');
    
    if (!numberOfDaysSelect) return;
    
    const selectedValue = numberOfDaysSelect.value;
    
    hideElement(singleDateGroup);
    hideElement(halfDayPeriodGroup);
    hideElement(startDateGroup);
    hideElement(customDaysGroup);
    hideElement(calculatedDuration);
    
    if (singleDateFull) singleDateFull.removeAttribute('required');
    if (singleDateHalf) singleDateHalf.removeAttribute('required');
    if (startDate) startDate.removeAttribute('required');
    if (endDate) endDate.removeAttribute('required');
    if (customDaysInput) {
        customDaysInput.value = '';
        customDaysInput.removeAttribute('required');
    }
    sessionInputs.forEach(input => input.removeAttribute('required'));
    
    switch(selectedValue) {
        case 'halfday':
            showElement(halfDayPeriodGroup);
            if (singleDateHalf) singleDateHalf.setAttribute('required', 'required');
            if (sessionInputs.length > 0) sessionInputs[0].setAttribute('required', 'required');
            break;
            
        case '1':
            showElement(singleDateGroup);
            if (singleDateFull) singleDateFull.setAttribute('required', 'required');
            break;
            
        case 'custom':
        case 'more':
            showCustomDaysInput(customDaysGroup, customDaysInput);
            showElement(startDateGroup);
            showElement(calculatedDuration);
            if (customDaysInput) customDaysInput.setAttribute('required', 'required');
            if (startDate) startDate.setAttribute('required', 'required');
            if (endDate) endDate.setAttribute('required', 'required');
            break;
            
        default:
            if (selectedValue && selectedValue !== '' && selectedValue !== 'halfday' && selectedValue !== '1') {
                showElement(startDateGroup);
                if (startDate) startDate.setAttribute('required', 'required');
                if (endDate) endDate.setAttribute('required', 'required');
            }
            break;
    }
}

// Helper functions
function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
        element.style.display = 'block';
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
    }
}

function showCustomDaysInput(customDaysGroup, customDaysInput) {
    if (customDaysGroup) {
        customDaysGroup.classList.remove('hidden');
        customDaysGroup.style.display = 'block';
        
        if (customDaysGroup.classList.contains('show')) {
            customDaysGroup.classList.add('show');
        }
    }
    
    if (customDaysInput) {
        customDaysInput.setAttribute('required', 'required');
        setTimeout(() => {
            customDaysInput.focus();
        }, 200);
    }
}

function calculateCustomLeaveDuration() {
    const customDaysInput = document.getElementById('customDaysInput');
    const startDateInput = document.getElementById('startDate');
    const endDateField = document.getElementById('endDate');
    const durationText = document.getElementById('durationText');
    
    if (!customDaysInput || !startDateInput) {
        return;
    }
    
    const customDays = parseInt(customDaysInput.value);
    const startDate = startDateInput.value;
    
    if (customDays && customDays >= 6) {
        customDaysInput.setCustomValidity('');
        
        if (startDate && endDateField) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + customDays - 1);
            
            const formattedEndDate = end.toISOString().split('T')[0];
            endDateField.value = formattedEndDate;
            
            if (durationText) {
                const startFormatted = start.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const endFormatted = end.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                durationText.innerHTML = `
                    <strong>${customDays} days</strong> from ${startFormatted} to ${endFormatted}
                `;
            }
        } else if (durationText) {
            durationText.innerHTML = `<strong>${customDays} days</strong> - Please select start date to calculate end date`;
        }
    } else if (customDays && customDays < 6) {
        customDaysInput.setCustomValidity('Please enter 6 or more days for custom duration.');
        if (durationText) {
            durationText.innerHTML = 'Please enter a valid number of days (6 or more)';
        }
        if (endDateField) {
            endDateField.value = '';
        }
    } else {
        customDaysInput.setCustomValidity('');
        if (durationText) {
            durationText.innerHTML = 'Enter the number of days to see duration calculation';
        }
        if (endDateField) {
            endDateField.value = '';
        }
    }
}

function validateLeaveApplication() {
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    const customDaysInput = document.getElementById('customDaysInput');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    if (!numberOfDaysSelect) return false;

    const selectedValue = numberOfDaysSelect.value;

    if ((selectedValue === 'custom' || selectedValue === 'more') && customDaysInput) {
        const customDays = parseInt(customDaysInput.value);

        if (!customDays || customDays < 6) {
            alert('Please enter a valid number of days (6 or more) for custom duration.');
            customDaysInput.focus();
            return false;
        }

        if (startDate && endDate && startDate.value && endDate.value) {
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);

            const actualWorkingDays = getWorkingDaysExcludingSundays(start, end);

            if (actualWorkingDays !== customDays) {
                alert(`The selected date range (${actualWorkingDays} working days) doesn't match your specified duration (${customDays} days). Please adjust.`);
                return false;
            }
        }
    }

    return true;
}

function getWorkingDaysExcludingSundays(start, end) {
    let count = 0;
    let current = new Date(start);
    while (current <= end) {
        if (current.getDay() !== 0) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}

function calculateLeaveDuration() {
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const customDaysInput = document.getElementById('customDaysInput');
    const durationText = document.getElementById('durationText');

    if (!startDateInput || !endDateInput || !startDateInput.value || !endDateInput.value) {
        return;
    }

    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);

    const workingDays = getWorkingDaysExcludingSundays(start, end);

    const startFormatted = start.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const endFormatted = end.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    if (workingDays <= 20) {
        numberOfDaysSelect.value = workingDays.toString();
        hideElement(document.getElementById('customDaysGroup'));
        if (customDaysInput) customDaysInput.value = '';
    } else {
        numberOfDaysSelect.value = 'more';
        showElement(document.getElementById('customDaysGroup'));
        if (customDaysInput) customDaysInput.value = workingDays;
    }

    if (durationText) {
        durationText.innerHTML = `
            <strong>${workingDays} working days</strong> from ${startFormatted} to ${endFormatted} (excluding Sundays)
        `;
    }

    updateLeaveDateFields();
}

function toggleOtherLeaveType() {
    const leaveType = document.getElementById('leaveType').value;
    const otherLeaveDiv = document.getElementById('otherLeaveTypeDiv');
    const otherLeaveInput = document.getElementById('otherLeaveType');
    
    if (leaveType === 'other') {
        otherLeaveDiv.classList.remove('hidden');
        otherLeaveInput.required = true;
        otherLeaveInput.focus();
    } else {
        otherLeaveDiv.classList.add('hidden');
        otherLeaveInput.required = false;
        otherLeaveInput.value = '';
    }
}

// Initialize Tagify with employee data
// Initialize Tagify with custom output format
async function initializeAttendeesTagify() {
    try {
        const response = await fetch('https://www.fist-o.com/web_crm/get_employees.php');
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error('Failed to fetch employees');
        }

        const whitelist = result.data.map(emp => emp.label);
        
        console.log('Loaded employees:', whitelist);

        const attendeesInput = document.getElementById('attendees');
        
        if (attendeesInput) {
            const tagify = new Tagify(attendeesInput, {
                whitelist: whitelist,
                enforceWhitelist: true,
                maxTags: 20,
                dropdown: {
                    maxItems: 10,
                    enabled: 0,
                    closeOnSelect: false,
                    highlightFirst: true
                },
                // ✅ Configure output format to be comma-separated
                originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(', ')
            });

            window.employeeMapping = result.data;
            
            console.log('✅ Tagify initialized with', whitelist.length, 'employees');
        }

    } catch (error) {
        console.error('Error initializing attendees tagify:', error);
        
        const attendeesInput = document.getElementById('attendees');
        if (attendeesInput) {
            new Tagify(attendeesInput, {
                whitelist: [],
                dropdown: {
                    maxItems: 10,
                    enabled: 0,
                    closeOnSelect: false
                },
                // ✅ Add the format here too
                originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(', ')
            });
        }
    }
}


function initializePermissionTimeCalculation() {
    const fromTime = document.getElementById('fromTime');
    const toTime = document.getElementById('toTime');
    const delayDuration = document.getElementById('delayDuration');

    function calculateDelay() {
        if (fromTime.value && toTime.value) {
            const [fromH, fromM] = fromTime.value.split(':').map(Number);
            const [toH, toM] = toTime.value.split(':').map(Number);

            const fromDate = new Date(2000, 0, 1, fromH, fromM);
            const toDate = new Date(2000, 0, 1, toH, toM);

            let diffMinutes = Math.round((toDate - fromDate) / (1000 * 60));

            if (diffMinutes < 0) diffMinutes = 0;

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            let delayStr = '';
            if (hours > 0) delayStr += `${hours} hr${hours > 1 ? 's' : ''} `;
            if (minutes > 0) delayStr += `${minutes} min${minutes > 1 ? 's' : ''}`;
            if (!delayStr) delayStr = '0 min';

            delayDuration.value = delayStr.trim();
        }
    }

    if (fromTime && toTime) {
        fromTime.addEventListener('change', calculateDelay);
        toTime.addEventListener('change', calculateDelay);
    }
}

async function loadPermissionReport() {
    try {
        const response = await fetch('https://www.fist-o.com/web_crm/get_permission_report.php');
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Failed to fetch report");

        const tbody = document.querySelector("#permissionReportsTable tbody");
        if (!tbody) return;
        
        tbody.innerHTML = '';

        result.data.forEach((row) => {
            let statusClass = '';
            const status = (row.status || 'Pending').toLowerCase();

            if (status === 'pending') statusClass = 'status-pending';
            else if (status === 'approved') statusClass = 'status-progress';
            else if (status === 'rejected') statusClass = 'status-completed';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.emp_id}</td>
                <td>${row.employeeName || ''}</td>
                <td>${row.permission_date}</td>
                <td>${row.from_time.substring(0,5)}</td>
                <td>${row.to_time.substring(0,5)}</td>
                <td>${row.delay_duration}</td>
                <td>${row.reason}</td>
                <td>${row.created_at.split(' ')[0]}</td>
                <td><span class="status-badge ${statusClass}">${row.status}</span></td>
            `;

            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading report:", error);
    }
}

// DOM Content Loaded - Single Event Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Leave management system initialized');
    
    // Initialize Tagify
    initializeAttendeesTagify();
    
    // Initialize permission time calculation
    initializePermissionTimeCalculation();
    
    // Load permission report
    loadPermissionReport();
    
    // Initialize Tagify for allocated team
    const allocatedTeamInput = document.getElementById('allocatedteam');
    if (allocatedTeamInput) {
        new Tagify(allocatedTeamInput, {
            whitelist: ["Software", "3D", "UI/UX", "AR", "Marketing", "R&D", "PH", "SBU Head"],
            dropdown: {
                maxItems: 10,
                enabled: 0,
                closeOnSelect: false
            }
        });
    }
    
    // Custom days input listeners
    const customDaysInput = document.getElementById('customDaysInput');
    if (customDaysInput) {
        customDaysInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            if (this.value && value < 6) {
                this.setCustomValidity('Please enter 6 or more days.');
            } else {
                this.setCustomValidity('');
            }
            
            calculateCustomLeaveDuration();
        });
        
        customDaysInput.addEventListener('keydown', function(e) {
            if ([46, 8, 9, 27, 13, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
    
    // Start date listener
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.addEventListener('change', function() {
            calculateCustomLeaveDuration();
            calculateLeaveDuration();
        });
        
        const today = new Date().toISOString().split('T')[0];
        startDateInput.setAttribute('min', today);
    }
    
    // End date listener
    const endDateInput = document.getElementById('endDate');
    if (endDateInput) {
        endDateInput.addEventListener('change', function() {
            calculateLeaveDuration();
        });
    }
    
    // Initialize dropdown state
    const numberOfDaysSelect = document.getElementById('numberOfDays');
    if (numberOfDaysSelect) {
        updateLeaveDateFields();
    }
    
    // Leave Form Submission
    const leaveForm = document.getElementById('leaveApplicationForm');
    if (leaveForm) {
        leaveForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!validateLeaveApplication()) return;

            const empId = sessionStorage.getItem('employeeId');
            const empName = sessionStorage.getItem('employeeName');

            if (!empId || !empName) {
                alert("Employee ID or name is missing. Please log in again.");
                return;
            }

            const numberOfDaysSelect = document.getElementById('numberOfDays');
            const leaveTypeSelect = document.getElementById('leaveType');
            const otherLeaveTypeInput = document.getElementById('otherLeaveType');
            const leaveReasonInput = document.getElementById('leaveReason');
            const singleDateHalf = document.getElementById('singleDateHalf');
            const singleDateFull = document.getElementById('singleDateFull');
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            const customDaysInput = document.getElementById('customDaysInput');

            let numberOfDays = numberOfDaysSelect.value?.trim() || '';
            let numberOfDaysLower = numberOfDays.toLowerCase();
            
            let fromDate = '';
            let toDate = '';
            let sessionValue = 'Full';

            if (numberOfDaysLower === 'halfday' || numberOfDaysLower === 'half day') {
                fromDate = singleDateHalf?.value || '';
                toDate = singleDateHalf?.value || '';

                const sessionInputs = document.getElementsByName('session');
                let selectedSession = '';
                for (let i = 0; i < sessionInputs.length; i++) {
                    if (sessionInputs[i].checked) {
                        selectedSession = sessionInputs[i].value.toUpperCase();
                        break;
                    }
                }

                if (!selectedSession) {
                    alert("Please select Morning (AM) or Afternoon (PM) for your Half Day leave.");
                    return;
                }

                if (selectedSession === 'AM') {
                    sessionValue = 'Morning(AM)';
                } else if (selectedSession === 'PM') {
                    sessionValue = 'Afternoon(PM)';
                } else {
                    sessionValue = 'Morning(AM)';
                }

                numberOfDays = 'Half Day';

            } else if (numberOfDaysLower === '1' || numberOfDaysLower === '1 day') {
                fromDate = singleDateFull?.value || '';
                toDate = singleDateFull?.value || '';
                numberOfDays = '1 Day';
                sessionValue = 'Full';
            } else if (numberOfDaysLower === 'custom' || numberOfDaysLower === 'more') {
                fromDate = startDateInput?.value || '';
                toDate = endDateInput?.value || '';
                
                const customDays = customDaysInput?.value || '';
                if (customDays) {
                    const dayCount = parseInt(customDays);
                    numberOfDays = customDays + (dayCount === 1 ? ' Day' : ' Days');
                } else {
                    alert("Please specify the number of days for custom leave.");
                    return;
                }
                sessionValue = 'Full';
            } else {
                fromDate = startDateInput?.value || '';
                toDate = endDateInput?.value || '';
                
                if (!numberOfDaysLower.includes('day')) {
                    numberOfDays = numberOfDays + ' Days';
                }
                sessionValue = 'Full';
            }

            if (!fromDate || !toDate) {
                alert("Please select valid date(s) for your leave.");
                return;
            }

            const leaveTypeValue = leaveTypeSelect.value === 'other'
                ? otherLeaveTypeInput.value
                : leaveTypeSelect.value;

            const leaveData = {
                emp_id: empId,
                emp_name: empName,
                leave_type: leaveTypeValue,
                from_date: fromDate,
                to_date: toDate,
                number_of_days: numberOfDays,
                session: sessionValue,
                reason: leaveReasonInput.value.trim(),
            };

            console.log("Submitting leave data:", leaveData);

            try {
                const response = await fetch("https://www.fist-o.com/web_crm/leave_report.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(leaveData),
                });

                const result = await response.json();

                if (response.ok && (result.success || result.message)) {
                    alert("✅ " + (result.message || "Leave request submitted successfully!"));
                    console.log("Success response:", result);
                    leaveForm.reset();
                    
                    if (typeof updateLeaveDateFields === 'function') {
                        updateLeaveDateFields();
                    }
                } else {
                    alert("❌ Error: " + (result.error || "Submission failed"));
                    console.error("Error response:", result);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                alert("⚠️ An error occurred: " + error.message);
            }
        });
    }
    
    // Permission Form Submission
    const permissionForm = document.getElementById('permissionForm');
    if (permissionForm) {
        permissionForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const form = e.target;

            const empId = sessionStorage.getItem('employeeId');
            const empName = sessionStorage.getItem('employeeName'); 
            console.log('Fetched emp_id from sessionStorage:', empId);
            console.log('Fetched emp_Name from sessionStorage:', empName);

            if (!empId) {
                alert('Employee ID is missing. Please log in again.');
                return;
            }

            const data = {
                emp_id: empId,
                employeeName: empName,
                permission_date: form.querySelector('#permissionDate').value || '',
                from_time: form.querySelector('#fromTime').value || '',
                to_time: form.querySelector('#toTime').value || '',
                delay_duration: form.querySelector('#delayDuration').value || '',
                reason: form.querySelector('#permissionReason').value || '',
            };

            console.log('Sending permission data:', data);

            try {
                const response = await fetch('https://www.fist-o.com/web_crm/permission_report.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok && result.message) {
                    alert(result.message);
                    form.reset();
                } else {
                    alert(result.error || 'Submission failed');
                }
            } catch (error) {
                alert('An error occurred: ' + error.message);
            }
        });
    }
    
// ✅ MEETING FORM SUBMISSION - FIXED
// ✅ MEETING FORM SUBMISSION - COMPLETE FIX
const meetingForm = document.getElementById('meetingForm');
if (meetingForm) {
    meetingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const empId = sessionStorage.getItem('employeeId');
        const empName = sessionStorage.getItem('employeeName');
        
        if (!empId || !empName) {
            alert('Employee ID or name is missing. Please log in again.');
            return;
        }
        
        const meetingTitle = document.getElementById('meetingTitle').value.trim();
        const meetingDate = document.getElementById('meetingDate').value;
        const meetingFromTime = document.getElementById('meetingFromTime').value;
        const meetingToTime = document.getElementById('meetingToTime').value;
        const meetingDuration = document.getElementById('meetingDuration').value;
        const meetingDescription = document.getElementById('meetingDescription').value.trim();
        
        // ✅ CORRECT WAY: Get attendees from the original input's value
        const attendeesInput = document.getElementById('attendees');
        let attendeesString = '';
        
        if (attendeesInput && attendeesInput.tagify) {
            // Method 1: Parse the stringified JSON from input.value
            try {
                const tagifyData = JSON.parse(attendeesInput.value);
                // Extract only the "value" property from each tag
                attendeesString = tagifyData.map(tag => tag.value).join(', ');
            } catch (e) {
                console.error('Error parsing Tagify data:', e);
                // Fallback: get from tagify.value
                attendeesString = attendeesInput.tagify.value.map(tag => tag.value).join(', ');
            }
        } else {
            // Fallback if Tagify not initialized
            attendeesString = attendeesInput.value.split(',').map(s => s.trim()).filter(s => s).join(', ');
        }
        
        console.log('Raw input value:', attendeesInput.value); // Debug
        console.log('Processed attendees string:', attendeesString); // Debug
        
        // Validate required fields
        if (!meetingTitle || !meetingDate || !meetingFromTime || !meetingToTime || !meetingDuration || !attendeesString) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Validate time range
        if (meetingFromTime >= meetingToTime) {
            alert('End time must be after start time.');
            return;
        }
        
        // Prepare meeting data
        const meetingData = {
            emp_id: empId,
            emp_name: empName,
            meeting_title: meetingTitle,
            meeting_date: meetingDate,
            from_time: meetingFromTime,
            to_time: meetingToTime,
            duration: meetingDuration,
            attendees: attendeesString, // ✅ Clean string: "CEO (FST001), Giyu (FST895)"
            meeting_description: meetingDescription
        };
        
        console.log('Final meeting data to submit:', meetingData); // Debug
        
        try {
            const response = await fetch('https://www.fist-o.com/web_crm/schedule_meeting.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(meetingData)
            });
            
            const result = await response.json();
            
            if (response.ok && (result.success || result.message)) {
                alert('✅ ' + (result.message || 'Meeting scheduled successfully!'));
                console.log('Success response:', result);
                
                meetingForm.reset();
                
                if (attendeesInput && attendeesInput.tagify) {
                    attendeesInput.tagify.removeAllTags();
                }
            } else {
                alert('❌ Error: ' + (result.error || 'Submission failed'));
                console.error('Error response:', result);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('⚠️ An error occurred: ' + error.message);
        }
    });
}

});
