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
    .then(() => {
      console.log('✅ Clients loaded, now loading projects...');
      return loadProjects();
    })
    .then(() => {
      renderProjectsList();
      setupEventListeners();
      console.log('✅ Project Dashboard initialized successfully');
    })
    .catch(err => {
      console.error('❌ Error initializing dashboard:', err);
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
      fillField('projectCustomerId', selectedOption.dataset.customerId || '', true);
      
      // Auto-fill Project Description (editable)
      fillField('projectDescriptionForm', selectedOption.dataset.projectDescription || '', false);
      
      // Auto-fill Contact Details (read-only)
      fillField('contactPersonForm', selectedOption.dataset.contactPerson || '', true);
      fillField('contactNumberForm', selectedOption.dataset.phone || '', true);
      fillField('contactEmailForm', selectedOption.dataset.email || '', true);
      fillField('contactDesignationForm', selectedOption.dataset.designation || '', true);
      
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
    'projectDescription',
    'contactPerson',
    'contactNumber',
    'contactEmail',
    'contactDesignation'
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
    console.log('📡 Fetching projects...');
    
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_projects.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      projectsData = result.data.map(proj => ({
        id: proj.id,
        name: proj.project_name || proj.project_description?.substring(0, 50) || 'Unnamed Project',
        client: proj.company_name || proj.customer_name,
        customerId: proj.customer_id,
        customerName: proj.customer_name,
        teamHead: { 
          name: proj.team_head || 'N/A', 
          avatar: 'img/Profileimg.png'
        },
        startDate: formatDate(proj.start_date),
        deadline: formatDate(proj.deadline),
        description: proj.project_description || 'N/A',
        priority: proj.priority || 'Medium',
        allocatedTeam: proj.allocated_team || 'N/A',
        initiatedBy: { 
          name: proj.initiated_by || 'N/A', 
          avatar: 'img/Profileimg.png'
        },
        employees: proj.employees || [],
        tasks: proj.tasks || []
      }));
      
      console.log(`✅ Loaded ${projectsData.length} projects`);
      renderProjectsList();
    } else {
      console.warn('⚠️ No projects found');
      projectsData = [];
      renderProjectsList();
    }
  } catch (err) {
    console.error('❌ Error loading projects:', err);
    projectsData = [];
    renderProjectsList();
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

async function handleProjectFormSubmit(e) {
  e.preventDefault();
  
  const customerId = document.getElementById('onboardedProjectSelect')?.value;
  if (!customerId) {
    showToast('Please select an onboarded project', 'error');
    return;
  }
  
  const client = clientsData.find(c => c.customerId === customerId);
  
  const projectData = {
    customer_id: customerId,
    company_name: client?.companyName || '',
    customer_name: client?.customerName || '',
    project_description: document.getElementById('projectDescription')?.value,
    contact_person: document.getElementById('contactPerson')?.value,
    contact_number: document.getElementById('contactNumber')?.value,
    contact_email: document.getElementById('contactEmail')?.value,
    contact_designation: document.getElementById('contactDesignation')?.value,
    start_date: document.getElementById('date')?.value,
    deadline: document.getElementById('deadline')?.value,
    team_head: document.getElementById('reportingPerson')?.value,
    allocated_team: document.getElementById('allocatedteam')?.value,
    remarks: document.getElementById('projectremarks')?.value
  };
  
  console.log('📤 Submitting:', projectData);
  
  try {
    const response = await fetch('https://www.fist-o.com/web_crm/create_project.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      await loadProjects();
      closeProjectForm();
      showToast('Project created successfully!', 'success');
    } else {
      showToast(result.message || 'Failed to create project', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
    console.error('Error:', err);
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