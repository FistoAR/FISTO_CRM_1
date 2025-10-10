// ============================
// UNIFIED PROJECT DASHBOARD WITH CLIENT INTEGRATION
// ============================

let projectsData = [];
let clientsData = [];
let currentProjectId = null;
let currentPage = 1;
const projectsPerPage = 10;

// ============================
// INITIALIZATION
// ============================

function initializeProjectDashboard() {
  console.log('🚀 Initializing Project Dashboard...');
  
  loadOnboardedClients()
    .then(() => loadProjects())
    .then(() => {
      displayProjectsTable(projectsData);
      setupEventListeners();
      console.log('✅ Dashboard initialized');
    })
    .catch(err => {
      console.error('❌ Error:', err);
      showToast('Failed to initialize dashboard', 'error');
    });
}

// ============================
// FETCH ONBOARDED CLIENTS WITH PROJECTS
// ============================

async function loadOnboardedClients() {
  try {
    console.log('📡 Fetching onboarded clients from API...');
    
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_addprojectdetails.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 API Response:', result);
    
    if (result.status === 'success') {
      const data = result.data || [];
      
      console.log(`📊 Total onboarded projects: ${data.length}`);
      
      // Debug first record
      if (data.length > 0) {
        console.log('🔍 First record structure:', data[0]);
      }
      
      // Map to clientsData format
      clientsData = data.map(client => ({
        id: client.client_id,
        customerId: client.customer_id,
        projectName: client.project_name || client.company_name || 'N/A',
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
      
      console.log(`✅ Loaded ${clientsData.length} onboarded clients`);
      populateClientDropdown();
      return clientsData;
    } else {
      console.warn('⚠️ No clients returned or status not success');
      return [];
    }
  } catch (err) {
    console.error('❌ Error loading clients:', err);
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
    console.error('❌ onboardedProjectSelect dropdown not found!');
    return;
  }

  console.log('🔄 Populating dropdown with', clientsData.length, 'projects');

  // Clear existing options
  clientSelect.innerHTML = '<option value="">-- Select Onboarded Project --</option>';
  
  if (clientsData.length === 0) {
    const noDataOption = document.createElement('option');
    noDataOption.value = '';
    noDataOption.textContent = '-- No onboarded projects available --';
    noDataOption.disabled = true;
    clientSelect.appendChild(noDataOption);
    console.warn('⚠️ No projects to populate');
    return;
  }

  clientsData.forEach((client, index) => {
    const option = document.createElement('option');
    option.value = client.customerId;
    
    // Display format: "Project Name - Company Name (Customer ID)"
    const displayText = client.projectName !== 'N/A' 
      ? `${client.projectName} - ${client.companyName} (${client.customerId})`
      : `${client.companyName} (${client.customerId})`;
    
    option.textContent = displayText;
    
    // Store all data in dataset
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
    
    if (index === 0) {
      console.log('📝 Sample dropdown option:', {
        value: option.value,
        text: option.textContent,
        dataset: option.dataset
      });
    }
  });
  
  console.log(`✅ Dropdown populated with ${clientsData.length} options`);
}

// ============================
// AUTO-FILL ON CLIENT SELECTION
// ============================

function handleClientSelection() {
  const clientSelect = document.getElementById('onboardedProjectSelect');
  
  if (!clientSelect) {
    console.error('❌ Dropdown not found!');
    return;
  }

  const selectedValue = clientSelect.value;
  console.log('🔍 Selected customer ID:', selectedValue);
  
  if (!selectedValue) {
    console.log('🔄 No selection, clearing fields');
    clearContactFields();
    return;
  }

  const selectedOption = clientSelect.options[clientSelect.selectedIndex];
  console.log('📦 Selected option dataset:', selectedOption.dataset);
  
  // Use requestAnimationFrame to ensure DOM is fully ready
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Auto-fill Customer ID (read-only)
      fillField('projectCustomerId', selectedOption.dataset.customerId || '', false);
      
      // Auto-fill Project Description (editable)
      fillField('projectDescriptionForm', selectedOption.dataset.projectDescription || '', false);
      
      // Auto-fill Contact Details (read-only)
      fillField('contactPersonForm', selectedOption.dataset.contactPerson || '', false);
      fillField('contactNumberForm', selectedOption.dataset.phone || '', false);
      fillField('contactEmailForm', selectedOption.dataset.email || '', false);
      fillField('contactDesignationForm', selectedOption.dataset.designation || '', false);
      
      showToast(`✓ Loaded: ${selectedOption.dataset.projectName}`, 'success');
    }, 150);
  });
}

