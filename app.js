/* 
=======================================================
NYMPH v2 - APPLICATION (CORRECTED IMPLEMENTATION)
=======================================================
Following proper design system with all features
*/

(function() {
    class NymphApp {
        constructor() {
            console.log('Nymph App starting...');
            
            // Initialize Supabase client
            this.supabase = supabase.createClient(NYMPH.SUPABASE.URL, NYMPH.SUPABASE.ANON_KEY);
            console.log('Supabase client initialized');
            
            this.data = [];
            this.currentSection = 'dashboard-section';
            this.lastScrollTop = 0;
            this.init();
            console.log('Nymph App initialized successfully');
        }
        
        async init() {
            this.setupEventListeners();
            this.setupNavigation();
            this.setupScrollNavigation();
            this.setupForms();
            this.setupActionCards();
            this.showSection('dashboard-section');
            
            // Load data from Supabase
            this.data = await this.loadData();
            this.updateDashboard();
            this.updateActivityFeed();
            this.updateCommunications();
        }

        setupEventListeners() {
            document.body.addEventListener('click', (e) => {
                const target = e.target;
                const fileItem = target.closest('.file-item[data-file-name]');

                if (fileItem) {
                    const { formType, fileName } = fileItem.dataset;
                    if (target.matches('.btn-remove')) {
                        this.removeFile(formType, fileName);
                    } else if (target.matches('.btn-download')) {
                        this.downloadFile(formType, fileName);
                    }
                }

                // Handle data-action buttons
                const actionButton = target.closest('[data-action]');
                if (actionButton) {
                    const action = actionButton.dataset.action;
                    console.log('Action button clicked:', action);
                    console.log('Button element:', actionButton);
                    
                    switch (action) {
                        case 'clear-all-data':
                            console.log('Calling clearAllData...');
                            this.clearAllData();
                            break;
                        case 'clear-all-files':
                            console.log('Calling clearAllFiles...');
                            this.clearAllFiles();
                            break;
                        case 'export-data':
                            console.log('Calling exportData...');
                            this.exportData();
                            break;
                        case 'export-local-data':
                            console.log('Calling exportLocalStorageData...');
                            this.exportLocalStorageData();
                            break;
                        case 'migrate-to-supabase':
                            console.log('Calling migrateLocalStorageToSupabase...');
                            this.migrateLocalStorageToSupabase();
                            break;
                        case 'compose-message':
                            console.log('Opening message composer...');
                            this.showMessageComposer();
                            break;
                        case 'mark-read':
                            console.log('Marking message as read...');
                            this.markMessageRead(actionButton);
                            break;
                        case 'dismiss-message':
                            console.log('Dismissing message...');
                            this.dismissMessage(actionButton);
                            break;
                        default:
                            console.log('Unknown action:', action);
                    }
                } else {
                    // Debug: log all clicks to see what's happening
                    console.log('Click target:', target);
                    console.log('Target data-action:', target.dataset?.action);
                }
            });

            document.body.addEventListener('change', (e) => {
                if (e.target.matches('select[data-action]')) {
                    const select = e.target;
                    const row = select.closest('tr[data-index]');
                    if (row) {
                        const index = parseInt(row.dataset.index, 10);
                        const action = select.dataset.action;

                        if (action === 'update-priority') {
                            this.updateEntryPriority(index, select.value);
                        } else if (action === 'update-status') {
                            this.updateEntryStatus(index, select.value);
                        } else if (action === 'update-type') {
                            this.updateEntryType(index, select.value);
                        }
                    }
                }
            });
        }

        // Verification Logic
        checkVerificationNeeded(bugData) {
            const issues = [];
            
            // Check for missing or insufficient information
            if (!bugData.error_code && bugData.priority === 'High') {
                issues.push('High priority bugs require error codes');
            }
            
            if (!bugData.error_message && (bugData.expected_behavior.length < 20 || bugData.actual_behavior.length < 20)) {
                issues.push('Insufficient detail in behavior descriptions');
            }
            
            if (bugData.expected_behavior.toLowerCase().includes('doesn\'t work') || 
                bugData.actual_behavior.toLowerCase().includes('broken')) {
                issues.push('Vague descriptions need more specific details');
            }
            
            // Trigger verification notification if issues found
            if (issues.length > 0) {
                setTimeout(() => {
                    if (typeof addNotification === 'function') {
                        addNotification(
                            'error', 
                            `Bug Report #${bugData.id} - Unable to verify`,
                            `Please provide more information: ${issues.join(', ')}`
                        );
                    }
                }, 2000); // Delay to show after success message
            }
        }
        
        // Data Management
        async loadData() {
            try {
                // Load from Supabase
                const [bugReports, featureRequests] = await Promise.all([
                    this.supabase.from('bug_reports').select('*').order('created_at', { ascending: false }),
                    this.supabase.from('feature_requests').select('*').order('created_at', { ascending: false })
                ]);

                let data = [];

                if (bugReports.data) {
                    data = data.concat(bugReports.data.map(bug => ({
                        id: bug.id,
                        type: 'bug',
                        featureName: bug.feature_name,
                        expectedBehavior: bug.expected_behavior,
                        actualBehavior: bug.actual_behavior,
                        errorCode: bug.error_code,
                        errorMessage: bug.error_message,
                        priority: bug.priority,
                        status: bug.status,
                        date: bug.created_at.split('T')[0]
                    })));
                }

                if (featureRequests.data) {
                    data = data.concat(featureRequests.data.map(feature => ({
                        id: feature.id,
                        type: 'feature',
                        featureName: feature.feature_name,
                        expectedBehavior: feature.expected_behavior,
                        featureImportance: feature.feature_importance,
                        desirability: feature.desirability,
                        priority: feature.priority,
                        status: feature.status,
                        date: feature.created_at.split('T')[0]
                    })));
                }

                return data;
            } catch (error) {
                console.error('Error loading data from Supabase:', error);
                // Fallback to localStorage
                const stored = localStorage.getItem(NYMPH.STORAGE_KEY);
                return stored ? JSON.parse(stored) : [];
            }
        }
        
        async saveData() {
            // No longer needed - data is saved directly to Supabase in addEntry
            this.updateDashboard();
            this.updateActivityFeed();
        }
        
        async addEntry(entry) {
            try {
                // Use the status from the form, default to 'Open' if not provided
                if (!entry.status) {
                    entry.status = 'Open';
                }
                
                if (entry.type === 'bug') {
                    const { data, error } = await this.supabase
                        .from('bug_reports')
                        .insert({
                            feature_name: entry.featureName,
                            expected_behavior: entry.expectedBehavior,
                            actual_behavior: entry.actualBehavior,
                            error_code: entry.errorCode || null,
                            error_message: entry.errorMessage || null,
                            priority: entry.priority || 'Normal',
                            status: entry.status
                        })
                        .select()
                        .single();
                    
                    if (error) {
                        throw error;
                    }
                    
                    // Add to local data array
                    this.data.unshift({
                        id: data.id,
                        type: 'bug',
                        featureName: data.feature_name,
                        expectedBehavior: data.expected_behavior,
                        actualBehavior: data.actual_behavior,
                        errorCode: data.error_code,
                        errorMessage: data.error_message,
                        priority: data.priority,
                        status: data.status,
                        date: data.created_at.split('T')[0]
                    });

                    // Check if verification is needed
                    this.checkVerificationNeeded(data);
                    
                } else if (entry.type === 'feature') {
                    const { data, error } = await this.supabase
                        .from('feature_requests')
                        .insert({
                            feature_name: entry.featureName,
                            expected_behavior: entry.expectedBehavior,
                            feature_importance: parseInt(entry.featureImportance) || 5,
                            desirability: parseInt(entry.desirability) || 5,
                            priority: entry.priority || 'Normal',
                            status: entry.status
                        })
                        .select()
                        .single();
                    
                    if (error) {
                        throw error;
                    }
                    
                    // Add to local data array
                    this.data.unshift({
                        id: data.id,
                        type: 'feature',
                        featureName: data.feature_name,
                        expectedBehavior: data.expected_behavior,
                        featureImportance: data.feature_importance,
                        desirability: data.desirability,
                        priority: data.priority,
                        status: data.status,
                        date: data.created_at.split('T')[0]
                    });
                }
                
                this.updateDashboard();
                this.updateActivityFeed();
                this.showToast('Entry saved successfully!', 'success');
                
            } catch (error) {
                console.error('Error saving entry:', error);
                this.showToast(`Error saving entry: ${error.message}`, 'error');
            }
        }

        // Migration Functions - Extract localStorage data and upload to Supabase
        async migrateLocalStorageToSupabase() {
            try {
                const localData = localStorage.getItem(NYMPH.STORAGE_KEY);
                if (!localData) {
                    this.showToast('No local data found to migrate', 'warning');
                    return;
                }

                const entries = JSON.parse(localData);
                if (!Array.isArray(entries) || entries.length === 0) {
                    this.showToast('No entries found in local storage', 'warning');
                    return;
                }

                this.showToast('Starting migration...', 'info');
                
                let bugReports = [];
                let featureRequests = [];

                // Separate entries by type
                entries.forEach(entry => {
                    if (entry.type === 'bug') {
                        bugReports.push({
                            feature_name: entry.featureName,
                            expected_behavior: entry.expectedBehavior,
                            actual_behavior: entry.actualBehavior,
                            error_code: entry.errorCode || null,
                            error_message: entry.errorMessage || null,
                            priority: entry.priority || 'Normal',
                            status: entry.status || 'Open'
                        });
                    } else if (entry.type === 'feature') {
                        featureRequests.push({
                            feature_name: entry.featureName,
                            expected_behavior: entry.expectedBehavior,
                            feature_importance: parseInt(entry.featureImportance) || 5,
                            desirability: parseInt(entry.desirability) || 5,
                            priority: entry.priority || 'Normal',
                            status: entry.status || 'Open'
                        });
                    }
                });

                // Upload bug reports
                if (bugReports.length > 0) {
                    const { error: bugError } = await this.supabase
                        .from('bug_reports')
                        .insert(bugReports);
                    
                    if (bugError) {
                        console.error('Bug reports migration error:', bugError);
                        this.showToast(`Error migrating bug reports: ${bugError.message}`, 'error');
                        return;
                    }
                }

                // Upload feature requests
                if (featureRequests.length > 0) {
                    const { error: featureError } = await this.supabase
                        .from('feature_requests')
                        .insert(featureRequests);
                    
                    if (featureError) {
                        console.error('Feature requests migration error:', featureError);
                        this.showToast(`Error migrating feature requests: ${featureError.message}`, 'error');
                        return;
                    }
                }

                this.showToast(`Successfully migrated ${bugReports.length} bug reports and ${featureRequests.length} feature requests!`, 'success');
                
            } catch (error) {
                console.error('Migration error:', error);
                this.showToast(`Migration failed: ${error.message}`, 'error');
            }
        }

        // Export localStorage data for manual transfer
        exportLocalStorageData() {
            const localData = localStorage.getItem(NYMPH.STORAGE_KEY);
            if (!localData) {
                this.showToast('No local data found to export', 'warning');
                return;
            }

            const blob = new Blob([localData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nymph-localStorage-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Local data exported successfully!', 'success');
        }

        // File Upload System
        uploadFile(formType) {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip';
            
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                
                // Store files in localStorage (for demo purposes)
                const fileData = [];
                let processedFiles = 0;
                
                files.forEach(file => {
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        this.showToast(`File ${file.name} is too large (max 5MB)`, 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        fileData.push({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            data: event.target.result,
                            uploadDate: new Date().toISOString()
                        });
                        
                        processedFiles++;
                        if (processedFiles === files.length) {
                            this.saveUploadedFiles(formType, fileData);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            };
            
            input.click();
        }
        
        saveUploadedFiles(formType, files) {
            const existingFiles = JSON.parse(localStorage.getItem(`nymph_files_${formType}`) || '[]');
            existingFiles.push(...files);
            localStorage.setItem(`nymph_files_${formType}`, JSON.stringify(existingFiles));
            
            const fileNames = files.map(f => f.name).join(', ');
            this.showToast(`Uploaded ${files.length} file(s): ${fileNames}`, 'success');
            
            // Update file display
            this.displayUploadedFiles(formType);
        }
        
        displayUploadedFiles(formType) {
            const files = JSON.parse(localStorage.getItem(`nymph_files_${formType}`) || '[]');
            let container = document.getElementById(`${formType}-files`);
            
            if (!container) {
                // Create file display container if it doesn't exist
                const form = document.getElementById(`${formType}-form`);
                const fileContainer = document.createElement('div');
                fileContainer.id = `${formType}-files`;
                fileContainer.className = 'uploaded-files';
                fileContainer.innerHTML = '<div class="card-title">Uploaded Files</div>';
                form.appendChild(fileContainer);
                container = fileContainer;
            }
            
            const fileList = document.createElement('div');
            fileList.className = 'file-list';
            
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.dataset.formType = formType;
                fileItem.dataset.fileName = file.name;
                fileItem.innerHTML = `
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
                    <button type="button" class="btn-remove" data-action="remove-file">×</button>
                `;
                fileList.appendChild(fileItem);
            });
            
            const existingList = container.querySelector('.file-list');
            if (existingList) {
                existingList.remove();
            }
            container.appendChild(fileList);
        }
        
        removeFile(formType, fileName) {
            const files = JSON.parse(localStorage.getItem(`nymph_files_${formType}`) || '[]');
            const updatedFiles = files.filter(f => f.name !== fileName);
            localStorage.setItem(`nymph_files_${formType}`, JSON.stringify(updatedFiles));
            this.displayUploadedFiles(formType);
            if (this.currentSection === 'settings-section') {
                this.displaySettingsFiles();
            }
            this.showToast(`Removed ${fileName}`, 'success');
        }

        displaySettingsFiles() {
            this.displaySettingsFileSection('bug');
            this.displaySettingsFileSection('feature');
        }

        displaySettingsFileSection(formType) {
            const files = JSON.parse(localStorage.getItem(`nymph_files_${formType}`) || '[]');
            const container = document.getElementById(`settings-${formType}-files`);
            
            if (!container) return;
            
            container.innerHTML = '';
            
            if (files.length === 0) {
                container.innerHTML = '<div style="color: rgba(255,255,255,0.5); font-size: 12px;">No files uploaded</div>';
                return;
            }
            
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.dataset.formType = formType;
                fileItem.dataset.fileName = file.name;
                fileItem.innerHTML = `
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
                    <button type="button" class="btn-download" data-action="download-file">Download</button>
                    <button type="button" class="btn-remove" data-action="remove-file">×</button>
                `;
                container.appendChild(fileItem);
            });
        }

        downloadFile(formType, fileName) {
            const files = JSON.parse(localStorage.getItem(`nymph_files_${formType}`) || '[]');
            const file = files.find(f => f.name === fileName);
            
            if (!file) {
                this.showToast('File not found', 'error');
                return;
            }
            
            const link = document.createElement('a');
            link.href = file.data;
            link.download = file.name;
            link.click();
            
            this.showToast(`Downloaded ${fileName}`, 'success');
        }

        clearAllFiles() {
            if (confirm('⚠️ WARNING: This will permanently delete ALL uploaded files (images, documents, etc.).\n\nAre you absolutely sure you want to continue?')) {
                const pin = prompt('Enter PIN to confirm file deletion:');
                if (pin !== NYMPH.PIN) {
                    this.showToast('Access denied', 'error');
                    return;
                }
                
                localStorage.removeItem('nymph_files_bug');
                localStorage.removeItem('nymph_files_feature');
                this.displaySettingsFiles();
                this.showToast('All files cleared', 'success');
            }
        }
        
        // Navigation System
        setupNavigation() {
            console.log('Setting up navigation...');
            
            // Top navigation
            const topNavItems = document.querySelectorAll('.top-nav .nav-item');
            console.log('Found top nav items:', topNavItems.length);
            
            topNavItems.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = btn.dataset.section;
                    console.log('Top nav clicked:', section);
                    this.handleNavigation(section);
                });
            });
            
            // Side navigation
            const sideNavItems = document.querySelectorAll('.side-nav .nav-item');
            console.log('Found side nav items:', sideNavItems.length);
            
            sideNavItems.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = btn.dataset.section;
                    console.log('Side nav clicked:', section);
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
            const actionCards = document.querySelectorAll('.action-card');
            console.log('Found action cards:', actionCards.length);
            
            actionCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    const section = card.dataset.section;
                    console.log('Action card clicked:', section);
                    if (section) {
                        this.handleNavigation(section);
                    }
                });
            });
        }
        
        async handleNavigation(sectionName) {
            // PIN protection for settings
            if (sectionName === 'settings-section') {
                const pinValid = await this.checkPin();
                if (!pinValid) {
                    return;
                }
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
                if (sectionName === 'settings-section') {
                    this.displaySettingsFiles();
                }
            }
            
            // Update communications to show/hide admin controls based on section
            this.updateCommunications();
        }
        
        checkPin() {
            return new Promise((resolve) => {
                this.showPinModal('Enter PIN to access settings:', (pin) => {
                    if (pin === NYMPH.PIN) {
                        resolve(true);
                    } else {
                        this.showToast('Access denied', 'error');
                        resolve(false);
                    }
                });
            });
        }

        showPinModal(message, callback) {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'pin-modal-overlay';
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'pin-modal';
            modal.innerHTML = `
                <div class="pin-modal-content">
                    <h3 class="pin-modal-title">${message}</h3>
                    <input type="password" class="pin-input" placeholder="Enter PIN" maxlength="4">
                    <div class="pin-modal-buttons">
                        <button class="btn btn-secondary pin-cancel">Cancel</button>
                        <button class="btn btn-secondary pin-confirm">Confirm</button>
                    </div>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Focus input
            const input = modal.querySelector('.pin-input');
            input.focus();
            
            // Handle events
            const cleanup = () => {
                overlay.remove();
            };
            
            modal.querySelector('.pin-cancel').onclick = () => {
                cleanup();
                callback(null);
            };
            
            modal.querySelector('.pin-confirm').onclick = () => {
                const pin = input.value;
                cleanup();
                callback(pin);
            };
            
            input.onkeyup = (e) => {
                if (e.key === 'Enter') {
                    const pin = input.value;
                    cleanup();
                    callback(pin);
                } else if (e.key === 'Escape') {
                    cleanup();
                    callback(null);
                }
            };
            
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    cleanup();
                    callback(null);
                }
            };
            
            // Show animation
            setTimeout(() => overlay.classList.add('show'), 10);
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
        
        async submitBugForm() {
            // Set current section to ensure proper validation  
            this.currentSection = 'bug-section';
            if (!this.validateForm(NYMPH.VALIDATION.REQUIRED.BUG)) {
                this.showToast('Please fix validation errors', 'error');
                return;
            }
            
            const formData = new FormData(document.getElementById('bug-form'));
            const entry = {
                type: 'bug',
                featureName: formData.get('featureName'),
                expectedBehavior: formData.get('expectedBehavior'),
                actualBehavior: formData.get('actualBehavior'),
                priority: formData.get('priority'),
                status: formData.get('status') || 'Open',
                errorCode: formData.get('errorCode') || '',
                errorMessage: formData.get('errorMessage') || '',
                featureImportance: '',
                desirability: ''
            };
            
            await this.addEntry(entry);
            this.clearForm('bug-form');
        }
        
        async submitFeatureForm() {
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
                type: 'feature',
                featureName: formData.get('featureName'),
                expectedBehavior: formData.get('expectedBehavior'),
                priority: formData.get('priority'),
                actualBehavior: '',
                errorCode: '',
                errorMessage: '',
                featureImportance: formData.get('featureImportance'),
                desirability: formData.get('desirability')
            };
            
            await this.addEntry(entry);
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
            const bugs = this.data.filter(entry => entry.type === 'bug');
            const features = this.data.filter(entry => entry.type === 'feature');
            const openBugs = bugs.filter(bug => bug.status === 'Open');
            const resolvedBugs = bugs.filter(bug => bug.status === 'Resolved');
            const featuresImplemented = features.filter(feature => feature.status === 'Closed' || feature.status === 'Resolved');
            
            // Update stat numbers
            this.updateStat('featuresImplemented', featuresImplemented.length);
            this.updateStat('openBugs', openBugs.length);
            this.updateStat('resolvedBugs', resolvedBugs.length);
            this.updateStat('featureRequests', features.length);
            
            // Update graph
            this.updateGraph(featuresImplemented.length, openBugs.length, resolvedBugs.length, features.length);
        }
        
        updateStat(elementId, value) {
            const element = document.getElementById(elementId);
            if (element) element.textContent = value;
        }
        
        updateGraph(featuresImplemented, open, resolved, features) {
            const maxValue = Math.max(featuresImplemented, open, resolved, features, 1);
            
            // Calculate percentages
            const implementedPercent = (featuresImplemented / maxValue) * 100;
            const openPercent = (open / maxValue) * 100;
            const resolvedPercent = (resolved / maxValue) * 100;
            const featuresPercent = (features / maxValue) * 100;
            
            // Update bar heights (assuming totalBar becomes implementedBar)
            this.updateBarHeight('totalBar', implementedPercent);
            this.updateBarHeight('openBar', openPercent);
            this.updateBarHeight('resolvedBar', resolvedPercent);
            this.updateBarHeight('featureBar', featuresPercent);
            
            // Update values
            this.updateStat('totalValue', featuresImplemented);
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
                const avatar = entry.type === 'bug' ? 'B' : 'F';
                const timeAgo = this.getTimeAgo(entry.date);
                
                const activityEntry = document.createElement('div');
                activityEntry.className = 'activity-entry';
                activityEntry.innerHTML = `
                    <div class="activity-avatar">${avatar}</div>
                    <div class="activity-info">
                        <div class="activity-name">${entry.featureName}</div>
                        <div class="activity-desc">${entry.type}</div>
                    </div>
                    <div class="activity-status">${entry.status}</div>
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
                row.dataset.index = index;
                row.innerHTML = `
                    <td>
                        <select data-action="update-type">
                            <option value="bug" ${entry.type === 'bug' ? 'selected' : ''}>Bug</option>
                            <option value="feature" ${entry.type === 'feature' ? 'selected' : ''}>Feature</option>
                        </select>
                    </td>
                    <td>${entry.featureName}</td>
                    <td>${entry.expectedBehavior}</td>
                    <td>${entry.actualBehavior || '-'}</td>
                    <td>${entry.errorCode || '-'}</td>
                    <td>${entry.errorMessage || '-'}</td>
                    <td>${entry.featureImportance || '-'}</td>
                    <td>${entry.desirability || '-'}</td>
                    <td>
                        <select data-action="update-priority">
                            ${NYMPH.PRIORITIES.map(p => 
                                `<option value="${p}" ${entry.priority === p ? 'selected' : ''}>${p}</option>`
                            ).join('')}
                        </select>
                    </td>
                    <td>${entry.date}</td>
                    <td>
                        <select data-action="update-status">
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

        async updateEntryType(index, newType) {
            const entry = this.data[index];
            const oldType = entry.type;
            
            if (oldType === newType) return; // No change needed
            
            try {
                console.log(`Converting ${oldType} to ${newType} for entry:`, entry.featureName);
                
                // Update in Supabase database
                if (oldType === 'bug' && newType === 'feature') {
                    // Move from bug_reports to feature_requests
                    
                    // Insert into feature_requests
                    const { data: newFeature, error: insertError } = await this.supabase
                        .from('feature_requests')
                        .insert({
                            feature_name: entry.featureName,
                            expected_behavior: entry.expectedBehavior,
                            feature_importance: entry.featureImportance || 5,
                            desirability: entry.desirability || 5,
                            priority: entry.priority || 'Normal',
                            status: entry.status || 'Open'
                        })
                        .select()
                        .single();
                    
                    if (insertError) throw insertError;
                    
                    // Delete from bug_reports
                    const { error: deleteError } = await this.supabase
                        .from('bug_reports')
                        .delete()
                        .eq('id', entry.id);
                    
                    if (deleteError) throw deleteError;
                    
                    // Update local data
                    this.data[index] = {
                        id: newFeature.id,
                        type: 'feature',
                        featureName: newFeature.feature_name,
                        expectedBehavior: newFeature.expected_behavior,
                        actualBehavior: '',
                        errorCode: '',
                        errorMessage: '',
                        featureImportance: newFeature.feature_importance,
                        desirability: newFeature.desirability,
                        priority: newFeature.priority,
                        status: newFeature.status,
                        date: newFeature.created_at.split('T')[0]
                    };
                    
                } else if (oldType === 'feature' && newType === 'bug') {
                    // Move from feature_requests to bug_reports
                    
                    // Insert into bug_reports
                    const { data: newBug, error: insertError } = await this.supabase
                        .from('bug_reports')
                        .insert({
                            feature_name: entry.featureName,
                            expected_behavior: entry.expectedBehavior,
                            actual_behavior: entry.actualBehavior || 'Not working as expected',
                            error_code: entry.errorCode || null,
                            error_message: entry.errorMessage || null,
                            priority: entry.priority || 'Normal',
                            status: entry.status || 'Open'
                        })
                        .select()
                        .single();
                    
                    if (insertError) throw insertError;
                    
                    // Delete from feature_requests
                    const { error: deleteError } = await this.supabase
                        .from('feature_requests')
                        .delete()
                        .eq('id', entry.id);
                    
                    if (deleteError) throw deleteError;
                    
                    // Update local data
                    this.data[index] = {
                        id: newBug.id,
                        type: 'bug',
                        featureName: newBug.feature_name,
                        expectedBehavior: newBug.expected_behavior,
                        actualBehavior: newBug.actual_behavior,
                        errorCode: newBug.error_code,
                        errorMessage: newBug.error_message,
                        featureImportance: '',
                        desirability: '',
                        priority: newBug.priority,
                        status: newBug.status,
                        date: newBug.created_at.split('T')[0]
                    };
                }
                
                // Update UI
                this.updateDashboard();
                this.updateActivityFeed();
                this.renderTable();
                
                this.showToast(`Successfully converted ${oldType} to ${newType}: ${entry.featureName}`, 'success');
                
            } catch (error) {
                console.error('Error updating entry type:', error);
                this.showToast(`Error converting entry type: ${error.message}`, 'error');
                
                // Revert the dropdown selection
                const row = document.querySelector(`tr[data-index="${index}"]`);
                if (row) {
                    const typeSelect = row.querySelector('select[data-action="update-type"]');
                    if (typeSelect) {
                        typeSelect.value = oldType;
                    }
                }
            }
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
        async clearAllData() {
            console.log('clearAllData method called!');
            if (confirm('⚠️ WARNING: This will permanently delete ALL bug reports and feature requests from both local storage AND the database.\n\nAre you absolutely sure you want to continue?')) {
                const pin = prompt('Enter PIN to confirm data deletion:');
                if (pin !== NYMPH.PIN) {
                    this.showToast('Access denied', 'error');
                    return;
                }
                
                try {
                    // Clear from Supabase database - first get all records, then delete them
                    const { data: bugData } = await this.supabase
                        .from('bug_reports')
                        .select('id');
                    
                    const { data: featureData } = await this.supabase
                        .from('feature_requests')
                        .select('id');
                    
                    let bugError = null;
                    let featureError = null;
                    
                    // Delete bug reports if any exist
                    if (bugData && bugData.length > 0) {
                        console.log(`Found ${bugData.length} bug reports to delete`);
                        const bugIds = bugData.map(item => item.id);
                        const { error, count } = await this.supabase
                            .from('bug_reports')
                            .delete()
                            .in('id', bugIds);
                        console.log(`Deleted ${count} bug reports`);
                        bugError = error;
                    } else {
                        console.log('No bug reports found to delete');
                    }
                    
                    // Delete feature requests if any exist
                    if (featureData && featureData.length > 0) {
                        console.log(`Found ${featureData.length} feature requests to delete`);
                        const featureIds = featureData.map(item => item.id);
                        const { error, count } = await this.supabase
                            .from('feature_requests')
                            .delete()
                            .in('id', featureIds);
                        console.log(`Deleted ${count} feature requests`);
                        featureError = error;
                    } else {
                        console.log('No feature requests found to delete');
                    }
                    
                    if (bugError) {
                        console.error('Error clearing bug reports:', bugError);
                        this.showToast(`Error clearing bug reports: ${bugError.message}`, 'error');
                        return;
                    }
                    
                    if (featureError) {
                        console.error('Error clearing feature requests:', featureError);
                        this.showToast(`Error clearing feature requests: ${featureError.message}`, 'error');
                        return;
                    }
                    
                    // Clear local data
                    this.data = [];
                    localStorage.removeItem(NYMPH.STORAGE_KEY);
                    
                    console.log('Data cleared. Local data length:', this.data.length);
                    
                    // Clear activity feed manually
                    const recentActivity = document.getElementById('recentActivity');
                    
                    if (recentActivity) {
                        recentActivity.innerHTML = `
                            <div class="activity-entry">
                                <div class="activity-info">
                                    <div class="activity-name">No recent activity</div>
                                    <div class="activity-desc">Submit your first bug report or feature request</div>
                                </div>
                            </div>
                        `;
                        console.log('Cleared recentActivity');
                    }
                    
                    // Update UI
                    this.updateDashboard();
                    this.updateActivityFeed();
                    this.renderTable();
                    
                    // Force reload data from database to verify deletion
                    setTimeout(async () => {
                        console.log('Reloading data from database to verify deletion...');
                        this.data = await this.loadData();
                        console.log('Reloaded data length:', this.data.length);
                        this.updateDashboard();
                        this.updateActivityFeed();
                        this.renderTable();
                    }, 1000);
                    
                    this.showToast('All data cleared successfully from database and local storage', 'success');
                    
                } catch (error) {
                    console.error('Error clearing data:', error);
                    this.showToast(`Error clearing data: ${error.message}`, 'error');
                }
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

        // Communication System
        async loadCommunications() {
            try {
                const { data, error } = await this.supabase
                    .from('user_communications')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error loading communications:', error);
                    return [];
                }

                return data || [];
            } catch (error) {
                console.error('Error loading communications:', error);
                return [];
            }
        }

        async updateCommunications() {
            const communications = await this.loadCommunications();
            const messagesList = document.getElementById('messagesList');
            const messageCount = document.getElementById('messageCount');
            
            if (!messagesList || !messageCount) return;

            const unreadCount = communications.filter(msg => !msg.is_read).length;
            messageCount.textContent = unreadCount;

            if (communications.length === 0) {
                messagesList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No messages</div>';
                return;
            }

            messagesList.innerHTML = '';
            communications.slice(0, 10).forEach(msg => {
                const messageItem = document.createElement('div');
                messageItem.className = `notification-item ${!msg.is_read ? 'unread' : ''}`;
                
                // Users can always mark as read and delete messages
                const userButtons = `<button class="notification-btn" data-action="mark-read" data-message-id="${msg.id}">✓</button>
                                   <button class="notification-btn" data-action="dismiss-message" data-message-id="${msg.id}">✕</button>`;
                
                messageItem.innerHTML = `
                    <span class="notification-icon ${this.getMessageIcon(msg.message_type)}">${this.getMessageEmoji(msg.message_type)}</span>
                    <span class="notification-title">${msg.subject}</span>
                    ${userButtons}
                    <span class="notification-message">${msg.message}</span>
                    <span class="notification-time">${this.getTimeAgo(msg.created_at)}</span>
                `;
                messagesList.appendChild(messageItem);
            });
        }

        getMessageIcon(type) {
            switch(type) {
                case 'info_request': return 'warning';
                case 'clarification': return 'warning';
                case 'rejection': return 'error';
                case 'update': return 'success';
                default: return '';
            }
        }

        getMessageEmoji(type) {
            switch(type) {
                case 'info_request': return '❓';
                case 'clarification': return '💭';
                case 'rejection': return '❌';
                case 'update': return '✅';
                default: return 'ℹ️';
            }
        }

        showMessageComposer() {
            // Create modal for composing messages
            const overlay = document.createElement('div');
            overlay.className = 'pin-modal-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'pin-modal';
            modal.style.maxWidth = '600px';
            modal.innerHTML = `
                <div class="pin-modal-content">
                    <h3 class="pin-modal-title">Send Message to User</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: white;">Related Item:</label>
                        <select id="messageItemType" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                            <option value="">Select item type...</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                        </select>
                        <select id="messageItemId" style="width: 100%; padding: 8px;" disabled>
                            <option value="">Select specific item...</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: white;">Message Type:</label>
                        <select id="messageType" style="width: 100%; padding: 8px;">
                            <option value="info_request">Request More Information</option>
                            <option value="clarification">Need Clarification</option>
                            <option value="rejection">Reject/Decline</option>
                            <option value="update">Status Update</option>
                            <option value="general">General Message</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: white;">Subject:</label>
                        <input type="text" id="messageSubject" style="width: 100%; padding: 8px;" placeholder="Enter subject...">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: white;">Message:</label>
                        <textarea id="messageContent" style="width: 100%; padding: 8px; height: 100px;" placeholder="Enter your message..."></textarea>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: white;">Priority:</label>
                        <select id="messagePriority" style="width: 100%; padding: 8px;">
                            <option value="low">Low</option>
                            <option value="normal" selected>Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    
                    <div class="pin-modal-buttons">
                        <button class="btn btn-secondary message-cancel">Cancel</button>
                        <button class="btn btn-secondary message-send">Send Message</button>
                    </div>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Load items for selection
            this.populateItemSelectors();

            // Handle item type change
            document.getElementById('messageItemType').onchange = (e) => {
                this.populateItemSelectors(e.target.value);
            };

            // Handle item selection to auto-populate subject
            document.getElementById('messageItemId').onchange = (e) => {
                this.autoPopulateSubject(e.target.value);
            };

            // Handle message type change to update subject prefix
            document.getElementById('messageType').onchange = (e) => {
                const selectedItemId = document.getElementById('messageItemId').value;
                if (selectedItemId) {
                    this.autoPopulateSubject(selectedItemId);
                }
            };
            
            // Handle events
            const cleanup = () => overlay.remove();
            
            modal.querySelector('.message-cancel').onclick = cleanup;
            modal.querySelector('.message-send').onclick = () => {
                this.sendMessage();
                cleanup();
            };
            
            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup();
            };
            
            setTimeout(() => overlay.classList.add('show'), 10);
        }

        populateItemSelectors(itemType = null) {
            const itemTypeSelect = document.getElementById('messageItemType');
            const itemIdSelect = document.getElementById('messageItemId');
            
            if (!itemType) {
                itemIdSelect.disabled = true;
                itemIdSelect.innerHTML = '<option value="">Select specific item...</option>';
                return;
            }

            itemIdSelect.disabled = false;
            itemIdSelect.innerHTML = '<option value="">Select specific item...</option>';
            
            const items = this.data.filter(item => item.type === itemType);
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.featureName} (${item.status})`;
                itemIdSelect.appendChild(option);
            });
        }

        autoPopulateSubject(itemId) {
            if (!itemId) return;
            
            // Find the selected item
            const selectedItem = this.data.find(item => item.id === itemId);
            if (!selectedItem) return;
            
            // Auto-populate subject with the request title
            const subjectField = document.getElementById('messageSubject');
            const messageTypeField = document.getElementById('messageType');
            
            if (subjectField && selectedItem.featureName) {
                const messageType = messageTypeField.value;
                let subjectPrefix = '';
                
                switch(messageType) {
                    case 'info_request':
                        subjectPrefix = 'Need More Information: ';
                        break;
                    case 'clarification':
                        subjectPrefix = 'Clarification Needed: ';
                        break;
                    case 'rejection':
                        subjectPrefix = 'Unable to Proceed: ';
                        break;
                    case 'update':
                        subjectPrefix = 'Status Update: ';
                        break;
                    default:
                        subjectPrefix = 'Regarding: ';
                }
                
                subjectField.value = subjectPrefix + selectedItem.featureName;
            }
        }

        async sendMessage() {
            const itemType = document.getElementById('messageItemType').value;
            const itemId = document.getElementById('messageItemId').value;
            const messageType = document.getElementById('messageType').value;
            const subject = document.getElementById('messageSubject').value;
            const content = document.getElementById('messageContent').value;
            const priority = document.getElementById('messagePriority').value;

            if (!itemType || !itemId || !subject || !content) {
                this.showToast('Please fill in all required fields', 'error');
                return;
            }

            try {
                const { error } = await this.supabase
                    .from('user_communications')
                    .insert({
                        item_type: itemType,
                        item_id: itemId,
                        message_type: messageType,
                        subject: subject,
                        message: content,
                        priority: priority,
                        from_admin: true,
                        is_read: false
                    });

                if (error) {
                    throw error;
                }

                this.showToast('Message sent successfully!', 'success');
                this.updateCommunications();
            } catch (error) {
                console.error('Error sending message:', error);
                this.showToast(`Error sending message: ${error.message}`, 'error');
            }
        }

        async markMessageRead(button) {
            const messageId = button.dataset.messageId;
            if (!messageId) return;

            try {
                const { error } = await this.supabase
                    .from('user_communications')
                    .update({ 
                        is_read: true,
                        read_at: new Date().toISOString()
                    })
                    .eq('id', messageId);

                if (error) throw error;

                this.updateCommunications();
                this.showToast('Message marked as read', 'success');
            } catch (error) {
                console.error('Error marking message as read:', error);
                this.showToast(`Error: ${error.message}`, 'error');
            }
        }

        async dismissMessage(button) {
            const messageId = button.dataset.messageId;
            if (!messageId) return;

            if (!confirm('Are you sure you want to delete this message?')) return;

            try {
                const { error } = await this.supabase
                    .from('user_communications')
                    .delete()
                    .eq('id', messageId);

                if (error) throw error;

                this.updateCommunications();
                this.showToast('Message deleted', 'success');
            } catch (error) {
                console.error('Error deleting message:', error);
                this.showToast(`Error: ${error.message}`, 'error');
            }
        }

    }

    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new NymphApp());
    } else {
        new NymphApp();
    }
})();