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
    console.log('✅ Project stored in session:', projectData);
    return projectData;
  } catch (error) {
    console.error('❌ Error storing project session:', error);
    showToast('Error storing project data', 'error');
    return null;
  }
}

function getProjectSession() {
  try {
    const projectData = sessionStorage.getItem('currentProject');
    if (projectData) {
      const project = JSON.parse(projectData);
      console.log('✅ Retrieved project from session:', project);
      return project;
    }
    return null;
  } catch (error) {
    console.error('❌ Error retrieving project session:', error);
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
    console.log('🧹 Project session cleared');
  } catch (error) {
    console.error('❌ Error clearing project session:', error);
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
// FETCH ONBOARDED CLIENTS
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
  clientSelect.innerHTML = '<option value="">-- Select Project --</option>';
  
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
    
    const displayText = client.projectName !== 'N/A' 
      ? `${client.projectName} - ${client.companyName} (${client.customerId})`
      : `${client.companyName} (${client.customerId})`;
    
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
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      fillField('projectCustomerId', selectedOption.dataset.customerId || '', false);
      fillField('projectDescriptionForm', selectedOption.dataset.projectDescription || '', false);
      fillField('contactPersonForm', selectedOption.dataset.contactPerson || '', false);
      fillField('contactNumberForm', selectedOption.dataset.phone || '', false);
      fillField('contactEmailForm', selectedOption.dataset.email || '', false);
      fillField('contactDesignationForm', selectedOption.dataset.designation || '', false);
      
      showToast(`✓ Loaded: ${selectedOption.dataset.projectName}`, 'success');
    }, 150);
  });
}

function fillField(fieldId, value, isReadOnly = false) {
  const field = document.getElementById(fieldId);
  
  if (!field) {
    console.error(`❌ Field "${fieldId}" not found!`);
    return;
  }
  
  console.log(`📝 Filling ${fieldId} with: "${value}"`);
  
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
  
  console.log('🧹 Fields cleared');
}

// ============================
// LOAD PROJECTS
// ============================

