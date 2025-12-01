// API Base URL
const API_BASE = '/api';

// State
let appState = {
    courses: [],
    assignments: [],
    settings: {},
    stats: {}
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeModals();
    loadInitialData();
    setupEventListeners();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
            
            // Update active nav item
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        document.querySelector('.page-title').textContent = getPageTitle(pageName);
        
        // Load page-specific data
        loadPageData(pageName);
    }
}

function getPageTitle(pageName) {
    const titles = {
        dashboard: 'Dashboard',
        courses: 'Courses',
        assignments: 'Assignments',
        workload: 'Workload Analysis',
        schedule: 'Study Schedule',
        notifications: 'Smart Notifications',
        settings: 'Settings'
    };
    return titles[pageName] || 'Dashboard';
}

// Modals
function initializeModals() {
    const modal = document.getElementById('addCourseModal');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Add course button will be created dynamically in the courses page
    document.addEventListener('click', (e) => {
        if (e.target.id === 'addCourseBtn' || e.target.closest('#addCourseBtn')) {
            modal.classList.add('active');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Add course submissions
    document.getElementById('submit-text').addEventListener('click', () => {
        const text = document.getElementById('syllabus-text').value;
        const semesterStart = document.getElementById('semester-start-text').value;
        if (text.trim()) {
            addCourseFromText(text, semesterStart);
        } else {
            showToast('Please enter syllabus text', 'error');
        }
    });
    
    document.getElementById('submit-url').addEventListener('click', () => {
        const url = document.getElementById('course-url').value;
        const semesterStart = document.getElementById('semester-start-url').value;
        if (url.trim()) {
            addCourseFromURL(url, semesterStart);
        } else {
            showToast('Please enter a URL', 'error');
        }
    });
    
    document.getElementById('submit-pdf').addEventListener('click', () => {
        const fileInput = document.getElementById('pdf-file');
        const semesterStart = document.getElementById('semester-start-pdf').value;
        if (fileInput.files.length > 0) {
            addCourseFromPDF(fileInput.files[0], semesterStart);
        } else {
            showToast('Please select a PDF file', 'error');
        }
    });
    
    // Workload analysis
    document.getElementById('analyzeWorkloadBtn').addEventListener('click', loadWorkload);
    
    // Schedule generation
    document.getElementById('generateScheduleBtn').addEventListener('click', () => {
        const hours = parseInt(document.getElementById('schedule-hours').value) || 4;
        loadSchedule(hours);
    });
    
    // Notifications
    document.getElementById('refreshNotificationsBtn').addEventListener('click', loadNotifications);
    
    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('exportCalendarBtn').addEventListener('click', exportCalendar);
    
    // Assignment filter
    document.getElementById('assignment-filter').addEventListener('change', (e) => {
        renderAssignments(e.target.value);
    });
}

// API Calls
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.error || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadInitialData() {
    showLoading();
    try {
        const state = await fetchAPI('/state');
        appState = state;
        updateDashboard();
        renderCourses();
        renderAssignments('all');
        loadSettings();
    } catch (error) {
        showToast('Failed to load data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'courses':
            renderCourses();
            break;
        case 'assignments':
            renderAssignments('all');
            break;
        case 'workload':
            loadWorkload();
            break;
        case 'schedule':
            // Schedule will be loaded when user clicks generate
            break;
        case 'notifications':
            loadNotifications();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard
function updateDashboard() {
    const stats = appState.stats || {};
    document.getElementById('stat-courses').textContent = stats.total_courses || 0;
    document.getElementById('stat-assignments').textContent = stats.total_assignments || 0;
    document.getElementById('stat-completed').textContent = stats.completed_assignments || 0;
    
    // Upcoming assignments (next 7 days)
    const upcoming = getUpcomingAssignments(7);
    document.getElementById('stat-upcoming').textContent = upcoming.length;
    
    // Recent courses
    renderRecentCourses();
    
    // Upcoming deadlines
    renderUpcomingDeadlines();
}

function renderRecentCourses() {
    const container = document.getElementById('recent-courses');
    const recent = appState.courses.slice(-3).reverse();
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No courses yet. Add your first course!</p>';
        return;
    }
    
    container.innerHTML = recent.map(course => `
        <div class="course-item">
            <div>
                <strong>${course.course_name || 'Untitled'}</strong>
                <div style="color: var(--text-muted); font-size: 0.875rem;">${course.course_code || ''}</div>
            </div>
            <div style="color: var(--text-muted); font-size: 0.875rem;">
                ${course.assignments?.length || 0} assignments
            </div>
        </div>
    `).join('');
}

function renderUpcomingDeadlines() {
    const container = document.getElementById('upcoming-deadlines');
    const upcoming = getUpcomingAssignments(7);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No upcoming deadlines</p>';
        return;
    }
    
    container.innerHTML = upcoming.slice(0, 5).map(assignment => {
        const dueDate = new Date(assignment.due_date);
        const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
        return `
            <div class="deadline-item">
                <div>
                    <strong>${assignment.name}</strong>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">${assignment.course}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600;">${daysLeft}d left</div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">${assignment.due_date}</div>
                </div>
            </div>
        `;
    }).join('');
}

function getUpcomingAssignments(days) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return appState.assignments
        .filter(a => {
            const dueDate = new Date(a.due_date);
            return dueDate >= now && dueDate <= future && a.progress < 100;
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
}

// Courses
function renderCourses() {
    const container = document.getElementById('courses-list');
    
    if (appState.courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🎓</div>
                <p>No courses yet. Add your first course!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.courses.map((course, index) => `
        <div class="course-card">
            <div class="course-card-header">
                <div>
                    <h4>${course.course_name || 'Untitled Course'}</h4>
                    <div class="course-code">${course.course_code || 'N/A'}</div>
                </div>
                <button class="delete-btn" onclick="deleteCourse(${index})" title="Delete course">🗑️</button>
            </div>
            <div class="course-meta">
                <div class="course-meta-item">
                    <span class="course-meta-label">Instructor:</span>
                    <span>${course.instructor || 'N/A'}</span>
                </div>
                <div class="course-meta-item">
                    <span class="course-meta-label">Assignments:</span>
                    <span>${course.assignments?.length || 0}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function deleteCourse(index) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    showLoading();
    try {
        await fetchAPI(`/course/${index}`, { method: 'DELETE' });
        await loadInitialData();
        showToast('Course deleted successfully', 'success');
    } catch (error) {
        showToast('Failed to delete course: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Add Course Functions
async function addCourseFromText(text, semesterStart) {
    showLoading();
    try {
        const result = await fetchAPI('/syllabus/text', {
            method: 'POST',
            body: JSON.stringify({ syllabus_text: text, semester_start: semesterStart })
        });
        
        if (result.success) {
            showToast('Course added successfully!', 'success');
            document.getElementById('addCourseModal').classList.remove('active');
            document.getElementById('syllabus-text').value = '';
            await loadInitialData();
            switchPage('courses');
        } else {
            showToast(result.error || 'Failed to add course', 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function addCourseFromURL(url, semesterStart) {
    showLoading();
    try {
        const result = await fetchAPI('/syllabus/url', {
            method: 'POST',
            body: JSON.stringify({ url, semester_start: semesterStart })
        });
        
        if (result.success) {
            showToast('Course scraped and added successfully!', 'success');
            document.getElementById('addCourseModal').classList.remove('active');
            document.getElementById('course-url').value = '';
            await loadInitialData();
            switchPage('courses');
        } else {
            showToast(result.error || 'Failed to scrape course', 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function addCourseFromPDF(file, semesterStart) {
    showLoading();
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('semester_start', semesterStart);
        
        const response = await fetch(`${API_BASE}/syllabus/pdf?semester_start=${semesterStart}`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Course added from PDF successfully!', 'success');
            document.getElementById('addCourseModal').classList.remove('active');
            document.getElementById('pdf-file').value = '';
            await loadInitialData();
            switchPage('courses');
        } else {
            showToast(result.error || 'Failed to parse PDF', 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Assignments
function renderAssignments(filter = 'all') {
    const container = document.getElementById('assignments-list');
    let assignments = [...appState.assignments];
    
    // Apply filter
    if (filter === 'upcoming') {
        assignments = getUpcomingAssignments(30);
    } else if (filter === 'completed') {
        assignments = assignments.filter(a => a.progress === 100);
    } else if (filter === 'in-progress') {
        assignments = assignments.filter(a => a.progress > 0 && a.progress < 100);
    }
    
    // Sort by due date
    assignments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    if (assignments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No assignments found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = assignments.map((assignment, index) => {
        const originalIndex = appState.assignments.findIndex(a => 
            a.name === assignment.name && a.course === assignment.course
        );
        const type = assignment.type?.toLowerCase() || 'homework';
        const badgeClass = `badge-${type}`;
        
        return `
            <div class="assignment-card">
                <div class="assignment-info">
                    <div class="assignment-header">
                        <span class="assignment-name">${assignment.name}</span>
                        <span class="assignment-badge ${badgeClass}">${assignment.type || 'Assignment'}</span>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">
                        ${assignment.course} • Due: ${assignment.due_date}
                    </div>
                    <div class="assignment-details">
                        <span>Weight: ${assignment.weight || 0}%</span>
                        <span>Hours: ${assignment.estimated_hours || 0}h</span>
                    </div>
                </div>
                <div class="assignment-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${assignment.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${assignment.progress || 0}%</span>
                    <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value="${assignment.progress || 0}" 
                        class="input-small"
                        style="width: 60px; margin-left: 0.5rem;"
                        onchange="updateProgress(${originalIndex}, this.value)"
                    />
                </div>
            </div>
        `;
    }).join('');
}

async function updateProgress(index, progress) {
    const progressValue = Math.max(0, Math.min(100, parseInt(progress)));
    
    try {
        await fetchAPI('/progress', {
            method: 'POST',
            body: JSON.stringify({ assignment_index: index, progress: progressValue })
        });
        
        await loadInitialData();
        showToast('Progress updated', 'success');
    } catch (error) {
        showToast('Failed to update progress: ' + error.message, 'error');
    }
}

// Workload
async function loadWorkload() {
    showLoading();
    try {
        const result = await fetchAPI('/workload');
        
        if (result.success && result.analysis) {
            renderWorkload(result.analysis);
        } else {
            document.getElementById('workload-content').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>${result.error || 'Failed to analyze workload'}</p>
                </div>
            `;
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderWorkload(analysis) {
    const container = document.getElementById('workload-content');
    
    const totalHours = analysis.total_hours || 0;
    const riskWeeks = analysis.risk_weeks || [];
    const priorityAssignments = analysis.priority_assignments || [];
    const weeklyBreakdown = analysis.weekly_breakdown || {};
    
    const maxHours = Math.max(...Object.values(weeklyBreakdown), 20);
    
    container.innerHTML = `
        <div class="workload-summary">
            <div class="workload-item">
                <h4>${totalHours}</h4>
                <p>Total Hours</p>
            </div>
            <div class="workload-item">
                <h4>${riskWeeks.length}</h4>
                <p>Risk Weeks</p>
            </div>
            <div class="workload-item">
                <h4>${priorityAssignments.length}</h4>
                <p>Priority Items</p>
            </div>
        </div>
        
        ${Object.keys(weeklyBreakdown).length > 0 ? `
            <div class="weekly-breakdown">
                <h4 style="margin-bottom: 1rem;">Weekly Breakdown</h4>
                ${Object.entries(weeklyBreakdown).map(([week, hours]) => {
                    const percentage = (hours / maxHours) * 100;
                    const riskLevel = hours > 20 ? 'high' : hours > 15 ? 'medium' : 'low';
                    return `
                        <div class="week-item">
                            <span style="font-weight: 600;">${week}</span>
                            <div class="week-bar">
                                <div class="week-bar-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span style="font-weight: 600;">${hours}h</span>
                            <span style="font-size: 0.875rem; color: var(--text-muted);">
                                ${riskLevel === 'high' ? '🔴 High' : riskLevel === 'medium' ? '🟡 Medium' : '🟢 Low'}
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
        
        ${analysis.recommendations && analysis.recommendations.length > 0 ? `
            <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-tertiary); border-radius: 12px;">
                <h4 style="margin-bottom: 1rem;">💡 Recommendations</h4>
                <ul style="list-style: none; padding: 0;">
                    ${analysis.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">• ${rec}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
}

// Schedule
async function loadSchedule(hoursPerDay) {
    showLoading();
    try {
        const result = await fetchAPI(`/schedule?hours_per_day=${hoursPerDay}`);
        
        if (result.success && result.schedule) {
            renderSchedule(result.schedule);
        } else {
            document.getElementById('schedule-content').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <p>${result.error || 'Failed to generate schedule'}</p>
                </div>
            `;
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderSchedule(schedule) {
    const container = document.getElementById('schedule-content');
    const dailySchedule = schedule.daily_schedule || {};
    
    if (Object.keys(dailySchedule).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>No schedule generated</p>
            </div>
        `;
        return;
    }
    
    const sortedDates = Object.keys(dailySchedule).sort();
    
    container.innerHTML = sortedDates.slice(0, 14).map(date => {
        const tasks = dailySchedule[date];
        const totalHours = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
        
        return `
            <div class="schedule-day">
                <div class="schedule-day-header">
                    <div class="schedule-day-date">${date}</div>
                    <div class="schedule-day-hours">${totalHours}h total</div>
                </div>
                ${tasks.map(task => {
                    const priority = task.priority || 'low';
                    return `
                        <div class="schedule-task">
                            <div class="task-priority priority-${priority}"></div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${task.task}</div>
                                <div style="font-size: 0.875rem; color: var(--text-muted);">${task.assignment}</div>
                            </div>
                            <div style="font-weight: 600;">${task.hours || 0}h</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
    
    if (schedule.warnings && schedule.warnings.length > 0) {
        container.innerHTML += `
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); border-radius: 12px;">
                <h4 style="margin-bottom: 1rem; color: var(--danger);">⚠️ Warnings</h4>
                <ul style="list-style: none; padding: 0;">
                    ${schedule.warnings.map(warning => `<li style="margin-bottom: 0.5rem;">• ${warning}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}

// Notifications
async function loadNotifications() {
    showLoading();
    try {
        const result = await fetchAPI('/notifications');
        
        if (result.success && result.notifications) {
            renderNotifications(result.notifications);
        } else {
            document.getElementById('notifications-content').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <p>${result.error || 'No notifications available'}</p>
                </div>
            `;
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notifications-content');
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔔</div>
                <p>No notifications at this time</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.slice(0, 20).map(notif => {
        const urgency = notif.urgency || 'low';
        const urgencyClass = `notification-${urgency}`;
        const icons = {
            high: '🚨',
            medium: '⚡',
            low: 'ℹ️'
        };
        
        return `
            <div class="notification-card ${urgencyClass}">
                <div class="notification-header">
                    <span>${icons[urgency] || '📢'}</span>
                    <span class="notification-type">${notif.type || 'Notification'}</span>
                </div>
                <div class="notification-message">${notif.message || ''}</div>
                <div class="notification-action">Action: ${notif.action || 'None'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                    Send at: ${notif.send_at || 'N/A'}
                </div>
            </div>
        `;
    }).join('');
}

// Settings
async function loadSettings() {
    try {
        const settings = await fetchAPI('/settings');
        appState.settings = settings;
        
        document.getElementById('setting-hours').value = settings.hours_per_day || 4;
        document.getElementById('setting-risk').value = settings.risk_threshold || 20;
        document.getElementById('setting-lead').value = settings.notification_lead_days || 3;
        document.getElementById('setting-email-enabled').checked = settings.email_enabled || false;
        document.getElementById('setting-email-to').value = settings.email_to || '';
        document.getElementById('setting-email-schedule').checked = settings.email_schedule_enabled || false;
    } catch (error) {
        showToast('Failed to load settings: ' + error.message, 'error');
    }
}

async function saveSettings() {
    showLoading();
    try {
        const settings = {
            hours_per_day: parseInt(document.getElementById('setting-hours').value),
            risk_threshold: parseInt(document.getElementById('setting-risk').value),
            notification_lead_days: parseInt(document.getElementById('setting-lead').value),
            email_enabled: document.getElementById('setting-email-enabled').checked,
            email_to: document.getElementById('setting-email-to').value,
            email_schedule_enabled: document.getElementById('setting-email-schedule').checked
        };
        
        await fetchAPI('/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        
        await loadInitialData();
        showToast('Settings saved successfully!', 'success');
    } catch (error) {
        showToast('Failed to save settings: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function exportCalendar() {
    try {
        const response = await fetch(`${API_BASE}/calendar`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coursesync_calendar.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Calendar exported successfully!', 'success');
    } catch (error) {
        showToast('Failed to export calendar: ' + error.message, 'error');
    }
}

// UI Helpers
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

