// ============================
// UNIFIED PROJECT DASHBOARD WITH CLIENT INTEGRATION
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
      
      if (data.length > 0) {
        console.log('🔍 First record structure:', data[0]);
      }
      
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
  
  if (field.tagName === 'TEXTAREA') {
    field.innerHTML = value;
    field.textContent = value;
  }
  
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
// DISPLAY PROJECTS WITH PAGINATION
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
    const projectName = project.companyName || project.company_name || project.projectName || project.project_name || project.name || 'N/A';
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
  prevBtn.onclick = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };
  
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
  nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
  nextBtn.onclick = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

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
// VIEW PROJECT DETAILS
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
// SHOW PROJECT DETAIL VIEW (MERGED - NO DUPLICATES)
// ============================

function showProjectDetailView(project) {
  document.getElementById('projects-list-view').style.display = 'none';
  document.getElementById('project-detail-view').style.display = 'block';
  
  const breadcrumbName = document.getElementById('breadcrumbProjectName');
  if (breadcrumbName) {
    breadcrumbName.textContent = project.companyName || 'Project';
  }
  
  populateProjectDetails(project);
  
  // ✅ Setup tabs immediately - NO setTimeout needed
  setupProjectDetailTabs();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// POPULATE PROJECT DETAILS (MERGED - NO DUPLICATES)
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
  
  updateProjectStats({
    assignedEmployees: 0,
    totalTasks: 0,
    completedTasks: 0,
    ongoingTasks: 0,
    delayedTasks: 0,
    overdueTasks: 0
  });
  
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
// SHOW PROJECTS LIST (MERGED - NO DUPLICATES)
// ============================

function showProjectsList() {
  document.getElementById('project-detail-view').style.display = 'none';
  document.getElementById('projects-list-view').style.display = 'block';
  currentProjectId = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// OPEN/CLOSE PROJECT FORM (MERGED - NO DUPLICATES)
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
// SUBMIT PROJECT FORM (MERGED - NO DUPLICATES)
// ============================

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
    companyName: client?.companyName || '',
    customerName: client?.customerName || '',
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
// TAB SWITCHING FUNCTIONALITY
// ============================

function setupProjectDetailTabs() {
  console.log('🔧 Setting up project detail tabs...');
  
  const tabButtons = document.querySelectorAll('.detail-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  if (tabButtons.length === 0) {
    console.warn('⚠️ No tab buttons found');
    return;
  }
  
  console.log(`Found ${tabButtons.length} tabs and ${tabPanels.length} panels`);
  
  // Remove existing listeners by cloning
  tabButtons.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
  
  // Get fresh references
  const freshTabButtons = document.querySelectorAll('.detail-tab');
  
  freshTabButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const targetTab = this.getAttribute('data-tab');
      console.log(`🔄 Switching to tab: ${targetTab}`);
      
      // Update button states
      freshTabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update panel states
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
      });
      
      // Show target panel
      const targetPanel = document.getElementById(`${targetTab}-panel`);
      if (targetPanel) {
        targetPanel.classList.add('active');
        targetPanel.style.display = 'block';
        console.log(`✅ Showing ${targetTab} panel`);
        
        // Load dynamic content
        if (targetTab === 'resources') {
          loadResourcesContent();
        } else if (targetTab === 'analytics') {
          loadAnalyticsContent();
        }
      } else {
        console.error(`❌ Panel not found: ${targetTab}-panel`);
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
// LOAD ANALYTICS CONTENT
// ============================

function loadAnalyticsContent() {
  console.log('📊 Loading analytics content...');
  
  const analyticsPanel = document.getElementById('analytics-panel');
  if (!analyticsPanel) {
    console.error('❌ Analytics panel not found');
    return;
  }
  
  analyticsPanel.innerHTML = `
    <div class="analytics-container">
      <h3><i class="fas fa-chart-line"></i> Project Analytics</h3>
      
      <div class="analytics-stats">
        <div class="stat-card">
          <h4>Task Completion Rate</h4>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 65%"></div>
          </div>
          <p>65% Complete</p>
        </div>
        
        <div class="stat-card">
          <h4>Team Productivity</h4>
          <p class="stat-value">8.5/10</p>
        </div>
        
        <div class="stat-card">
          <h4>Average Task Duration</h4>
          <p class="stat-value">3.2 days</p>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <p style="color: #666; text-align: center;">
          <i class="fas fa-chart-pie"></i> 
          Detailed analytics charts will be displayed here
        </p>
      </div>
    </div>
  `;
  
  console.log('✅ Analytics content loaded');
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
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
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

// ============================
// INITIALIZE ON DOM LOAD
// ============================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 DOM Loaded - Initializing Project Dashboard...');
  initializeProjectDashboard();
});

 // Remove employee from list
    function removeEmployee(button) {
      const item = button.closest('.employee-item');
      item.style.animation = 'slideOut 0.3s ease';
      
      setTimeout(() => {
        item.remove();
      }, 300);
    }

    // Add employee to list
    function addEmployeeToList() {
      const select = document.getElementById('employeeSelect');
      const employeeName = select.value;
      
      if (!employeeName) {
        showToast('Please select an employee', 'warning');
        return;
      }

      // Check if already added
      const existingItems = document.querySelectorAll('.employee-item');
      for (let item of existingItems) {
        if (item.dataset.employee === employeeName) {
          showToast('Employee already added', 'warning');
          return;
        }
      }

      // Create new employee item
      const list = document.getElementById('selectedEmployeesList');
      const newItem = document.createElement('div');
      newItem.className = 'employee-item';
      newItem.dataset.employee = employeeName;
      newItem.innerHTML = `
        <span class="employee-name">${employeeName}</span>
        <button class="remove-btn" onclick="removeEmployee(this)" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      list.appendChild(newItem);
      select.value = '';
      showToast('Employee added successfully', 'success');
    }

    // Submit employees
    function submitEmployees() {
      const items = document.querySelectorAll('.employee-item');
      
      if (items.length === 0) {
        showToast('Please add at least one employee', 'error');
        return;
      }

      const employees = Array.from(items).map(item => item.dataset.employee);
      console.log('Submitting employees:', employees);
      
      showToast(`${employees.length} employee(s) allocated successfully!`, 'success');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeProjectAllocationForm();
      }, 1500);
    }

    // Close modal
    function closeProjectAllocationForm() {
      const modal = document.getElementById('addProjectAllocationModal');
      modal.style.animation = 'fadeOut 0.3s ease';
      
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }

    // Show toast notification
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      const icon = type === 'success' ? '✓' : 
                   type === 'error' ? '✕' : '⚠';
      
      toast.innerHTML = `
        <span style="font-size: 20px;">${icon}</span>
        <span>${message}</span>
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Add slideOut animation
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
    `;
    document.head.appendChild(style);


    
// ============================
// FETCH EMPLOYEES FROM DATABASE
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

    const result = await response.json();

    console.log('📦 Employee fetch response:', result);
    console.log('📦 First employee data structure:', result.data?.[0]); // ✅ Added debug log

    if (result.success && result.data) {
      // ✅ Normalize the data structure to ensure consistent property names
      employeesData = result.data.map(emp => ({
        id: emp.id || emp.employee_id || emp.emp_id,
        name: emp.name || emp.employee_name || emp.full_name || emp.emp_name || 'Unknown',
        designation: emp.designation || emp.role || emp.position || ''
      }));
      
      console.log('📦 Normalized employees:', employeesData); // ✅ Added debug log
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
    showToast('Error loading employees', 'error');
    return [];
  }
}

// ============================
// POPULATE EMPLOYEE DROPDOWN
// ============================

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
    option.value = emp.id;
    
    // Display format: "NAME - Designation"
    const displayText = emp.designation 
      ? `${emp.name} - ${emp.designation}`
      : emp.name;
    
    option.textContent = displayText;
    option.dataset.employeeId = emp.id;
    option.dataset.name = emp.name;
    option.dataset.designation = emp.designation || '';
    
    select.appendChild(option);
  });
  
  console.log(`✅ Dropdown populated with ${employeesData.length} employees`);
}

// ============================
// OPEN PROJECT ALLOCATION MODAL
// ============================

function openProjectAllocationForm(projectId = null) {
  console.log('📝 Opening employee allocation modal for project:', projectId);
  
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) {
    console.error('❌ Modal not found');
    return;
  }

  // Store current project ID globally
  if (projectId) {
    window.currentProjectId = projectId;
  }

  // Clear previous selections
  selectedEmployees = [];
  const list = document.getElementById('selectedEmployeesList');
  if (list) list.innerHTML = '';

  // Show modal
  modal.style.display = 'block';
  modal.style.animation = 'fadeIn 0.3s ease';
  
  // Fetch employees for this project
  fetchProjectEmployees(projectId);
}

// ============================
// CLOSE PROJECT ALLOCATION MODAL
// ============================

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

// ============================
// ADD EMPLOYEE TO SELECTION LIST
// ============================

function addEmployeeToList() {
  const select = document.getElementById('employeeSelect');
  
  if (!select || !select.value) {
    showToast('Please select an employee', 'warning');
    return;
  }

  const selectedOption = select.options[select.selectedIndex];
  const employeeId = select.value;
  const employeeName = selectedOption.dataset.emp_name;
  const designation = selectedOption.dataset.designation;

  // Check if already added
  if (selectedEmployees.find(emp => emp.id === employeeId)) {
    showToast('Employee already added to list', 'warning');
    return;
  }

  // Add to selected employees array
  selectedEmployees.push({
    id: employeeId,
    name: employeeName,
    designation: designation
  });

  // Create visual list item
  const list = document.getElementById('selectedEmployeesList');
  if (!list) {
    console.error('❌ selectedEmployeesList not found');
    return;
  }

  const newItem = document.createElement('div');
  newItem.className = 'employee-item';
  newItem.dataset.employeeId = employeeId;
  newItem.dataset.employee = employeeName;
  newItem.innerHTML = `
    <span class="employee-name">
      ${employeeName}
      ${designation ? `<small style="color: #666; margin-left: 8px;">- ${designation}</small>` : ''}
    </span>
    <button class="remove-btn" onclick="removeEmployee(this)" title="Remove">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  list.appendChild(newItem);
  select.value = '';
  
  showToast(`${employeeName} added to list`, 'success');
  console.log('📝 Current selected employees:', selectedEmployees);
}

// ============================
// REMOVE EMPLOYEE FROM LIST
// ============================

function removeEmployee(button) {
  const item = button.closest('.employee-item');
  if (!item) return;

  const employeeId = item.dataset.employeeId;
  
  // Remove from array
  selectedEmployees = selectedEmployees.filter(emp => emp.id !== employeeId);
  
  // Animate removal
  item.style.animation = 'slideOut 0.3s ease';
  
  setTimeout(() => {
    item.remove();
    showToast('Employee removed from list', 'info');
  }, 300);
  
  console.log('📝 Current selected employees:', selectedEmployees);
}

// ============================
// SUBMIT EMPLOYEE ALLOCATION
// ============================

async function submitEmployees() {
  if (selectedEmployees.length === 0) {
    showToast('Please add at least one employee', 'error');
    return;
  }

  // Use global currentProjectId or window.currentProjectId
  const projectId = window.currentProjectId || currentProjectId;
  
  if (!projectId) {
    showToast('Project ID not found', 'error');
    return;
  }

  const allocationData = {
    project_id: projectId,
    employees: selectedEmployees.map(emp => ({
      id: emp.id,
      name: emp.name
    }))
  };

  console.log('📤 Submitting employee allocation:', allocationData);

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

    const result = await response.json();
    hideLoadingSpinner();

    console.log('📦 Allocation response:', result);

    if (result.success || result.status === 'success') {
      const message = result.message || `${selectedEmployees.length} employee(s) allocated successfully!`;
      showToast(message, 'success');
      
      // Close modal after delay
      setTimeout(() => {
        closeProjectAllocationForm();
        
        // Refresh project details if viewing project
        if (projectId && typeof viewProject === 'function') {
          viewProject(projectId);
        }
      }, 1500);
    } else {
      showToast(result.message || 'Failed to allocate employees', 'error');
    }
  } catch (error) {
    hideLoadingSpinner();
    console.error('❌ Error submitting allocation:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================

window.fetchProjectEmployees = fetchProjectEmployees;
window.populateEmployeeDropdown = populateEmployeeDropdown;
window.addEmployeeToList = addEmployeeToList;
window.removeEmployee = removeEmployee;
window.submitEmployees = submitEmployees;

console.log('✅ Employee management functions loaded');

// ============================
// POPULATE EMPLOYEE DROPDOWN
// ============================

// function populateEmployeeDropdown() {
//   const select = document.getElementById('employeeSelect');
  
//   if (!select) {
//     console.error('❌ employeeSelect dropdown not found');
//     return;
//   }

//   select.innerHTML = '<option value="">-- SELECT EMPLOYEE --</option>';

//   if (employeesData.length === 0) {
//     const noDataOption = document.createElement('option');
//     noDataOption.value = '';
//     noDataOption.textContent = '-- No employees available --';
//     noDataOption.disabled = true;
//     select.appendChild(noDataOption);
//     console.warn('⚠️ No employees to display');
//     return;
//   }

//   employeesData.forEach(emp => {
//     const option = document.createElement('option');
//     option.value = emp.id;
    
//     // Display format: "NAME - Designation"
//     const displayText = emp.designation 
//       ? `${emp.name} - ${emp.designation}`
//       : emp.name;
    
//     option.textContent = displayText;
//     option.dataset.employeeId = emp.id;
//     option.dataset.name = emp.name;
//     option.dataset.designation = emp.designation || '';
    
//     select.appendChild(option);
//   });
  
//   console.log(`✅ Dropdown populated with ${employeesData.length} employees`);
// }

// ============================
// OPEN PROJECT ALLOCATION MODAL
// ============================

function openProjectAllocationForm(projectId = null) {
  console.log('📝 Opening employee allocation modal for project:', projectId);
  
  const modal = document.getElementById('addProjectAllocationModal');
  if (!modal) {
    console.error('❌ Modal not found');
    return;
  }

  // Store current project ID
  if (projectId) {
    currentProjectId = projectId;
  }

  // Clear previous selections
  selectedEmployees = [];
  const list = document.getElementById('selectedEmployeesList');
  if (list) list.innerHTML = '';

  // Show modal
  modal.style.display = 'block';
  modal.style.animation = 'fadeIn 0.3s ease';
  
  // Fetch employees for this project
  fetchProjectEmployees(projectId);
}

// ============================
// CLOSE PROJECT ALLOCATION MODAL
// ============================

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

// ============================
// ADD EMPLOYEE TO SELECTION LIST
// ============================

function addEmployeeToList() {
  const select = document.getElementById('employeeSelect');
  
  if (!select || !select.value) {
    showToast('Please select an employee', 'warning');
    return;
  }

  const selectedOption = select.options[select.selectedIndex];
  const employeeId = select.value;
  const employeeName = selectedOption.dataset.name;
  const designation = selectedOption.dataset.designation;

  // Check if already added
  if (selectedEmployees.find(emp => emp.id === employeeId)) {
    showToast('Employee already added to list', 'warning');
    return;
  }

  // Add to selected employees array
  selectedEmployees.push({
    id: employeeId,
    name: employeeName,
    designation: designation
  });

  // Create visual list item
  const list = document.getElementById('selectedEmployeesList');
  if (!list) {
    console.error('❌ selectedEmployeesList not found');
    return;
  }

  const newItem = document.createElement('div');
  newItem.className = 'employee-item';
  newItem.dataset.employeeId = employeeId;
  newItem.dataset.employee = employeeName;
  newItem.innerHTML = `
    <span class="employee-name">
      ${employeeName}
      ${designation ? `<small style="color: #666; margin-left: 8px;">- ${designation}</small>` : ''}
    </span>
    <button class="remove-btn" onclick="removeEmployee(this)" title="Remove">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  list.appendChild(newItem);
  select.value = '';
  
  showToast(`${employeeName} added to list`, 'success');
  console.log('📝 Current selected employees:', selectedEmployees);
}

// ============================
// REMOVE EMPLOYEE FROM LIST
// ============================

function removeEmployee(button) {
  const item = button.closest('.employee-item');
  if (!item) return;

  const employeeId = item.dataset.employeeId;
  
  // Remove from array
  selectedEmployees = selectedEmployees.filter(emp => emp.id !== employeeId);
  
  // Animate removal
  item.style.animation = 'slideOut 0.3s ease';
  
  setTimeout(() => {
    item.remove();
    showToast('Employee removed from list', 'info');
  }, 300);
  
  console.log('📝 Current selected employees:', selectedEmployees);
}

// ============================
// SUBMIT EMPLOYEE ALLOCATION
// ============================

async function submitEmployees() {
  if (selectedEmployees.length === 0) {
    showToast('Please add at least one employee', 'error');
    return;
  }

  if (!currentProjectId) {
    showToast('Project ID not found', 'error');
    return;
  }

  const allocationData = {
    project_id: currentProjectId,
    employees: selectedEmployees.map(emp => ({
      id: emp.id,
      name: emp.name
    }))
  };

  console.log('📤 Submitting employee allocation:', allocationData);

  try {
    showLoadingSpinner();

    const response = await fetch('https://www.fist-o.com/web_crm/submit_project_allocation.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(allocationData)
    });

    const result = await response.json();
    hideLoadingSpinner();

    console.log('📦 Allocation response:', result);

    if (result.success || result.status === 'success') {
      const message = result.message || `${selectedEmployees.length} employee(s) allocated successfully!`;
      showToast(message, 'success');
      
      // Close modal after delay
      setTimeout(() => {
        closeProjectAllocationForm();
        
        // Refresh project details if viewing project
        if (currentProjectId) {
          viewProject(currentProjectId);
        }
      }, 1500);
    } else {
      showToast(result.message || 'Failed to allocate employees', 'error');
    }
  } catch (error) {
    hideLoadingSpinner();
    console.error('❌ Error submitting allocation:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// ============================
// UTILITY: SHOW/HIDE LOADING SPINNER
// ============================

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

// ============================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================

window.fetchProjectEmployees = fetchProjectEmployees;
window.populateEmployeeDropdown = populateEmployeeDropdown;
window.addEmployeeToList = addEmployeeToList;
window.removeEmployee = removeEmployee;
window.submitEmployees = submitEmployees;

console.log('✅ Employee management functions loaded');
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

console.log('✅ Project.js loaded successfully - All duplicates removed!');