async function loadProjects() {
  try {
    console.log('📡 Loading projects...');
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_projects.php');
    const result = await response.json();

    if (result.success && result.data) {
      projectsData = result.data;
      console.log(`✅ Loaded ${projectsData.length} projects`);
      
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
    console.error('❌ Error loading projects:', err);
    projectsData = [];
    currentPage = 1;
    displayProjectsTable([]);
    showToast('Failed to load projects', 'error');
    return [];
  }
}

// ============================
// DISPLAY PROJECTS TABLE
// ============================

function displayProjectsTable(projects) {
  const tableBody = document.getElementById('projectsListTableBody');
  const projectCount = document.getElementById('projectCount');
  
  if (!tableBody) {
    console.error('❌ Table body element not found');
    return;
  }

  if (projectCount) {
    projectCount.textContent = projects.length;
  }

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
    updatePaginationControls(0);
    return;
  }

  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  console.log(`📄 Displaying page ${currentPage}: showing ${paginatedProjects.length} of ${projects.length} projects`);

  paginatedProjects.forEach((project, index) => {
    const projectName = project.projectName || project.project_name || project.name || 'N/A';
    const companyName = project.companyName || project.company_name || 'N/A';
    const reportingPerson = project.reportingPerson || project.reporting_person || project.teamHead || project.team_head || 'N/A';
    const startDate = project.startDate || project.start_date || project.date || '';
    const completionDate = project.completionDate || project.completion_date || project.deadline || project.end_date || '';
    const projectId = project.projectId || project.project_id || project.id || index;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="project-name-cell">
          <span class="project-title">${projectName}</span>
        </div>
      </td>
      <td>${reportingPerson}</td>
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
        <button class="action-btn delete-btn" onclick="confirmDeleteProject('${projectId}', '${escapeHtml(projectName)}')" title="Delete Project">
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

  updatePaginationControls(projects.length);
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
    console.error('❌ Pagination elements not found!');
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

  console.log(`📊 Pagination: Page ${currentPage} of ${totalPages}`);
}

function goToPage(page) {
  const totalPages = Math.ceil(projectsData.length / projectsPerPage);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  
  console.log(`🔄 Going to page ${page}`);
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
    
    console.log('🔍 Fetching project with ID:', projectId);
    
    const response = await fetch(`https://www.fist-o.com/web_crm/fetch_projects.php?project_id=${projectId}`);
    const result = await response.json();
    
    hideLoadingSpinner();
    
    if (result.success && result.data && result.data.length > 0) {
      const project = result.data[0];
      
      console.log('📦 ===== FULL PROJECT DATA =====');
      console.log(JSON.stringify(project, null, 2));
      console.log('📦 =============================');
      
      // Check all possible ID fields
      console.log('🔍 Checking ID fields:');
      console.log('  - project.id:', project.id, typeof project.id);
      console.log('  - project.projectId:', project.projectId, typeof project.projectId);
      console.log('  - project.project_id:', project.project_id, typeof project.project_id);
      
      // STORE PROJECT IN SESSION
      storeProjectSession(project);
      
      // CRITICAL: Store the NUMERIC id for API calls
      // The database likely has: id (INT), project_id (VARCHAR)
      const numericId = project.id; // This is the auto-increment ID
      const stringProjectId = project.projectId || project.project_id || projectId;
      
      if (!numericId) {
        console.error('❌ No numeric ID found in project data');
        console.error('Available fields:', Object.keys(project));
        showToast('Error: Project structure issue. Check console.', 'error');
        return;
      }
      
      currentProjectId = numericId; // Use numeric ID for allocation API
      window.currentProjectId = numericId;
      window.projectStringId = stringProjectId; // Keep string ID for display
      
      console.log('✅ Set currentProjectId (numeric for API):', numericId, typeof numericId);
      console.log('✅ Set projectStringId (for display):', stringProjectId);
      
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
  const listView = document.getElementById('projects-list-view');
  const detailView = document.getElementById('project-detail-view');
  
  if (listView) listView.style.display = 'none';
  if (detailView) {
    detailView.style.display = 'block';
    
    // Store project ID in data attribute as backup
    const projectId = project.projectId || project.project_id || project.id;
    if (projectId) {
      detailView.setAttribute('data-project-id', projectId);
      console.log('✅ Stored project ID in DOM:', projectId);
    }
  }
  
  const breadcrumbName = document.getElementById('breadcrumbProjectName');
  if (breadcrumbName) {
    breadcrumbName.textContent = project.companyName || 'Project';
  }
  
  // CRITICAL: Store project ID from the project object
  const projectId = project.projectId || project.project_id || project.id;
  if (projectId) {
    currentProjectId = projectId;
    window.currentProjectId = projectId;
    console.log('✅ Stored project ID in variables:', projectId);
  }
  
  populateProjectDetails(project);
  setupProjectDetailTabs();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// POPULATE PROJECT DETAILS
// ============================

function populateProjectDetails(project) {
  const projectNameTitle = document.getElementById('projectNameTitle');
  if (projectNameTitle) projectNameTitle.textContent = project.companyName || 'N/A';
  
  const projectDescription = document.getElementById('projectDescription');
  if (projectDescription) projectDescription.textContent = project.projectDescription || 'No description available.';
  
  const projectStartDate = document.getElementById('projectStartDate');
  if (projectStartDate) projectStartDate.textContent = formatDate(project.startDate);
  
  const projectDeadlineDate = document.getElementById('projectDeadlineDate');
  if (projectDeadlineDate) projectDeadlineDate.textContent = formatDate(project.completionDate);
  
  const reportingPerson = document.getElementById('teamHeadName');
  if (reportingPerson) reportingPerson.textContent = project.reportingPerson || 'N/A';
  
  // CRITICAL: Ensure project ID is stored
  const projectId = project.projectId || project.project_id || project.id;
  if (projectId) {
    currentProjectId = projectId;
    window.currentProjectId = projectId;
    console.log('✅ Project ID stored from details:', projectId);
  }
  
  updateProjectStats({
    assignedEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    ongoingTasks: 0,
    delayedTasks: 0,
    overdueTasks: 0
  });
  
  loadProjectTasks(projectId);
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
  
  // 🔍 DEBUG: Log what we're about to send
  console.log('📦 Client data found:', client);
  console.log('📦 Project name from client:', client?.projectName);
  
  const projectData = {
    customerId: customerId,
    companyName: client?.companyName || '',
    customerName: client?.customerName || '',
     project_name: client?.project_name || client?.projectName || '', 
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

  console.log('📤 Submitting project data:', projectData);
  console.log('📤 Project name being sent:', projectData.projectName);

  
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
      await loadProjects();
      
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
  console.log('🔧 Setting up project detail tabs...');
  
  const tabButtons = document.querySelectorAll('.detail-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  if (tabButtons.length === 0) {
    console.warn('⚠️ No tab buttons found');
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
      console.log(`🔄 Switching to tab: ${targetTab}`);
      
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
        console.log(`✅ Showing ${targetTab} panel`);
        
        if (targetTab === 'resources') {
          loadResourcesContent();
        } else if (targetTab === 'analytics') {
          loadAnalyticsContent();
        }
      }
    });
  });
  
  console.log('✅ Tab switching setup complete');
}


// ============================
// LOAD RESOURCES CONTENT
// ============================

function loadResourcesContent() {
  console.log('📦 Loading resources content...');
  
  const resourcesPanel = document.getElementById('resources-panel');
  if (!resourcesPanel) {
    console.error('❌ Resources panel not found');
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
            <p>Uploaded: Jan 15, 2025 • 2.4 MB</p>
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
            <p>Uploaded: Jan 12, 2025 • 1.8 MB</p>
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
  
  console.log('✅ Resources content loaded');
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
  
  console.log(`🔍 Filtered ${filtered.length} projects from ${projectsData.length}`);
  currentPage = 1;
  displayProjectsTable(filtered);
}

// ============================
// MODAL HANDLERS
// ============================

function openTaskAllocationForm() {
    const modal = document.getElementById('addTaskAllocationModal');
    if (modal) {
        modal.style.display = 'block';
        
        // ✅ GET PROJECT DATA FROM SESSION STORAGE
        const sessionProject = getProjectSession();
        
        if (sessionProject) {
            // ✅ Populate display fields (readonly info section)
            const taskProjectName = document.getElementById('taskProjectName');
            const taskCompanyName = document.getElementById('taskCompanyName');
            const taskProjectDescription = document.getElementById('taskProjectDescription');
            const taskStartDate = document.getElementById('taskStartDate');
            const taskCompletionDate = document.getElementById('taskCompletionDate');
            
            if (taskProjectName) taskProjectName.textContent = sessionProject.project_name || sessionProject.company_name || 'N/A';
            if (taskCompanyName) taskCompanyName.textContent = sessionProject.company_name || 'N/A';
            if (taskProjectDescription) taskProjectDescription.textContent = sessionProject.project_description || 'No description available';
            if (taskStartDate) taskStartDate.textContent = formatDate(sessionProject.start_date) || 'N/A';
            if (taskCompletionDate) taskCompletionDate.textContent = formatDate(sessionProject.completion_date) || 'N/A';
            
            // ✅ Also populate the form input field (if you want it auto-filled)
            const projectNameInput = document.getElementById('projectName');
            if (projectNameInput) {
                projectNameInput.value = sessionProject.project_name || sessionProject.company_name || '';
            }
            
            console.log('✅ Task form populated with session data:', sessionProject);
        } else {
            console.warn('⚠️ No project session data found');
        }
    }
}



function closeTaskAllocationForm() {
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) modal.style.display = 'none';
}

function openProjectAllocationForm(projectId = null) {
  console.log('📝 Opening employee allocation modal...');
  console.log('📝 Received projectId parameter:', projectId);
  
  // CRITICAL: Get projectId from multiple sources
  let finalProjectId = projectId || 
                       currentProjectId || 
                       window.currentProjectId || 
                       getProjectIdFromSession();
  
  // Try getting from DOM as last resort
  if (!finalProjectId) {
    const detailView = document.getElementById('project-detail-view');
    if (detailView) {
      finalProjectId = detailView.getAttribute('data-project-id');
      console.log('📝 Got project ID from DOM:', finalProjectId);
    }
  }
  
  if (!finalProjectId) {
    showToast('Error: Project ID not found. Please view a project first.', 'error');
    console.error('❌ No project ID available from any source:', {
      param: projectId,
      current: currentProjectId,
      window: window.currentProjectId,
      session: getProjectIdFromSession(),
      dom: document.getElementById('project-detail-view')?.getAttribute('data-project-id')
    });
    return;
  }
  
  console.log('✅ Using project ID:', finalProjectId);
  
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) {
    console.error('❌ Modal not found');
    return;
  }

  // Store current project ID in multiple places
  currentProjectId = finalProjectId;
  window.currentProjectId = finalProjectId;

  // Clear previous selections
  selectedEmployees = [];
  const list = document.getElementById('selectedEmployeesList');
  if (list) list.innerHTML = '';

  // Show modal
  modal.style.display = 'block';
  modal.style.animation = 'fadeIn 0.3s ease';
  
  // Fetch employees for this project
  fetchProjectEmployees(finalProjectId);
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
  }, 300);
}

