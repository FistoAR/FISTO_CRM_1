class ProjectManager {
    constructor() {
        this.projects = [];
        this.initializeEventListeners();
        this.setDefaultDate();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Close modal when clicking outside
        document.getElementById('addProjectModal').addEventListener('click', (e) => {
            if (e.target.id === 'addProjectModal') {
                this.closeForm();
            }
        });

        document.getElementById('viewProjectModal').addEventListener('click', (e) => {
            if (e.target.id === 'viewProjectModal') {
                this.closeViewModal();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeForm();
                this.closeViewModal();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    openForm() {
        document.getElementById('addProjectModal').classList.add('show');
        document.body.style.overflow = 'show';
    }

    closeForm() {
        document.getElementById('addProjectModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    closeViewModal() {
        document.getElementById('viewProjectModal').classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    resetForm() {
        document.getElementById('projectForm').reset();
        this.setDefaultDate();
        // Reset custom project type field
        document.getElementById('customProjectType').style.display = 'none';
    }

    handleFormSubmit() {
        const formData = new FormData(document.getElementById('projectForm'));
        
        // Get project type value
        let projectType = formData.get('typeOfProject');
        if (projectType === 'other') {
            projectType = formData.get('customProjectType') || 'Other';
        }

        const projectData = {
            id: Date.now().toString(),
            projectName: formData.get('projectName'),
            customerId: formData.get('customerId'),
            contactNumber: formData.get('contactNumber'),
            typeOfProject: projectType,
            division: formData.get('division'),
            category: formData.get('category'),
            date: formData.get('date'),
            deadline: formData.get('deadline'),
            status: formData.get('status'),
            specification: formData.get('specification') || 'N/A'
        };

        this.addProject(projectData);
        this.closeForm();
        this.showToast('Project Added Successfully', `${projectData.projectName} has been added to the project list.`);
    }

    addProject(projectData) {
        this.projects.push(projectData);
        this.updateTable();
    }

    updateTable() {
        const tbody = document.getElementById('projectTableBody');
        
        if (this.projects.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="7">
                        <div class="empty-content">
                            <i class="fas fa-project-diagram"></i>
                            <p>No projects found</p>
                            <small>Click "Add Project" to get started</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.projects.map((project, index) => `
            <tr>
                <td>${this.formatDate(project.date)}</td>
                <td>${project.projectName}</td>
                <td>${project.customerId}</td>
                <td>${project.contactNumber}</td>
                <td>
                    <span class="status-badge">${project.typeOfProject}</span>
                </td>
                <td>${project.specification}</td>
                <td>
                    <button class="view-btn" onclick="projectManager.viewProject(${index})">
                        View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    viewProject(index) {
        console.log('viewProject called with index:', index);
        console.log('Available projects:', this.projects);
        
        const project = this.projects[index];
        if (!project) {
            console.error('Project not found at index:', index);
            return;
        }
        
        console.log('Project data:', project);
        const viewContent = document.getElementById('projectViewContent');
        
        if (!viewContent) {
            console.error('projectViewContent element not found');
            return;
        }
        
        viewContent.innerHTML = `
            <div class="view-grid">
                <div class="view-item">
                    <h4>Project Name</h4>
                    <p>${project.projectName}</p>
                </div>
                <div class="view-item">
                    <h4>Customer ID</h4>
                    <p>${project.customerId}</p>
                </div>
                <div class="view-item">
                    <h4>Contact Number</h4>
                    <p>${project.contactNumber}</p>
                </div>
                <div class="view-item">
                    <h4>Type of Project</h4>
                    <p>${project.typeOfProject}</p>
                </div>
                <div class="view-item">
                    <h4>Division</h4>
                    <p style="text-transform: capitalize;">${project.division}</p>
                </div>
                <div class="view-item">
                    <h4>Category</h4>
                    <p style="text-transform: capitalize;">${project.category}</p>
                </div>
                <div class="view-item">
                    <h4>Date</h4>
                    <p>${this.formatDate(project.date)}</p>
                </div>
                <div class="view-item">
                    <h4>Deadline</h4>
                    <p>${this.formatDate(project.deadline)}</p>
                </div>
                <div class="view-item">
                    <h4>Status</h4>
                    <p>
                        <span class="status-badge status-${project.status}">${project.status.replace('-', ' ')}</span>
                    </p>
                </div>
                <div class="view-item" style="grid-column: 1 / -1;">
                    <h4>Specification</h4>
                    <p>${project.specification}</p>
                </div>
            </div>
        `;
        
        document.getElementById('viewProjectModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showToast(title, description) {
        const toastContainer = document.getElementById('projectToastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <h4>${title}</h4>
            <p>${description}</p>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Handle project type change
function handleProjectTypeChange() {
    const typeSelect = document.getElementById('typeOfProject');
    const customInput = document.getElementById('customProjectType');
    
    if (typeSelect.value === 'other') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Initialize the project manager
const projectManager = new ProjectManager();

// Global functions for HTML onclick handlers
function openProjectForm() {
    projectManager.openForm();
}

function closeProjectForm() {
    projectManager.closeForm();
}

function closeProjectViewModal() {
    projectManager.closeViewModal();
}