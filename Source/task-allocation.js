// Example projects to populate dropdown, stored in localStorage for demo
const exampleProjects = [
  { projectName: "Project Alpha", projectDescription: "Description of Project Alpha", teamName: "Team A" },
  { projectName: "Project Beta", projectDescription: "Description of Project Beta", teamName: "Team B" },
];

if (!localStorage.getItem('projectAllocations')) {
  localStorage.setItem('projectAllocations', JSON.stringify(exampleProjects));
}

// Elements references
const tempTableBody = document.querySelector('#tempTaskTable tbody');
const mainTableBody = document.getElementById('TaskallocationTableBody');

// Populate project dropdown
function populateTaskAllocationDropdowns() {
  const projects = JSON.parse(localStorage.getItem('projectAllocations')) || [];
  const projectSelect = document.getElementById('TaskProjectName');
  projectSelect.innerHTML = '<option value="">Select Project Name</option>';
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.projectName;
    option.textContent = project.projectName;
    projectSelect.appendChild(option);
  });
}

// Update project description and team name when project changes
document.getElementById('TaskProjectName').addEventListener('change', function() {
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

// Open modal and populate dropdown
function openTaskAllocationForm() {
  populateTaskAllocationDropdowns();
  document.getElementById('addTaskAllocationModal').style.display = 'flex';
}

// Close modal and reset form + clear temp table
function closeTaskAllocationForm() {
  document.getElementById('addTaskAllocationModal').style.display = 'none';
  resetFormAndTempTable();
}

// Reset form inputs and clear temporary table
function resetFormAndTempTable() {
  document.getElementById('TaskallocationForm').reset();
  document.getElementById('TaskProjectDescription').value = '';
  document.getElementById('TaskTeamName').value = '';

  tempTableBody.innerHTML = '';
  addTempEmptyState();
}

// Add empty state row for temp table
function addTempEmptyState() {
  const emptyRow = document.createElement('tr');
  emptyRow.classList.add('empty-state-temp');
  emptyRow.innerHTML = `<td colspan="6" style="font-style: italic; text-align: center; color: #666;">No tasks added yet</td>`;
  tempTableBody.appendChild(emptyRow);
}

// Initialize temp table empty state on page load
addTempEmptyState();

// Add a task to the temporary table on Add Task button click
document.getElementById('TaskallocationForm').addEventListener('submit', function(event) {
  event.preventDefault();

  if (!this.checkValidity()) {
    this.reportValidity();
    return;
  }

  // Remove temp empty state row if exists
  const tempEmptyRow = tempTableBody.querySelector('.empty-state-temp');
  if (tempEmptyRow) tempEmptyRow.remove();

  // Gather form data
  const taskName = document.getElementById('TaskName').value.trim();
  const description = document.getElementById('TaskProjectDescription').value.trim() || '-';
  const startDate = document.getElementById('TaskStartDate').value;
  const endDate = document.getElementById('TaskEndDate').value;
  const assignedTo = document.getElementById('allocAssignedTo').value;

  // Create table row for temp table
  const tempRow = document.createElement('tr');
  tempRow.innerHTML = `
    <td>${taskName}</td>
    <td>${description}</td>
    <td>${startDate}</td>
    <td>${endDate}</td>
    <td>${assignedTo}</td>
    <td><button class="task-D" aria-label="Delete Task">Delete</button></td>
  `;

  // Attach delete event for this temp row
  tempRow.querySelector('button.task-D').addEventListener('click', () => {
    tempRow.remove();
    if (tempTableBody.children.length === 0) {
      addTempEmptyState();
    }
  });

  tempTableBody.appendChild(tempRow);

  // Clear form fields but leave modal open
  this.reset();
  document.getElementById('TaskProjectDescription').value = '';
  document.getElementById('TaskTeamName').value = '';
});

// Transfer all tasks from temp table to main table on Submit All
function submitAllTasks() {
  if (tempTableBody.children.length === 0 || tempTableBody.querySelector('.empty-state-temp')) {
    alert("No tasks to submit!");
    return;
  }

  // Remove any existing empty state from main table
  const mainEmptyState = mainTableBody.querySelector('.empty-state');
  if (mainEmptyState) mainEmptyState.remove();

  // Move rows from temp to main table
  while (tempTableBody.firstChild) {
    const tempRow = tempTableBody.firstChild;

    // Construct new main table row with delete button
    const newMainRow = document.createElement('tr');
    newMainRow.innerHTML = `
      <td>${tempRow.cells[0].textContent}</td>
      <td>${tempRow.cells[1].textContent}</td>
      <td>${tempRow.cells[2].textContent}</td>
      <td>${tempRow.cells[3].textContent}</td>
      <td>${tempRow.cells[4].textContent}</td>
      <td><button class="task-D" aria-label="Delete Task">Delete</button></td>
    `;

    // Attach delete event for main table row
    newMainRow.querySelector('button.task-D').addEventListener('click', () => {
      newMainRow.remove();
      if (mainTableBody.children.length === 0) {
        addMainEmptyState();
      }
    });

    mainTableBody.appendChild(newMainRow);
    tempTableBody.removeChild(tempRow);
  }

  // Add empty state to temp table after clear
  addTempEmptyState();

  // Close modal
  closeTaskAllocationForm();
}

// Add empty state to main table when no tasks exist
function addMainEmptyState() {
  const emptyRow = document.createElement('tr');
  emptyRow.classList.add('empty-state');
  emptyRow.innerHTML = `<td colspan="6" style="font-style: italic; text-align: center; color: #666;">
                          No allocations found. Click "Add New Task" to get started.
                        </td>`;
  mainTableBody.appendChild(emptyRow);
}

// Close modal if clicking outside modal content
window.onclick = function(event) {
  const modal = document.getElementById('addTaskAllocationModal');
  if (event.target === modal) {
    closeTaskAllocationForm();
  }
};
