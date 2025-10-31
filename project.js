// ============================
// SESSION STORAGE MANAGEMENT
// ============================
function storeProjectSession(project) {
  try {
    const projectData = {
      project_id: project.projectId || project.project_id || project.id,
      company_name: project.companyName || project.company_name || '',
      project_name: project.projectName || project.project_name || '',
      project_description: project.projectDescription || project.project_description || '',
      start_date: project.startDate || project.start_date || '',
      completion_date: project.completionDate || project.completion_date || '',
      reporting_person: project.reportingPerson || project.reporting_person || '',
      customer_id: project.customerId || project.customer_id || '',
      stored_at: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentProject', JSON.stringify(projectData));
    console.log('Ã¢Å“â€¦ Project stored in session:', projectData);
    return projectData;
  } catch (error) {
    console.error('Ã¢ÂÅ’ Error storing project session:', error);
    showToast('Error storing project data', 'error');
    return null;
  }
}

function getProjectSession() {
  try {
    const projectData = sessionStorage.getItem('currentProject');
    if (projectData) {
      const project = JSON.parse(projectData);
      console.log('Ã¢Å“â€¦ Retrieved project from session:', project);
      return project;
    }
    return null;
  } catch (error) {
    console.error('Ã¢ÂÅ’ Error retrieving project session:', error);
    return null;
  }
}

function getProjectIdFromSession() {
  const project = getProjectSession();
  return project ? project.project_id : null;
}

function clearProjectSession() {
  try {
    sessionStorage.removeItem('currentProject');
    console.log('Ã°Å¸Â§Â¹ Project session cleared');
  } catch (error) {
    console.error('Ã¢ÂÅ’ Error clearing project session:', error);
  }
}

// ============================
// GLOBAL VARIABLES
// ============================

let projectsData = [];
let clientsData = [];
let currentProjectId = null;
let currentPage = 1;
const projectsPerPage = 5;
let employeesData = [];
let selectedEmployees = [];
let tempTasks = [];
let employeesToRemove = [];
let tempAllocatedEmployees = [];
// ✅ Store minimum allowed progress (from latest report)
let minimumProgress = 0;


// ============================
// INITIALIZATION
// ============================

function initializeProjectDashboard() {
  console.log('Ã°Å¸Å¡â‚¬ Initializing Project Dashboard...');
  
  loadOnboardedClients()
    .then(() => loadProjects())
    .then(() => {
      displayProjectsTable(projectsData);
      setupEventListeners();
      console.log('Ã¢Å“â€¦ Dashboard initialized');
    })
    .catch(err => {
      console.error('Ã¢ÂÅ’ Error:', err);
      showToast('Failed to initialize dashboard', 'error');
    });
}

// ============================
// FETCH ONBOARDED CLIENTS
// ============================

async function loadOnboardedClients() {
  try {
    console.log('Ã°Å¸â€œÂ¡ Fetching onboarded clients from API...');
    
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_addprojectdetails.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ã°Å¸â€œÂ¦ API Response:', result);
    
    if (result.status === 'success') {
      const data = result.data || [];
      console.log(`Ã°Å¸â€œÅ  Total onboarded projects: ${data.length}`);
      
      clientsData = data.map(client => ({
        id: client.client_id,
        customerId: client.customer_id,
        projectName:  client.project_name || client.projectName || 'N/A',
        projectDescription: client.project_description || '',
        companyName: client.company_name,
        customerName: client.customer_name,
        contactPerson: client.contact_person || 'N/A',
        phoneNo: client.phone_number || 'N/A',
        mailId: client.mail_id || 'N/A',
        designation: client.designation || 'N/A',
        address: client.address || 'N/A',
        industryType: client.industry_type || 'N/A',
        website: client.website || 'N/A',
        status: client.status
      }));
      
      console.log(`Ã¢Å“â€¦ Loaded ${clientsData.length} onboarded clients`);
      populateClientDropdown();
      return clientsData;
    } else {
      console.warn('Ã¢Å¡ Ã¯Â¸Â No clients returned or status not success');
      return [];
    }
  } catch (err) {
    console.error('Ã¢ÂÅ’ Error loading clients:', err);
    showToast('Failed to load clients: ' + err.message, 'error');
    return [];
  }
}

// ============================
// POPULATE CLIENT DROPDOWN
// ============================

function populateClientDropdown() {
  const clientSelect = document.getElementById('onboardedProjectSelect');
  if (!clientSelect) {
    console.error('onboardedProjectSelect dropdown not found!');
    return;
  }

  clientSelect.innerHTML = '<option value="">-- Select Project --</option>';

  if (clientsData.length === 0) {
    const noDataOption = document.createElement('option');
    noDataOption.value = '';
    noDataOption.textContent = '-- No onboarded projects available --';
    noDataOption.disabled = true;
    clientSelect.appendChild(noDataOption);
    console.warn('No projects to populate');
    return;
  }

  // Filter clients without projects
  const availableClients = clientsData.filter(client => {
    const hasProject = projectsData.some(project => project.customerId === client.customerId);
    return !hasProject;
  });

  if (availableClients.length === 0) {
    const allAddedOption = document.createElement('option');
    allAddedOption.value = '';
    allAddedOption.textContent = '-- All onboarded projects have been added --';
    allAddedOption.disabled = true;
    clientSelect.appendChild(allAddedOption);
    console.warn('All clients already have projects');
    return;
  }

  availableClients.forEach(client => {
    const option = document.createElement('option');
    const displayText = client.projectName && client.projectName !== 'NA'
      ? `${client.projectName} (${client.customerId})`
      : `N/A (${client.customerId})`;
    option.value = client.customerId;
    option.textContent = displayText;
    option.dataset.customerId = client.customerId;
    option.dataset.projectName = client.projectName;
    option.dataset.projectDescription = client.projectDescription;
    option.dataset.companyName = client.companyName;
    option.dataset.customerName = client.customerName;
    option.dataset.phone = client.phoneNo;
    option.dataset.email = client.mailId;
    option.dataset.contactPerson = client.contactPerson;
    option.dataset.designation = client.designation;
    option.dataset.industry = client.industryType;
    option.dataset.website = client.website;
    option.dataset.address = client.address;
    clientSelect.appendChild(option);
  });

  
  console.log('Dropdown populated with', availableClients.length, 'available options');
//   console.log("Loaded projects:", projects);
// projects.forEach(p => {
//     console.log("Project ID:", p.projectId, "Project Name:", p.projectName, "Company Name:", p.companyName);
// });

}


// ============================
// AUTO-FILL ON CLIENT SELECTION
// ============================

function handleClientSelection() {
  const clientSelect = document.getElementById('onboardedProjectSelect');
  
  if (!clientSelect) {
    console.error('Ã¢ÂÅ’ Dropdown not found!');
    return;
  }

  const selectedValue = clientSelect.value;
  console.log('Ã°Å¸â€Â Selected customer ID:', selectedValue);
  
  if (!selectedValue) {
    console.log('Ã°Å¸â€â€ž No selection, clearing fields');
    clearContactFields();
    return;
  }

  const selectedOption = clientSelect.options[clientSelect.selectedIndex];
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      fillField('projectCustomerId', selectedOption.dataset.customerId || '', false);
      fillField('projectDescriptionForm', selectedOption.dataset.projectDescription || '', false);
      fillField('contactPersonForm', selectedOption.dataset.contactPerson || '', false);
      fillField('contactNumberForm', selectedOption.dataset.phone || '', false);
      fillField('contactEmailForm', selectedOption.dataset.email || '', false);
      fillField('contactDesignationForm', selectedOption.dataset.designation || '', false);
      
      showToast(`Ã¢Å“â€œ Loaded: ${selectedOption.dataset.projectName}`, 'success');
    }, 150);
  });
}

function fillField(fieldId, value, isReadOnly = false) {
  const field = document.getElementById(fieldId);
  
  if (!field) {
    console.error(`Ã¢ÂÅ’ Field "${fieldId}" not found!`);
    return;
  }
  
  console.log(`Ã°Å¸â€œÂ Filling ${fieldId} with: "${value}"`);
  
  field.removeAttribute('placeholder');
  field.removeAttribute('disabled');
  field.style.display = '';
  field.style.visibility = 'visible';
  field.style.opacity = '1';
  
  let parent = field.parentElement;
  while (parent && parent !== document.body) {
    if (parent.style.display === 'none') {
      parent.style.display = 'block';
    }
    parent = parent.parentElement;
  }
  
  field.readOnly = isReadOnly;
  
  if (isReadOnly) {
    field.style.cssText += `
      background-color: #f0f0f0 !important;
      color: #333 !important;
      cursor: not-allowed !important;
      border-left: 3px solid #2196F3 !important;
    `;
  } else {
    field.style.cssText += `
      background-color: #f9f9f9 !important;
      color: #333 !important;
      border-left: 3px solid #4CAF50 !important;
    `;
  }
  
  field.value = value;
  field.setAttribute('value', value);
  field.setAttribute('data-filled', 'true');
  
  const events = ['input', 'change', 'blur', 'keyup'];
  events.forEach(eventType => {
    field.dispatchEvent(new Event(eventType, { bubbles: true }));
  });
}

function clearContactFields() {
  const fields = [
    'projectCustomerId',
    'projectDescriptionForm',
    'contactPersonForm',
    'contactNumberForm',
    'contactEmailForm',
    'contactDesignationForm'
  ];
  
  fields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.value = '';
      element.style.backgroundColor = '';
      element.readOnly = false;
    }
  });
  
  console.log('Ã°Å¸Â§Â¹ Fields cleared');
}

// ============================
// LOAD PROJECTS
// ============================

