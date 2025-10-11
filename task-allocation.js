document.addEventListener('DOMContentLoaded', () => {
  const exampleProjects = [
    { projectName: "Project Alpha", projectDescription: "Description of Project Alpha", teamName: "Team A" },
    { projectName: "Project Beta", projectDescription: "Description of Project Beta", teamName: "Team B" },
  ];

  if (!localStorage.getItem('projectAllocations')) {
    localStorage.setItem('projectAllocations', JSON.stringify(exampleProjects));
  }

  const openModalBtn = document.querySelector('.add-btn') || document.getElementById('openModalBtn');
  const closeModalBtn = document.querySelector('.close-btn') || document.getElementById('closeModalBtn');
  const modal = document.getElementById('addTaskAllocationModal');
  const form = document.getElementById('TaskallocationForm');
  const tempTableBody = document.querySelector('#tempTaskTable tbody');
  const mainTableBody = document.getElementById('TaskallocationTableBody');
  const submitBtn = document.querySelector('.submit-task-btn') || document.querySelector('.submit-btn');

  // Populate project dropdown
  function populateProjectDropdown() {
    const projects = JSON.parse(localStorage.getItem('projectAllocations')) || [];
    const select = document.getElementById('TaskProjectName');
    select.innerHTML = '<option value="">Select Project Name</option>';
    projects.forEach(proj => {
      const option = document.createElement('option');
      option.value = proj.projectName;
      option.textContent = proj.projectName;
      select.appendChild(option);
    });
  }

  // Update Description and Team Name when project changes
  const projectSelect = document.getElementById('TaskProjectName');
  projectSelect.addEventListener('change', function () {
    const projects = JSON.parse(localStorage.getItem('projectAllocations')) || [];
    const project = projects.find(p => p.projectName === this.value);
    if (project) {
      document.getElementById('TaskProjectDescription').value = project.projectDescription;
      document.getElementById('TaskTeamName').value = project.teamName;
    } else {
      document.getElementById('TaskProjectDescription').value = '';
      document.getElementById('TaskTeamName').value = '';
    }
  });

  openModalBtn.addEventListener('click', () => {
    populateProjectDropdown();
    modal.style.display = 'flex';
    form.reset();
    clearTempTable();
    addTempEmptyRow();
  });

  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal if clicking outside content
  // window.addEventListener('click', (event) => {
  //   if (event.target === modal) {
  //     modal.style.display = 'none';
  //   }
  // });

  // Add empty state row to temp table if empty
  function addTempEmptyRow() {
    if (tempTableBody.children.length === 0) {
      const tr = document.createElement('tr');
      tr.classList.add('empty-state-temp');
      tr.innerHTML = '<td colspan="6" style="font-style: italic; text-align: center; color: #666;">No tasks added yet</td>';
      tempTableBody.appendChild(tr);
    }
  }

  // Clear temp table rows
  function clearTempTable() {
    tempTableBody.innerHTML = '';
  }

  // Form submit handler: Add task to temporary table
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const taskName = document.getElementById('TaskName').value.trim();
    const description = document.getElementById('TaskProjectDescription').value.trim() || '-';
    const startDate = document.getElementById('TaskStartDate').value;
    const endDate = document.getElementById('TaskEndDate').value;
    const assignedTo = document.getElementById('allocAssignedTo').value;

    // Remove empty state if present
    const emptyRow = tempTableBody.querySelector('.empty-state-temp');
    if (emptyRow) emptyRow.remove();

    // Create row for temporary table
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${taskName}</td>
      <td>${description}</td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td>${assignedTo}</td>
      <td><button class="task-D" aria-label="Delete Task" style ="    
      background: linear-gradient(111deg, #161616 5%, #5f5f5ff2 90%);
      color: white;
      border: none;
      padding: 10px 10px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s 
      ease;
      display: block;
      ">Delete</button></td>
    `;

    // Delete button event for temp row
    newRow.querySelector('button').addEventListener('click', () => {
      newRow.remove();
      if (tempTableBody.children.length === 0) {
        addTempEmptyRow();
      }
    });

    tempTableBody.appendChild(newRow);

    // Clear only task-specific fields, not project or assignedTo
    document.getElementById('TaskName').value = '';
    document.getElementById('TaskStartDate').value = '';
    document.getElementById('TaskEndDate').value = '';
    // Assigned To remains selected (do NOT clear)
  });

  // Submit button handler: move temp table rows to main table and close modal
  submitBtn.addEventListener('click', () => {
    if (tempTableBody.children.length === 0 || tempTableBody.querySelector('.empty-state-temp')) {
      alert('No tasks to submit');
      return;
    }

    // Remove empty state in main table if any
    const emptyMain = mainTableBody.querySelector('.empty-state');
    if (emptyMain) {
      mainTableBody.removeChild(emptyMain);
    }

    // Move all rows from temp to main table
    while (tempTableBody.firstChild) {
      const tempRow = tempTableBody.firstChild;
      const cells = tempRow.querySelectorAll('td');

      const mainRow = document.createElement('tr');
      mainRow.innerHTML = `
        <td>${cells[0].textContent}</td>
        <td>${cells[1].textContent}</td>
        <td>${cells[2].textContent}</td>
        <td>${cells[3].textContent}</td>
        <td>${cells[4].textContent}</td>
        <td><button class="task-D" aria-label="Delete Task"  style ="    
      background: linear-gradient(111deg, #161616 5%, #5f5f5ff2 90%);
      color: white;
      border: none;
      padding: 10px 10px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s 
      ease;
      display: block;
      ">Delete</button></td>
      `;

      // Delete button event for main table row
      mainRow.querySelector('button').addEventListener('click', () => {
        mainRow.remove();
        if (mainTableBody.children.length === 0) {
          const tr = document.createElement('tr');
          tr.classList.add('empty-state');
          tr.innerHTML = '<td colspan="6" style="font-style: italic; text-align: center; color: #666;">No allocations found. Click "Add New Task" to get started.</td>';
          mainTableBody.appendChild(tr);
        }
      });

      mainTableBody.appendChild(mainRow);
      tempTableBody.removeChild(tempRow);
    }

    addTempEmptyRow();
    modal.style.display = 'none';
  });

  // Initialize empty states on page load
  addTempEmptyRow();

  if (mainTableBody.children.length === 0) {
    const tr = document.createElement('tr');
    tr.classList.add('empty-state');
    tr.innerHTML = '<td colspan="6" style="font-style: italic; text-align: center; color: #666;">No allocations found. Click "Add New Task" to get started.</td>';
    mainTableBody.appendChild(tr);
  }
});


function closeTaskAllocationForm() {
  console.log('closeTaskAllocationForm called');
  const modal = document.getElementById('addTaskAllocationModal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Modal hidden');
  } else {
    console.error('Modal element not found');
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