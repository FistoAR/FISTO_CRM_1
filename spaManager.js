class DashboardSPA {
    constructor() {
        this.currentUser = {
            designation: null,
            employeeId: null,
            name: null,
            permissions: {}
        };
        
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        
        // Consolidated and enhanced designation-based menu configuration
        this.designationMenus = {
            'CEO': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'analysis', icon: 'fas fa-chart-line', text: 'Analysis' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                // { id: 'registration', icon: 'fas fa-user-plus', text: 'Employee Details' },
                // { id: 'leave', icon: 'fas fa-calendar-check', text: 'Request Management' },
                // { id: 'specialday', icon: 'fas fa-calendar-star', text: 'Special Day Management' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' },
                { id: 'budget', icon: 'fas fa-dollar-sign', text: 'Budget' },
                { id: 'marketing', icon: 'fas fa-bullhorn', text: 'Marketing' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' }
            ],
            'MD': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'analysis', icon: 'fas fa-chart-line', text: 'Analysis' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'registration', icon: 'fas fa-user-plus', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Request Management' },
                { id: 'specialday', icon: 'fa fa-calendar-o', text: 'HR' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' },
                { id: 'budget', icon: 'fas fa-dollar-sign', text: 'Budget' },
                { id: 'marketing', icon: 'fas fa-bullhorn', text: 'Marketing' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' }
            ],
            'ProjectHead': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'analysis', icon: 'fas fa-chart-line', text: 'Analysis' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'registration', icon: 'fas fa-user-plus', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'specialday', icon: 'fa-regular fa-calendar-xmark', text: 'HR' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' },
                { id: 'budget', icon: 'fas fa-dollar-sign', text: 'Budget' },
                // { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' }
            ],
            'SBUHead': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'analysis', icon: 'fas fa-chart-line', text: 'Analysis' },
                { id: 'marketing', icon: 'fas fa-bullhorn', text: 'Marketing' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'registration', icon: 'fas fa-user-plus', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'specialday', icon: 'fa-regular fa-calendar-xmark', text: 'HR' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' },
                { id: 'budget', icon: 'fas fa-dollar-sign', text: 'Budget' },
                // { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' }
            ],
            'TeamHead': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                 { id: 'analysis', icon: 'fas fa-chart-line', text: 'Analysis' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' }
            ],
            'HR': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' },
                { id: 'analysis', icon: 'fas fa-chart-line', text: 'Analysis' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'registration', icon: 'fas fa-user-plus', text: 'Employee Details' },
                { id: 'specialday', icon: 'fa-regular fa-calendar-xmark', text: 'HR' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' }
            ],
            'JuniorDeveloper': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' },
                { id: 'report', icon: 'fas fa-clipboard-list', text: 'Reports' }
                
            ],
            'Junior Developer Intern': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ],
            'UI/UX Designer': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ],
            'UI/UX Intern': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ],
             'AR VR Developer': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' }
            ],
            '3D Artist': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ],
            '3D Artist Intern': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'projects', icon: 'fas fa-project-diagram', text: 'Projects' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ],
            'Admin': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                // { id: 'employee', icon: 'fas fa-users', text: 'Employee Details' },
                { id: 'registration', icon: 'fas fa-user-plus', text: 'Employee Details' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'report', icon: 'fas fa-file-alt', text: 'Reports' }
            ],
            'Marketing': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'marketing', icon: 'fas fa-bullhorn', text: 'Marketing' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ],
            'Marketing Associate': [
                { id: 'dashboard', icon: 'fas fa-home', text: 'Dashboard' },
                { id: 'marketing', icon: 'fas fa-bullhorn', text: 'Marketing' },
                { id: 'clients', icon: 'fas fa-handshake', text: 'Clients' },
                { id: 'leave', icon: 'fas fa-calendar-check', text: 'Employee Request' },
                { id: 'dailyreport', icon: 'fas fa-clipboard-list', text: 'Daily Reports' }
            ]
        };

        // Enhanced designation-based permissions with granular controls
        this.designationPermissions = {
            'CEO': {
                canViewAllReports: true,
                canManageEmployees: true,
                canApproveLeave: true,
                canViewBudget: true,
                canManageSpecialDays: true,
                canAccessAnalysis: true,
                canManageProjects: true,
                canViewMarketing: true,
                canManageClients: true,
                canRegisterEmployees: true,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            'MD': {
                canViewAllReports: true,
                canManageEmployees: true,
                canApproveLeave: true,
                canViewBudget: true,
                canManageSpecialDays: true,
                canAccessAnalysis: true,
                canManageProjects: true,
                canViewMarketing: true,
                canManageClients: true,
                canRegisterEmployees: true,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            'ProjectHead': {  // Add this entry
                canViewAllReports: true,
                // canManageEmployees: true,
                // canApproveLeave: true,
                // canViewBudget: true,
                canManageSpecialDays: false,
                canAccessAnalysis: true,
                canManageProjects: true,
                canViewMarketing: false,
                // canManageClients: true,
                // canRegisterEmployees: true,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            'TeamHead': {
                canViewAllReports: true,
                canManageEmployees: true,
                canApproveLeave: true,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: true,
                canViewMarketing: false,
                canManageClients: true,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            'AR VR Developer': {
                canViewAllReports: true,
                canManageEmployees: true,
                canApproveLeave: true,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: true,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            'HR': {
                canViewAllReports: true,
                canManageEmployees: true,
                canApproveLeave: true,
                canViewBudget: false,
                canManageSpecialDays: true,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: true,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            // Employee designations with limited permissions
            'JuniorDeveloper': {
                canViewAllReports: true,
                // canManageEmployees: true,
                // canApproveLeave: true,
                // canViewBudget: true,
                canManageSpecialDays: false,
                canAccessAnalysis: true,
                canManageProjects: true,
                canViewMarketing: false,
                // canManageClients: true,
                // canRegisterEmployees: true,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            'Junior Developer Intern': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            'UI/UX Designer': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            'UI/UX Intern': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            '3D Artist': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            '3D Artist Intern': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            'Admin': {
                canViewAllReports: true,
                canManageEmployees: true,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: false,
                canManageClients: false,
                canRegisterEmployees: true,
                canViewDashboard: true,
                canSubmitDailyReport: false,
                canViewOwnReports: true
            },
            'Marketing': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: true,
                canManageClients: true,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            },
            'Marketing Associate': {
                canViewAllReports: false,
                canManageEmployees: false,
                canApproveLeave: false,
                canViewBudget: false,
                canManageSpecialDays: false,
                canAccessAnalysis: false,
                canManageProjects: false,
                canViewMarketing: true,
                canManageClients: true,
                canRegisterEmployees: false,
                canViewDashboard: true,
                canSubmitDailyReport: true,
                canViewOwnReports: true
            }
        };

        // Section mapping for content areas
        this.sectionMapping = {
            'dashboard': 'dashboard-content',
            'analysis': 'analysis-content',
            'projects': 'projects-content',
            'employee': 'employee-content',
            'dailyreport': 'dailyreport-content',
            'leave': 'leave-content',
            'registration': 'registration-content',
            'specialday': 'specialday-content',
            'report': 'report-content',
            'budget': 'budget-content',
            'marketing': 'marketing-content',
            'clients': 'clients-content'
        };

        // Bind methods to preserve context
        this.navigateToSection = this.navigateToSection.bind(this);
        this.hasPermission = this.hasPermission.bind(this);
        this.showNotification = this.showNotification.bind(this);
    }

    // Initialize the SPA
    initialize() {
        console.log('Initializing Dashboard SPA...');
        
        if (!this.validateUserSession()) {
            return false;
        }
        
        this.loadUserData();
        this.generateDesignationBasedMenu();
        this.setupEventHandlers();
        this.startPeriodicUpdates();
        
        // Load initial section from URL or default to dashboard
        const initialSection = window.location.hash.slice(1) || 'dashboard';
        
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            this.navigateToSection(initialSection);
            
            // Ensure dashboard is active if it's the initial section
            if (initialSection === 'dashboard') {
                this.setDashboardActive();
            }
        }, 100);
        
        this.isInitialized = true;
        console.log('Dashboard SPA initialized successfully');
        return true;
    }

    setDashboardActive() {
    console.log('Setting dashboard as active...');
    
    // Remove active from all nav items
    document.querySelectorAll('#sidebarMenu .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate dashboard nav item
    const dashboardNavItem = document.querySelector('#sidebarMenu .nav-item[data-section="dashboard"]');
    if (dashboardNavItem) {
        dashboardNavItem.classList.add('active');
        console.log('Dashboard nav item activated');
    } else {
        console.warn('Dashboard nav item not found');
        // Fallback: activate first nav item
        const firstNavItem = document.querySelector('#sidebarMenu .nav-item');
        if (firstNavItem) {
            firstNavItem.classList.add('active');
        }
    }
    
    // Ensure dashboard content is visible and active
    this.showContentSection('dashboard');
}

    // FIXED: Validate user session with consistent key checking
    validateUserSession() {
        console.log('Validating user session...');
        
        // Check both storage patterns for backward compatibility
        const directKeys = ['employeeId', 'employeeName', 'designation'];
        const hasDirectKeys = directKeys.every(key => sessionStorage.getItem(key));
        
        const currentUserData = sessionStorage.getItem('currentUser');
        let hasCurrentUserData = false;
        
        if (currentUserData) {
            try {
                const userData = JSON.parse(currentUserData);
                hasCurrentUserData = userData.employeeId && userData.name && userData.designation;
            } catch (e) {
                console.warn('Invalid currentUser data in sessionStorage');
            }
        }
        
        // Valid if either pattern exists
        if (!hasDirectKeys && !hasCurrentUserData) {
            console.warn('No valid session data found');
            this.showNotification('Your session has expired. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        
        console.log('Session validation successful');
        return true;
    }

    // FIXED: Load user data with consistent handling
    loadUserData() {
        console.log('Loading user data...');
        
        let userData = {};
        
        // First try to get from currentUser object
        const currentUserData = sessionStorage.getItem('currentUser');
        if (currentUserData) {
            try {
                userData = JSON.parse(currentUserData);
                console.log('Loaded user data from currentUser object:', userData);
            } catch (e) {
                console.warn('Failed to parse currentUser data, falling back to direct keys');
            }
        }
        
        // Fallback to direct session storage keys
        if (!userData.employeeId) {
            userData = {
                employeeId: sessionStorage.getItem('employeeId'),
                name: sessionStorage.getItem('employeeName'),
                designation: sessionStorage.getItem('designation')
            };
            console.log('Loaded user data from direct keys:', userData);
        }
        
        // Set current user with fallbacks
        this.currentUser = {
            name: userData.name || userData.employeeName || 'User',
            employeeId: userData.employeeId || 'EMP000',
            designation: userData.designation || userData.designation || 'Junior Developer',
            permissions: this.designationPermissions[userData.designation || userData.designation || 'Junior Developer'] || {}
        };
        
        // Store consistent format for future use
        sessionStorage.setItem('currentUser', JSON.stringify({
            employeeId: this.currentUser.employeeId,
            name: this.currentUser.name,
            designation: this.currentUser.designation
        }));
        
        this.updateUserInterface();
        console.log('User data loaded successfully:', this.currentUser);
    }

    // Update UI elements with user data
    updateUserInterface() {
        const { name, employeeId, designation } = this.currentUser;
        
        // Update sidebar user info
        this.updateElement('userWelcome', `Welcome, ${name}`);
        this.updateElement('Designation', `Designation: ${designation}`);
        this.updateElement('userId', `ID: ${employeeId}`);
        
        // Update main dashboard welcome
        this.updateElement('.welcome-card h2', `Hello, ${name}`);
        
        // Pre-fill forms with user data
        this.updateFormFields();
    }

    // Helper method to update elements safely
    updateElement(selector, content) {
        const element = document.querySelector(selector) || document.getElementById(selector);
        if (element) {
            element.textContent = content;
        }
    }

    // Update form fields with user data
    updateFormFields() {
        const { employeeId, name } = this.currentUser;
        const today = new Date().toISOString().split('T')[0];
        
        const formUpdates = [
            { id: 'employee-id', value: employeeId },
            { id: 'employee-name', value: name },
            { id: 'empId', value: employeeId },
            { id: 'empName', value: name },
            { id: 'reportDate', value: today },
            { id: 'attendanceDate', value: today }
        ];
        
        formUpdates.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element && element.tagName === 'INPUT') {
                element.value = value;
            }
        });
    }

    // FIXED: Generate designation-based sidebar menu with consistent data handling
    generateDesignationBasedMenu() {
    const menuContainer = document.getElementById('sidebarMenu');
    if (!menuContainer) {
        console.error('Sidebar menu container not found!');
        return;
    }

    const designation = this.currentUser.designation;
    console.log('Generating menu for designation:', designation);

    const userMenus = this.designationMenus[designation] || this.designationMenus['Junior Developer'];

    // Clear existing menu
    menuContainer.innerHTML = '';

    // Generate and append menu items
    userMenus.forEach((menu, index) => {
        const menuItem = this.createMenuButton(menu);
        
        // Set dashboard as active by default (first item is usually dashboard)
        if (menu.id === 'dashboard') {
            menuItem.classList.add('active');
        }
        
        menuContainer.appendChild(menuItem);
    });

    console.log(`Generated ${userMenus.length} menu items for designation: ${designation}`);
}

    // Create individual menu button
    createMenuButton(menu) {
        const button = document.createElement('button');
        button.className = 'nav-item';
        button.setAttribute('data-section', menu.id);
        button.innerHTML = `
            <i class="${menu.icon}"></i>
            <span>${menu.text}</span>
        `;
        
        // Add click event listener with proper active state handling
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all nav items first
            document.querySelectorAll('#sidebarMenu .nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active to clicked item
            button.classList.add('active');
            
            // Navigate to section
            this.navigateToSection(menu.id);
        });
        
        return button;
    }

    // Navigate to specific section
    navigateToSection(sectionId) {
    if (!this.hasAccessToSection(sectionId)) {
        this.showNotification('You do not have permission to access this section.', 'warning');
        if (sectionId !== 'dashboard') {
            // Fallback to dashboard
            this.navigateToSection('dashboard');
        }
        return;
    }

    // Prevent redundant navigation
    if (this.currentSection === sectionId) {
        // Still update active state even for same section
        this.updateActiveMenuItem(sectionId);
        return;
    }

    // Proceed to update UI
    this.currentSection = sectionId;
    this.renderSection(sectionId);
}

    // Check if user has access to a section
    hasAccessToSection(sectionId) {
        const designation = this.currentUser.designation;
        const userMenus = this.designationMenus[designation] || [];

        return userMenus.some(menu => menu.id === sectionId);
    }

    // Render specific section
    // Enhanced renderSection method to ensure active state is properly set
    renderSection(sectionId) {
        console.log(`Rendering section: ${sectionId}`);
        
        // Update active menu item FIRST
        this.updateActiveMenuItem(sectionId);
        
        // Then show content section
        this.showContentSection(sectionId);
        
        // Update URL
        this.updateURL(sectionId);
        
        // Initialize section features with special handling for dashboard
        if (sectionId === 'dashboard') {
            // For dashboard, add extra delay to ensure proper rendering
            setTimeout(() => {
                this.initializeSectionFeatures(sectionId);
            }, 100);
        } else {
            // For other sections, initialize immediately
            this.initializeSectionFeatures(sectionId);
        }
    }
    

    // Update active menu item
    updateActiveMenuItem(sectionId) {
        // Remove active class from all nav items
        const allNavItems = document.querySelectorAll('#sidebarMenu .nav-item');
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to the current section's nav item
        const activeNavItem = document.querySelector(`#sidebarMenu .nav-item[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
            console.log(`Active nav item set for: ${sectionId}`);
        } else {
            console.warn(`Nav item not found for section: ${sectionId}`);
        }
    }

    // Show specific content section
    showContentSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // Show target section
        const targetId = this.sectionMapping[sectionId] || `${sectionId}-content`;
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            // Show the section
            targetSection.style.display = 'block';
            
            // Force a reflow for proper rendering (especially important for charts)
            targetSection.offsetHeight;
            
            // Then add active class
            targetSection.classList.add('active');
            
            console.log(`Section ${targetId} is now visible and active`);
        } else {
            console.warn(`Content section not found: ${targetId}`);
            if (sectionId !== 'dashboard') {
                this.navigateToSection('dashboard');
            }
        }
    }

    refreshDashboard() {
        const currentSection = this.getCurrentSection();
        if (currentSection === 'dashboard') {
            console.log('Refreshing dashboard...');
            
            // Destroy existing charts to prevent memory leaks
            if (typeof destroyAllCharts === 'function') {
                destroyAllCharts();
            }
            
            // Re-initialize dashboard after a brief delay
            setTimeout(() => {
                this.initializeDashboard();
            }, 200);
        }
    }
     refreshDashboardData() {
        if (this.currentSection === 'dashboard') {
            console.log('Refreshing dashboard data...');
            
            // Update statistics
            this.updateDashboardStats();
            
            // Refresh charts if needed
            if (typeof initDashboardCharts === 'function') {
                // Don't recreate charts, just update data if possible
                // For now, we'll just ensure they're properly initialized
                setTimeout(() => {
                    const dashboard = document.getElementById('dashboard-content');
                    if (dashboard && dashboard.classList.contains('active')) {
                        // Only refresh if dashboard is still active
                        this.updateDashboardStats();
                    }
                }, 100);
            }
        }
    }


    // Update URL without page refresh
    updateURL(sectionId) {
        const newURL = `${window.location.pathname}#${sectionId}`;
        window.history.pushState({ section: sectionId }, '', newURL);
    }

    // Initialize section-specific features
     initializeSectionFeatures(sectionId) {
        const { permissions } = this.currentUser;
        
        switch(sectionId) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'leave':
                this.initializeLeaveSection(permissions);
                break;
            case 'employee':
                this.initializeEmployeeSection(permissions);
                break;
            case 'specialday':
                if (permissions.canManageSpecialDays) {
                    this.initializeSpecialDaySection();
                }
                break;
            case 'registration':
                if (permissions.canRegisterEmployees) {
                    this.initializeRegistrationSection();
                }
                break;
            case 'dailyreport':
                if (permissions.canSubmitDailyReport) {
                    this.initializeDailyReportSection();
                }
                break;
        }
    }

    // Initialize dashboard
   initializeDashboard() {
        console.log('Initializing dashboard section...');
        
        // Ensure dashboard content is visible first
        const dashboardContent = document.getElementById('dashboard-content');
        if (!dashboardContent || !dashboardContent.classList.contains('active')) {
            console.warn('Dashboard content not active, waiting...');
            setTimeout(() => this.initializeDashboard(), 200);
            return;
        }

        // Initialize dashboard components in sequence
        this.initializeDashboardComponents();
    }

    initializeDashboardComponents() {
        // 1. Show random quote first (fast)
        if (typeof showRandomQuote === 'function') {
            showRandomQuote();
        }
        
        // 2. Initialize charts with proper timing
        setTimeout(() => {
            if (typeof initDashboardCharts === 'function') {
                console.log('Calling initDashboardCharts from SPA manager...');
                initDashboardCharts();
            } else {
                console.warn('initDashboardCharts function not available');
            }
        }, 100);

        // 3. Initialize any other dashboard-specific features
        // setTimeout(() => {
        //     this.updateDashboardStats();
        //     this.checkForNotifications();
        // }, 300);
    }

    // Initialize leave section based on permissions
    initializeLeaveSection(permissions) {
        const hrView = document.getElementById('hr-view');
        const employeeView = document.querySelector('.employee-request-view');
        
        if (permissions.canApproveLeave || permissions.canViewAllReports) {
            // Show HR management interface
            if (hrView) {
                hrView.style.display = 'block';
                hrView.classList.remove('hidden');
            }
        } else {
            // Show only employee request interface
            if (hrView) {
                hrView.style.display = 'none';
                hrView.classList.add('hidden');
            }
        }
        
        // Initialize leave management functions if they exist
        if (typeof updateLeaveDateFields === 'function') {
            updateLeaveDateFields();
        }
    }

    // Initialize employee section
    initializeEmployeeSection(permissions) {
        const managementControls = document.querySelectorAll('.employee-management-controls');
        managementControls.forEach(control => {
            control.style.display = permissions.canManageEmployees ? 'block' : 'none';
        });
    }

    // Initialize special day section
    initializeSpecialDaySection() {
        if (typeof renderQuotesTable === 'function') {
            renderQuotesTable();
        }
        if (typeof renderSpecialDaysTable === 'function') {
            renderSpecialDaysTable();
        }
        if (typeof renderUpcomingEvents === 'function') {
            renderUpcomingEvents();
        }
    }

    // Initialize registration section
    initializeRegistrationSection() {
        // Registration specific initialization
        console.log('Registration section initialized for authorized user');
    }

    // Initialize daily report section
    initializeDailyReportSection() {
        // Daily report specific initialization
        console.log('Daily report section initialized');
    }

    // Setup event handlers
    setupEventHandlers() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // Hamburger menu toggle
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sidebar = document.getElementById('sidebar');
        
        if (hamburgerBtn && sidebar) {
            hamburgerBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || window.location.hash.slice(1) || 'dashboard';
            this.navigateToSection(section);
        });
        
        // Profile modal handlers
        window.addEventListener('click', (e) => {
            const profileModal = document.getElementById('profileModal');
            if (e.target === profileModal) {
                if (typeof hideProfileModal === 'function') {
                    hideProfileModal();
                }
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display === 'block' || modal.classList.contains('show')) {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    }
                });
            }
        });
    }

    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session data
            sessionStorage.clear();
            
            // Reset current user
            this.currentUser = { designation: null, employeeId: null, name: null, permissions: {} };
            
            // Show notification and redirect
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    // Start periodic updates
    startPeriodicUpdates() {
        // Update date/time every second
        setInterval(() => {
            if (typeof updateDateTime === 'function') {
                updateDateTime();
            }
        }, 1000);
        
        // Session check every 5 minutes
        setInterval(() => {
            this.validateUserSession();
        }, 300000);

        // Auto-refresh data every 10 minutes for management designations
        if (this.hasPermission('canViewAllReports')) {
            setInterval(() => {
                this.refreshDashboardData();
            }, 600000);
        }
    }

    // Refresh dashboard data
    refreshDashboardData() {
        if (this.currentSection === 'dashboard' && typeof refreshDashboard === 'function') {
            refreshDashboard();
        }
    }

    // Show notification with enhanced styling
    showNotification(message, type = 'success') {
        // Remove existing notifications
        document.querySelectorAll('.spa-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `spa-notification notification-${type}`;
        
        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle', 
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${iconMap[type] || iconMap.info}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('spa-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'spa-notification-styles';
            styles.textContent = `
                .spa-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    min-width: 300px;
                    max-width: 500px;
                    padding: 0;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                }
                
                .spa-notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    gap: 12px;
                    color: white;
                    font-weight: 500;
                }
                
                .notification-success { background: linear-gradient(135deg, #28a745, #20c997); }
                .notification-error { background: linear-gradient(135deg, #dc3545, #e74c3c); }
                .notification-warning { background: linear-gradient(135deg, #ffc107, #fd7e14); }
                .notification-info { background: linear-gradient(135deg, #17a2b8, #6f42c1); }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 5px;
                    margin-left: auto;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                
                .notification-close:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }

    // Enhanced permission checking
    hasPermission(permission) {
        return this.currentUser.permissions[permission] || false;
    }

    // Check multiple permissions (AND logic)
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    // Check multiple permissions (OR logic)  
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    // Get user menu items
    getUserMenuItems() {
        return this.designationMenus[this.currentUser.designation] || [];
    }

    // Check if user can access specific functionality
    canAccess(feature) {
        const accessMap = {
            'hr_functions': ['canApproveLeave', 'canManageEmployees'],
            'management_reports': ['canViewAllReports'],
            'budget_access': ['canViewBudget'],
            'employee_registration': ['canRegisterEmployees'],
            'special_days': ['canManageSpecialDays'],
            'analysis_tools': ['canAccessAnalysis'],
            'project_management': ['canManageProjects'],
            'marketing_tools': ['canViewMarketing'],
            'client_management': ['canManageClients']
        };

        const requiredPermissions = accessMap[feature];
        return requiredPermissions ? this.hasAnyPermission(requiredPermissions) : false;
    }

    // Get current user info (safe copy)
    getCurrentUser() {
        return {
            ...this.currentUser,
            permissions: { ...this.currentUser.permissions }
        };
    }

    // Get current section
    getCurrentSection() {
        return this.currentSection;
    }

    // FIXED: Refresh user session with better error handling
    refreshSession() {
        console.log('Refreshing user session...');
        try {
            if (this.validateUserSession()) {
                this.loadUserData();
                this.generateDesignationBasedMenu();
                this.showNotification('Session refreshed successfully!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing session:', error);
            this.showNotification('Error refreshing session. Please login again.', 'error');
            return false;
        }
    }

    // Export user settings
    exportUserSettings() {
        return {
            designation: this.currentUser.designation,
            permissions: this.currentUser.permissions,
            menuItems: this.getUserMenuItems(),
            currentSection: this.currentSection
        };
    }

    // Debug method for development
    debug() {
        console.group('Dashboard SPA Debug Info');
        console.log('Current User:', this.currentUser);
        console.log('Current Section:', this.currentSection);
        console.log('Available Menu Items:', this.getUserMenuItems());
        console.log('User Permissions:', this.currentUser.permissions);
        console.log('Is Initialized:', this.isInitialized);
        console.log('Session Storage:', {
            direct: {
                employeeId: sessionStorage.getItem('employeeId'),
                employeeName: sessionStorage.getItem('employeeName'),
                Designation: sessionStorage.getItem('Designation')
            },
            currentUser: sessionStorage.getItem('currentUser')
        });
        console.groupEnd();
    }

    // Cleanup method
    destroy() {
        // Clear intervals
        if (this.dateTimeInterval) clearInterval(this.dateTimeInterval);
        if (this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);
        if (this.dataRefreshInterval) clearInterval(this.dataRefreshInterval);
        
        // Remove event listeners
        window.removeEventListener('popstate', this.handlePopState);
        
        // Clear user data
        this.currentUser = { designation: null, employeeId: null, name: null, permissions: {} };
        this.isInitialized = false;
        
        console.log('Dashboard SPA destroyed');
    }
}

// Configuration object for easy customization
const SPAConfig = {
    sessionTimeout: 300000, // 5 minutes
    dataRefreshInterval: 600000, // 10 minutes
    notificationDuration: 3000, // 3 seconds
    errorNotificationDuration: 5000, // 5 seconds
    
    // Default fallback designation
    defaultDesignation: 'Junior Developer',
    
    // Session storage keys
    sessionKeys: {
        employeeId: 'employeeId',
        employeeName: 'employeeName',
        Designation: 'Designation'
    },
    
    // API endpoints (if needed)
    endpoints: {
        login: '/api/login',
        logout: '/api/logout',
        userData: '/api/user',
        dashboard: '/api/dashboard'
    }
};

// FIXED: Better session management utility functions
const SessionManager = {
    // Set user session data in both formats for compatibility
    setUserData(userData) {
        // Store in direct format
        sessionStorage.setItem('employeeId', userData.employeeId);
        sessionStorage.setItem('employeeName', userData.name || userData.employeeName);
        sessionStorage.setItem('Designation', userData.designation);
        
        // Store in currentUser format
        sessionStorage.setItem('currentUser', JSON.stringify({
            employeeId: userData.employeeId,
            name: userData.name || userData.employeeName,
            designation: userData.designation
        }));
        
        console.log('User session data stored successfully');
    },
    
    // Get user data from session with fallbacks
    getUserData() {
        let userData = {};
        
        // Try currentUser format first
        const currentUserData = sessionStorage.getItem('currentUser');
        if (currentUserData) {
            try {
                userData = JSON.parse(currentUserData);
            } catch (e) {
                console.warn('Invalid currentUser data');
            }
        }
        
        // Fallback to direct format
        if (!userData.employeeId) {
            userData = {
                employeeId: sessionStorage.getItem('employeeId'),
                name: sessionStorage.getItem('employeeName'),
                designation: sessionStorage.getItem('Designation')
            };
        }
        
        return userData;
    },
    
    // Check if valid session exists
    hasValidSession() {
        const userData = this.getUserData();
        return userData.employeeId && userData.name && userData.designation;
    },
    
    // Clear all session data
    clearSession() {
        const keysToRemove = ['employeeId', 'employeeName', 'Designation', 'currentUser'];
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        console.log('Session cleared');
    }
};

// Initialize SPA when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create global SPA instance
        window.dashboardSPA = new DashboardSPA();
        
        // Initialize the SPA
        if (window.dashboardSPA.initialize()) {
            console.log('✓ Dashboard SPA initialized successfully');
            
            // Make key functions globally available for backward compatibility
            window.navigateToSection = (section) => {
                console.log(`Navigation requested to: ${section}`);
                window.dashboardSPA.navigateToSection(section);
            };
            window.getCurrentUser = () => window.dashboardSPA.getCurrentUser();
            window.hasPermission = (permission) => window.dashboardSPA.hasPermission(permission);
            window.showNotification = (message, type) => window.dashboardSPA.showNotification(message, type);
            window.refreshSession = () => window.dashboardSPA.refreshSession();
            window.canAccess = (feature) => window.dashboardSPA.canAccess(feature);
            window.refreshDashboard = () => window.dashboardSPA.refreshDashboard();
            
            // Make session manager available globally
            window.SessionManager = SessionManager;
            
            // Development helper
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.debugSPA = () => window.dashboardSPA.debug();
                console.log('💡 Development mode: Use debugSPA() to inspect SPA state');
            }
            
            // IMPORTANT: Ensure dashboard is properly initialized if it's the default section
            setTimeout(() => {
                const currentHash = window.location.hash.slice(1) || 'dashboard';
                if (currentHash === 'dashboard') {
                    console.log('Ensuring dashboard is properly initialized...');
                    window.dashboardSPA.navigateToSection('dashboard');
                }
            }, 500);
            
        } else {
            console.error('✗ Failed to initialize Dashboard SPA');
        }
    } catch (error) {
        console.error('✗ Error initializing Dashboard SPA:', error);
        // Fallback to login page on critical error
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});


// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.dashboardSPA && document.visibilityState === 'visible') {
        // Refresh session when page becomes visible again
        window.dashboardSPA.validateUserSession();
        
        // If dashboard is active, refresh it
        if (window.dashboardSPA.getCurrentSection() === 'dashboard') {
            setTimeout(() => {
                window.dashboardSPA.initializeDashboard();
            }, 200);
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardSPA, SPAConfig, SessionManager };
}

function switchTab(tabName) {
  // Remove active class from all tab buttons
  document.getElementById('tabProject').classList.remove('active');
  document.getElementById('tabAllocation').classList.remove('active');
  document.getElementById('tabTaskAllocation').classList.remove('active');

  // Hide all tab contents
  document.getElementById('projects-section').classList.remove('active');
  document.getElementById('allocation-section').classList.remove('active');
  document.getElementById('task-section').classList.remove('active');

  // Show selected tab and content
  if (tabName === 'project') {
    document.getElementById('tabProject').classList.add('active');
    document.getElementById('projects-section').classList.add('active');
  } else if (tabName === 'allocation') {
    document.getElementById('tabAllocation').classList.add('active');
    document.getElementById('allocation-section').classList.add('active');
  } else if (tabName === 'task') {
    document.getElementById('tabTaskAllocation').classList.add('active');
    document.getElementById('task-section').classList.add('active');
  }
}

// function loadSidebarMenu() {
//     const sidebarItems = [
//         { name: 'Dashboard', id: 'dashboard', icon: 'icon-home' },
//         { name: 'Clients', id: 'clients', icon: 'icon-clients' },
//         { name: 'Analysis', id: 'analysis', icon: 'icon-analysis' },
//         { name: 'Employee Request', id: 'employee-request', icon: 'icon-request' },
//         { name: 'Employee Details', id: 'employee-details', icon: 'icon-details' },
//         { name: 'HR', id: 'hr', icon: 'icon-hr' }
//     ];

//     const sidebarMenu = document.getElementById('sidebarMenu');
//     sidebarMenu.innerHTML = ''; // Clear existing items

//     sidebarItems.forEach(item => {
//         const li = document.createElement('li');
//         li.className = 'nav-item';
//         li.setAttribute('data-section', item.id);
//         li.innerHTML = `<i class="${item.icon}"></i> ${item.name}`;

//         li.addEventListener('click', () => {
//             app.updateActiveMenuItem(item.id);
//             app.showContentSection(item.id);
//         });

//         sidebarMenu.appendChild(li);
//     });
// }


// document.addEventListener("DOMContentLoaded", () => {
//      // 1. Load sidebar menu items dynamically
//     loadSidebarMenu(); // This creates and appends nav-items with click handlers
//     // Default section on initial load
//     const defaultSection = 'dashboard';

//     // Activate dashboard in sidebar
//     app.updateActiveMenuItem(defaultSection);

//     // Show dashboard content
//     app.showContentSection(defaultSection);

//     // Initialize dashboard (charts, stats, etc.)
//     app.refreshDashboard();
// });


// 4. Update the DOMContentLoaded event handler at the bottom of your file:
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create global SPA instance
        window.dashboardSPA = new DashboardSPA();
        
        // Initialize the SPA
        if (window.dashboardSPA.initialize()) {
            console.log('✓ Dashboard SPA initialized successfully');
            
            // Make key functions globally available for backward compatibility
            window.navigateToSection = (section) => {
                console.log(`Navigation requested to: ${section}`);
                window.dashboardSPA.navigateToSection(section);
            };
            
            // ... other global functions ...
            
            // ENHANCED: Ensure dashboard is properly initialized and active
            setTimeout(() => {
                const currentHash = window.location.hash.slice(1) || 'dashboard';
                console.log('Current hash:', currentHash);
                
                if (currentHash === 'dashboard') {
                    console.log('Ensuring dashboard is properly initialized and active...');
                    // Force dashboard to be active
                    window.dashboardSPA.setDashboardActive();
                    // Initialize dashboard features
                    window.dashboardSPA.initializeDashboard();
                }
            }, 200); // Reduced timeout for faster activation
            
        } else {
            console.error('✗ Failed to initialize Dashboard SPA');
        }
    } catch (error) {
        console.error('✗ Error initializing Dashboard SPA:', error);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
});




// 6. Debug helper to check active states:
// checkActiveStates() {
//     console.group('Active States Check');
    
//     const activeNavItem = document.querySelector('#sidebarMenu .nav-item.active');
//     console.log('Active nav item:', activeNavItem);
    
//     const activeContentSection = document.querySelector('.content-section.active');
//     console.log('Active content section:', activeContentSection);
    
//     const currentSection = this.currentSection;
//     console.log('Current section:', currentSection);
    
//     const dashboardNavItem = document.querySelector('#sidebarMenu .nav-item[data-section="dashboard"]');
//     console.log('Dashboard nav item exists:', !!dashboardNavItem);
    
//     const dashboardContent = document.getElementById('dashboard-content');
//     console.log('Dashboard content visible:', dashboardContent ? dashboardContent.style.display !== 'none' : 'not found');
    
//     console.groupEnd();
// }

// // Add this to your DashboardSPA class as a method for debugging
// debug() {
//     console.group('Dashboard SPA Debug Info');
//     console.log('Current User:', this.currentUser);
//     console.log('Current Section:', this.currentSection);
//     console.log('Available Menu Items:', this.getUserMenuItems());
//     console.log('User Permissions:', this.currentUser.permissions);
//     console.log('Is Initialized:', this.isInitialized);
    
//     // Check active states
//     this.checkActiveStates();
    
//     console.groupEnd();
// }