async function loadProjects() {
  try {
    console.log('Ã°Å¸â€œÂ¡ Loading projects...');
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_projects.php');
    const result = await response.json();

    if (result.success && result.data) {
      projectsData = result.data;
      console.log(`Ã¢Å“â€¦ Loaded ${projectsData.length} projects`);
      
      currentPage = 1;
      displayProjectsTable(projectsData);
      return projectsData;
    } else {
      projectsData = [];
      currentPage = 1;
      displayProjectsTable([]);
      showToast('No projects found', 'info');
      return [];
    }
  } catch (err) {
    console.error('Ã¢ÂÅ’ Error loading projects:', err);
    projectsData = [];
    currentPage = 1;
    displayProjectsTable([]);
    showToast('Failed to load projects', 'error');
    return [];
  }
}
async function loadProjectTasksTable() {
  const tableBody = document.getElementById('projectTasksTableBody');
  const tableHead = document.getElementById('projectTasksTableHead');
  
  if (!tableBody) {
    console.error('❌ Tasks table body not found');
    return;
  }

  // Loading indicator
  tableBody.innerHTML = `
    <tr class="loading-state">
      <td colspan="10" style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #5e72e4;"></i>
        <p style="margin-top: 10px; color: #666;">Loading tasks...</p>
      </td>
    </tr>
  `;

  // ✅ Get project, employee, and role data from session storage
  const project = JSON.parse(sessionStorage.getItem('currentProject') || '{}');
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  
  // ✅ FIX: Check projectId FIRST (camelCase from API)
  const projectId = project?.projectId || project?.project_id;
  const employeeId = currentUser?.employeeId || 
                     currentUser?.emp_id || 
                     currentUser?.empid || 
                     sessionStorage.getItem('employeeId');
  
  // ✅ Get user role
  const userRole = currentUser?.role || 
                   currentUser?.user_role || 
                   currentUser?.designation ||
                   sessionStorage.getItem('userRole') || 
                   'employee';

  console.log('📋 Session Data:', {
    project: project,
    currentUser: currentUser,
    projectId: projectId,
    employeeId: employeeId,
    userRole: userRole
  });

  if (!projectId) {
    tableBody.innerHTML = `
      <tr class="error-state">
        <td colspan="10" style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545;"></i>
          <p style="color: #dc3545;">Missing project ID</p>
        </td>
      </tr>
    `;
    console.error('❌ Missing projectId');
    return;
  }

  // ✅ Check if user is Project Head
  const isProjectHead = userRole.toLowerCase().includes('project') || 
                        userRole.toLowerCase().includes('head') || 
                        userRole.toLowerCase().includes('manager');
  
  // ✅ For employees only, require employee_id
  if (!isProjectHead && !employeeId) {
    tableBody.innerHTML = `
      <tr class="error-state">
        <td colspan="10" style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545;"></i>
          <p style="color: #dc3545;">Missing employee ID</p>
        </td>
      </tr>
    `;
    console.error('❌ Missing employeeId for employee role');
    return;
  }

  try {
    // ✅ Build API URL based on role
    let apiUrl = `https://www.fist-o.com/web_crm/get_project_tasks.php?project_id=${projectId}&user_role=${encodeURIComponent(userRole)}`;
    
    // Add employee_id only for non-head roles
    if (!isProjectHead && employeeId) {
      apiUrl += `&employee_id=${employeeId}`;
    }

    console.log('🌐 Fetching from:', apiUrl);
    console.log('👤 View mode:', isProjectHead ? 'PROJECT HEAD - All Tasks' : 'EMPLOYEE - My Tasks');

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 Tasks response:', result);

    if (result.success && result.data && result.data.tasks && result.data.tasks.length > 0) {
      const tasks = result.data.tasks;
      
 if (isProjectHead) {
  // ✅ PROJECT HEAD VIEW - Show Assigned By and Assigned To
  
  // Update table header
  if (tableHead) {
    tableHead.innerHTML = `
      <tr>
        <th style="text-align: center;">S.No</th>
        <th>Tasks / Activities</th>
        <th>Description</th>
        <th style="text-align: center;">Start Date</th>
        <th style="text-align: center;">Start Time</th>
        <th style="text-align: center;">End Date</th>
        <th style="text-align: center;">End Time</th>
        <th style="text-align: center;">Reports</th>
        <th style="text-align: center;">Progress</th>
        <th style="text-align: center;">Status</th>
      </tr>
    `;
  }
  
  // Build table rows
  tableBody.innerHTML = tasks.map((task, index) => {
    const progress = parseInt(task.progress) || 0;
    const statusClass = getStatusClass(task.status);
    const progressColor = getProgressColor(progress);
    const reportSubmitted = task.report_submitted || false;
    
    return `
      <tr>
        <td style="text-align: center; padding: 12px;">${index + 1}</td>
        <td style="padding: 12px;">
          <strong>${task.task_name}</strong>
        </td>
        <td style="padding: 12px;">
          <span class="task-description-cell">${task.task_description || 'No description'}</span>
        </td>
        <td style="text-align: center; padding: 12px;">${formatDateDisplay(task.start_date)}</td>
        <td style="text-align: center; padding: 12px;">${formatTime(task.start_time)}</td>
        <td style="text-align: center; padding: 12px;">${formatDateDisplay(task.end_date)}</td>
        <td style="text-align: center; padding: 12px;">${formatTime(task.end_time)}</td>
        <td style="text-align: center; padding: 12px;">
          <button class="view-reports-btn" onclick="handleViewReports('${task.id}', '${task.task_name.replace(/'/g, "\\'")}')" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 500;">
            View Reports
          </button>
        </td>
        <!-- ✅ FIXED PROGRESS BAR FOR PROJECT HEAD -->
        <td style="text-align: center; padding: 12px; min-width: 160px;">
          <div class="progress-container" style="display: flex; align-items: center; gap: 8px; justify-content: center;">
            <div class="progress-bar-wrapper" style="width: 80px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; flex-shrink: 0;">
              <div class="progress-bar-fill" style="width: ${progress}%; height: 100%; background-color: ${progressColor}; transition: all 0.3s ease;"></div>
            </div>
            <span class="progress-text" style="font-weight: 600; color: ${progressColor}; font-size: 14px; min-width: 45px; text-align: right;">${progress}%</span>
          </div>
        </td>
        <td style="text-align: center; padding: 12px;">
          <span class="status-badge ${statusClass}" style="padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${task.status || 'pending'}</span>
        </td>
      </tr>
    `;
  }).join('');
  
} else {
  // ✅ EMPLOYEE VIEW - SIMPLE S.No ALWAYS SHOWS
  if (tableHead) {
    tableHead.innerHTML = `
      <tr>
        <th style="text-align: center;">S.No</th>
        <th>Tasks / Activities</th>
        <th>Description</th>
        <th style="text-align: center;">Start Date</th>
        <th style="text-align: center;">Start Time</th>
        <th style="text-align: center;">End Date</th>
        <th style="text-align: center;">End Time</th>
        <th style="text-align: center;">Report</th>
        <th style="text-align: center;">Progress</th>
        <th style="text-align: center;">Status</th>
      </tr>
    `;
  }
  
  tableBody.innerHTML = tasks.map((task, index) => {
    const progress = parseInt(task.progress) || 0;
    const statusClass = getStatusClass(task.status);
    
    return `
      <tr>
        <td style="text-align: center; padding: 12px;"><strong>${index + 1}</strong></td>
        <td style="padding: 12px;"><strong>${task.task_name}</strong></td>
        <td style="padding: 12px;">${task.task_description || 'No description'}</td>
        <td style="text-align: center; padding: 12px;">${formatDateDisplay(task.start_date)}</td>
        <td style="text-align: center; padding: 12px;">${formatTime(task.start_time)}</td>
        <td style="text-align: center; padding: 12px;">${formatDateDisplay(task.end_date)}</td>
        <td style="text-align: center; padding: 12px;">${formatTime(task.end_time)}</td>
        <td style="text-align: center; padding: 12px;">
          <button onclick="handleAddReport('${task.id}', '${task.task_name.replace(/'/g, "\\'")}')"
                  style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 500;">
            Add Report
          </button>
        </td>
        <td style="text-align: center; padding: 12px; min-width: 160px;">
          <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
            <div style="width: 100px; height: 6px; background: #e8e8e8; border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${progress}%; background: linear-gradient(90deg, #007bff 0%, #0056b3 100%); transition: width 0.3s ease;"></div>
            </div>
            <span style="font-weight: 600; color: #333; font-size: 14px; min-width: 45px; text-align: right;">${progress}%</span>
          </div>
        </td>
        <td style="text-align: center; padding: 12px;">
          <span class="status-badge ${statusClass}" style="padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${capitalizeFirst(task.status)}</span>
        </td>
      </tr>
    `;
  }).join('');
}



      
      console.log(`✅ Displayed ${tasks.length} tasks for ${isProjectHead ? 'Project Head' : 'Employee'}`);
      
    } else {
      const emptyMessage = isProjectHead 
        ? 'No tasks allocated in this project yet. Click "Add Task" to assign tasks to team members.'
        : 'No tasks assigned to you in this project. Contact your project head for task assignments.';
      
      tableBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="10">
            <div class="empty-content" style="text-align: center; padding: 40px; color: #666;">
              <i class="fas fa-tasks" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
              <p style="font-size: 16px; margin: 10px 0;">${emptyMessage}</p>
            </div>
          </td>
        </tr>
      `;
      console.log(`ℹ️ No tasks found (Role: ${userRole})`);
    }
  } catch (error) {
    tableBody.innerHTML = `
      <tr class="error-state">
        <td colspan="10" style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545;"></i>
          <p style="color: #dc3545; font-size: 16px;">Failed to load tasks</p>
          <small style="color: #999;">${error.message}</small>
        </td>
      </tr>
    `;
    console.error('❌ Error loading tasks:', error);
  }
}

// ✅ Get progress bar color based on percentage
function getProgressColor(progress) {
  progress = parseInt(progress) || 0;
  
  if (progress >= 100) return '#4CAF50'; // Green - Complete
  if (progress >= 75) return '#2196F3';  // Blue
  if (progress >= 50) return '#FF9800';  // Orange
  if (progress >= 25) return '#FFC107';  // Yellow
  return '#F44336'; // Red - Low progress
}

// ✅ Get status badge class based on status
function getStatusClass(status) {
  if (!status) return 'status-pending';
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'completed') return 'status-completed';
  if (statusLower.includes('progress') || statusLower === 'ongoing') return 'status-inprogress';
  if (statusLower === 'pending') return 'status-pending';
  if (statusLower === 'delayed' || statusLower === 'overdue') return 'status-delayed';
  
  return 'status-pending';
}

// ============================================
// HANDLE ADD REPORT - FETCH DESCRIPTION FROM SESSION
// ============================================
async function handleAddReport(taskId, taskName) {
  console.log('📝 Add report for task:', taskId, taskName);
  
  sessionStorage.setItem('currentTaskId', taskId);
  sessionStorage.setItem('currentTaskName', taskName);
  sessionStorage.setItem('modalMode', 'add');
  
  const projectData = getProjectSession();
  const projectName = projectData?.project_name || projectData?.projectName || 'Project';
  const projectDescription = projectData?.project_description || projectData?.projectDescription || projectData?.description || '';
  
  sessionStorage.setItem('projectDescription', projectDescription);
  
  // Current date and time
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const dateTimeDisplay = `${currentDate} | ${currentTime}`;
  
  // Set form fields
  document.getElementById('reportTaskName').value = taskName;
  document.getElementById('reportTaskDesc').value = projectDescription;
  
  // ✅ FETCH LATEST PROGRESS
  try {
    const response = await fetch(`https://www.fist-o.com/web_crm/get-task-reports.php?taskId=${taskId}`);
    const data = await response.json();
    
    if (data.success && data.reports && data.reports.length > 0) {
      // Get the latest report (first one)
      const latestReport = data.reports[0];
      const latestProgress = latestReport.progress || 0;
      
      // ✅ SET MINIMUM PROGRESS (can't go below this)
      minimumProgress = latestProgress;

      // ✅ PRE-FILL PROGRESS WITH LATEST VALUE
      document.getElementById('reportProgress').value = latestProgress;
      console.log('✅ Pre-filled progress with latest value:', latestProgress);
    } else {
      // No previous reports, start from 0
      document.getElementById('reportProgress').value = 0;
    }
  } catch (error) {
    console.error('Error fetching latest progress:', error);
    document.getElementById('reportProgress').value = 0;
  }
  
  // Set project title and date/time
  document.getElementById('addReportProjectTitle').textContent = projectName;
  const dateElement = document.getElementById('addReportDate');
  if (dateElement) {
    dateElement.textContent = dateTimeDisplay;
  }
  
  // Show form, hide history
  document.getElementById('reportFormView').style.display = 'block';
  document.getElementById('reportHistoryView').style.display = 'none';
  
  // Open modal
  const modal = document.getElementById('addReportModal');
  modal.setAttribute('style', 'display: flex !important; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 999999; align-items: center; justify-content: center;');
  document.body.style.overflow = 'hidden';
  
  console.log('✅ Modal opened with project:', projectName, 'and time:', dateTimeDisplay);
}

// ✅ VALIDATE PROGRESS ON CHANGE
function validateProgressOnChange() {
  const progressInput = document.getElementById('reportProgress');
  const currentValue = parseInt(progressInput.value) || 0;
  const decreaseError = document.getElementById('progressDecreaseError');
  const minProgressValue = document.getElementById('minProgressValue');
  
  // Hide error initially
  decreaseError.style.display = 'none';
  
  // ✅ CHECK IF USER TRIED TO DECREASE PROGRESS
  if (currentValue < minimumProgress) {
    // ❌ PREVENT DECREASE - RESET TO MINIMUM
    progressInput.value = minimumProgress;
    minProgressValue.textContent = minimumProgress;
    decreaseError.style.display = 'block';
    
    console.warn(`❌ User tried to decrease progress from ${minimumProgress}% to ${currentValue}%`);
    showToast(`Progress cannot decrease! Minimum is ${minimumProgress}%`, 'warning');
    return false;
  }
  
  // ✅ Allow increase
  console.log(`✅ Progress valid: ${currentValue}%`);
  return true;
}



// ============================================
// HANDLE VIEW REPORTS
// ============================================
function handleViewReports(taskId, taskName) {
  console.log('📊 View reports for task:', taskId, taskName);
  
  sessionStorage.setItem('currentTaskId', taskId);
  sessionStorage.setItem('currentTaskName', taskName);
  
  const projectData = getProjectSession();
  const projectName = projectData?.project_name || projectData?.projectName || 'Project';
  
  // Get current date and time
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const dateTimeDisplay = `${currentDate} | ${currentTime}`;
  
  // Set modal header
  const titleElement = document.getElementById('viewReportProjectTitle');
  const dateElement = document.getElementById('viewReportDate');
  const taskNameElement = document.getElementById('viewReportTaskName');
  
  if (titleElement) titleElement.textContent = projectName;
  if (dateElement) dateElement.textContent = dateTimeDisplay;
  if (taskNameElement) taskNameElement.textContent = taskName;
  
  loadViewReportHistory(taskId, taskName);
  
  const modal = document.getElementById('viewReportModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}


// ============================================
// CLOSE MODALS
// ============================================
function closeAddReportModal() {
  const modal = document.getElementById('addReportModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}


function closeViewReportModal() {
  const modal = document.getElementById('viewReportModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// ============================================
// TOGGLE HISTORY VIEW
// ============================================
function toggleHistoryView() {
  const formView = document.getElementById('reportFormView');
  const historyView = document.getElementById('reportHistoryView');
  const historyBtnText = document.getElementById('historyBtnText');
  const submitBtn = document.querySelector('.submit-btn');
  
  if (!formView || !historyView) {
    console.error('❌ Modal elements not found');
    return;
  }
  
  if (formView.style.display === 'none') {
    // Show form, hide history
    formView.style.display = 'block';
    historyView.style.display = 'none';
    if (historyBtnText) historyBtnText.textContent = 'History';
    if (submitBtn) submitBtn.style.display = 'inline-block';
  } else {
    // Show history, hide form
    formView.style.display = 'none';
    historyView.style.display = 'block';
    if (historyBtnText) historyBtnText.textContent = 'Back to Form';
    if (submitBtn) submitBtn.style.display = 'none';
    loadTaskHistory(sessionStorage.getItem('currentTaskId'), sessionStorage.getItem('currentTaskName'));
  }
}

// ============================================
// SUBMIT REPORT - WITH ERROR HANDLING & DEBUG
// ============================================
function submitAddReport() {
  const taskId = sessionStorage.getItem('currentTaskId');
  const taskName = sessionStorage.getItem('currentTaskName');
  const projectDescription = sessionStorage.getItem('projectDescription');
  let progress = document.getElementById('reportProgress')?.value;
  let status = document.getElementById('reportStatus')?.value;
  const comments = document.getElementById('comments')?.value;
  const empId = sessionStorage.getItem('employeeId');
  
  // Get error message elements
  const progressError = document.getElementById('progressError');
  const statusError = document.getElementById('statusError');
  const commentsError = document.getElementById('commentsError');
  
  // Hide all errors initially
  if (progressError) progressError.style.display = 'none';
  if (statusError) statusError.style.display = 'none';
  if (commentsError) commentsError.style.display = 'none';
  
  let hasErrors = false;
  
    // ✅ VALIDATE PROGRESS
  if (!progress || progress === '') {
    if (progressError) progressError.style.display = 'block';
    hasErrors = true;
  }
  
  progress = parseInt(progress) || 0;
  
  // ✅ CHECK IF TRYING TO DECREASE
  if (progress < minimumProgress) {
    if (decreaseError) {
      document.getElementById('minProgressValue').textContent = minimumProgress;
      decreaseError.style.display = 'block';
    }
    hasErrors = true;
  }
  
  // ✅ VALIDATE STATUS
  if (!status || status === '') {
    if (statusError) statusError.style.display = 'block';
    hasErrors = true;
  }
  
  // ✅ VALIDATE COMMENTS
  if (!comments || !comments.trim()) {
    if (commentsError) commentsError.style.display = 'block';
    hasErrors = true;
  }
  
  // ✅ STOP IF ERRORS
  if (hasErrors) {
    showToast('Please fill all required fields', 'error');
    return;
  }
  
  if (!taskId || !taskName) {
    showToast('Task information missing', 'error');
    return;
  }
  
  if (!empId) {
    showToast('Employee ID not found in session', 'error');
    return;
  }
  
  progress = parseInt(progress);
  
  // ✅ AUTO-CHANGE STATUS TO COMPLETED IF PROGRESS IS 100%
  if (progress === 100) {
    status = 'Completed';
    document.getElementById('reportStatus').value = 'Completed';
    console.log('✅ Progress is 100%, auto-changing status to Completed');
  }
  
  const reportData = {
    taskId: parseInt(taskId),
    taskName: taskName,
    projectDescription: projectDescription,
    progress: progress,
    status: status,
    comments: comments,
    empId: empId
  };
  
  console.log('📋 Final data to send:', reportData);
  
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn?.textContent || 'Submit';
  if (submitBtn) {
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
  }
  
  fetch('https://www.fist-o.com/web_crm/submit-report.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  })
  .then(response => response.text().then(text => ({ status: response.status, text: text })))
  .then(({ status, text }) => {
    console.log('📨 Response status:', status);
    console.log('📨 Raw response:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('✅ Parsed JSON:', data);
      
      if (data.success || data.status === 'success') {
        showToast('Report submitted successfully!', 'success');
        
        // Clear form
        document.getElementById('reportProgress').value = '';
        document.getElementById('reportStatus').value = '';
        document.getElementById('comments').value = '';
        
        // Hide errors
        if (progressError) progressError.style.display = 'none';
        if (statusError) statusError.style.display = 'none';
        if (commentsError) commentsError.style.display = 'none';
        
        // Close modal
        closeAddReportModal();
        
        // Update table
        console.log('🔄 Updating table row with new progress and status...');
        updateTaskProgressInTable(parseInt(taskId), progress, status);
        
        // Reload table
        setTimeout(() => {
          console.log('🔄 Reloading tasks table...');
          loadProjectTasksTable();
        }, 1000);
        
      } else {
        console.error('❌ Error from server:', data.message || data.errors);
        showToast(data.message || 'Failed to submit', 'error');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON');
      console.error('❌ Error:', parseError.message);
      console.error('❌ Response text:', text);
      showToast('Server returned invalid response. Check PHP syntax!', 'error');
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
    showToast('Network error: ' + error.message, 'error');
  })
  .finally(() => {
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}


// ============================================
// UPDATE TASK PROGRESS IN TABLE ROW
// ============================================
function updateTaskProgressInTable(taskId, newProgress, newStatus) {
  try {
    // ✅ VALIDATE inputs
    if (!taskId || newProgress === undefined || newProgress === null) {
      console.error('❌ Invalid parameters:', { taskId, newProgress, newStatus });
      return;
    }
    
    // ✅ Ensure newProgress is a number
    newProgress = parseInt(newProgress) || 0;
    
    // ✅ Ensure newStatus is a string (default to empty if not provided)
    if (newStatus === null || newStatus === undefined) {
      newStatus = '';
      console.warn('⚠️ Status is null/undefined, using empty string');
    }
    
    // ✅ Convert to string if it's not already
    newStatus = String(newStatus).trim();
    
    const progressColor = getProgressColor(newProgress);
    
    // Find all rows in the table
    const rows = document.querySelectorAll('tbody tr');
    
    console.log(`🔄 Updating table with progress: ${newProgress}%, status: ${newStatus}`);
    
    rows.forEach((row, index) => {
      // Look for the progress bar in this row
      const progressContainer = row.querySelector('.progress-container');
      
      if (progressContainer) {
        // Find the progress bar fill and text
        const progressBarFill = progressContainer.querySelector('.progress-bar-fill');
        const progressText = progressContainer.querySelector('.progress-text');
        
        if (progressBarFill) {
          // ✅ UPDATE PROGRESS BAR WIDTH
          progressBarFill.style.width = newProgress + '%';
          progressBarFill.style.backgroundColor = progressColor;
          progressBarFill.style.transition = 'all 0.5s ease';
          
          console.log(`✅ Updated progress bar to ${newProgress}%`);
        }
        
        if (progressText) {
          // ✅ UPDATE PROGRESS PERCENTAGE TEXT
          progressText.textContent = newProgress + '%';
          progressText.style.color = progressColor;
          
          console.log(`✅ Updated progress text to ${newProgress}%`);
        }
      }
      
      // Also update status badge if present
      const statusBadge = row.querySelector('.status-badge');
      if (statusBadge && newStatus) {
        // ✅ SAFELY get status class
        let statusClass = 'status-pending'; // Default
        
        if (newStatus && typeof newStatus === 'string') {
          const statusLower = newStatus.toLowerCase();
          
          if (statusLower === 'completed') {
            statusClass = 'status-completed';
          } else if (statusLower.includes('progress') || statusLower === 'ongoing') {
            statusClass = 'status-inprogress';
          } else if (statusLower === 'pending') {
            statusClass = 'status-pending';
          } else if (statusLower === 'delayed' || statusLower === 'overdue') {
            statusClass = 'status-delayed';
          }
        }
        
        // ✅ Update the status badge
        statusBadge.className = 'status-badge ' + statusClass;
        statusBadge.textContent = capitalizeFirst(newStatus);
        
        console.log(`✅ Updated status to ${newStatus} with class ${statusClass}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating table row:', error);
    console.error('Stack:', error.stack);
  }
}

// ============================================
// LOAD TASK HISTORY
// ============================================
function loadTaskHistory(taskId, taskName) {
  const tableBody = document.getElementById('historyTableBody');
  
  if (!tableBody) {
    console.error('❌ historyTableBody not found');
    return;
  }
  
  if (!taskId || taskId === 'undefined' || taskId === 'null') {
    console.error('❌ Invalid taskId:', taskId);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: #dc3545;">
          <i class="fas fa-exclamation-circle"></i> 
          Error: Task ID is invalid
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
  
  const numericTaskId = parseInt(taskId);
  
  if (isNaN(numericTaskId)) {
    console.error('❌ taskId is not a valid number:', taskId);
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: #dc3545;">
          <i class="fas fa-exclamation-circle"></i> 
          Error: Task ID must be a number
        </td>
      </tr>
    `;
    return;
  }
  
  const apiUrl = `https://www.fist-o.com/web_crm/get-task-reports.php?taskId=${numericTaskId}`;
  console.log('🔗 Fetching from:', apiUrl);
  
  fetch(apiUrl)
    .then(response => {
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    })
    .then(data => {
      console.log('📋 History response:', data);
      
      if (data.success && data.reports && data.reports.length > 0) {
        // ✅ FIXED: Generate S.No from index instead of report.sno
        tableBody.innerHTML = data.reports.map((report, index) => `
          <tr>
            <td style="text-align: center;"><strong>${index + 1}</strong></td>
            <td>${report.task || taskName}</td>
            <td style="text-align: center;">${report.progress || 0}%</td>
            <td style="text-align: center;">${report.status || 'N/A'}</td>
            <td>${report.outcome || report.comments || '-'}</td>
            <td>${report.date || '-'}</td>
          </tr>
        `).join('');
        console.log(`✅ Displayed ${data.reports.length} reports`);
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px;">
              <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 10px;"></i>
              <p style="color: #999; font-size: 14px; margin: 10px 0;">No data's are available now</p>
              <small style="color: #bbb;">No reports submitted yet for this task</small>
            </td>
          </tr>
        `;
        console.log('ℹ️ No reports found for this task');
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">
            <i class="fas fa-exclamation-circle" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            <p style="margin: 10px 0;">Error loading reports</p>
            <small>${error.message}</small>
          </td>
        </tr>
      `;
    });
}




function loadViewReportHistory(taskId, taskName) {
  const tableBody = document.getElementById('viewHistoryTableBody');
  
  if (!tableBody) {
    console.error('❌ viewHistoryTableBody not found');
    return;
  }
  
  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
  
  fetch(`https://www.fist-o.com/web_crm/get-task-reports.php?taskId=${taskId}`)
    .then(response => response.json())
    .then(data => {
      console.log('📊 View report history response:', data);
      
      if (data.success && data.reports && data.reports.length > 0) {
        // ✅ FIXED: Generate S.No from index instead of report.sno
        tableBody.innerHTML = data.reports.map((report, index) => `
          <tr>
            <td style="text-align: center;"><strong>${index + 1}</strong></td>
            <td>${report.task || taskName}</td>
            <td style="text-align: center;">${report.progress || 0}%</td>
            <td style="text-align: center;">${report.status || 'N/A'}</td>
            <td>${report.outcome || report.comments || '-'}</td>
            <td>${report.date || '-'}</td>
          </tr>
        `).join('');
        console.log(`✅ Displayed ${data.reports.length} reports`);
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px;">
              <i class="fas fa-inbox" style="font-size: 48px; color: #ddd; display: block; margin-bottom: 10px;"></i>
              <p style="color: #999; font-size: 14px; margin: 10px 0;">No data's are available now</p>
              <small style="color: #bbb;">No reports have been submitted yet</small>
            </td>
          </tr>
        `;
        console.log('ℹ️ No reports found');
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">
            <i class="fas fa-exclamation-circle" style="font-size: 48px; display: block; margin-bottom: 10px;"></i>
            <p style="margin: 10px 0;">Error loading reports</p>
            <small>${error.message}</small>
          </td>
        </tr>
      `;
    });
}




function updateTaskAllocationUI() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userRole = currentUser?.role || 
                   currentUser?.user_role || 
                   currentUser?.designation || 
                   'employee';
  
  const isProjectHead = userRole.toLowerCase().includes('project') || 
                        userRole.toLowerCase().includes('head') || 
                        userRole.toLowerCase().includes('manager');
  
  // Show/hide "Add Task" button
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) {
    addTaskBtn.style.display = isProjectHead ? 'inline-block' : 'none';
  }
  
  console.log('🎭 Role-based UI updated:', { userRole, isProjectHead });
}

// Helper functions
function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
function formatTime(timeStr) {
  if (!timeStr) return '-';
  
  // If already in HH:MM:SS format, convert to AM/PM
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const min = minutes || '00';
    
    if (hour === 0) return `12:${min} AM`;
    if (hour < 12) return `${hour}:${min} AM`;
    if (hour === 12) return `12:${min} PM`;
    return `${hour - 12}:${min} PM`;
  }
  
  return timeStr;
}



// Usage
loadProjectTasksTable();


// ============================
// UPDATE TABLE DISPLAY FUNCTION
// ============================

function displayProjectsTable(projects) {
  const tableBody = document.getElementById('projectsListTableBody');
  const projectCount = document.getElementById('projectCount');

  if (!tableBody) {
    console.error('âŒ Table body element not found');
    return;
  }

  if (projectCount) {
    projectCount.textContent = projects.length;
  }

  tableBody.innerHTML = '';

  if (projects.length === 0) {
    tableBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
          <div class="empty-content">
            <i class="fas fa-project-diagram"></i>
            <p>No projects found</p>
            <small>Click "New Project" to get started</small>
          </div>
        </td>
      </tr>
    `;
    updatePaginationControls(0);
    configureProjectPageByRole();
    return;
  }

  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  console.log(`ðŸ“„ Displaying page ${currentPage}: ${paginatedProjects.length} of ${projects.length} projects`);

  // âœ… Get designation - try both methods
  let designation = sessionStorage.getItem('designation');
  if (!designation) {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      designation = currentUser.designation;
    } catch (e) {
      console.error('Error parsing currentUser:', e);
    }
  }
  
  console.log('ðŸ” Table rendering with designation:', designation);

  paginatedProjects.forEach((project, index) => {
    const projectName = project.projectName || project.project_name || 'N/A';
    const reportingPerson = project.reportingPerson || project.reporting_person || 'N/A';
    const startDate = project.startDate || project.start_date || '';
    const completionDate = project.completionDate || project.completion_date || '';
    const projectId = project.projectId || project.project_id || project.id || index;

    // âœ… Conditionally render delete button only for ProjectHead
    const deleteButtonHTML = designation === 'ProjectHead' 
      ? `<button class="action-btn delete-btn" onclick="confirmDeleteProject('${projectId}', '${escapeHtml(projectName)}')" title="Delete Project">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <polyline points="3 6 5 6 21 6"></polyline>
             <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
           </svg>
           Delete
         </button>`
      : ''; // âœ… Empty for other designations

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="project-name-cell">
          <span class="project-title">${escapeHtml(projectName)}</span>
        </div>
      </td>
      <td>${escapeHtml(reportingPerson)}</td>
      <td>${formatDate(startDate)}</td>
      <td>${formatDate(completionDate)}</td>
      <td>
        <button class="action-btn view-btn" onclick="viewProject('${projectId}')" title="View Project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View
        </button>
        ${deleteButtonHTML}
      </td>
    `;
    tableBody.appendChild(row);
  });

  updatePaginationControls(projects.length);
  configureProjectPageByRole(); // âœ… Apply additional restrictions
}

// ============================
// PAGINATION CONTROLS
// ============================

function updatePaginationControls(totalProjects) {
  const totalPages = Math.ceil(totalProjects / projectsPerPage);
  const paginationNumbers = document.getElementById('paginationNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  if (!paginationNumbers || !prevBtn || !nextBtn) {
    console.error('Ã¢ÂÅ’ Pagination elements not found!');
    return;
  }

  paginationNumbers.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i.toString().padStart(2, '0');
    pageBtn.onclick = () => goToPage(i);
    paginationNumbers.appendChild(pageBtn);
  }

  prevBtn.disabled = currentPage === 1;
  prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
  prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
  
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
  nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';

  console.log(`Ã°Å¸â€œÅ  Pagination: Page ${currentPage} of ${totalPages}`);
}

function goToPage(page) {
  const totalPages = Math.ceil(projectsData.length / projectsPerPage);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  
  console.log(`Ã°Å¸â€â€ž Going to page ${page}`);
  currentPage = page;
  displayProjectsTable(projectsData);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// VIEW PROJECT (WITH SESSION STORAGE)
// ============================

async function viewProject(projectId) {
  try {
    showLoadingSpinner();
    
    console.log('Ã°Å¸â€Â Fetching project with ID:', projectId);
    
    const response = await fetch(`https://www.fist-o.com/web_crm/fetch_projects.php?project_id=${projectId}`);
    const result = await response.json();
    
    hideLoadingSpinner();
    
    if (result.success && result.data && result.data.length > 0) {
      const project = result.data[0];
      
      console.log('Ã°Å¸â€œÂ¦ ===== FULL PROJECT DATA =====');
      console.log(JSON.stringify(project, null, 2));
      console.log('Ã°Å¸â€œÂ¦ =============================');
      
      // Check all possible ID fields
      console.log('Ã°Å¸â€Â Checking ID fields:');
      console.log('  - project.id:', project.id, typeof project.id);
      console.log('  - project.projectId:', project.projectId, typeof project.projectId);
      console.log('  - project.project_id:', project.project_id, typeof project.project_id);
      
      // STORE PROJECT IN SESSION
      storeProjectSession(project);
      
      // CRITICAL: Store the NUMERIC id for API calls
      const numericId = project.id;
      const stringProjectId = project.projectId || project.project_id || projectId;
      
      if (!numericId) {
        console.error('Ã¢ÂÅ’ No numeric ID found in project data');
        console.error('Available fields:', Object.keys(project));
        showToast('Error: Project structure issue. Check console.', 'error');
        return;
      }
       // Load project tasks
      loadProjectTasksTable(projectId);
      
      
      currentProjectId = numericId;
      window.currentProjectId = numericId;
      window.projectStringId = stringProjectId;
      
      console.log('Ã¢Å“â€¦ Set currentProjectId (numeric for API):', numericId, typeof numericId);
      console.log('Ã¢Å“â€¦ Set projectStringId (for display):', stringProjectId);
      
      showProjectDetailView(project);
    } else {
      showToast('Project not found', 'error');
    }
  } catch (err) {
    hideLoadingSpinner();
    console.error('Error fetching project:', err);
    showToast('Failed to load project details', 'error');
  }
}

// ============================
// SHOW PROJECT DETAIL VIEW
// ============================

// At the top of your file
let projectOverviewAllocatedEmployees = [];

// Update your showProjectDetailView function
async function showProjectDetailView(project) {
    const listView = document.getElementById('projects-list-view');
    const detailView = document.getElementById('project-detail-view');

    if (listView) listView.style.display = 'none';
    if (detailView) {
        detailView.style.display = 'block';
        const projectId = project.projectId || project.project_id || project.id;
        if (projectId) {
            detailView.setAttribute('data-project-id', projectId);
        }
    }

    const breadcrumbName = document.getElementById('breadcrumbProjectName');
    if (breadcrumbName) {
        breadcrumbName.textContent = project.projectName || 'Project';
    }

  const projectId = project.projectId || project.project_id || project.id;
  if (projectId) {
    currentProjectId = projectId;
    window.currentProjectId = projectId;
    
    // ✅ Update UI based on role
  updateTaskAllocationUI();
  
  // ✅ Load tasks
  await loadProjectTasksTable();
    
    // ✅ Fetch statistics
    await fetchProjectStatistics(projectId);
  }

    populateProjectDetails(project);
    setupProjectDetailTabs();

    // CLEAR OLD DATA
    projectOverviewAllocatedEmployees = [];
    
    // Fetch employees using YOUR PHP endpoint
    try {
        const response = await fetch(`https://www.fist-o.com/web_crm/get_allocated_employees.php?project_id=${projectId}`);
        const data = await response.json();
        
        console.log('ðŸ“¥ API Response:', data);
        
        if (data.success && data.data && Array.isArray(data.data.employees)) {
            projectOverviewAllocatedEmployees = data.data.employees.map(emp => ({
                id: emp.emp_id,
                name: emp.emp_name,
                avatar: './assets/Images/profile.webp',
                initial: emp.emp_name ? emp.emp_name[0].toUpperCase() : 'U'
            }));
            console.log('âœ… Mapped', projectOverviewAllocatedEmployees.length, 'employees');
        } else {
            console.warn('âš ï¸ No employees found or invalid response');
        }
    } catch (error) {
        console.error('âŒ Error fetching employees:', error);
    }

    updateProjectOverviewEmployeeAvatars();
      
  // âœ… ADD THIS LINE AT THE END
  configureProjectOverviewByRole();

    const initiatorElement = document.getElementById('initiatorName');
    if (initiatorElement) {
        initiatorElement.textContent = project.initiated_by || "N/A";
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


async function fetchProjectStatistics(projectId) {
  // ✅ Validate projectId before making the call
  if (!projectId || projectId === 'undefined' || projectId === 'null') {
    console.error('❌ Invalid projectId:', projectId);
    console.error('❌ Cannot fetch statistics without valid project ID');
    
    // Don't reset to 0, just return
    return;
  }

  try {
    console.log('📊 Fetching statistics for project:', projectId);
    console.log('🔗 URL:', `https://www.fist-o.com/web_crm/get_project_statistics.php?project_id=${projectId}`);

    const response = await fetch(
      `https://www.fist-o.com/web_crm/get_project_statistics.php?project_id=${projectId}`,
      {
        method: 'GET'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 Statistics API Full Response:', JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      console.log('✅ Stats data received:', result.data);
      
      // ✅ Pass the data object directly
      updateProjectStats(result.data);
      
    } else {
      console.error('❌ API returned error:', result.message || 'Unknown error');
      console.error('❌ Full response:', result);
      
      // ❌ DON'T reset to 0 on error - keep previous values
      // Just log the error
    }
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    console.error('❌ Error stack:', error.stack);
    
    // ❌ DON'T reset to 0 on error - keep previous values
  }
}



// Avatar rendering function
function updateProjectOverviewEmployeeAvatars() {
    const container = document.getElementById('projectOverviewEmployeeAvatars');
    if (!container) {
        console.error('âŒ Container not found');
        return;
    }
    
    const totalEmployees = projectOverviewAllocatedEmployees?.length || 0;
    console.log('ðŸŽ¨ Rendering', totalEmployees, 'employee avatars');
    
    container.innerHTML = '';
    
    if (totalEmployees === 0) {
        console.log('âœ… No employees to show');
        return;
    }
    
    // Show up to 4 employees, or 3 + "4+" if more than 4
    if (totalEmployees <= 4) {
        // Show all employees (1-4)
        projectOverviewAllocatedEmployees.forEach((emp) => {
            const avatar = document.createElement('div');
            avatar.className = 'project-overview-avatar-circle';
            const img = document.createElement('img');
            img.src = emp.avatar;
            img.alt = emp.name;
            img.className = 'avatar-img';
            avatar.appendChild(img);
            container.appendChild(avatar);
        });
        console.log(`âœ… Showed ${totalEmployees} avatars`);
    } else {
        // Show first 3 + "4+" badge
        projectOverviewAllocatedEmployees.slice(0, 3).forEach((emp) => {
            const avatar = document.createElement('div');
            avatar.className = 'project-overview-avatar-circle';
            const img = document.createElement('img');
            img.src = emp.avatar;
            img.alt = emp.name;
            img.className = 'avatar-img';
            avatar.appendChild(img);
            container.appendChild(avatar);
        });
        
        const extraAvatar = document.createElement('div');
        extraAvatar.className = 'project-overview-avatar-circle project-overview-extra-count';
        extraAvatar.textContent = '4+';
        container.appendChild(extraAvatar);
        console.log('âœ… Showed 3 avatars + 4+ badge');
    }
    
}






// ============================
// POPULATE PROJECT DETAILS
// ============================

function populateProjectDetails(project) {
  const projectNameTitle = document.getElementById('projectNameTitle');
  if (projectNameTitle) projectNameTitle.textContent = project.projectName || 'N/A';
  
  const projectDescription = document.getElementById('projectDescription');
  if (projectDescription) projectDescription.textContent = project.projectDescription || 'No description available.';
  
  const projectStartDate = document.getElementById('projectStartDate');
  if (projectStartDate) projectStartDate.textContent = formatDate(project.startDate);
  
  const projectDeadlineDate = document.getElementById('projectDeadlineDate');
  if (projectDeadlineDate) projectDeadlineDate.textContent = formatDate(project.completionDate);
  
  const reportingPerson = document.getElementById('teamHeadName');
  if (reportingPerson) reportingPerson.textContent = project.reportingPerson || 'N/A';
  
  const projectId = project.projectId || project.project_id || project.id;
  if (projectId) {
    currentProjectId = projectId;
    window.currentProjectId = projectId;
    console.log('Ã¢Å“â€¦ Project ID stored from details:', projectId);
  }
  
  // updateProjectStats({
  //   assignedEmployees: 0,
  //   totalTasks: 0,
  //   completedTasks: 0,
  //   ongoingTasks: 0,
  //   delayedTasks: 0,
  //   overdueTasks: 0
  // });
  
  // loadProjectTasksTable(projectId);
  
}

// ============================
// UPDATE PROJECT STATS
// ============================

function updateProjectStats(stats) {
  console.log('🔄 UPDATE STATS CALLED');
  console.log('📊 Stats Received:', stats);

  // Map of element IDs to their stat values
  const elements = {
    'assignedEmployeesCount': stats.assignedEmployees || 0,
    'totalTasksCount': stats.totalTasks || 0,
    'completedTasksCount': stats.completedTasks || 0,
    'ongoingTasksCount': stats.ongoingTasks || 0,
    'delayedTasksCount': stats.delayedTasks || 0,
    'overdueTasksCount': stats.overdueTasks || 0
  };

  console.log('🎯 Elements to Update:', elements);

  // Update each stat card
  Object.keys(elements).forEach(id => {
    const element = document.getElementById(id);
    const value = elements[id];
    
    console.log(`Updating ${id}:`, {
      found: !!element,
      value: value,
      currentText: element?.textContent
    });

    if (element) {
      // Animate the number change
      const currentValue = parseInt(element.textContent) || 0;
      animateValue(element, currentValue, value, 500);
      console.log(`✅ ${id} updated to ${value}`);
    } else {
      console.error(`❌ Element NOT FOUND: ${id}`);
    }
  });

  console.log('✅ UPDATE STATS COMPLETE');
}

// Helper function to animate number changes
function animateValue(element, start, end, duration) {
  if (start === end) {
    element.textContent = end;
    return;
  }

  const range = end - start;
  const increment = range / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = end;
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}


// ============================
// LOAD PROJECT TASKS
// ============================

// async function loadProjectTasksTable() {
//   const tableBody = document.getElementById('projectTasksTableBody');
//   if (!tableBody) {
//     console.error('Tasks table body not found');
//     return;
//   }

//   // Show loading state
//   tableBody.innerHTML = `
//     <tr class="loading-state">
//       <td colspan="7" style="text-align: center; padding: 40px;">
//         <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #5e72e4;"></i>
//         <p style="margin-top: 10px; color: #666;">Loading tasks...</p>
//       </td>
//     </tr>
//   `;

//   // Parse session storage for project and current user
//   const projectData = JSON.parse(sessionStorage.getItem('currentProject'));
//   const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

//   // The correct field for your project ID (see your session example)
//   const projectId = projectData?.project_id || projectData?.projectid;
//   // The correct field for your employee ID (see your session example)
//   const employeeId = currentUser?.employeeid || currentUser?.empid;

//   if (!projectId || !employeeId) {
//     tableBody.innerHTML = `
//       <tr class="error-state">
//         <td colspan="7" style="text-align: center; padding: 40px;">
//           <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545; margin-bottom: 10px; display: block;"></i>
//           <p style="color: #dc3545; font-size: 16px; margin: 10px 0;">Missing project or employee ID</p>
//           <small style="color: #999;">Cannot fetch tasks</small>
//         </td>
//       </tr>
//     `;
//     console.error('Missing projectId or employeeId from session storage');
//     return;
//   }

//   try {
//     // Call the backend endpoint with correct parameter names
//     const response = await fetch(
//       `https://www.fist-o.com/web_crm/get_project_tasks.php?project_id=${projectId}&employee_id=${employeeId}`
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Tasks response:', result);

//     if (
//       result.success &&
//       result.data &&
//       result.data.tasks &&
//       result.data.tasks.length > 0
//     ) {
//       const tasks = result.data.tasks;
//       tableBody.innerHTML = tasks
//         .map((task, index) => `
//           <tr>
//             <td>${index + 1}</td>
//             <td>
//               <div class="task-title-cell">
//                 <strong>${task.task_name}</strong>
//                 <small style="display: block; color: #999; margin-top: 4px;">${task.task_description}</small>
//               </div>
//             </td>
//             <td>
//               <span class="team-badge">${task.team_name}</span>
//             </td>
//             <td>
//               <div style="display: flex; flex-direction: column;">
//                 <strong>${task.assigned_to_name}</strong>
//                 <small style="color: #999;">${task.assigned_to_emp_id}</small>
//               </div>
//             </td>
//             <td>
//               <div style="display: flex; flex-direction: column;">
//                 <span>${formatDateDisplay(task.start_date)}</span>
//                 <small style="color: #666;">${formatTime(task.start_time)}</small>
//               </div>
//             </td>
//             <td>
//               <div style="display: flex; flex-direction: column;">
//                 <span>${formatDateDisplay(task.end_date)}</span>
//                 <small style="color: #666;">${formatTime(task.end_time)}</small>
//               </div>
//             </td>
//             <td>
//               <span class="status-badge status-${task.status?.toLowerCase() || ''}">${capitalizeFirst(task.status)}</span>
//             </td>
//           </tr>
//         `)
//         .join('');
//       console.log(`Displayed ${tasks.length} tasks`);
//     } else {
//       tableBody.innerHTML = `
//         <tr class="empty-state">
//           <td colspan="7">
//             <div class="empty-content" style="text-align: center; padding: 40px; color: #666;">
//               <i class="fas fa-tasks" style="font-size: 48px; color: #ccc; margin-bottom: 10px; display: block;"></i>
//               <p style="font-size: 16px; margin: 10px 0;">No tasks found</p>
//               <small style="color: #999;">Click "Add Task" to get started</small>
//             </div>
//           </td>
//         </tr>
//       `;
//       console.log('No tasks found for this project');
//     }
//   } catch (error) {
//     tableBody.innerHTML = `
//       <tr class="error-state">
//         <td colspan="7" style="text-align: center; padding: 40px;">
//           <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545; margin-bottom: 10px; display: block;"></i>
//           <p style="color: #dc3545; font-size: 16px; margin: 10px 0;">Failed to load tasks</p>
//           <small style="color: #999;">${error.message}</small>
//         </td>
//       </tr>
//     `;
//     console.error('Error loading tasks:', error);
//   }
// }

// // Helpers (reuse or adjust as per your app)
// function formatDateDisplay(dateStr) {
//   if (!dateStr) return '-';
//   const d = new Date(dateStr);
//   return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
// }
// function formatTime(timeStr) {
//   return timeStr ? timeStr : '-';
// }
// function capitalizeFirst(str) {
//   return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
// }

// // Usage: call this on detail view load, etc.
// loadProjectTasksTable();



// Capitalize first letter
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================
// SHOW PROJECTS LIST
// ============================

function showProjectsList() {
  document.getElementById('project-detail-view').style.display = 'none';
  document.getElementById('projects-list-view').style.display = 'block';
  clearProjectSession();
  currentProjectId = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// PROJECT FORM HANDLERS
// ============================

function openProjectForm() {
  console.log("Opening project form...");
  const modal = document.getElementById("addProjectModal");
  if (modal) {
    // Show the modal
    modal.classList.add("show");
    modal.style.display = "block";
  }

  // Reset the form
  const form = document.getElementById("projectForm");
  if (form) {
    form.reset();
    clearContactFields(); // Reset contact-related fields as well
  }

  // Always reload the dropdown data to ensure latest clients/projects (even if already loaded)
  loadOnboardedClients()
    .then(() => {
      populateClientDropdown();
    })
    .catch(() => {
      console.warn("Failed to reload onboarded clients for modal.");
    });
}


function closeProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
}

async function handleProjectFormSubmit(e) {
    e.preventDefault();

    const customerId = document.getElementById('onboardedProjectSelect')?.value;
    if (!customerId) {
        showToast('Please select an onboarded project', 'error');
        return;
    }

    const client = clientsData.find(c => c.customerId === customerId);

    const projectData = {
        customerId: customerId,
        companyName: client?.companyName,
        customerName: client?.customerName,
        projectName: client?.projectName,
        projectDescription: document.getElementById('projectDescriptionForm')?.value,
        contactPerson: document.getElementById('contactPersonForm')?.value,
        contactNumber: document.getElementById('contactNumberForm')?.value,
        contactEmail: document.getElementById('contactEmailForm')?.value,
        contactDesignation: document.getElementById('contactDesignationForm')?.value,
        startDate: document.getElementById('date')?.value,
        completionDate: document.getElementById('deadline')?.value,
        reportingPerson: document.getElementById('reportingPerson')?.value,
        allocatedTeam: document.getElementById('allocatedteam')?.value,
        remarks: document.getElementById('projectremarks')?.value || 'N/A',
        // Send initiator from session for this project!
        initiatedBy: sessionStorage.getItem("employeeName") || "N/A"
    };

    try {
        showLoadingSpinner();
        const response = await fetch('https://www.fist-o.com/web_crm/add_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(projectData)
        });

        const result = await response.json();
        hideLoadingSpinner();

        if (response.ok && (result.success === true || result.status === 'success')) {
            showToast('Project created successfully!', 'success');
            closeProjectForm();
            await loadProjects();
            await loadOnboardedClients();
            const form = document.getElementById('projectForm');
            if (form) {
                form.reset();
                clearContactFields();
            }
        } else {
            showToast(result.message || 'Failed to create project', 'error');
            console.error('Server error:', result);
        }
    } catch (err) {
        hideLoadingSpinner();
        console.error('Error:', err);
        showToast('Error: ' + err.message, 'error');
    }
}



// ============================
// DELETE PROJECT
// ============================

function confirmDeleteProject(projectId, companyName) {
  const confirmed = confirm(
    `Are you sure you want to delete the project for "${companyName}"?\n\n` +
    `Project ID: ${projectId}\n\n` +
    `This action cannot be undone.`
  );
  
  if (confirmed) {
    deleteProject(projectId);
  }
}

async function deleteProject(projectId) {
  try {
    showLoadingSpinner();
    
    const response = await fetch('https://www.fist-o.com/web_crm/delete_project.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ projectId: projectId })
    });

    const result = await response.json();
    hideLoadingSpinner();
    
    if (result.success || result.status === 'success') {
      showToast('Project deleted successfully', 'success');
      await loadProjects();
    } else {
      showToast(result.message || 'Failed to delete project', 'error');
    }
  } catch (err) {
    hideLoadingSpinner();
    console.error('Error deleting project:', err);
    showToast('Failed to delete project', 'error');
  }
}

// ============================
// TAB SWITCHING
// ============================

function setupProjectDetailTabs() {
  console.log('Ã°Å¸â€Â§ Setting up project detail tabs...');
  
  const tabButtons = document.querySelectorAll('.detail-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  if (tabButtons.length === 0) {
    console.warn('Ã¢Å¡ Ã¯Â¸Â No tab buttons found');
    return;
  }
  
  tabButtons.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
  
  const freshTabButtons = document.querySelectorAll('.detail-tab');
  
  freshTabButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const targetTab = this.getAttribute('data-tab');
      console.log(`Ã°Å¸â€â€ž Switching to tab: ${targetTab}`);
      
      freshTabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });
      
      const targetPanel = document.getElementById(`${targetTab}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.style.display = 'block';
        console.log(`Ã¢Å“â€¦ Showing ${targetTab} panel`);
        
        if (targetTab === 'resources') {
          loadResourcesContent();
        } else if (targetTab === 'analytics') {
          loadAnalyticsContent();
        }
      }
    });
  });
  
  console.log('Ã¢Å“â€¦ Tab switching setup complete');
}

// ============================
// LOAD RESOURCES CONTENT
// ============================

function loadResourcesContent() {
  console.log('Ã°Å¸â€œÂ¦ Loading resources content...');
  
  const resourcesPanel = document.getElementById('resources-panel');
  if (!resourcesPanel) {
    console.error('Ã¢ÂÅ’ Resources panel not found');
    return;
  }
  
  resourcesPanel.innerHTML = `
    <div class="resources-container">
      <div class="resources-header">
        <h3><i class="fas fa-folder-open"></i> Project Resources</h3>
        <button class="primary-btn" onclick="openUploadResourceModal()">
          <i class="fas fa-upload"></i> Upload Resource
        </button>
      </div>
      
      <div class="resources-grid">
        <div class="resource-card">
          <div class="resource-icon">
            <i class="fas fa-file-pdf"></i>
          </div>
          <div class="resource-info">
            <h4>Project Requirements.pdf</h4>
            <p>Uploaded: Jan 15, 2025 Ã¢â‚¬Â¢ 2.4 MB</p>
          </div>
          <div class="resource-actions">
            <button class="btn-icon" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn-icon" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="resource-card">
          <div class="resource-icon">
            <i class="fas fa-file-word"></i>
          </div>
          <div class="resource-info">
            <h4>Design Specifications.docx</h4>
            <p>Uploaded: Jan 12, 2025 Ã¢â‚¬Â¢ 1.8 MB</p>
          </div>
          <div class="resource-actions">
            <button class="btn-icon" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn-icon" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="resource-card">
          <div class="resource-icon">
            <i class="fas fa-link"></i>
          </div>
          <div class="resource-info">
            <h4>Project Drive Link</h4>
            <p>Added: Jan 10, 2025</p>
          </div>
          <div class="resource-actions">
            <button class="btn-icon" title="Open">
              <i class="fas fa-external-link-alt"></i>
            </button>
            <button class="btn-icon" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  console.log('Ã¢Å“â€¦ Resources content loaded');
}

function loadAnalyticsContent() {
  console.log('Ã°Å¸â€œÅ  Analytics content placeholder');
}

// ============================
// EVENT LISTENERS
// ============================

function setupEventListeners() {
  console.log('Ã°Å¸â€â€” Setting up event listeners...');
  
  const clientSelect = document.getElementById('onboardedProjectSelect');
  if (clientSelect) {
    clientSelect.removeEventListener('change', handleClientSelection);
    clientSelect.addEventListener('change', handleClientSelection);
    console.log('Ã¢Å“â€¦ Client select listener attached');
  }
  
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.removeEventListener('submit', handleProjectFormSubmit);
    projectForm.addEventListener('submit', handleProjectFormSubmit);
    console.log('Ã¢Å“â€¦ Form submit listener attached');
  }
  
  const searchInput = document.getElementById('projectSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterProjects(e.target.value));
  }
  
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) goToPage(currentPage - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(projectsData.length / projectsPerPage);
      if (currentPage < totalPages) goToPage(currentPage + 1);
    });
  }
  
  console.log('Ã¢Å“â€¦ All listeners attached');
}

// ============================
// SEARCH/FILTER PROJECTS
// ============================

function filterProjects(searchTerm) {
  if (!searchTerm) {
    displayProjectsTable(projectsData);
    return;
  }
  
  const filtered = projectsData.filter(project => {
    const search = searchTerm.toLowerCase();
    const projectName = (project.companyName || project.company_name || '').toLowerCase();
    const reportingPerson = (project.reportingPerson || project.reporting_person || '').toLowerCase();
    const customerId = (project.customerId || project.customer_id || '').toLowerCase();
    
    return projectName.includes(search) || 
           reportingPerson.includes(search) || 
           customerId.includes(search);
  });
  
  console.log(`Ã°Å¸â€Â Filtered ${filtered.length} projects from ${projectsData.length}`);
  currentPage = 1;
  displayProjectsTable(filtered);
}

// ============================
// TASK ALLOCATION MODAL
// ============================

async function openTaskAllocationForm() {
    const modal = document.getElementById('addTaskAllocationModal');
    if (modal) {
        modal.style.display = 'block';
        
        const sessionProject = getProjectSession();
        
        if (sessionProject) {
            const taskProjectName = document.getElementById('taskProjectName');
            const taskCompanyName = document.getElementById('taskCompanyName');
            const taskProjectDescription = document.getElementById('ProjectDescription');
            
            if (taskProjectName) taskProjectName.textContent = sessionProject.project_name || 'N/A';
            if (taskCompanyName) taskCompanyName.textContent = sessionProject.company_name || 'N/A';
            if (taskProjectDescription) taskProjectDescription.textContent = sessionProject.project_description || 'N/A';
            
            const projectNameInput = document.getElementById('projectName');
            if (projectNameInput) {
                projectNameInput.value = sessionProject.project_name || '';
            }
            
            await populateTaskTeamDropdown();
            
            console.log('Ã¢Å“â€¦ Task allocation form opened for project:', sessionProject.project_id);
        } else {
            showToast('Please select a project first', 'error');
            closeTaskAllocationForm();
        }
    }
}

function closeTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) modal.style.display = 'none';
}

// ============================
// FETCH TEAMS FROM project_allocations TABLE
// ============================

async function fetchTaskAllocationTeams() {
    try {
        const sessionProject = getProjectSession();
        const projectId = sessionProject?.project_id;
        
        if (!projectId) {
            console.error('Ã¢ÂÅ’ No project ID in session');
            showToast('Please select a project first', 'error');
            return [];
        }
        
        console.log('Ã°Å¸â€Â Fetching teams for project:', projectId);
        
        const response = await fetch(`https://www.fist-o.com/web_crm/fetch_project_teams.php?project_id=${projectId}`, {
            method: 'GET'
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('Ã¢Å“â€¦ Teams loaded:', result.data);
            return result.data;
        } else {
            console.warn('Ã¢Å¡ Ã¯Â¸Â No teams found for this project');
            return [];
        }
    } catch (error) {
        console.error('Ã¢ÂÅ’ Error fetching teams:', error);
        showToast('Failed to load teams', 'error');
        return [];
    }
}

async function populateTaskTeamDropdown() {
    const teamSelect = document.getElementById('TaskTeamName');
    
    if (!teamSelect) {
        console.error('Ã¢ÂÅ’ TaskTeamName dropdown not found');
        return;
    }
    
    teamSelect.innerHTML = '<option value="">Loading teams...</option>';
    teamSelect.disabled = true;
    
    const teams = await fetchTaskAllocationTeams();
    
    teamSelect.innerHTML = '<option value="">-- Select Team --</option>';
    
    if (teams.length === 0) {
        teamSelect.innerHTML = '<option value="">-- No teams allocated --</option>';
        teamSelect.disabled = true;
        return;
    }
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.team_name;
        option.textContent = `${team.team_name} (${team.members.length} members)`;
        option.dataset.members = JSON.stringify(team.members);
        teamSelect.appendChild(option);
    });
    
    teamSelect.disabled = false;
    console.log(`Ã¢Å“â€¦ Populated ${teams.length} teams`);
}

function handleTaskTeamChange() {
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    
    if (!teamSelect || !memberSelect) {
        console.error('Ã¢ÂÅ’ Dropdowns not found');
        return;
    }
    
    memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
    memberSelect.disabled = true;
    
    const selectedTeam = teamSelect.value;
    
    if (!selectedTeam) {
        console.log('Ã¢â€žÂ¹Ã¯Â¸Â No team selected');
        return;
    }
    
    const selectedOption = teamSelect.options[teamSelect.selectedIndex];
    const members = JSON.parse(selectedOption.dataset.members || '[]');
    
    console.log('Ã°Å¸â€˜Â¥ Team selected:', selectedTeam);
    console.log('Ã°Å¸â€˜Â¥ Members:', members);
    
    if (members.length === 0) {
        memberSelect.innerHTML = '<option value="">-- No members in this team --</option>';
        return;
    }
    
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.emp_id;
        option.textContent = `${member.emp_name}${member.designation ? ' - ' + member.designation : ''}`;
        option.dataset.empId = member.emp_id;
        option.dataset.empName = member.emp_name;
        option.dataset.designation = member.designation;
        memberSelect.appendChild(option);
    });
    
    memberSelect.disabled = false;
    console.log(`Ã¢Å“â€¦ Populated ${members.length} members for team: ${selectedTeam}`);
}

// ============================
// TASK ALLOCATION - TEMPORARY STORAGE
// ============================

function handleAddTaskToTable(event) {
    event.preventDefault();
    
    const taskName = document.getElementById('TaskName')?.value.trim();
    const taskDescription = document.getElementById('ProjectDescription')?.value.trim();
    const startDate = document.getElementById('TaskStartDate')?.value;
    const startTime = document.getElementById('TaskStartTime')?.value; // Ã¢Å“â€¦ NEW
    const endDate = document.getElementById('TaskEndDate')?.value;
    const endTime = document.getElementById('TaskEndTime')?.value; // Ã¢Å“â€¦ NEW
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    const remarks = document.getElementById('taskremarks')?.value.trim();
    
    const teamName = teamSelect?.value;
    const assignedToEmpId = memberSelect?.value;
    const assignedToName = memberSelect?.options[memberSelect.selectedIndex]?.text || '';
    
    console.log('Ã°Å¸â€œâ€¹ Form Values:');
    console.log('  taskName:', taskName);
    console.log('  startDate:', startDate);
    console.log('  startTime:', startTime); // Ã¢Å“â€¦ NEW
    console.log('  endDate:', endDate);
    console.log('  endTime:', endTime); // Ã¢Å“â€¦ NEW
    console.log('  teamName:', teamName);
    console.log('  assignedToEmpId:', assignedToEmpId);
    console.log('  remarks:', remarks);
    
    // Validation
    if (!taskName) {
        showToast('Ã¢ÂÅ’ Task Name is required', 'error');
        return;
    }
    
    if (!startDate) {
        showToast('Ã¢ÂÅ’ Start Date is required', 'error');
        return;
    }
    
    if (!startTime) {
        showToast('Ã¢ÂÅ’ Start Time is required', 'error');
        return;
    }
    
    if (!endDate) {
        showToast('Ã¢ÂÅ’ End Date is required', 'error');
        return;
    }
    
    if (!endTime) {
        showToast('Ã¢ÂÅ’ End Time is required', 'error');
        return;
    }
    
    if (!teamName) {
        showToast('Ã¢ÂÅ’ Team Name is required', 'error');
        return;
    }
    
    if (!assignedToEmpId) {
        showToast('Ã¢ÂÅ’ Assigned To is required', 'error');
        return;
    }
    
    if (!remarks) {
        showToast('Ã¢ÂÅ’ Remarks is required', 'error');
        return;
    }
    
    // Ã¢Å“â€¦ Validate date-time combination
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (startDateTime >= endDateTime) {
        showToast('Ã¢ÂÅ’ End date/time must be after start date/time', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        taskName: taskName,
        description: taskDescription || '',
        startDate: startDate,
        startTime: startTime, // Ã¢Å“â€¦ NEW
        endDate: endDate,
        endTime: endTime, // Ã¢Å“â€¦ NEW
        teamName: teamName,
        assignedToEmpId: assignedToEmpId,
        assignedToName: assignedToName,
        taskremarks: remarks
    };
    
    tempTasks.push(task);
    updateTempTaskTable();
    clearTaskFormFields();
    
    showToast('Ã¢Å“â€¦ Task added to list', 'success');
    console.log('Ã¢Å“â€¦ Task added:', task);
}


function updateTempTaskTable() {
    const tbody = document.querySelector('#tempTaskTable tbody');
    
    if (!tbody) {
        console.error('Ã¢ÂÅ’ Task table body not found');
        return;
    }
    
    if (tempTasks.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-temp">
                <td colspan="7">No tasks added yet</td>
            </tr>
        `;
        return;
    }
    
tbody.innerHTML = tempTasks.map(task => `
    <tr>
        <td>${task.taskName}</td>
        <td>${task.description || '-'}</td>
        <td>${formatDateDisplay(task.startDate)}<br><small>${task.startTime || '09:00'}</small></td>
        <td>${formatDateDisplay(task.endDate)}<br><small>${task.endTime || '18:00'}</small></td>
        <td>${task.assignedToName}</td>
        <td>${task.taskremarks || '-'}</td>
        <td>
            <button type="button" onclick="removeTaskFromTable(${task.id})" 
                    style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    </tr>
`).join('');

}


function removeTaskFromTable(taskId) {
    const taskIndex = tempTasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const removedTask = tempTasks.splice(taskIndex, 1)[0];
        updateTempTaskTable();
        showToast(`Task "${removedTask.taskName}" removed`, 'info');
        console.log('Ã°Å¸â€”â€˜Ã¯Â¸Â Remaining tasks:', tempTasks.length);
    }
}

function clearTaskFormFields() {
    document.getElementById('TaskName').value = '';
    document.getElementById('TaskStartDate').value = '';
    document.getElementById('TaskStartTime').value = '09:00'; // Ã¢Å“â€¦ Reset to default
    document.getElementById('TaskEndDate').value = '';
    document.getElementById('TaskEndTime').value = '18:00'; // Ã¢Å“â€¦ Reset to default
    
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    
    if (teamSelect) teamSelect.selectedIndex = 0;
    if (memberSelect) {
        memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
        memberSelect.disabled = true;
    }
    
    document.getElementById('taskremarks').value = '';
}

async function submitAllTasks() {
    if (tempTasks.length === 0) {
        showToast('Please add at least one task', 'error');
        return;
    }

    const sessionProject = getProjectSession();
    const projectId = sessionProject?.project_id;

    if (!projectId) {
        showToast('No project selected', 'error');
        return;
    }

    try {
        console.log('Submitting tasks to database:', tempTasks);
        const response = await fetch('https://www.fist-o.com/web_crm/add_task_allocations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId, tasks: tempTasks })
        });

        const result = await response.json();

        if (result.success) {
            showToast(`âœ… ${tempTasks.length} task(s) allocated successfully!`, 'success');
            
            tempTasks = [];
            updateTempTaskTable();
            closeTaskAllocationForm();
            
            await loadProjectTasksTable(projectId);
            
            // âœ… REFRESH STATISTICS AFTER ADDING TASKS
            await fetchProjectStatistics(projectId);
            
            console.log('âœ… Tasks submitted and statistics refreshed');
        } else {
            showToast(result.message || 'Failed to submit tasks', 'error');
            console.error('Server error:', result);
        }
    } catch (error) {
        console.error('Error submitting tasks:', error);
        showToast('Network error while submitting tasks', 'error');
    }
}


function formatDateDisplay(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ============================
// EMPLOYEE ALLOCATION MODAL - WITH ALLOCATED DISPLAY
// ============================

async function openProjectAllocationForm(projectId = null) {
  console.log('Ã°Å¸â€œÂ Opening employee allocation modal...');
  console.log('Ã°Å¸â€œÂ Received projectId parameter:', projectId);
  
  let finalProjectId = projectId || 
                       currentProjectId || 
                       window.currentProjectId || 
                       getProjectIdFromSession();
  
  if (!finalProjectId) {
    const detailView = document.getElementById('project-detail-view');
    if (detailView) {
      finalProjectId = detailView.getAttribute('data-project-id');
      console.log('Ã°Å¸â€œÂ Got project ID from DOM:', finalProjectId);
    }
  }
  
  if (!finalProjectId) {
    showToast('Error: Project ID not found. Please view a project first.', 'error');
    console.error('Ã¢ÂÅ’ No project ID available from any source');
    return;
  }
  
  console.log('Ã¢Å“â€¦ Using project ID:', finalProjectId);
  
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) {
    console.error('Ã¢ÂÅ’ Modal not found');
    return;
  }

  currentProjectId = finalProjectId;
  window.currentProjectId = finalProjectId;

  selectedEmployees = [];
  
  modal.style.display = 'block';
  modal.style.animation = 'fadeIn 0.3s ease';
  
  const list = document.getElementById('selectedEmployeesList');
  if (list) {
    list.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p style="color: #999; margin: 10px 0 0 0;">Loading current team members...</p>
      </div>
    `;
  }
  
  await fetchAndDisplayAllocatedInModal(finalProjectId);
  
  fetchProjectEmployees(finalProjectId);
}

async function fetchAndDisplayAllocatedInModal(projectId) {
  try {
    console.log('Ã°Å¸â€œÂ¡ Fetching allocated employees for modal display...');
    
    const response = await fetch(
      `https://www.fist-o.com/web_crm/get_allocated_employees.php?project_id=${projectId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ã°Å¸â€œÂ¦ Modal allocated employees response:', result);

    if (result.success && result.data && result.data.employees && result.data.employees.length > 0) {
      displayAllocatedInModal(result.data.employees);
    } else {
      showEmptyStateInModal();
    }
  } catch (error) {
    console.error('Ã¢ÂÅ’ Error fetching allocated employees for modal:', error);
    showEmptyStateInModal();
  }
}
// ============================
// DISPLAY ALLOCATED EMPLOYEES IN MODAL - SINGLE AREA WITH X BUTTON
// ============================

function displayAllocatedInModal(allocatedEmployees) {
  const selectedList = document.getElementById('selectedEmployeesList');
  
  if (!selectedList) {
    console.error('Ã¢ÂÅ’ Selected employee list container not found');
    return;
  }

  if (!allocatedEmployees || allocatedEmployees.length === 0) {
    showEmptyStateInModal();
    return;
  }

  // Display allocated employees - using CORRECT emp_id from data
  selectedList.innerHTML = allocatedEmployees.map(emp => `
    <div class="employee-card allocated" data-emp-id="${emp.emp_id}">
      <div class="emp-card-content">
        <i class="fas fa-user"></i>
        <span class="emp-card-name">${emp.emp_name || 'Unknown'}</span>
        <small style="color: #999; font-size: 11px; margin-left: 8px;">${emp.emp_id}</small>
      </div>
      <button class="remove-card-btn" 
              onclick="removeAllocatedEmployee('${emp.emp_id}', '${escapeHtml(emp.emp_name)}')" 
              title="Remove from project">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  console.log(`Ã¢Å“â€¦ Displayed ${allocatedEmployees.length} allocated employees`);
  console.log('Employee IDs:', allocatedEmployees.map(e => e.emp_id));
}

function showEmptyStateInModal() {
  const selectedList = document.getElementById('selectedEmployeesList');
  
  if (!selectedList) return;

  selectedList.innerHTML = `
    <div class="empty-selection-state">
      <i class="fas fa-users-slash" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
      <p style="color: #999; margin: 0; font-size: 14px;">No employees allocated yet</p>
      <small style="color: #bbb; font-size: 12px;">Select employees from the dropdown below</small>
    </div>
  `;
}

function getTeamBadgeClass(teamName) {
  if (!teamName) return 'badge-general';
  
  const teamClasses = {
    'Management Team': 'badge-management',
    'Development Team': 'badge-development',
    'UI/UX Team': 'badge-design',
    '3D Design Team': 'badge-3d',
    'HR Team': 'badge-hr',
    'Marketing Team': 'badge-marketing',
    'Admin Team': 'badge-admin',
    'General Team': 'badge-general'
  };
  
  return teamClasses[teamName] || 'badge-general';
}

function addToSelectedList() {
  const selectElement = document.getElementById('employeeSelect');
  
  if (!selectElement) {
    console.error('âŒ Employee select element not found');
    return;
  }

  const selectedValue = selectElement.value;
  
  if (!selectedValue) {
    showToast('Please select an employee', 'warning');
    return;
  }

  const selectedOption = selectElement.options[selectElement.selectedIndex];
  
  const employee = {
    emp_id: selectedValue,
    emp_name: selectedOption.getAttribute('data-name') || selectedOption.textContent,
    designation: selectedOption.getAttribute('data-designation') || 'N/A'
  };

  if (selectedEmployees.some(emp => emp.emp_id === employee.emp_id)) {
    showToast('Employee already added to the list', 'warning');
    return;
  }

  selectedEmployees.push(employee);
  
  console.log('âœ… Added employee to selection:', employee);
  console.log('Current selections:', selectedEmployees);

  displayNewSelectionsInModal();

  populateEmployeeDropdown(); // <-- Add this line

  selectElement.value = '';
  
  showToast(`${employee.emp_name} added to selection`, 'success');
}


// ============================
// DISPLAY NEW SELECTIONS IN MODAL - COMBINED WITH ALLOCATED
// ============================

function displayNewSelectionsInModal() {
  const selectedList = document.getElementById('selectedEmployeesList');
  
  if (!selectedList) {
    console.error('Ã¢ÂÅ’ Selected employees list not found');
    return;
  }

  if (selectedEmployees.length === 0) {
    const projectId = currentProjectId || window.currentProjectId || getProjectIdFromSession();
    if (projectId) {
      fetchAndDisplayAllocatedInModal(projectId);
    }
    return;
  }

  const projectId = currentProjectId || window.currentProjectId || getProjectIdFromSession();
  
  if (projectId) {
    fetch(`https://www.fist-o.com/web_crm/get_allocated_employees.php?project_id=${projectId}`)
      .then(response => response.json())
      .then(result => {
        let cardsHTML = '';
        
        // Add allocated employees cards - use emp_id from database
        if (result.success && result.data && result.data.employees && result.data.employees.length > 0) {
          cardsHTML += result.data.employees.map(emp => `
            <div class="employee-card allocated" data-emp-id="${emp.emp_id}">
              <div class="emp-card-content">
                <i class="fas fa-user"></i>
                <span class="emp-card-name">${emp.emp_name || 'Unknown'}</span>
                <small style="color: #999; font-size: 11px; margin-left: 8px;">${emp.emp_id}</small>
              </div>
              <button class="remove-card-btn" 
                      onclick="removeAllocatedEmployee('${emp.emp_id}', '${escapeHtml(emp.emp_name)}')" 
                      title="Remove from project">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `).join('');
        }
        
        // Add new selections cards - use emp_id from selection
        cardsHTML += selectedEmployees.map(emp => `
          <div class="employee-card new-selection" data-emp-id="${emp.emp_id}">
            <div class="emp-card-content">
              <i class="fas fa-user"></i>
              <span class="emp-card-name">${emp.emp_name}</span>
              <small style="color: #28a745; font-size: 11px; margin-left: 8px;">${emp.emp_id}</small>
              <span class="new-badge">NEW</span>
            </div>
            <button class="remove-card-btn" 
                    onclick="removeFromNewSelection('${emp.emp_id}')" 
                    title="Remove from selection">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('');
        
        selectedList.innerHTML = cardsHTML;
      })
      .catch(error => {
        console.error('Error fetching allocated employees:', error);
        selectedList.innerHTML = selectedEmployees.map(emp => `
          <div class="employee-card new-selection" data-emp-id="${emp.emp_id}">
            <div class="emp-card-content">
              <i class="fas fa-user"></i>
              <span class="emp-card-name">${emp.emp_name}</span>
              <small style="color: #28a745; font-size: 11px; margin-left: 8px;">${emp.emp_id}</small>
              <span class="new-badge">NEW</span>
            </div>
            <button class="remove-card-btn" 
                    onclick="removeFromNewSelection('${emp.emp_id}')" 
                    title="Remove from selection">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('');
      });
  } else {
    selectedList.innerHTML = selectedEmployees.map(emp => `
      <div class="employee-card new-selection" data-emp-id="${emp.emp_id}">
        <div class="emp-card-content">
          <i class="fas fa-user"></i>
          <span class="emp-card-name">${emp.emp_name}</span>
          <small style="color: #28a745; font-size: 11px; margin-left: 8px;">${emp.emp_id}</small>
          <span class="new-badge">NEW</span>
        </div>
        <button class="remove-card-btn" 
                onclick="removeFromNewSelection('${emp.emp_id}')" 
                title="Remove from selection">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }
}

// ============================
// REMOVE ALLOCATED EMPLOYEE - WITH DEBUGGING
// ============================

async function removeAllocatedEmployee(empId, employeeName) {
  console.log('Ã°Å¸â€Â Remove function called with:');
  console.log('  - empId:', empId);
  console.log('  - employeeName:', employeeName);
  
  const confirmed = confirm(
    `Are you sure you want to remove "${employeeName}" (${empId}) from this project?\n\n` +
    `This will remove them from the project team.`
  );
  
  if (!confirmed) return;

  try {
    // Disable the button immediately
    const cardElement = document.querySelector(`.employee-card[data-emp-id="${empId}"]`);
    if (cardElement) {
      const removeBtn = cardElement.querySelector('.remove-card-btn');
      if (removeBtn) {
        removeBtn.disabled = true;
        removeBtn.style.opacity = '0.5';
        removeBtn.style.cursor = 'not-allowed';
        removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      }
    }
    
    showLoadingSpinner();
    
    const projectId = currentProjectId || window.currentProjectId || getProjectIdFromSession();
    
    if (!projectId) {
      hideLoadingSpinner();
      showToast('Error: Project ID not found', 'error');
      return;
    }
    
    const requestData = { 
      project_id: String(projectId),
      emp_id: String(empId)
    };
    
    console.log('Ã°Å¸â€œÂ¤ Sending remove request:', requestData);
    
    const response = await fetch('https://www.fist-o.com/web_crm/remove_allocated_employee.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    hideLoadingSpinner();
    
    console.log('Ã°Å¸â€œÂ¦ Remove response:', result);
    
    if (result.success) {
      // Remove the card with animation
      if (cardElement) {
        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateX(-20px)';
        setTimeout(() => {
          cardElement.remove();
          
          // Check if list is now empty
          const selectedList = document.getElementById('selectedEmployeesList');
          if (selectedList && selectedList.children.length === 0) {
            showEmptyStateInModal();
          }
        }, 300);
      }
      
      showToast(`${employeeName} removed from project successfully`, 'success');
      
      // Ã¢Å“â€¦ REFRESH THE DROPDOWN TO SHOW THE REMOVED EMPLOYEE
      console.log('Ã°Å¸â€â€ž Refreshing employee dropdown...');
      await fetchProjectEmployees(projectId);
      
      // Also refresh the allocated list
      setTimeout(() => {
        fetchAndDisplayAllocatedInModal(projectId);
      }, 500);
      
    } else {
      showToast(result.message || 'Failed to remove employee', 'error');
      console.error('Ã¢ÂÅ’ Server error:', result);
      
      // Re-enable button if failed
      if (cardElement) {
        const removeBtn = cardElement.querySelector('.remove-card-btn');
        if (removeBtn) {
          removeBtn.disabled = false;
          removeBtn.style.opacity = '1';
          removeBtn.style.cursor = 'pointer';
          removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        }
      }
    }
  } catch (error) {
    hideLoadingSpinner();
    console.error('Ã¢ÂÅ’ Error removing employee:', error);
    showToast('Failed to remove employee: ' + error.message, 'error');
    
    // Re-enable button if error
    const cardElement = document.querySelector(`.employee-card[data-emp-id="${empId}"]`);
    if (cardElement) {
      const removeBtn = cardElement.querySelector('.remove-card-btn');
      if (removeBtn) {
        removeBtn.disabled = false;
        removeBtn.style.opacity = '1';
        removeBtn.style.cursor = 'pointer';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      }
    }
  }
}




// ============================
// REMOVE FROM NEW SELECTION (From Temporary List)
// ============================

function removeFromNewSelection(empId) {
    selectedEmployees = selectedEmployees.filter(emp => emp.emp_id !== empId);
    displayNewSelectionsInModal(); // re-renders selected employee list
    updateAllocatedCount(); // update count display
    showToast('Employee removed from selection', 'info');
}

function updateAllocatedCount() {
    const countElement = document.getElementById('allocatedCount');
    if (!countElement) return;
    const count = selectedEmployees.length; // or the array holding current allocated employees count
    countElement.textContent = count;
}



// ============================
// ADD escapeHtml HELPER FUNCTION
// ============================

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function closeProjectAllocationForm() {
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) return;
  modal.style.animation = 'fadeOut 0.3s ease';
  setTimeout(() => {
    modal.style.display = 'none';
    selectedEmployees = [];
    const list = document.getElementById('selectedEmployeesList');
    if (list) list.innerHTML = '';
    const selectElement = document.getElementById('employeeSelect');
    if (selectElement) selectElement.value = '';
    console.log('Modal closed and cleaned up');
    // ✅ Add this line:
    const sessionProject = getProjectSession();
    if(sessionProject && sessionProject.projectid) {
      fetchProjectStatistics(sessionProject.projectid);
    }
  }, 300);
}

// When DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('ðŸš€ Initializing Project Dashboard...');
  
  // Load projects and configure UI
  loadProjects()
    .then(() => {
      displayProjectsTable(projectsData);
      configureProjectPageByRole(); // Configure UI based on role
      console.log('âœ… Dashboard initialized');
    })
    .catch(err => {
      console.error('âŒ Error:', err);
    });
});

// ============================
// FETCH AND POPULATE EMPLOYEES
// ============================

async function fetchProjectEmployees(projectId = null) {
  try {
    console.log('Ã°Å¸â€œÂ¡ Fetching employees from add_project_employee.php...');
    
    const url = projectId 
      ? `https://www.fist-o.com/web_crm/add_project_employee.php?project_id=${projectId}`
      : 'https://www.fist-o.com/web_crm/add_project_employee.php';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ã°Å¸â€œÂ¦ Employee fetch response:', result);

    if (result.success && result.data) {
      employeesData = result.data.map(emp => ({
        id: emp.id,
        emp_id: emp.emp_id,
        emp_name: emp.emp_name,
        designation: emp.designation || 'N/A'
      }));
      
      console.log('Ã°Å¸â€œÂ¦ Stored employees data:', employeesData);
      populateEmployeeDropdown();
      console.log(`Ã¢Å“â€¦ Loaded ${employeesData.length} employees`);
      return employeesData;
    } else {
      employeesData = [];
      populateEmployeeDropdown();
      showToast(result.message || 'No employees available', 'warning');
      return [];
    }
  } catch (error) {
    console.error('Ã¢ÂÅ’ Error fetching employees:', error);
    employeesData = [];
    populateEmployeeDropdown();
    showToast('Error loading employees: ' + error.message, 'error');
    return [];
  }
}

function populateEmployeeDropdown() {
  const select = document.getElementById('employeeSelect');
  
  if (!select) {
    console.error('âŒ employeeSelect dropdown not found');
    return;
  }

  select.innerHTML = '<option value="">-- SELECT EMPLOYEE --</option>';

  if (employeesData.length === 0) {
    const noDataOption = document.createElement('option');
    noDataOption.value = '';
    noDataOption.textContent = '-- No employees available --';
    noDataOption.disabled = true;
    select.appendChild(noDataOption);
    console.warn('âš ï¸ No employees to display');
    return;
  }

  employeesData.forEach(emp => {
    // Filter out employees that have already been selected
    if (selectedEmployees.some(selected => selected.emp_id === emp.emp_id)) {
      return; // Skip already-selected employee
    }

    const option = document.createElement('option');
    option.value = emp.emp_id;
    
    const displayText = emp.designation !== 'N/A'
      ? `${emp.emp_name} - ${emp.designation}`
      : emp.emp_name;
    
    option.textContent = displayText;
    
    option.dataset.id = emp.id;
    option.dataset.empId = emp.emp_id;
    option.dataset.name = emp.emp_name;
    option.dataset.designation = emp.designation;
    
    select.appendChild(option);
  });
  
  console.log(`âœ… Dropdown populated with ${select.options.length-1} employees`);
}

async function submitEmployees() {
    if (selectedEmployees.length === 0) {
        showToast('Please add at least one employee', 'error');
        return;
    }
    const sessionProject = getProjectSession();
    const projectId = sessionProject?.project_id;
    if (!projectId) {
        showToast('No project selected', 'error');
        return;
    }

    // Send employees as array of objects with emp_id, emp_name, designation
    const employeesData = selectedEmployees.map(emp => ({
      emp_id: emp.emp_id,
      emp_name: emp.emp_name,
      designation: emp.designation || ''
    }));

    try {
        const response = await fetch('https://www.fist-o.com/web_crm/add_project_employee.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                employees: employeesData
            })
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message || 'Employees allocated successfully!', 'success');
            selectedEmployees = [];
           setTimeout(() => {
              closeProjectAllocationForm();
              const sessionProject = getProjectSession();
              if (sessionProject && typeof viewProject === 'function') {
                viewProject(sessionProject.project_id);
              } else {
                // fallback: reload the whole page if needed
                // location.reload();
              }
          }, 1000);

            // Refresh data as needed
        } else {
            showToast(result.message || 'Failed to allocate employees', 'error');
        }
    } catch (error) {
        showToast('Network error while submitting employees', 'error');
    }
}

async function submitChanges() {
  const sessionProject = getProjectSession();
  const projectId = sessionProject?.project_id;
  if (!projectId) {
    showToast('No project selected', 'error');
    return;
  }

  try {
    // Process removals first, if any
    if (employeesToRemove.length > 0) {
      for (const empId of employeesToRemove) {
        const resRemove = await fetch('https://www.fist-o.com/web_crm/remove_allocated_employee.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, emp_id: empId })
        });
        const resultRemove = await resRemove.json();
        if (!resultRemove.success) {
          showToast(`Failed to remove employee ID ${empId}: ${resultRemove.message}`, 'error');
          return;
        }
      }
    }

    // Then process additions, if any
    if (selectedEmployees.length > 0) {
      const employeesPayload = selectedEmployees.map(emp => ({
        emp_id: emp.emp_id,
        emp_name: emp.emp_name,
        designation: emp.designation || ''
      }));
      const resAdd = await fetch('https://www.fist-o.com/web_crm/add_project_employee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, employees: employeesPayload })
      });
      const resultAdd = await resAdd.json();
      if (!resultAdd.success) {
        showToast(resultAdd.message || 'Failed to add employees', 'error');
        return;
      }
    }

    // Clear temporary arrays after success
    employeesToRemove = [];
    selectedEmployees = [];

    showToast('Project employees updated successfully', 'success');
    closeProjectAllocationForm();

    if (typeof viewProject === 'function') {
      viewProject(projectId);
    } else {
      location.reload();
    }
  } catch (error) {
    showToast('Network error updating project employees', 'error');
  }
}



// ============================
// UTILITY FUNCTIONS
// ============================

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showLoadingSpinner() {
  let spinner = document.getElementById('loadingSpinner');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    spinner.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
        <div class="loading-spinner"></div>
        <p style="margin-top: 15px; color: #333;">Processing...</p>
      </div>
    `;
    document.body.appendChild(spinner);
  }
  spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('projectToastContainer') || document.getElementById('toast-container');
  
  if (!container) {
    console.log('Ã°Å¸â€œÂ¢ Toast:', message);
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'Ã¢Å“â€œ' : 
                 type === 'error' ? 'Ã¢Å“â€¢' : 'Ã¢Å¡ ';
    
    toast.innerHTML = `
      <span style="font-size: 20px;">${icon}</span>
      <span>${message}</span>
    `;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<p>${message}</p>`;
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// Add animations style
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(-30px);
      opacity: 0;
    }
  }
  @keyframes fadeOut {
    to { opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// ============================
// INITIALIZE ON DOM LOAD
// ============================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Ã°Å¸Å½Â¬ DOM Loaded - Initializing Project Dashboard...');
  initializeProjectDashboard();
  
  // Task team dropdown event listener
  const teamSelect = document.getElementById('TaskTeamName');
  if (teamSelect) {
    teamSelect.addEventListener('change', handleTaskTeamChange);
    console.log('Ã¢Å“â€¦ Team dropdown event listener attached');
  }
  
  // Task form event listener
  const taskForm = document.getElementById('TaskAllocationForm');
  if (taskForm) {
    taskForm.addEventListener('submit', handleAddTaskToTable);
    console.log('Ã¢Å“â€¦ Task form listener attached');
  }
  
  // Submit button event listener
  const submitBtn = document.querySelector('.submit-task-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitAllTasks);
    console.log('Ã¢Å“â€¦ Submit button listener attached');
  }
});
// ============================
// ROLE-BASED UI CONFIGURATION
// ============================

function configureProjectPageByRole() {
  const designation = sessionStorage.getItem('designation') || '';
  
  console.log('ðŸ” Configuring project page for designation:', designation);
  
  // Only ProjectHead gets full access
  if (designation === 'ProjectHead') {
    console.log('âœ… ProjectHead - Full access granted');
    return; // Exit - no restrictions needed
  }
  
  // ALL OTHER DESIGNATIONS - Apply restrictions
  console.log('âš ï¸ Limited access for:', designation);
  
  // 1. Hide "New Project" button
  const newProjectBtn = document.querySelector('.add-btn.primary-btn');
  if (newProjectBtn) {
    const btnText = newProjectBtn.textContent || newProjectBtn.innerText;
    if (btnText.includes('New Project')) {
      newProjectBtn.style.display = 'none';
      console.log('ðŸš« New Project button hidden');
    }
  }
  
  // 2. Remove delete buttons from already rendered rows
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => {
    btn.remove(); // Completely remove instead of just hiding
    console.log('ðŸš« Delete button removed');
  });
}

// ============================
// PROJECT OVERVIEW ROLE-BASED CONFIGURATION
// ============================

function configureProjectOverviewByRole() {
  const designation = sessionStorage.getItem('designation') || 
                     JSON.parse(sessionStorage.getItem('currentUser') || '{}').designation;
  
  console.log('ðŸ” Configuring project overview for designation:', designation);
  
  // Get button elements
  const addEmployeeBtn = document.querySelector('button[onclick*="openProjectAllocationForm"]');
  const addTaskBtn = document.querySelector('button[onclick*="openTaskAllocationForm"]');
  
  // âœ… Check if view button already exists to prevent duplicates
  const existingViewBtn = document.querySelector('.view-employee-btn');
  
  if (designation === 'ProjectHead') {
    // ProjectHead: Keep all buttons as-is
    console.log('âœ… ProjectHead - Full access to overview page');
    if (addEmployeeBtn) addEmployeeBtn.style.display = 'inline-flex';
    if (addTaskBtn) addTaskBtn.style.display = 'inline-flex';
    
    // Remove view button if it exists (in case role changed)
    if (existingViewBtn) existingViewBtn.remove();
    
    return;
  }
  
  // ALL OTHER DESIGNATIONS - Apply restrictions
  console.log('âš ï¸ Employee view mode for:', designation);
  
  // 1. Replace "Add Employee" with "View Employees"
  if (addEmployeeBtn) {
    // Hide original Add Employee button
    addEmployeeBtn.style.display = 'none';
    
    // âœ… Only create View Employees button if it doesn't exist
    if (!existingViewBtn) {
      const viewEmployeeBtn = document.createElement('button');
      viewEmployeeBtn.className = addEmployeeBtn.className.replace('add-employee-btn', '') + ' view-employee-btn'; // Add unique class
      viewEmployeeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        View 
      `;
      viewEmployeeBtn.onclick = openViewEmployeesModal;
      
      // Insert after the hidden button
      addEmployeeBtn.parentNode.insertBefore(viewEmployeeBtn, addEmployeeBtn.nextSibling);
      console.log('âœ… Added "View Employees" button');
    } else {
      // Button already exists, just make sure it's visible
      existingViewBtn.style.display = 'inline-flex';
      console.log('âœ… "View Employees" button already exists');
    }
  }
  
  // 2. Hide "Add Task" button completely
  if (addTaskBtn) {
    addTaskBtn.style.display = 'none';
    console.log('ðŸš« "Add Task" button hidden');
  }
  
  // 3. Make task table read-only (disable edit/delete in tasks table)
  document.querySelectorAll('.task-edit-btn, .task-delete-btn').forEach(btn => {
    btn.style.display = 'none';
  });
}



// ============================
// VIEW EMPLOYEES MODAL FUNCTIONS
// ============================

async function openViewEmployeesModal() {
  const modal = document.getElementById('viewEmployeesModal');
  const projectId = currentProjectId || window.currentProjectId || getProjectIdFromSession();
  
  if (!projectId) {
    showToast('Project not found', 'error');
    return;
  }
  
  console.log('ðŸ“‹ Opening view employees modal for project:', projectId);
  
  // âœ… Update modal title with actual project name
  const projectName = sessionStorage.getItem('currentProjectName') || 
                     JSON.parse(sessionStorage.getItem('currentProject') || '{}').project_name || 
                     'Project';
  const modalTitle = modal.querySelector('.modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = `Manage Employees (${projectName})`;
  }
  
  // Show modal
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
  
  // Load allocated employees
  await loadAllocatedEmployeesView(projectId);
}

function closeViewEmployeesModal() {
  const modal = document.getElementById('viewEmployeesModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scroll
  }
  
  // Clear search
  const searchInput = document.getElementById('viewEmployeeSearch');
  if (searchInput) searchInput.value = '';
}
async function loadAllocatedEmployeesView(projectId) {
  try {
   const url = `https://www.fist-o.com/web_crm/get_allocated_employees.php?project_id=${projectId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    let employees = [];
    if (data.success && data.data && Array.isArray(data.data.employees)) {
      employees = data.data.employees;
    }
    
    const countElement = document.getElementById('viewAllocatedCount');
    if (countElement) {
      countElement.textContent = employees.length;
    }
    
    displayAllocatedEmployeesView(employees);
    
  } catch (error) {
    console.error('âŒ ERROR:', error);
    showToast('Failed to load employees', 'error');
  }
}


function displayAllocatedEmployeesView(employees) {
  console.log('ðŸ”µ === DISPLAYING EMPLOYEES ===');
  console.log('ðŸ“‹ Employees array:', employees);
  console.log('ðŸ“‹ Array length:', employees ? employees.length : 'null/undefined');
  
  const container = document.getElementById('viewAllocatedEmployeesList');
  
  if (!container) {
    console.error('âŒ Container #viewAllocatedEmployeesList NOT FOUND!');
    alert('Error: Container element is missing from HTML!');
    return;
  }
  
  console.log('âœ… Container found');
  
  // Clear container
  container.innerHTML = '';
  
  // Check if empty
  if (!employees || employees.length === 0) {
    console.log('âš ï¸ No employees to display');
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #888;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin-bottom: 16px;">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p style="margin: 0; font-size: 16px;">No employees allocated to this project</p>
      </div>
    `;
    return;
  }
  
  console.log(`ðŸ“‹ Creating ${employees.length} employee cards...`);
  
  // Create employee cards
  employees.forEach((employee, index) => {
    console.log(`ðŸ‘¤ Employee ${index + 1}:`, employee);
    
    const employeeCard = document.createElement('div');
    employeeCard.style.cssText = 'display: flex; align-items: center; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff; margin-bottom: 10px; transition: all 0.2s;';
    employeeCard.onmouseover = function() { this.style.background = '#f9fafb'; };
    employeeCard.onmouseout = function() { this.style.background = '#ffffff'; };
    
    // Get data - match your PHP response structure
    const name = employee.emp_name || employee.empname || 'Unknown';
    const empId = employee.emp_id || employee.empid || 'N/A';
    const designation = employee.designation || '';
    const teamName = employee.team_name || '';
    
    const initials = getEmployeeInitials(name);
    const avatarColor = getAvatarColor(empId);
    
    employeeCard.innerHTML = `
      <div style="width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: ${avatarColor}; color: white; font-weight: 600; font-size: 16px; margin-right: 14px; flex-shrink: 0; text-transform: uppercase;">
        ${initials}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; font-size: 15px; color: #1f2937; margin-bottom: 2px;">${name}</div>
        ${designation ? `<div style="font-size: 13px; color: #6b7280;">${designation}</div>` : ''}
        ${teamName ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">Team: ${teamName}</div>` : ''}
      </div>
    `;
    
    container.appendChild(employeeCard);
    console.log(`  âœ… Card ${index + 1} added for ${name}`);
  });
  
  console.log(`âœ… Successfully displayed ${employees.length} employees`);
}

// Helper functions
function getEmployeeInitials(name) {
  if (!name || name === 'Unknown') return '?';
  const cleaned = name.trim().toUpperCase();
  const parts = cleaned.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[parts.length - 1][0];
  }
  return cleaned.substring(0, 1);
}

function getAvatarColor(id) {
  const colors = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e74c3c'];
  if (!id) return colors[0];
  const hash = id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}




function switchViewTab(tab) {
  // For view-only mode, only one tab is shown
  console.log('ðŸ“‹ Viewing:', tab);
}

// Helper functions
function getEmployeeInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(id) {
  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
  const index = (id || '').toString().charCodeAt(0) % colors.length;
  return colors[index];
}

// Search functionality for view modal
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('viewEmployeeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const employeeCards = document.querySelectorAll('#viewAllocatedEmployeesList .employee-card-view');
      
      employeeCards.forEach(card => {
        const name = card.querySelector('.employee-name').textContent.toLowerCase();
        const id = card.querySelector('.employee-id').textContent.toLowerCase();
        const designation = card.querySelector('.employee-designation').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || id.includes(searchTerm) || designation.includes(searchTerm)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});





// ============================
// GLOBAL EXPORTS
// ============================

window.viewProject = viewProject;
window.showProjectsList = showProjectsList;
window.openProjectForm = openProjectForm;
window.closeProjectForm = closeProjectForm;
window.openTaskAllocationForm = openTaskAllocationForm;
window.closeTaskAllocationForm = closeTaskAllocationForm;
window.openProjectAllocationForm = openProjectAllocationForm;
window.closeProjectAllocationForm = closeProjectAllocationForm;
window.handleClientSelection = handleClientSelection;
window.loadProjects = loadProjects;
window.initializeProjectDashboard = initializeProjectDashboard;
window.setupProjectDetailTabs = setupProjectDetailTabs;
window.loadResourcesContent = loadResourcesContent;
window.loadAnalyticsContent = loadAnalyticsContent;
window.confirmDeleteProject = confirmDeleteProject;
window.fetchProjectEmployees = fetchProjectEmployees;
window.populateEmployeeDropdown = populateEmployeeDropdown;
window.addToSelectedList = addToSelectedList;
window.submitEmployees = submitEmployees;
window.removeAllocatedEmployee = removeAllocatedEmployee; // Ã¢ÂÅ’ THIS IS MISSING!
window.fetchTaskAllocationTeams = fetchTaskAllocationTeams;
window.populateTaskTeamDropdown = populateTaskTeamDropdown;
window.handleTaskTeamChange = handleTaskTeamChange;
window.handleAddTaskToTable = handleAddTaskToTable;
window.removeTaskFromTable = removeTaskFromTable;
window.submitAllTasks = submitAllTasks;
window.updateTempTaskTable = updateTempTaskTable;
window.formatDateDisplay = formatDateDisplay;
window.fetchAndDisplayAllocatedInModal = fetchAndDisplayAllocatedInModal;
window.displayAllocatedInModal = displayAllocatedInModal;
window.showEmptyStateInModal = showEmptyStateInModal;
window.displayNewSelectionsInModal = displayNewSelectionsInModal;
window.removeFromNewSelection = removeFromNewSelection;
window.updateProjectOverviewEmployeeAvatars = updateProjectOverviewEmployeeAvatars;
window.getTeamBadgeClass = getTeamBadgeClass;
window.configureProjectOverviewByRole = configureProjectOverviewByRole;
window.openViewEmployeesModal = openViewEmployeesModal;
window.closeViewEmployeesModal = closeViewEmployeesModal;
window.loadAllocatedEmployeesView = loadAllocatedEmployeesView;
window.displayAllocatedEmployeesView = displayAllocatedEmployeesView;
window.getEmployeeInitials = getEmployeeInitials;
window.getAvatarColor = getAvatarColor;
window.openViewEmployeesModal = openViewEmployeesModal;
window.closeViewEmployeesModal = closeViewEmployeesModal;
window.displayAllocatedEmployeesView = displayAllocatedEmployeesView;
window.switchViewTab = switchViewTab;
window.getEmployeeInitials = getEmployeeInitials;
window.getAvatarColor = getAvatarColor;
window.configureProjectOverviewByRole = configureProjectOverviewByRole;
window.handleAddReport = handleAddReport;
window.handleViewReports = handleViewReports;


console.log('Ã¢Å“â€¦ Project.js loaded successfully - All functions organized and deduplicated!');