// ========================================
// ✅ FETCH TEAMS FROM project_allocations TABLE
// ========================================
async function fetchTaskAllocationTeams() {
    try {
        const sessionProject = getProjectSession();
        const projectId = sessionProject?.project_id;
        
        if (!projectId) {
            console.error('❌ No project ID in session');
            showToast('Please select a project first', 'error');
            return [];
        }
        
        console.log('🔍 Fetching teams for project:', projectId);
        
        // ✅ REMOVE Content-Type header for GET requests
        const response = await fetch(`https://www.fist-o.com/web_crm/fetch_project_teams.php?project_id=${projectId}`, {
            method: 'GET'
            // ❌ Don't add headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('✅ Teams loaded:', result.data);
            return result.data;
        } else {
            console.warn('⚠️ No teams found for this project');
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching teams:', error);
        showToast('Failed to load teams', 'error');
        return [];
    }
}

// ========================================
// ✅ POPULATE TEAM NAME DROPDOWN
// ========================================
async function populateTaskTeamDropdown() {
    const teamSelect = document.getElementById('TaskTeamName');
    
    if (!teamSelect) {
        console.error('❌ TaskTeamName dropdown not found');
        return;
    }
    
    // Show loading state
    teamSelect.innerHTML = '<option value="">Loading teams...</option>';
    teamSelect.disabled = true;
    
    const teams = await fetchTaskAllocationTeams();
    
    // Reset dropdown
    teamSelect.innerHTML = '<option value="">-- Select Team --</option>';
    
    if (teams.length === 0) {
        teamSelect.innerHTML = '<option value="">-- No teams allocated --</option>';
        teamSelect.disabled = true;
        return;
    }
    
    // Populate with teams
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.team_name;
        option.textContent = `${team.team_name} (${team.members.length} members)`;
        option.dataset.members = JSON.stringify(team.members);
        teamSelect.appendChild(option);
    });
    
    teamSelect.disabled = false;
    console.log(`✅ Populated ${teams.length} teams`);
}

