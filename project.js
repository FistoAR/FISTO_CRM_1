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
    console.log('âœ… Project stored in session:', projectData);
    return projectData;
  } catch (error) {
    console.error('âŒ Error storing project session:', error);
    showToast('Error storing project data', 'error');
    return null;
  }
}

function getProjectSession() {
  try {
    const projectData = sessionStorage.getItem('currentProject');
    if (projectData) {
      const project = JSON.parse(projectData);
      console.log('âœ… Retrieved project from session:', project);
      return project;
    }
    return null;
  } catch (error) {
    console.error('âŒ Error retrieving project session:', error);
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
    console.log('ðŸ§¹ Project session cleared');
  } catch (error) {
    console.error('âŒ Error clearing project session:', error);
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

// ============================
// INITIALIZATION
// ============================

function initializeProjectDashboard() {
  console.log('ðŸš€ Initializing Project Dashboard...');
  
  loadOnboardedClients()
    .then(() => loadProjects())
    .then(() => {
      displayProjectsTable(projectsData);
      setupEventListeners();
      console.log('âœ… Dashboard initialized');
    })
    .catch(err => {
      console.error('âŒ Error:', err);
      showToast('Failed to initialize dashboard', 'error');
    });
}

// ============================
// FETCH ONBOARDED CLIENTS
// ============================

async function loadOnboardedClients() {
  try {
    console.log('ðŸ“¡ Fetching onboarded clients from API...');
    
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_addprojectdetails.php', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('ðŸ“¦ API Response:', result);
    
    if (result.status === 'success') {
      const data = result.data || [];
      console.log(`ðŸ“Š Total onboarded projects: ${data.length}`);
      
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
      
      console.log(`âœ… Loaded ${clientsData.length} onboarded clients`);
      populateClientDropdown();
      return clientsData;
    } else {
      console.warn('âš ï¸ No clients returned or status not success');
      return [];
    }
  } catch (err) {
    console.error('âŒ Error loading clients:', err);
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
    console.error('âŒ Dropdown not found!');
    return;
  }

  const selectedValue = clientSelect.value;
  console.log('ðŸ” Selected customer ID:', selectedValue);
  
  if (!selectedValue) {
    console.log('ðŸ”„ No selection, clearing fields');
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
      
      showToast(`âœ“ Loaded: ${selectedOption.dataset.projectName}`, 'success');
    }, 150);
  });
}

function fillField(fieldId, value, isReadOnly = false) {
  const field = document.getElementById(fieldId);
  
  if (!field) {
    console.error(`âŒ Field "${fieldId}" not found!`);
    return;
  }
  
  console.log(`ðŸ“ Filling ${fieldId} with: "${value}"`);
  
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
  
  console.log('ðŸ§¹ Fields cleared');
}

// ============================
// LOAD PROJECTS
// ============================

