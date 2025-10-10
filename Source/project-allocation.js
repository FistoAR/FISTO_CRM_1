class ProjectAllocationManager {
  constructor() {
    this.allocations = this.loadAllocations();
    this.initializeEventListeners();
    this.updateTable();
  }

  loadAllocations() {
    const saved = localStorage.getItem('projectAllocations');
    return saved ? JSON.parse(saved) : [];
  }

  saveAllocations() {
    localStorage.setItem('projectAllocations', JSON.stringify(this.allocations));
  }

  initializeEventListeners() {
    document.getElementById('allocationForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
    document.getElementById('addAllocationModal').addEventListener('click', (e) => {
      if (e.target.id === 'addAllocationModal') {
        this.closeForm();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeForm();
      }
    });
  }

  openForm() {
    document.getElementById('addAllocationModal').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  closeForm() {
    document.getElementById('addAllocationModal').classList.remove('show');
    document.body.style.overflow = 'auto';
    this.resetForm();
  }

  resetForm() {
    document.getElementById('allocationForm').reset();
  }

  handleFormSubmit() {
    const formData = new FormData(document.getElementById('allocationForm'));
    const allocationData = {
      projectName: formData.get('allocProjectName'),
      startDate: formData.get('allocStartDate'),
      deadline: formData.get('allocDeadline'),
      projectDescription: formData.get('allocProjectDescription'),
      teamName: formData.get('allocTeamName'),
      assignedBy: formData.get('allocAssignedBy'),
      assignedTo: formData.get('allocAssignedTo'),
    };
    this.addAllocation(allocationData);
    this.closeForm();

    populateTaskAllocationDropdowns();

    alert(`Allocation added for ${allocationData.projectName} assigned to ${allocationData.assignedTo}.`);
  }

  addAllocation(allocationData) {
    this.allocations.push(allocationData);
    this.saveAllocations();
    this.updateTable();
  }

  updateTable() {
    const tbody = document.getElementById('allocationTableBody');
    if (this.allocations.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-state">
          <td colspan="6">
            <div class="empty-content">
              <i class="fas fa-users-cog"></i>
              <p>No allocations found</p>
              <small>Click "Add Allocation" to get started</small>
            </div>
          </td>
        </tr>`;
      return;
    }
    tbody.innerHTML = this.allocations.map((allocation, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${allocation.projectName}</td>
        <td>${allocation.startDate}</td>
        <td>${allocation.deadline}</td>
        <td>${allocation.teamName}</td>
        <td>${allocation.assignedTo}</td>
      </tr>
    `).join('');
  }
}

const allocationManager = new ProjectAllocationManager();

function openAllocationForm() { allocationManager.openForm(); }
function closeAllocationForm() { allocationManager.closeForm(); }