// ========================================
// ✅ HANDLE TEAM SELECTION - POPULATE MEMBERS
// ========================================
function handleTaskTeamChange() {
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    
    if (!teamSelect || !memberSelect) {
        console.error('❌ Dropdowns not found');
        return;
    }
    
    // Clear member dropdown
    memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
    memberSelect.disabled = true;
    
    const selectedTeam = teamSelect.value;
    
    if (!selectedTeam) {
        console.log('ℹ️ No team selected');
        return;
    }
    
    // Get selected option and extract members
    const selectedOption = teamSelect.options[teamSelect.selectedIndex];
    const members = JSON.parse(selectedOption.dataset.members || '[]');
    
    console.log('👥 Team selected:', selectedTeam);
    console.log('👥 Members:', members);
    
    if (members.length === 0) {
        memberSelect.innerHTML = '<option value="">-- No members in this team --</option>';
        return;
    }
    
    // Populate member dropdown
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
    console.log(`✅ Populated ${members.length} members for team: ${selectedTeam}`);
}

// ========================================
// ✅ OPEN TASK ALLOCATION FORM - LOAD TEAMS
// ========================================
async function openTaskAllocationForm() {
    const modal = document.getElementById('addTaskAllocationModal');
    if (modal) {
        modal.style.display = 'block';
        
        // ✅ GET PROJECT DATA FROM SESSION
        const sessionProject = getProjectSession();
        
        if (sessionProject) {
            // Populate project info (if you have display elements)
            const taskProjectName = document.getElementById('taskProjectName');
            const taskCompanyName = document.getElementById('taskCompanyName');
            const taskProjectDescription = document.getElementById('ProjectDescription');
            
            if (taskProjectName) taskProjectName.textContent = sessionProject.project_name || 'N/A';
            if (taskCompanyName) taskCompanyName.textContent = sessionProject.company_name || 'N/A';
            if (taskProjectDescription) taskProjectDescription.textContent = sessionProject.project_description || 'N/A';
            
            // Auto-fill form fields
            const projectNameInput = document.getElementById('projectName');
            if (projectNameInput) {
                projectNameInput.value = sessionProject.project_name || '';
            }
            
            // ✅ LOAD TEAMS FOR THIS PROJECT
            await populateTaskTeamDropdown();
            
            console.log('✅ Task allocation form opened for project:', sessionProject.project_id);
        } else {
            showToast('Please select a project first', 'error');
            closeTaskAllocationForm();
        }
    }
}