// New helper function to fill fields reliably
function fillField(fieldId, value, isReadOnly = false) {
  const field = document.getElementById(fieldId);
  
  if (!field) {
    console.error(`❌ Field "${fieldId}" not found!`);
    return;
  }
  
  console.log(`📝 Filling ${fieldId} with: "${value}"`);
  
  // Remove any attributes that might interfere
  field.removeAttribute('placeholder');
  field.removeAttribute('disabled');
  
  // Make absolutely sure the field and all parents are visible
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
  
  // Set readonly BEFORE setting value
  field.readOnly = isReadOnly;
  
  // Apply styling
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
  
  // Critical: Set value property directly
  field.value = value;
  
  // Also set as attribute for debugging
  field.setAttribute('value', value);
  field.setAttribute('data-filled', 'true');
  
  // For textarea, also set innerHTML as backup
  if (field.tagName === 'TEXTAREA') {
    field.innerHTML = value;
    field.textContent = value;
  }
  
  // Trigger all possible events
  const events = ['input', 'change', 'blur', 'keyup'];
  events.forEach(eventType => {
    field.dispatchEvent(new Event(eventType, { bubbles: true }));
  });
  
  // Final check
  setTimeout(() => {
    const actualValue = field.value;
    const isVisible = field.offsetParent !== null;
    console.log(`✅ ${fieldId}: value="${actualValue}", visible=${isVisible}`);
    
    if (!isVisible) {
      console.warn(`⚠️ ${fieldId} is still not visible! Parent chain:`, getParentChain(field));
    }
    
    if (actualValue !== value) {
      console.error(`❌ ${fieldId} value mismatch! Expected "${value}", got "${actualValue}"`);
    }
  }, 100);
}

// Helper to debug parent chain
function getParentChain(element) {
  const chain = [];
  let parent = element;
  while (parent && parent !== document.body) {
    chain.push({
      tag: parent.tagName,
      id: parent.id,
      class: parent.className,
      display: window.getComputedStyle(parent).display,
      visibility: window.getComputedStyle(parent).visibility
    });
    parent = parent.parentElement;
  }
  return chain;
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
  
  console.log('🧹 Fields cleared');
}

// ============================
// LOAD PROJECTS
// ============================

async function loadProjects() {
  try {
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_projects.php');
    const result = await response.json();

    if (result.success && result.data) {
      projectsData = result.data;
      displayProjectsTable(projectsData);
      console.log(`✅ Loaded ${projectsData.length} projects`);
      return projectsData;
    } else {
      projectsData = [];
      displayProjectsTable([]);
      showToast('No projects found', 'info');
      return [];
    }
  } catch (err) {
    console.error('❌ Error loading projects:', err);
    projectsData = [];
    displayProjectsTable([]);
    showToast('Failed to load projects', 'error');
    return [];
  }
}
// ============================
// DISPLAY PROJECTS IN TABLE
// ============================

