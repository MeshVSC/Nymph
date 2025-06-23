/* 
=======================================================
NYMPH v2 - APPLICATION (CORRECTED IMPLEMENTATION)
=======================================================
Following proper design system with all features
*/

class NymphApp {
    constructor() {
        this.data = this.loadData();
        this.currentSection = 'dashboard-section';
        this.lastScrollTop = 0;
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollNavigation();
        this.setupForms();
        this.setupActionCards();
        this.showSection('dashboard-section');
        this.updateDashboard();
        this.updateActivityFeed();
    }
    
    // Data Management
    loadData() {
        const stored = localStorage.getItem(NYMPH.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }
    
    saveData() {
        localStorage.setItem(NYMPH.STORAGE_KEY, JSON.stringify(this.data));
        this.updateDashboard();
        this.updateActivityFeed();
    }
    
    addEntry(entry) {
        entry.id = Date.now();
        entry.date = new Date().toISOString().split('T')[0];
        entry.status = 'Open';
        this.data.push(entry);
        this.saveData();
        this.showToast('Entry saved successfully!', 'success');
    }
    
    // Navigation System
    setupNavigation() {
        // Top navigation
        document.querySelectorAll('.top-nav .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = btn.dataset.section;
                this.handleNavigation(section);
            });
        });
        
        // Side navigation
        document.querySelectorAll('.side-nav .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = btn.dataset.section;
                this.handleNavigation(section);
            });
        });
    }
    
    setupScrollNavigation() {
        window.addEventListener('scroll', () => {
            const topNav = document.getElementById('topNav');
            const sideNav = document.getElementById('sideNav');
            
            if (!topNav || !sideNav) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                // User scrolled down - hide top nav, show side nav
                topNav.classList.add('hidden');
                sideNav.classList.add('visible');
            } else {
                // User at top - show top nav, hide side nav
                topNav.classList.remove('hidden');
                sideNav.classList.remove('visible');
            }
            
            this.lastScrollTop = scrollTop;
        });
    }
    
    setupActionCards() {
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const section = card.dataset.section;
                if (section) {
                    this.handleNavigation(section);
                }
            });
        });
    }
    
    handleNavigation(sectionName) {
        // PIN protection for settings
        if (sectionName === 'settings-section' && !this.checkPin()) {
            return;
        }
        
        this.showSection(sectionName);
    }
    
    showSection(sectionName) {
        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionName);
        });
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionName);
        });
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        if (sectionName === 'reports-section' || sectionName === 'settings-section') {
            this.renderTable();
        }
    }
    
    checkPin() {
        const pin = prompt('Enter PIN to access settings:');
        if (pin !== NYMPH.PIN) {
            this.showToast('Access denied', 'error');
            return false;
        }
        return true;
    }
    
    // Forms
    setupForms() {
        // Bug form
        const bugForm = document.getElementById('bug-form');
        if (bugForm) {
            bugForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitBugForm();
            });
        }
        
        // Feature form
        const featureForm = document.getElementById('feature-form');
        if (featureForm) {
            featureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeatureForm();
            });
        }
        
        // Real-time validation
        this.setupValidation();
    }
    
    setupValidation() {
        document.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }
    
    validateField(field) {
        // Determine form type based on current section
        const formType = this.currentSection === 'bug-section' ? 'BUG' : 'FEATURE';
        const requiredFields = NYMPH.VALIDATION.REQUIRED[formType] || [];
        const isRequired = requiredFields.includes(field.name);
        const value = field.value.trim();
        const fieldContainer = field.closest('.form-field');
        
        let isValid = true;
        let errorMessage = '';
        
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (value && value.length < NYMPH.VALIDATION.MIN_LENGTH) {
            isValid = false;
            errorMessage = `Minimum ${NYMPH.VALIDATION.MIN_LENGTH} characters required`;
        }
        
        this.updateFieldValidation(fieldContainer, isValid, errorMessage);
        return isValid;
    }
    
    updateFieldValidation(container, isValid, message) {
        const errorElement = container.querySelector('.error-message');
        
        container.classList.toggle('error', !isValid);
        container.classList.toggle('valid', isValid && container.querySelector('input, textarea').value.trim());
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    clearFieldError(field) {
        const container = field.closest('.form-field');
        container.classList.remove('error');
        const errorElement = container.querySelector('.error-message');
        if (errorElement) errorElement.textContent = '';
    }
    
    validateForm(formFields) {
        let isValid = true;
        formFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            } else {
                console.log(`Field not found: ${fieldName}`);
            }
        });
        return isValid;
    }
    
    submitBugForm() {
        // Set current section to ensure proper validation  
        this.currentSection = 'bug-section';
        if (!this.validateForm(NYMPH.VALIDATION.REQUIRED.BUG)) {
            this.showToast('Please fix validation errors', 'error');
            return;
        }
        
        const formData = new FormData(document.getElementById('bug-form'));
        const entry = {
            type: 'Bug',
            featureName: formData.get('featureName'),
            expectedBehavior: formData.get('expectedBehavior'),
            actualBehavior: formData.get('actualBehavior'),
            priority: formData.get('priority'),
            errorCode: formData.get('errorCode') || '',
            errorMessage: formData.get('errorMessage') || '',
            featureImportance: '',
            desirability: ''
        };
        
        this.addEntry(entry);
        this.clearForm('bug-form');
    }
    
    submitFeatureForm() {
        // Simple validation check for feature form
        const form = document.getElementById('feature-form');
        const requiredFields = ['featureName', 'expectedBehavior', 'featureImportance', 'desirability'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) {
                isValid = false;
                this.showToast(`Field ${fieldName} not found`, 'error');
            } else if (!field.value.trim()) {
                isValid = false;
                this.showToast(`Please fill in ${fieldName}`, 'error');
            }
        });
        
        if (!isValid) {
            return;
        }
        
        const formData = new FormData(document.getElementById('feature-form'));
        const entry = {
            type: 'Feature Request',
            featureName: formData.get('featureName'),
            expectedBehavior: formData.get('expectedBehavior'),
            priority: formData.get('priority'),
            actualBehavior: '',
            errorCode: '',
            errorMessage: '',
            featureImportance: formData.get('featureImportance'),
            desirability: formData.get('desirability')
        };
        
        this.addEntry(entry);
        this.clearForm('feature-form');
    }
    
    clearForm(formId) {
        const form = document.getElementById(formId);
        form.reset();
        form.querySelectorAll('.form-field').forEach(field => {
            field.classList.remove('valid', 'error');
            const errorElement = field.querySelector('.error-message');
            if (errorElement) errorElement.textContent = '';
        });
    }
    
    // Dashboard Stats & Charts
    updateDashboard() {
        const bugs = this.data.filter(entry => entry.type === 'Bug');
        const features = this.data.filter(entry => entry.type === 'Feature Request');
        const openBugs = bugs.filter(bug => bug.status === 'Open');
        const resolvedBugs = bugs.filter(bug => bug.status === 'Resolved');
        
        // Update stat numbers
        this.updateStat('totalBugs', bugs.length);
        this.updateStat('openBugs', openBugs.length);
        this.updateStat('resolvedBugs', resolvedBugs.length);
        this.updateStat('featureRequests', features.length);
        
        // Update graph
        this.updateGraph(bugs.length, openBugs.length, resolvedBugs.length, features.length);
    }
    
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = value;
    }
    
    updateGraph(total, open, resolved, features) {
        const maxValue = Math.max(total, open, resolved, features, 1);
        
        // Calculate percentages
        const totalPercent = (total / maxValue) * 100;
        const openPercent = (open / maxValue) * 100;
        const resolvedPercent = (resolved / maxValue) * 100;
        const featuresPercent = (features / maxValue) * 100;
        
        // Update bar heights
        this.updateBarHeight('totalBar', totalPercent);
        this.updateBarHeight('openBar', openPercent);
        this.updateBarHeight('resolvedBar', resolvedPercent);
        this.updateBarHeight('featureBar', featuresPercent);
        
        // Update values
        this.updateStat('totalValue', total);
        this.updateStat('openValue', open);
        this.updateStat('resolvedValue', resolved);
        this.updateStat('featureValue', features);
    }
    
    updateBarHeight(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.height = percentage + '%';
        }
    }
    
    // Activity Feed
    updateActivityFeed() {
        const container = document.getElementById('recentActivity');
        if (!container) return;
        
        // Get recent 5 entries, sorted by date
        const recentEntries = this.data
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        container.innerHTML = '';
        
        if (recentEntries.length === 0) {
            container.innerHTML = `
                <div class="activity-entry">
                    <div class="activity-info">
                        <div class="activity-name">No recent activity</div>
                        <div class="activity-desc">Submit your first bug report or feature request</div>
                    </div>
                </div>
            `;
            return;
        }
        
        recentEntries.forEach(entry => {
            const avatar = entry.type === 'Bug' ? 'B' : 'F';
            const timeAgo = this.getTimeAgo(entry.date);
            
            const activityEntry = document.createElement('div');
            activityEntry.className = 'activity-entry';
            activityEntry.innerHTML = `
                <div class="activity-avatar">${avatar}</div>
                <div class="activity-info">
                    <div class="activity-name">${entry.featureName}</div>
                    <div class="activity-desc">${entry.type}</div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            `;
            
            container.appendChild(activityEntry);
        });
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d`;
        
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}m`;
    }
    
    // Data Table
    renderTable() {
        // Check which table to populate based on current section
        const isSettings = this.currentSection === 'settings-section';
        const tbody = document.getElementById(isSettings ? 'settings-tbody' : 'reports-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.data.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.type}</td>
                <td>${entry.featureName}</td>
                <td>${entry.expectedBehavior}</td>
                <td>${entry.actualBehavior || '-'}</td>
                <td>${entry.errorCode || '-'}</td>
                <td>${entry.errorMessage || '-'}</td>
                <td>${entry.featureImportance || '-'}</td>
                <td>${entry.desirability || '-'}</td>
                <td>
                    <select onchange="app.updateEntryPriority(${index}, this.value)">
                        ${NYMPH.PRIORITIES.map(p => 
                            `<option value="${p}" ${entry.priority === p ? 'selected' : ''}>${p}</option>`
                        ).join('')}
                    </select>
                </td>
                <td>${entry.date}</td>
                <td>
                    <select onchange="app.updateEntryStatus(${index}, this.value)">
                        ${NYMPH.STATUS.map(s => 
                            `<option value="${s}" ${entry.status === s ? 'selected' : ''}>${s}</option>`
                        ).join('')}
                    </select>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updateEntryPriority(index, priority) {
        this.data[index].priority = priority;
        this.saveData();
    }
    
    updateEntryStatus(index, status) {
        this.data[index].status = status;
        this.saveData();
    }
    
    // Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 4000);
    }
    
    // Settings
    clearAllData() {
        if (confirm('Are you sure? This will delete all bug reports and feature requests.')) {
            this.data = [];
            this.saveData();
            this.showToast('All data cleared', 'success');
        }
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `nymph-data-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully', 'success');
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new NymphApp();
    });
} else {
    app = new NymphApp();
}