// ========================================
// ✅ CLOSE TASK ALLOCATION FORM
// ========================================
function closeTaskAllocationForm() {
    const modal = document.getElementById('addTaskAllocationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========================================
// ✅ ADD EVENT LISTENER ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const teamSelect = document.getElementById('TaskTeamName');
    
    if (teamSelect) {
        teamSelect.addEventListener('change', handleTaskTeamChange);
        console.log('✅ Team dropdown event listener attached');
    }
});


// ========================================
// TASK ALLOCATION - TEMPORARY STORAGE
// ========================================
let tempTasks = [];

// ========================================
// HANDLE "ADD" BUTTON - ADD TASK TO TABLE
// ========================================
function handleAddTaskToTable(event) {
    event.preventDefault();
    
    const taskName = document.getElementById('TaskName').value.trim();
    const taskDescription = document.getElementById('ProjectDescription').value.trim();
    const startDate = document.getElementById('TaskStartDate').value;
    const endDate = document.getElementById('TaskEndDate').value;
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    const remarks = document.getElementById('projectremarks').value.trim();
    
    const teamName = teamSelect.value;
    const assignedToEmpId = memberSelect.value;
    const assignedToName = memberSelect.options[memberSelect.selectedIndex]?.text || '';
    
    if (!taskName || !startDate || !endDate || !teamName || !assignedToEmpId || !remarks) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showToast('End date must be after start date', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        taskName: taskName,
        description: taskDescription,
        startDate: startDate,
        endDate: endDate,
        teamName: teamName,
        assignedToEmpId: assignedToEmpId,
        assignedToName: assignedToName,
        remarks: remarks
    };
    
    tempTasks.push(task);
    updateTempTaskTable();
    clearTaskFormFields();
    
    showToast('✅ Task added to list', 'success');
    console.log('✅ Task added:', task);
    console.log('📋 Total tasks:', tempTasks.length);
}