function displayProjectsTable(projects) {
  const tableBody = document.getElementById('projectsListTableBody');
  
  if (!tableBody) {
    console.error('❌ Table body element not found');
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = '';

  if (projects.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
          <div class="empty-content">
            <i class="fas fa-project-diagram"></i>
            <p>No projects found</p>
            <small>Click "New Project" to get started</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Create table rows
  projects.forEach(project => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="project-name-cell">
          <span class="project-title">${project.companyName || 'N/A'}</span>
        </div>
      </td>
      <td>${project.reportingPerson || 'N/A'}</td>
      <td>${formatDate(project.startDate)}</td>
      <td>${formatDate(project.completionDate)}</td>
      <td>
        <button class="action-btn view-btn" onclick="viewProject('${project.projectId}')" title="View Project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View
        </button>
        <button class="action-btn delete-btn" onclick="confirmDeleteProject('${project.projectId}', '${escapeHtml(project.companyName)}')" title="Delete Project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Update project count
  const projectCount = document.getElementById('projectCount');
  if (projectCount) {
    projectCount.textContent = projects.length;
  }
}

// ============================
// VIEW PROJECT DETAILS (SHOW DETAIL VIEW)
// ============================

async function viewProject(projectId) {
  try {
    showLoadingSpinner();
    
    const response = await fetch(`https://www.fist-o.com/web_crm/fetch_projects.php?project_id=${projectId}`);
    const result = await response.json();
    
    hideLoadingSpinner();
    
    if (result.success && result.data && result.data.length > 0) {
      const project = result.data[0];
      currentProjectId = projectId;
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

function showProjectDetailView(project) {
  // Hide list view
  document.getElementById('projects-list-view').style.display = 'none';
  
  // Show detail view
  document.getElementById('project-detail-view').style.display = 'block';
  
  // Update breadcrumb
  const breadcrumbName = document.getElementById('breadcrumbProjectName');
  if (breadcrumbName) {
    breadcrumbName.textContent = project.companyName || 'Project';
  }
  
  // Populate project details
  populateProjectDetails(project);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// POPULATE PROJECT DETAILS
// ============================

function populateProjectDetails(project) {
  // Project Name and Description
  const projectNameTitle = document.getElementById('projectNameTitle');
  if (projectNameTitle) projectNameTitle.textContent = project.companyName || 'N/A';
  
  const projectDescription = document.getElementById('projectDescription');
  if (projectDescription) projectDescription.textContent = project.projectDescription || 'No description available.';
  
  // Dates
  const projectStartDate = document.getElementById('projectStartDate');
  if (projectStartDate) projectStartDate.textContent = formatDate(project.startDate);
  
  const projectDeadlineDate = document.getElementById('projectDeadlineDate');
  if (projectDeadlineDate) projectDeadlineDate.textContent = formatDate(project.completionDate);
  
  // Team information
  const reportingPerson = document.getElementById('teamHeadName');
  if (reportingPerson) reportingPerson.textContent = project.reportingPerson || 'N/A';
  
  // Stats (default values - can be updated from tasks API)
  updateProjectStats({
    assignedEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    ongoingTasks: 0,
    delayedTasks: 0,
    overdueT: 0
  });
  
  // Load tasks for this project (if you have tasks API)
  loadProjectTasks(project.projectId);
}
// ============================
// UPDATE PROJECT STATS
// ============================

function updateProjectStats(stats) {
  const elements = {
    assignedEmployeesCount: stats.assignedEmployees || 0,
    totalTasksCount: stats.totalTasks || 0,
    completedTasksCount: stats.completedTasks || 0,
    ongoingTasksCount: stats.ongoingTasks || 0,
    delayedTasksCount: stats.delayedTasks || 0,
    overdueTasksCount: stats.overdueTasks || 0
  };
  
  Object.keys(elements).forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = elements[id];
  });
}


// ============================
// LOAD PROJECT TASKS
// ============================

async function loadProjectTasks(projectId) {
  const tableBody = document.getElementById('projectTasksTableBody');
  
  if (!tableBody) return;
  
  // Show empty state for now (you can implement tasks API later)
  tableBody.innerHTML = `
    <tr class="empty-state">
      <td colspan="7">
        <div class="empty-content" style="text-align: center; padding: 40px; color: #666;">
          <i class="fas fa-tasks" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
          <p>No tasks found</p>
          <small>Click "Add Task" to get started</small>
        </div>
      </td>
    </tr>
  `;
}

// ============================
// SHOW PROJECTS LIST (BACK BUTTON)
// ============================

function showProjectsList() {
  // Hide detail view
  document.getElementById('project-detail-view').style.display = 'none';
  
  // Show list view
  document.getElementById('projects-list-view').style.display = 'block';
  
  currentProjectId = null;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// OPEN/CLOSE PROJECT FORM
// ============================

function openProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'block';
    modal.classList.add('show');
    
    const form = document.getElementById('projectForm');
    if (form) form.reset();
    
    clearContactFields();
    
    // Reload clients if needed
    if (clientsData.length === 0) {
      loadOnboardedClients();
    }
  }
}

function closeProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}

// ============================
// RENDER PROJECTS LIST
// ============================

function renderProjectsList() {
  const tbody = document.getElementById('projectsListTableBody');
  const projectCount = document.getElementById('projectCount');
  
  if (!tbody) return;
  
  if (projectCount) {
    projectCount.textContent = projectsData.length;
  }
  
  tbody.innerHTML = '';
  
  if (projectsData.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="empty-content">
            <i class="fas fa-project-diagram"></i>
            <p>No projects found</p>
            <small>Click "New Project" to get started</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = projectsData.slice(startIndex, endIndex);
  
  paginatedProjects.forEach(project => {
    const row = createProjectRow(project);
    tbody.appendChild(row);
  });
  
  updatePagination();
}

function createProjectRow(project) {
  const tr = document.createElement('tr');
  
  tr.innerHTML = `
    <td>
      <div class="project-name-cell">
        <div class="project-info-cell">
          <span class="project-title">${project.name}</span>
          <span class="project-client">${project.client || 'N/A'}</span>
        </div>
      </div>
    </td>
    <td>
      <div class="team-head-cell">
        <img src="${project.teamHead?.avatar || 'img/Profileimg.png'}" 
             alt="${project.teamHead?.name || 'N/A'}" 
             class="team-head-avatar">
        <span class="team-head-name">${project.teamHead?.name || 'N/A'}</span>
      </div>
    </td>
    <td class="project-date-cell">${project.startDate || 'N/A'}</td>
    <td class="project-date-cell">${project.deadline || 'N/A'}</td>
    <td>
      <button class="project-view-btn" onclick="viewProjectDetail(${project.id})">View</button>
    </td>
  `;
  
  return tr;
}

// ============================
// PROJECT DETAIL VIEW
// ============================

function viewProjectDetail(projectId) {
  currentProjectId = projectId;
  const project = projectsData.find(p => p.id === projectId);
  
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }
  
  document.getElementById('projects-list-view').style.display = 'none';
  document.getElementById('project-detail-view').style.display = 'block';
  
  document.getElementById('breadcrumbProjectName').textContent = project.name;
  renderProjectDetail(project);
}

function renderProjectDetail(project) {
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
  const ongoingTasks = project.tasks?.filter(t => t.status === 'working').length || 0;
  const assignedEmployees = new Set(project.tasks?.map(t => t.assignedTo?.name)).size || 0;
  
  document.getElementById('assignedEmployeesCount').textContent = assignedEmployees;
  document.getElementById('totalTasksCount').textContent = totalTasks;
  document.getElementById('completedTasksCount').textContent = completedTasks;
  document.getElementById('ongoingTasksCount').textContent = ongoingTasks;
  document.getElementById('delayedTasksCount').textContent = '0';
  document.getElementById('overdueTasksCount').textContent = '0';
  
  document.getElementById('projectNameTitle').textContent = project.name;
  document.getElementById('projectDescription').textContent = project.description || 'No description available.';
  document.getElementById('projectPriority').textContent = project.priority || 'Medium';
  
  if (project.initiatedBy) {
    document.getElementById('initiatorName').textContent = project.initiatedBy.name;
    document.getElementById('initiatorAvatar').src = project.initiatedBy.avatar;
  }
  
  if (project.teamHead) {
    document.getElementById('teamHeadName').textContent = project.teamHead.name;
    document.getElementById('teamHeadAvatar').src = project.teamHead.avatar;
  }
  
  document.getElementById('projectStartDate').textContent = project.startDate || 'N/A';
  document.getElementById('projectDeadlineDate').textContent = project.deadline || 'N/A';
  
  renderProjectTasks(project.tasks || []);
}

function renderProjectTasks(tasks) {
  const tbody = document.getElementById('projectTasksTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (tasks.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="7">
          <div class="empty-content">
            <i class="fas fa-tasks"></i>
            <p>No tasks found</p>
            <small>Click "Add Task" to get started</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tasks.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${task.title}</td>
      <td>
        <div class="task-assignee">
          <img src="${task.assignedBy?.avatar || 'img/Profileimg.png'}" 
               alt="${task.assignedBy?.name || 'N/A'}" 
               class="task-assignee-avatar">
          <span class="task-assignee-name">${task.assignedBy?.name || 'N/A'}</span>
        </div>
      </td>
      <td>
        <div class="task-assignee">
          <img src="${task.assignedTo?.avatar || 'img/Profileimg.png'}" 
               alt="${task.assignedTo?.name || 'N/A'}" 
               class="task-assignee-avatar">
          <span class="task-assignee-name">${task.assignedTo?.name || 'N/A'}</span>
        </div>
      </td>
      <td>${task.startDate || 'N/A'}</td>
      <td>${task.endDate || 'N/A'}</td>
      <td>
        <span class="status-badge ${task.status || 'pending'}">
          ${getStatusText(task.status)}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getStatusText(status) {
  const statusMap = {
    'done': 'Done',
    'working': 'Working on it',
    'stuck': 'Stuck',
    'pending': 'Pending'
  };
  return statusMap[status] || 'Pending';
}

function showProjectsList() {
  document.getElementById('project-detail-view').style.display = 'none';
  document.getElementById('projects-list-view').style.display = 'block';
  currentProjectId = null;
}

// ============================
// ADD NEW PROJECT
// ============================

function openProjectForm() {
  console.log('📝 Opening project form...');
  
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.classList.add('show');
    modal.style.display = 'block';
    
    const form = document.getElementById('projectForm');
    if (form) form.reset();
    
    clearContactFields();
    
    if (clientsData.length > 0) {
      populateClientDropdown();
    } else {
      console.warn('⚠️ No clients, reloading...');
      loadOnboardedClients();
    }
  }
}

function closeProjectForm() {
  const modal = document.getElementById('addProjectModal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
}

// ============================
// SUBMIT PROJECT FORM (FIXED)
// ============================

async function handleProjectFormSubmit(e) {
  e.preventDefault();
  
  const customerId = document.getElementById('onboardedProjectSelect')?.value;
  if (!customerId) {
    showToast('Please select an onboarded project', 'error');
    return;
  }
  
  // Find the selected client
  const client = clientsData.find(c => c.customer_id === customerId);
  
  const projectData = {
    customerId: customerId,
    companyName: client?.company_name || '',
    customerName: client?.customer_name || '',
    projectDescription: document.getElementById('projectDescriptionForm')?.value || '',
    contactPerson: document.getElementById('contactPersonForm')?.value || '',
    contactNumber: document.getElementById('contactNumberForm')?.value || '',
    contactEmail: document.getElementById('contactEmailForm')?.value || '',
    contactDesignation: document.getElementById('contactDesignationForm')?.value || '',
    startDate: document.getElementById('date')?.value || '',
    completionDate: document.getElementById('deadline')?.value || '',
    reportingPerson: document.getElementById('reportingPerson')?.value || '',
    allocatedTeam: document.getElementById('allocatedteam')?.value || '',
    remarks: document.getElementById('projectremarks')?.value || 'N/A'
  };

  console.log('📤 Submitting project:', projectData);
  
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
      showToast('✅ Project created successfully!', 'success');
      closeProjectForm();
      await loadProjects(); // Reload projects
      
      // Reset form
      const form = document.getElementById('projectForm');
      if (form) form.reset();
      clearContactFields();
    } else {
      const errorMsg = result.message || 'Failed to create project';
      showToast(errorMsg, 'error');
      console.error('Server error:', result);
    }
  } catch (err) {
    hideLoadingSpinner();
    console.error('❌ Error:', err);
    showToast('Error: ' + err.message, 'error');
  }
}

// ============================
// EVENT LISTENERS
// ============================

function setupEventListeners() {
  console.log('🔗 Setting up event listeners...');
  
  // Client selection
  const clientSelect = document.getElementById('onboardedProjectSelect');
  if (clientSelect) {
    clientSelect.removeEventListener('change', handleClientSelection);
    clientSelect.addEventListener('change', handleClientSelection);
    console.log('✅ Client select listener attached');
  }
  
  // Form submission
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.removeEventListener('submit', handleProjectFormSubmit);
    projectForm.addEventListener('submit', handleProjectFormSubmit);
    console.log('✅ Form submit listener attached');
  }
  
  // Search
  const searchInput = document.getElementById('projectSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterProjects(e.target.value));
  }
  
  // Pagination
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
  
  console.log('✅ All listeners attached');
}

// ============================
// UTILITIES
// ============================

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function updatePagination() {
  const totalPages = Math.ceil(projectsData.length / projectsPerPage);
  const paginationNumbers = document.getElementById('paginationNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (!paginationNumbers) return;
  
  paginationNumbers.innerHTML = '';
  
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const btn = document.createElement('button');
    btn.className = 'page-number' + (i === currentPage ? ' active' : '');
    btn.textContent = i.toString().padStart(2, '0');
    btn.onclick = () => goToPage(i);
    paginationNumbers.appendChild(btn);
  }
  
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function goToPage(page) {
  currentPage = page;
  renderProjectsList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterProjects(searchTerm) {
  if (!searchTerm) {
    renderProjectsList();
    return;
  }
  
  const filtered = projectsData.filter(project => {
    const search = searchTerm.toLowerCase();
    return project.name.toLowerCase().includes(search) ||
           (project.client && project.client.toLowerCase().includes(search)) ||
           (project.teamHead?.name && project.teamHead.name.toLowerCase().includes(search));
  });
  
  const tbody = document.getElementById('projectsListTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="empty-content">
            <i class="fas fa-search"></i>
            <p>No projects match "${searchTerm}"</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  filtered.forEach(project => {
    tbody.appendChild(createProjectRow(project));
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('projectToastContainer') || document.getElementById('toast-container');
  if (!container) {
    console.log('📢 Toast:', message);
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<p>${message}</p>`;
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

function openTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) modal.style.display = 'block';
}

function closeTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) modal.style.display = 'none';
}

function openProjectAllocationForm() {
  const modal = document.getElementById('addProjectAllocationModal');
  if (modal) modal.style.display = 'block';
}

function closeProjectAllocationForm() {
  const modal = document.getElementById('addProjectAllocationModal');
  if (modal) modal.style.display = 'none';
}

// ============================
// INITIALIZE ON DOM LOAD
// ============================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 DOM Loaded - Initializing...');
  initializeProjectDashboard();
});

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
      await loadProjects(); // Reload table
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
// UTILITY FUNCTIONS
// ============================

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
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
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
}
// ============================
// GLOBAL EXPORTS
// ============================

window.viewProjectDetail = viewProjectDetail;
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