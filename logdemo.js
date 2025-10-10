 // Global variables
        let currentSection = 'dashboard';
        let isLoggedIn = false;
        let loginTime = null;
        let attendanceActivities = [
            { type: 'out', time: 'Yesterday - 06:30 PM', device: 'Desktop' },
            { type: 'in', time: 'Yesterday - 09:15 AM', device: 'Mobile' }
        ];

        // Utility function to safely get element
        function safeGetElement(id) {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id '${id}' not found`);
            }
            return element;
        }

        // Navigation function
        function showSection(section, eventTarget = null) {
            try {
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                if (eventTarget) {
                    eventTarget.classList.add('active');
                }

                // Hide all content sections
                document.querySelectorAll('.content-section').forEach(contentSection => {
                    contentSection.classList.remove('active');
                });

                // Show selected section
                const targetSection = safeGetElement(section + '-content');
                if (targetSection) {
                    targetSection.classList.add('active');
                    targetSection.classList.add('fade-in');
                    currentSection = section;
                    
                    // Update page title and breadcrumb
                    updatePageHeader(section);
                    
                    // Initialize section-specific content
                    if (section === 'attendance') {
                        initializeAttendance();
                    }
                }
            } catch (error) {
                console.error('Error in showSection:', error);
                showNotification('Error loading section', 'error');
            }
        }

        function updatePageHeader(section) {
            const titles = {
                'dashboard': 'Dashboard',
                'analysis': 'Business Analysis',
                'projects': 'Projects Management',
                'employee': 'Employee Management',
                'attendance': 'Attendance System'
            };

            const titleElement = safeGetElement('pageTitle');
            const sectionElement = safeGetElement('currentSection');
            
            if (titleElement) titleElement.textContent = titles[section] || 'Dashboard';
            if (sectionElement) sectionElement.textContent = titles[section] || 'Home';
        }

        // Quick Attendance Functions
        function openQuickAttendance() {
            try {
                const overlay = safeGetElement('quickAttendanceOverlay');
                if (!overlay) return;
                
                overlay.classList.add('active');
                updateModalTime();
                updateModalStatus();
                
                // Update time every second while modal is open
                if (window.modalTimeInterval) {
                    clearInterval(window.modalTimeInterval);
                }
                window.modalTimeInterval = setInterval(updateModalTime, 1000);
            } catch (error) {
                console.error('Error opening quick attendance:', error);
            }
        }

        function closeQuickAttendance() {
            try {
                const overlay = safeGetElement('quickAttendanceOverlay');
                if (overlay) overlay.classList.remove('active');
                
                if (window.modalTimeInterval) {
                    clearInterval(window.modalTimeInterval);
                    window.modalTimeInterval = null;
                }
            } catch (error) {
                console.error('Error closing quick attendance:', error);
            }
        }

        function updateModalTime() {
            try {
                const timeElement = safeGetElement('modalCurrentTime');
                if (timeElement) {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString('en-US', {
                        hour12: true,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    const dateString = now.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    timeElement.innerHTML = `${timeString}<br><small style="font-size: 0.8rem; opacity: 0.8;">${dateString}</small>`;
                }
            } catch (error) {
                console.error('Error updating modal time:', error);
            }
        }

        function updateModalStatus() {
            try {
                const statusElement = safeGetElement('modalStatusDisplay');
                const actionButton = safeGetElement('quickAttendanceAction');
                
                if (statusElement && actionButton) {
                    const dot = statusElement.querySelector('.attendance-status-dot');
                    
                    if (isLoggedIn) {
                        statusElement.innerHTML = `<span class="attendance-status-dot logged-in"></span>Status: Logged In${loginTime ? ` (${loginTime})` : ''}`;
                        actionButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Punch Out';
                        actionButton.className = 'btn btn-primary';
                        actionButton.style.background = 'linear-gradient(135deg, #ff7675, #d63031)';
                    } else {
                        statusElement.innerHTML = '<span class="attendance-status-dot logged-out"></span>Status: Logged Out';
                        actionButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Punch In';
                        actionButton.className = 'btn btn-primary';
                        actionButton.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
                    }
                }
            } catch (error) {
                console.error('Error updating modal status:', error);
            }
        }

        function quickToggleAttendance() {
            try {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { hour12: true });
                const dateString = now.toLocaleDateString('en-US');
                
                if (isLoggedIn) {
                    // Punch Out
                    isLoggedIn = false;
                    loginTime = null;
                    
                    attendanceActivities.unshift({
                        type: 'out',
                        time: `${dateString} - ${timeString}`,
                        device: 'Desktop'
                    });
                    
                    showNotification('Successfully punched out!', 'success');
                } else {
                    // Punch In
                    isLoggedIn = true;
                    loginTime = timeString;
                    
                    attendanceActivities.unshift({
                        type: 'in',
                        time: `${dateString} - ${timeString}`,
                        device: 'Desktop'
                    });
                    
                    showNotification('Successfully punched in!', 'success');
                }
                
                updateHeaderAttendanceButton();
                updateModalStatus();
                updateAttendanceStatus();
                renderRecentActivity();
                
                // Close modal after action
                setTimeout(() => {
                    closeQuickAttendance();
                }, 1500);
                
            } catch (error) {
                console.error('Error toggling attendance:', error);
                showNotification('Error updating attendance', 'error');
            }
        }

        function updateHeaderAttendanceButton() {
            try {
                const button = safeGetElement('headerAttendanceBtn');
                const buttonText = safeGetElement('attendanceButtonText');
                const dot = button?.querySelector('.attendance-status-dot');
                
                if (button && buttonText && dot) {
                    if (isLoggedIn) {
                        button.className = 'header-attendance-btn logged-in';
                        buttonText.textContent = 'Punch Out';
                        dot.className = 'attendance-status-dot logged-in';
                    } else {
                        button.className = 'header-attendance-btn logged-out';
                        buttonText.textContent = 'Punch In';
                        dot.className = 'attendance-status-dot logged-out';
                    }
                }
            } catch (error) {
                console.error('Error updating header attendance button:', error);
            }
        }

        // Attendance Functions
        function initializeAttendance() {
            try {
                updateCurrentTime();
                updateAttendanceStatus();
                renderRecentActivity();
                
                // Update time every second
                if (window.attendanceTimeInterval) {
                    clearInterval(window.attendanceTimeInterval);
                }
                window.attendanceTimeInterval = setInterval(updateCurrentTime, 1000);
            } catch (error) {
                console.error('Error initializing attendance:', error);
            }
        }

        function updateCurrentTime() {
            try {
                const timeElement = safeGetElement('currentTimeDisplay');
                if (timeElement) {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString('en-US', {
                        hour12: true,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    const dateString = now.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    timeElement.innerHTML = `
                        <div>${timeString}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">${dateString}</div>
                    `;
                }
            } catch (error) {
                console.error('Error updating current time:', error);
            }
        }

        function updateAttendanceStatus() {
            try {
                const statusElement = safeGetElement('attendanceStatusBadge');
                
                if (statusElement) {
                    if (isLoggedIn) {
                        statusElement.textContent = `Logged In${loginTime ? ` - ${loginTime}` : ''}`;
                        statusElement.style.background = '#e6f7e6';
                        statusElement.style.color = '#00b894';
                    } else {
                        statusElement.textContent = 'Logged Out';
                        statusElement.style.background = '#ffe6e6';
                        statusElement.style.color = '#d63031';
                    }
                }
            } catch (error) {
                console.error('Error updating attendance status:', error);
            }
        }

        function toggleAttendance() {
            try {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { hour12: true });
                const dateString = now.toLocaleDateString('en-US');
                
                if (isLoggedIn) {
                    // Punch Out
                    isLoggedIn = false;
                    loginTime = null;
                    
                    attendanceActivities.unshift({
                        type: 'out',
                        time: `${dateString} - ${timeString}`,
                        device: 'Desktop'
                    });
                    
                    showNotification('Successfully punched out!', 'success');
                } else {
                    // Punch In
                    isLoggedIn = true;
                    loginTime = timeString;
                    
                    attendanceActivities.unshift({
                        type: 'in',
                        time: `${dateString} - ${timeString}`,
                        device: 'Desktop'
                    });
                    
                    showNotification('Successfully punched in!', 'success');
                }
                
                updateHeaderAttendanceButton();
                updateAttendanceStatus();
                renderRecentActivity();
            } catch (error) {
                console.error('Error toggling attendance:', error);
                showNotification('Error updating attendance', 'error');
            }
        }

        function renderRecentActivity() {
            try {
                const container = safeGetElement('attendanceActivityList');
                if (!container) return;
                
                const recentActivities = attendanceActivities.slice(0, 5);
                
                container.innerHTML = recentActivities.map(activity => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem;">
                        <div>
                            <span style="font-weight: 500; color: ${activity.type === 'in' ? '#00b894' : '#d63031'};">
                                ${activity.type === 'in' ? 'Punch In' : 'Punch Out'}
                            </span>
                            <div style="font-size: 0.8rem; color: #999;">${activity.device}</div>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: #666;">
                            ${activity.time}
                        </div>
                    </div>
                `).join('');
                
                // Remove border from last item
                const lastItem = container.lastElementChild;
                if (lastItem) {
                    lastItem.style.borderBottom = 'none';
                }
            } catch (error) {
                console.error('Error rendering recent activity:', error);
            }
        }

        // Utility Functions
        function showNotification(message, type = 'info') {
            try {
                // Remove existing notifications
                document.querySelectorAll('.notification').forEach(n => n.remove());
                
                // Create notification element
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                        <span>${message}</span>
                    </div>
                    <button class="notification-close" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Add to page
                document.body.appendChild(notification);
                
                // Auto remove after 5 seconds
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.style.animation = 'slideInRight 0.3s ease reverse';
                        setTimeout(() => {
                            if (notification.parentElement) {
                                notification.remove();
                            }
                        }, 300);
                    }
                }, 5000);
            } catch (error) {
                console.error('Error showing notification:', error);
                alert(message);
            }
        }

        // Mobile menu toggle
        function toggleMobileMenu() {
            try {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            } catch (error) {
                console.error('Error toggling mobile menu:', error);
            }
        }

        // Search functionality
        function handleSearch() {
            try {
                const searchTerm = prompt('Enter search term:');
                if (searchTerm && searchTerm.trim()) {
                    showNotification(`Searching for: ${searchTerm}`, 'info');
                }
            } catch (error) {
                console.error('Error handling search:', error);
            }
        }

        // Logout functionality
        function handleLogout() {
            try {
                if (confirm('Are you sure you want to logout?')) {
                    showNotification('Logging out...', 'info');
                    // Clear intervals
                    if (window.attendanceTimeInterval) {
                        clearInterval(window.attendanceTimeInterval);
                    }
                    if (window.modalTimeInterval) {
                        clearInterval(window.modalTimeInterval);
                    }
                    // Simulate logout delay
                    setTimeout(() => {
                        showNotification('Logged out successfully', 'success');
                        // Reset state
                        isLoggedIn = false;
                        loginTime = null;
                        updateHeaderAttendanceButton();
                    }, 1500);
                }
            } catch (error) {
                console.error('Error handling logout:', error);
            }
        }

        // Initialize application
        function initializeApp() {
            try {
                updatePageHeader('dashboard');
                updateHeaderAttendanceButton();
                
                // Close modal when clicking outside
                document.addEventListener('click', function(e) {
                    if (e.target.classList.contains('modal-overlay')) {
                        closeQuickAttendance();
                    }
                });
                
                // Keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        closeQuickAttendance();
                    }
                });
                
                showNotification('Dashboard loaded successfully!', 'success');
            } catch (error) {
                console.error('Error initializing app:', error);
                alert('Error initializing application. Please refresh the page.');
            }
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        // Clean up intervals when page unloads
        window.addEventListener('beforeunload', function() {
            if (window.attendanceTimeInterval) {
                clearInterval(window.attendanceTimeInterval);
            }
            if (window.modalTimeInterval) {
                clearInterval(window.modalTimeInterval);
            }
        });