// ========================================
// UPDATE TEMPORARY TASK TABLE
// ========================================
function updateTempTaskTable() {
    const tbody = document.querySelector('#tempTaskTable tbody');
    
    if (!tbody) {
        console.error('❌ Task table body not found');
        return;
    }
    
    if (tempTasks.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-temp">
                <td colspan="6">No tasks added yet</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = tempTasks.map(task => `
        <tr>
            <td>${task.taskName}</td>
            <td>${task.description || '-'}</td>
            <td>${formatDateDisplay(task.startDate)}</td>
            <td>${formatDateDisplay(task.endDate)}</td>
            <td>${task.assignedToName}</td>
            <td>
                <button type="button" onclick="removeTaskFromTable(${task.id})" 
                        style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ Table updated: ${tempTasks.length} tasks`);
}

// ========================================
// REMOVE TASK FROM TABLE
// ========================================
function removeTaskFromTable(taskId) {
    const taskIndex = tempTasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const removedTask = tempTasks.splice(taskIndex, 1)[0];
        updateTempTaskTable();
        showToast(`Task "${removedTask.taskName}" removed`, 'info');
        console.log('🗑️ Remaining tasks:', tempTasks.length);
    }
}

// ========================================
// CLEAR TASK FORM FIELDS
// ========================================
function clearTaskFormFields() {
    document.getElementById('TaskName').value = '';
    document.getElementById('TaskStartDate').value = '';
    document.getElementById('TaskEndDate').value = '';
    
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    
    if (teamSelect) teamSelect.selectedIndex = 0;
    if (memberSelect) {
        memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
        memberSelect.disabled = true;
    }
    
    document.getElementById('projectremarks').value = '';
}

// ========================================
// SUBMIT ALL TASKS TO DATABASE
// ========================================
async function submitAllTasks() {
    if (tempTasks.length === 0) {
        showToast('❌ Please add at least one task', 'error');
        return;
    }
    
    const sessionProject = getProjectSession();
    const projectId = sessionProject?.project_id;
    
    if (!projectId) {
        showToast('❌ No project selected', 'error');
        return;
    }
    
    try {
        console.log('📤 Submitting tasks to database:', tempTasks);
        
        const response = await fetch('https://www.fist-o.com/web_crm/add_task_allocations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                tasks: tempTasks
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`✅ ${tempTasks.length} task(s) allocated successfully!`, 'success');
            
            // Clear tasks and table
            tempTasks = [];
            updateTempTaskTable();
            
            // Close modal
            closeTaskAllocationForm();
            
            console.log('✅ All tasks submitted successfully');
        } else {
            showToast(result.message || 'Failed to submit tasks', 'error');
            console.error('❌ Server error:', result);
        }
        
    } catch (error) {
        console.error('❌ Error submitting tasks:', error);
        showToast('Network error while submitting tasks', 'error');
    }
}

// ========================================
// FORMAT DATE FOR DISPLAY
// ========================================
function formatDateDisplay(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ========================================
// SETUP EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // "Add" button - add task to table
    const taskForm = document.getElementById('TaskAllocationForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleAddTaskToTable);
        console.log('✅ Task form listener attached');
    }
    
    // "Submit" button - save all tasks to DB
    const submitBtn = document.querySelector('.submit-task-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAllTasks);
        console.log('✅ Submit button listener attached');
    }
    
    // Team dropdown change
    const teamSelect = document.getElementById('TaskTeamName');
    if (teamSelect) {
        teamSelect.addEventListener('change', handleTaskTeamChange);
        console.log('✅ Team select listener attached');
    }
});


// ============================
// EMPLOYEE MANAGEMENT
// ============================