async function loadProjects() {
  try {
    console.log('ðŸ“¡ Loading projects...');
    const response = await fetch('https://www.fist-o.com/web_crm/fetch_projects.php');
    const result = await response.json();

    if (result.success && result.data) {
      projectsData = result.data;
      console.log(`âœ… Loaded ${projectsData.length} projects`);
      
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
    console.error('âŒ Error loading projects:', err);
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
    console.error('âŒ Table body element not found');
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

  console.log(`ðŸ“„ Displaying page ${currentPage}: showing ${paginatedProjects.length} of ${projects.length} projects`);

  paginatedProjects.forEach((project, index) => {
    // Use projectName strictly, no fallback to companyName here
    const projectName = project.projectName || project.projectname || project.name || 'N/A';
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
    console.error('âŒ Pagination elements not found!');
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

  console.log(`ðŸ“Š Pagination: Page ${currentPage} of ${totalPages}`);
}

function goToPage(page) {
  const totalPages = Math.ceil(projectsData.length / projectsPerPage);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  
  console.log(`ðŸ”„ Going to page ${page}`);
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
    
    console.log('ðŸ” Fetching project with ID:', projectId);
    
    const response = await fetch(`https://www.fist-o.com/web_crm/fetch_projects.php?project_id=${projectId}`);
    const result = await response.json();
    
    hideLoadingSpinner();
    
    if (result.success && result.data && result.data.length > 0) {
      const project = result.data[0];
      
      console.log('ðŸ“¦ ===== FULL PROJECT DATA =====');
      console.log(JSON.stringify(project, null, 2));
      console.log('ðŸ“¦ =============================');
      
      // Check all possible ID fields
      console.log('ðŸ” Checking ID fields:');
      console.log('  - project.id:', project.id, typeof project.id);
      console.log('  - project.projectId:', project.projectId, typeof project.projectId);
      console.log('  - project.project_id:', project.project_id, typeof project.project_id);
      
      // STORE PROJECT IN SESSION
      storeProjectSession(project);
      
      // CRITICAL: Store the NUMERIC id for API calls
      const numericId = project.id;
      const stringProjectId = project.projectId || project.project_id || projectId;
      
      if (!numericId) {
        console.error('âŒ No numeric ID found in project data');
        console.error('Available fields:', Object.keys(project));
        showToast('Error: Project structure issue. Check console.', 'error');
        return;
      }
       // Load project tasks
      loadProjectTasks(projectId);
      
      
      currentProjectId = numericId;
      window.currentProjectId = numericId;
      window.projectStringId = stringProjectId;
      
      console.log('âœ… Set currentProjectId (numeric for API):', numericId, typeof numericId);
      console.log('âœ… Set projectStringId (for display):', stringProjectId);
      
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
    }

    populateProjectDetails(project);
    setupProjectDetailTabs();

    // Set "Initiated By" meta card from project object
    const initiatorElement = document.getElementById('initiatorName');
    if (initiatorElement) {
        initiatorElement.textContent = project.initiated_by || "N/A";
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    console.log('âœ… Project ID stored from details:', projectId);
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
  
  if (!tableBody) {
    console.error('âŒ Tasks table body not found');
    return;
  }
  
  // Show loading state
  tableBody.innerHTML = `
    <tr class="loading-state">
      <td colspan="7" style="text-align: center; padding: 40px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #5e72e4;"></i>
        <p style="margin-top: 10px; color: #666;">Loading tasks...</p>
      </td>
    </tr>
  `;
  
  try {
    console.log('ðŸ“‹ Fetching tasks for project:', projectId);
    
    const response = await fetch(`https://www.fist-o.com/web_crm/get_project_tasks.php?project_id=${projectId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('ðŸ“¦ Tasks response:', result);
    
    if (result.success && result.data && result.data.tasks && result.data.tasks.length > 0) {
      const tasks = result.data.tasks;
      
      tableBody.innerHTML = tasks.map((task, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="task-title-cell">
              <strong>${task.task_name}</strong>
              <small style="display: block; color: #999; margin-top: 4px;">${task.task_description}</small>
            </div>
          </td>
          <td>
            <span class="team-badge ${getTeamBadgeClass(task.team_name)}">${task.team_name}</span>
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <strong>${task.assigned_to_name}</strong>
              <small style="color: #999;">${task.assigned_to_emp_id}</small>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span>${formatDateDisplay(task.start_date)}</span>
              <small style="color: #666;">${formatTime(task.start_time)}</small>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span>${formatDateDisplay(task.end_date)}</span>
              <small style="color: #666;">${formatTime(task.end_time)}</small>
            </div>
          </td>
          <td>
            <span class="status-badge status-${task.status.toLowerCase()}">${capitalizeFirst(task.status)}</span>
          </td>
        </tr>
      `).join('');
      
      console.log(`âœ… Displayed ${tasks.length} tasks`);
    } else {
      // No tasks found
      tableBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="7">
            <div class="empty-content" style="text-align: center; padding: 40px; color: #666;">
              <i class="fas fa-tasks" style="font-size: 48px; color: #ccc; margin-bottom: 10px; display: block;"></i>
              <p style="font-size: 16px; margin: 10px 0;">No tasks found</p>
              <small style="color: #999;">Click "Add Task" to get started</small>
            </div>
          </td>
        </tr>
      `;
      
      console.log('â„¹ï¸ No tasks found for this project');
    }
  } catch (error) {
    console.error('âŒ Error loading tasks:', error);
    
    tableBody.innerHTML = `
      <tr class="error-state">
        <td colspan="7" style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545; margin-bottom: 10px; display: block;"></i>
          <p style="color: #dc3545; font-size: 16px; margin: 10px 0;">Failed to load tasks</p>
          <small style="color: #999;">${error.message}</small>
        </td>
      </tr>
    `;
  }
}
// Format time from HH:MM:SS to HH:MM AM/PM
function formatTime(timeString) {
  if (!timeString) return '09:00 AM';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}


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
  console.log('ðŸ”§ Setting up project detail tabs...');
  
  const tabButtons = document.querySelectorAll('.detail-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  if (tabButtons.length === 0) {
    console.warn('âš ï¸ No tab buttons found');
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
      console.log(`ðŸ”„ Switching to tab: ${targetTab}`);
      
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
        console.log(`âœ… Showing ${targetTab} panel`);
        
        if (targetTab === 'resources') {
          loadResourcesContent();
        } else if (targetTab === 'analytics') {
          loadAnalyticsContent();
        }
      }
    });
  });
  
  console.log('âœ… Tab switching setup complete');
}

// ============================
// LOAD RESOURCES CONTENT
// ============================

function loadResourcesContent() {
  console.log('ðŸ“¦ Loading resources content...');
  
  const resourcesPanel = document.getElementById('resources-panel');
  if (!resourcesPanel) {
    console.error('âŒ Resources panel not found');
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
            <p>Uploaded: Jan 15, 2025 â€¢ 2.4 MB</p>
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
            <p>Uploaded: Jan 12, 2025 â€¢ 1.8 MB</p>
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
  
  console.log('âœ… Resources content loaded');
}

function loadAnalyticsContent() {
  console.log('ðŸ“Š Analytics content placeholder');
}

// ============================
// EVENT LISTENERS
// ============================

function setupEventListeners() {
  console.log('ðŸ”— Setting up event listeners...');
  
  const clientSelect = document.getElementById('onboardedProjectSelect');
  if (clientSelect) {
    clientSelect.removeEventListener('change', handleClientSelection);
    clientSelect.addEventListener('change', handleClientSelection);
    console.log('âœ… Client select listener attached');
  }
  
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.removeEventListener('submit', handleProjectFormSubmit);
    projectForm.addEventListener('submit', handleProjectFormSubmit);
    console.log('âœ… Form submit listener attached');
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
  
  console.log('âœ… All listeners attached');
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
  
  console.log(`ðŸ” Filtered ${filtered.length} projects from ${projectsData.length}`);
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
            
            console.log('âœ… Task allocation form opened for project:', sessionProject.project_id);
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
            console.error('âŒ No project ID in session');
            showToast('Please select a project first', 'error');
            return [];
        }
        
        console.log('ðŸ” Fetching teams for project:', projectId);
        
        const response = await fetch(`https://www.fist-o.com/web_crm/fetch_project_teams.php?project_id=${projectId}`, {
            method: 'GET'
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('âœ… Teams loaded:', result.data);
            return result.data;
        } else {
            console.warn('âš ï¸ No teams found for this project');
            return [];
        }
    } catch (error) {
        console.error('âŒ Error fetching teams:', error);
        showToast('Failed to load teams', 'error');
        return [];
    }
}

async function populateTaskTeamDropdown() {
    const teamSelect = document.getElementById('TaskTeamName');
    
    if (!teamSelect) {
        console.error('âŒ TaskTeamName dropdown not found');
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
    console.log(`âœ… Populated ${teams.length} teams`);
}

function handleTaskTeamChange() {
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    
    if (!teamSelect || !memberSelect) {
        console.error('âŒ Dropdowns not found');
        return;
    }
    
    memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
    memberSelect.disabled = true;
    
    const selectedTeam = teamSelect.value;
    
    if (!selectedTeam) {
        console.log('â„¹ï¸ No team selected');
        return;
    }
    
    const selectedOption = teamSelect.options[teamSelect.selectedIndex];
    const members = JSON.parse(selectedOption.dataset.members || '[]');
    
    console.log('ðŸ‘¥ Team selected:', selectedTeam);
    console.log('ðŸ‘¥ Members:', members);
    
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
    console.log(`âœ… Populated ${members.length} members for team: ${selectedTeam}`);
}

// ============================
// TASK ALLOCATION - TEMPORARY STORAGE
// ============================

function handleAddTaskToTable(event) {
    event.preventDefault();
    
    const taskName = document.getElementById('TaskName')?.value.trim();
    const taskDescription = document.getElementById('ProjectDescription')?.value.trim();
    const startDate = document.getElementById('TaskStartDate')?.value;
    const startTime = document.getElementById('TaskStartTime')?.value; // âœ… NEW
    const endDate = document.getElementById('TaskEndDate')?.value;
    const endTime = document.getElementById('TaskEndTime')?.value; // âœ… NEW
    const teamSelect = document.getElementById('TaskTeamName');
    const memberSelect = document.getElementById('allocAssignedTo');
    const remarks = document.getElementById('taskremarks')?.value.trim();
    
    const teamName = teamSelect?.value;
    const assignedToEmpId = memberSelect?.value;
    const assignedToName = memberSelect?.options[memberSelect.selectedIndex]?.text || '';
    
    console.log('ðŸ“‹ Form Values:');
    console.log('  taskName:', taskName);
    console.log('  startDate:', startDate);
    console.log('  startTime:', startTime); // âœ… NEW
    console.log('  endDate:', endDate);
    console.log('  endTime:', endTime); // âœ… NEW
    console.log('  teamName:', teamName);
    console.log('  assignedToEmpId:', assignedToEmpId);
    console.log('  remarks:', remarks);
    
    // Validation
    if (!taskName) {
        showToast('âŒ Task Name is required', 'error');
        return;
    }
    
    if (!startDate) {
        showToast('âŒ Start Date is required', 'error');
        return;
    }
    
    if (!startTime) {
        showToast('âŒ Start Time is required', 'error');
        return;
    }
    
    if (!endDate) {
        showToast('âŒ End Date is required', 'error');
        return;
    }
    
    if (!endTime) {
        showToast('âŒ End Time is required', 'error');
        return;
    }
    
    if (!teamName) {
        showToast('âŒ Team Name is required', 'error');
        return;
    }
    
    if (!assignedToEmpId) {
        showToast('âŒ Assigned To is required', 'error');
        return;
    }
    
    if (!remarks) {
        showToast('âŒ Remarks is required', 'error');
        return;
    }
    
    // âœ… Validate date-time combination
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (startDateTime >= endDateTime) {
        showToast('âŒ End date/time must be after start date/time', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        taskName: taskName,
        description: taskDescription || '',
        startDate: startDate,
        startTime: startTime, // âœ… NEW
        endDate: endDate,
        endTime: endTime, // âœ… NEW
        teamName: teamName,
        assignedToEmpId: assignedToEmpId,
        assignedToName: assignedToName,
        taskremarks: remarks
    };
    
    tempTasks.push(task);
    updateTempTaskTable();
    clearTaskFormFields();
    
    showToast('âœ… Task added to list', 'success');
    console.log('âœ… Task added:', task);
}


function updateTempTaskTable() {
    const tbody = document.querySelector('#tempTaskTable tbody');
    
    if (!tbody) {
        console.error('âŒ Task table body not found');
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
        console.log('ðŸ—‘ï¸ Remaining tasks:', tempTasks.length);
    }
}

function clearTaskFormFields() {
    document.getElementById('TaskName').value = '';
    document.getElementById('TaskStartDate').value = '';
    document.getElementById('TaskStartTime').value = '09:00'; // âœ… Reset to default
    document.getElementById('TaskEndDate').value = '';
    document.getElementById('TaskEndTime').value = '18:00'; // âœ… Reset to default
    
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
        showToast('âŒ Please add at least one task', 'error');
        return;
    }
    
    const sessionProject = getProjectSession();
    const projectId = sessionProject?.project_id;
    
    if (!projectId) {
        showToast('âŒ No project selected', 'error');
        return;
    }
    
    try {
        console.log('ðŸ“¤ Submitting tasks to database:', tempTasks);
        
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
            showToast(`âœ… ${tempTasks.length} task(s) allocated successfully!`, 'success');
            
            // Clear temporary tasks
            tempTasks = [];
            updateTempTaskTable();
            
            // Close the modal
            closeTaskAllocationForm();
            
            // âœ… RELOAD PROJECT TASKS TO UPDATE THE TABLE
            await loadProjectTasks(projectId);
            
            console.log('âœ… All tasks submitted and table refreshed');
        } else {
            showToast(result.message || 'Failed to submit tasks', 'error');
            console.error('âŒ Server error:', result);
        }
        
    } catch (error) {
        console.error('âŒ Error submitting tasks:', error);
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
  console.log('ðŸ“ Opening employee allocation modal...');
  console.log('ðŸ“ Received projectId parameter:', projectId);
  
  let finalProjectId = projectId || 
                       currentProjectId || 
                       window.currentProjectId || 
                       getProjectIdFromSession();
  
  if (!finalProjectId) {
    const detailView = document.getElementById('project-detail-view');
    if (detailView) {
      finalProjectId = detailView.getAttribute('data-project-id');
      console.log('ðŸ“ Got project ID from DOM:', finalProjectId);
    }
  }
  
  if (!finalProjectId) {
    showToast('Error: Project ID not found. Please view a project first.', 'error');
    console.error('âŒ No project ID available from any source');
    return;
  }
  
  console.log('âœ… Using project ID:', finalProjectId);
  
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) {
    console.error('âŒ Modal not found');
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
    console.log('ðŸ“¡ Fetching allocated employees for modal display...');
    
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
    console.log('ðŸ“¦ Modal allocated employees response:', result);

    if (result.success && result.data && result.data.employees && result.data.employees.length > 0) {
      displayAllocatedInModal(result.data.employees);
    } else {
      showEmptyStateInModal();
    }
  } catch (error) {
    console.error('âŒ Error fetching allocated employees for modal:', error);
    showEmptyStateInModal();
  }
}
// ============================
// DISPLAY ALLOCATED EMPLOYEES IN MODAL - SINGLE AREA WITH X BUTTON
// ============================

function displayAllocatedInModal(allocatedEmployees) {
  const selectedList = document.getElementById('selectedEmployeesList');
  
  if (!selectedList) {
    console.error('âŒ Selected employee list container not found');
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

  console.log(`âœ… Displayed ${allocatedEmployees.length} allocated employees`);
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
    console.error('❌ Employee select element not found');
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
  
  console.log('✅ Added employee to selection:', employee);
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
    console.error('âŒ Selected employees list not found');
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
  console.log('ðŸ” Remove function called with:');
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
    
    console.log('ðŸ“¤ Sending remove request:', requestData);
    
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
    
    console.log('ðŸ“¦ Remove response:', result);
    
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
      
      // âœ… REFRESH THE DROPDOWN TO SHOW THE REMOVED EMPLOYEE
      console.log('ðŸ”„ Refreshing employee dropdown...');
      await fetchProjectEmployees(projectId);
      
      // Also refresh the allocated list
      setTimeout(() => {
        fetchAndDisplayAllocatedInModal(projectId);
      }, 500);
      
    } else {
      showToast(result.message || 'Failed to remove employee', 'error');
      console.error('âŒ Server error:', result);
      
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
    console.error('âŒ Error removing employee:', error);
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
  console.log('ðŸ—‘ï¸ Removing employee from new selection:', empId);
  
  selectedEmployees = selectedEmployees.filter(emp => emp.emp_id !== empId);
  
  console.log('Updated selections:', selectedEmployees);
  
  displayNewSelectionsInModal();
  
  showToast('Employee removed from selection', 'info');
}

// ============================
// ADD escapeHtml HELPER FUNCTION
// ============================

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

function closeProjectAllocationForm() {
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) return;
  
  modal.style.animation = 'fadeOut 0.3s ease';
  
  setTimeout(() => {
    modal.style.display = 'none';
    
    selectedEmployees = [];
    
    const list = document.getElementById('selectedEmployeesList');
    if (list) {
      list.innerHTML = '';
    }
    
    const selectElement = document.getElementById('employeeSelect');
    if (selectElement) {
      selectElement.value = '';
    }
    
    console.log('âœ… Modal closed and cleaned up');
  }, 300);
}

// ============================
// FETCH AND POPULATE EMPLOYEES
// ============================

async function fetchProjectEmployees(projectId = null) {
  try {
    console.log('ðŸ“¡ Fetching employees from add_project_employee.php...');
    
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
    console.log('ðŸ“¦ Employee fetch response:', result);

    if (result.success && result.data) {
      employeesData = result.data.map(emp => ({
        id: emp.id,
        emp_id: emp.emp_id,
        emp_name: emp.emp_name,
        designation: emp.designation || 'N/A'
      }));
      
      console.log('ðŸ“¦ Stored employees data:', employeesData);
      populateEmployeeDropdown();
      console.log(`âœ… Loaded ${employeesData.length} employees`);
      return employeesData;
    } else {
      employeesData = [];
      populateEmployeeDropdown();
      showToast(result.message || 'No employees available', 'warning');
      return [];
    }
  } catch (error) {
    console.error('âŒ Error fetching employees:', error);
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
  
  console.log(`✅ Dropdown populated with ${select.options.length-1} employees`);
}


async function submitEmployees() {
  if (selectedEmployees.length === 0) {
    showToast('Please add at least one employee', 'error');
    return;
  }

  let projectId = currentProjectId || 
                  window.currentProjectId || 
                  getProjectIdFromSession();
  
  if (!projectId) {
    const detailView = document.getElementById('project-detail-view');
    if (detailView) {
      projectId = detailView.getAttribute('data-project-id');
    }
  }
  
  if (!projectId) {
    showToast('Error: Project ID not found. Please try again.', 'error');
    console.error('âŒ Project ID missing from all sources');
    return;
  }

  const finalProjectId = String(projectId).trim();
  
  if (!finalProjectId) {
    showToast('Error: Invalid project ID', 'error');
    console.error('âŒ Invalid project ID. Original:', projectId);
    return;
  }

  console.log('âœ… Using project ID for submission:', finalProjectId);

  const allocationData = {
    project_id: finalProjectId,
    employees: selectedEmployees.map(emp => ({
      emp_id: emp.emp_id,
      emp_name: emp.emp_name,
      designation: emp.designation
    }))
  };

  console.log('ðŸ“¤ Submitting employee allocation:', JSON.stringify(allocationData, null, 2));

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
    console.log('ðŸ“¦ Raw server response:', responseText);

    hideLoadingSpinner();

    if (!response.ok) {
      console.error('âŒ HTTP Error:', response.status, responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('âŒ JSON Parse Error:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    console.log('ðŸ“¦ Parsed allocation response:', result);

    if (result.success) {
      const message = result.message || `${selectedEmployees.length} employee(s) allocated successfully!`;
      showToast(message, 'success');
      
      setTimeout(() => {
        closeProjectAllocationForm();
        
        if (finalProjectId && typeof viewProject === 'function') {
          console.log('ðŸ”„ Refreshing project view...');
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
    console.error('âŒ Error submitting allocation:', error);
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
    console.log('ðŸ“¢ Toast:', message);
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'âœ“' : 
                 type === 'error' ? 'âœ•' : 'âš ';
    
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
  console.log('ðŸŽ¬ DOM Loaded - Initializing Project Dashboard...');
  initializeProjectDashboard();
  
  // Task team dropdown event listener
  const teamSelect = document.getElementById('TaskTeamName');
  if (teamSelect) {
    teamSelect.addEventListener('change', handleTaskTeamChange);
    console.log('âœ… Team dropdown event listener attached');
  }
  
  // Task form event listener
  const taskForm = document.getElementById('TaskAllocationForm');
  if (taskForm) {
    taskForm.addEventListener('submit', handleAddTaskToTable);
    console.log('âœ… Task form listener attached');
  }
  
  // Submit button event listener
  const submitBtn = document.querySelector('.submit-task-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitAllTasks);
    console.log('âœ… Submit button listener attached');
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
window.removeAllocatedEmployee = removeAllocatedEmployee; // âŒ THIS IS MISSING!
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
window.getTeamBadgeClass = getTeamBadgeClass;

console.log('âœ… Project.js loaded successfully - All functions organized and deduplicated!');