async function fetchProjectEmployees(projectId = null) {
  try {
    console.log('📡 Fetching employees from add_project_employee.php...');
    
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
    console.log('📦 Employee fetch response:', result);
    console.log('📦 First employee data structure:', result.data?.[0]);

    if (result.success && result.data) {
      employeesData = result.data.map(emp => ({
        id: emp.id,
        emp_id: emp.emp_id,
        emp_name: emp.emp_name,
        designation: emp.designation || 'N/A'
      }));
      
      console.log('📦 Stored employees data:', employeesData);
      populateEmployeeDropdown();
      console.log(`✅ Loaded ${employeesData.length} employees`);
      return employeesData;
    } else {
      employeesData = [];
      populateEmployeeDropdown();
      showToast(result.message || 'No employees available', 'warning');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    employeesData = [];
    populateEmployeeDropdown();
    showToast('Error loading employees: ' + error.message, 'error');
    return [];
  }
}

function populateEmployeeDropdown() {
  const select = document.getElementById('employeeSelect');
  
  if (!select) {
    console.error('❌ employeeSelect dropdown not found');
    return;
  }

  select.innerHTML = '<option value="">-- SELECT EMPLOYEE --</option>';

  if (employeesData.length === 0) {
    const noDataOption = document.createElement('option');
    noDataOption.value = '';
    noDataOption.textContent = '-- No employees available --';
    noDataOption.disabled = true;
    select.appendChild(noDataOption);
    console.warn('⚠️ No employees to display');
    return;
  }

  employeesData.forEach(emp => {
    const option = document.createElement('option');
    option.value = emp.emp_id;
    
    const displayText = emp.designation !== 'N/A'
      ? `${emp.emp_name} - ${emp.designation}`
      : emp.emp_name;
    
    option.textContent = displayText;
    
    option.dataset.id = emp.id;
    option.dataset.emp_id = emp.emp_id;
    option.dataset.emp_name = emp.emp_name;
    option.dataset.designation = emp.designation;
    
    console.log('Setting option dataset for', emp.emp_name, ':', option.dataset);
    
    select.appendChild(option);
  });
  
  console.log(`✅ Dropdown populated with ${employeesData.length} employees`);
}

function addEmployeeToList() {
  const select = document.getElementById('employeeSelect');
  
  if (!select || !select.value) {
    showToast('Please select an employee', 'warning');
    return;
  }

  const selectedOption = select.options[select.selectedIndex];
  
  const id = selectedOption.dataset.id;
  const emp_id = selectedOption.dataset.emp_id;
  const emp_name = selectedOption.dataset.emp_name;
  const designation = selectedOption.dataset.designation;

  console.log('📝 Adding employee:', { id, emp_id, emp_name, designation });

  if (!emp_id || !emp_name) {
    showToast('Error: Employee data incomplete', 'error');
    console.error('Missing emp_id or emp_name. Dataset:', selectedOption.dataset);
    return;
  }

  if (selectedEmployees.find(emp => emp.emp_id === emp_id)) {
    showToast('Employee already added to list', 'warning');
    return;
  }

  selectedEmployees.push({
    id: id,
    emp_id: emp_id,
    emp_name: emp_name,
    designation: designation
  });

  const list = document.getElementById('selectedEmployeesList');
  if (!list) {
    console.error('❌ selectedEmployeesList not found');
    return;
  }

  const newItem = document.createElement('div');
  newItem.className = 'employee-item';
  newItem.dataset.employeeId = emp_id;
  newItem.dataset.employee = emp_name;
  newItem.innerHTML = `
    <span class="employee-name">
      ${emp_name}
      ${designation && designation !== 'N/A' ? `<small style="color: #666; margin-left: 8px;">- ${designation}</small>` : ''}
    </span>
    <button class="remove-btn" onclick="removeEmployee(this)" title="Remove">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  list.appendChild(newItem);
  select.value = '';
  
  showToast(`${emp_name} added to list`, 'success');
  console.log('✅ Current selected employees:', selectedEmployees);
}

function removeEmployee(button) {
  const item = button.closest('.employee-item');
  if (!item) return;

  const employeeId = item.dataset.employeeId;
  
  selectedEmployees = selectedEmployees.filter(emp => emp.emp_id !== employeeId);
  
  item.style.animation = 'slideOut 0.3s ease';
  
  setTimeout(() => {
    item.remove();
    showToast('Employee removed from list', 'info');
  }, 300);
  
  console.log('📝 Current selected employees:', selectedEmployees);
}

async function submitEmployees() {
  if (selectedEmployees.length === 0) {
    showToast('Please add at least one employee', 'error');
    return;
  }

  // CRITICAL: Try multiple sources for project ID
  let projectId = currentProjectId || 
                  window.currentProjectId || 
                  getProjectIdFromSession();
  
  // Try DOM as last resort
  if (!projectId) {
    const detailView = document.getElementById('project-detail-view');
    if (detailView) {
      projectId = detailView.getAttribute('data-project-id');
    }
  }
  
  if (!projectId) {
    showToast('Error: Project ID not found. Please try again.', 'error');
    console.error('❌ Project ID missing from all sources:', {
      currentProjectId,
      windowProjectId: window.currentProjectId,
      sessionProjectId: getProjectIdFromSession(),
      domProjectId: document.getElementById('project-detail-view')?.getAttribute('data-project-id')
    });
    return;
  }

  // FIX: Keep project ID as string - don't convert to integer
  // Your API likely expects the string ID like "PRJ20251011_9f1781fac20c"
  const finalProjectId = String(projectId).trim();
  
  if (!finalProjectId) {
    showToast('Error: Invalid project ID', 'error');
    console.error('❌ Invalid project ID. Original:', projectId);
    return;
  }

  console.log('✅ Using project ID for submission:', finalProjectId);

  const allocationData = {
    project_id: finalProjectId,  // Send as string, not integer
    employees: selectedEmployees.map(emp => ({
      emp_id: emp.emp_id,
      emp_name: emp.emp_name,
      designation: emp.designation
    }))
  };

  console.log('📤 Submitting employee allocation:', JSON.stringify(allocationData, null, 2));

  try {
    showLoadingSpinner();

    const response = await fetch('https://www.fist-o.com/web_crm/add_project_employee.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(allocationData)
    });

    const responseText = await response.text();
    console.log('📦 Raw server response:', responseText);

    hideLoadingSpinner();

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    console.log('📦 Parsed allocation response:', result);

    if (result.success) {
      const message = result.message || `${selectedEmployees.length} employee(s) allocated successfully!`;
      showToast(message, 'success');
      
      setTimeout(() => {
        closeProjectAllocationForm();
        
        if (finalProjectId && typeof viewProject === 'function') {
          console.log('🔄 Refreshing project view...');
          viewProject(finalProjectId);
        }
      }, 1500);
    } else {
      const errorMsg = result.message || 'Failed to allocate employees';
      showToast(errorMsg, 'error');
      console.error('Allocation failed:', result);
      
      if (result.data && result.data.errors) {
        console.error('Error details:', result.data.errors);
      }
    }
  } catch (error) {
    hideLoadingSpinner();
    console.error('❌ Error submitting allocation:', error);
    showToast('Error: ' + error.message, 'error');
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
    console.log('📢 Toast:', message);
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : 
                 type === 'error' ? '✕' : '⚠';
    
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
  console.log('🎬 DOM Loaded - Initializing Project Dashboard...');
  initializeProjectDashboard();
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
window.addEmployeeToList = addEmployeeToList;
window.removeEmployee = removeEmployee;
window.submitEmployees = submitEmployees;
window.fetchTaskAllocationTeams = fetchTaskAllocationTeams;
window.populateTaskTeamDropdown = populateTaskTeamDropdown;
window.handleTaskTeamChange = handleTaskTeamChange;
window.openTaskAllocationForm = openTaskAllocationForm;
window.closeTaskAllocationForm = closeTaskAllocationForm;
window.handleAddTaskToTable = handleAddTaskToTable;
window.removeTaskFromTable = removeTaskFromTable;
window.submitAllTasks = submitAllTasks;
window.updateTempTaskTable = updateTempTaskTable;
window.formatDateDisplay = formatDateDisplay;



console.log('✅ Project.js loaded successfully - All duplicates removed!');