/*
=======================================================
NYMPH BUG TRACKER - UI ENHANCEMENTS
=======================================================
Polish improvements: validation, notifications, error handling
*/

// Form Validation System
class FormValidator {
    constructor() {
        this.rules = {
            required: (value) => value.trim() !== '',
            minLength: (value, min) => value.length >= min,
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        };
        
        this.messages = {
            required: 'This field is required',
            minLength: (min) => `Minimum ${min} characters required`,
            email: 'Please enter a valid email address'
        };
    }

    validateField(field, rules = []) {
        const value = field.value;
        const fieldContainer = field.closest('.form-field');
        const errorElement = fieldContainer?.querySelector('.error-message');
        
        let isValid = true;
        let errorMessage = '';

        // Check each validation rule
        for (const rule of rules) {
            if (typeof rule === 'string') {
                // Simple rule like 'required'
                if (!this.rules[rule](value)) {
                    isValid = false;
                    errorMessage = this.messages[rule];
                    break;
                }
            } else if (typeof rule === 'object') {
                // Rule with parameters like {minLength: 3}
                const [ruleName, param] = Object.entries(rule)[0];
                if (!this.rules[ruleName](value, param)) {
                    isValid = false;
                    errorMessage = typeof this.messages[ruleName] === 'function' 
                        ? this.messages[ruleName](param)
                        : this.messages[ruleName];
                    break;
                }
            }
        }

        // Update UI
        if (fieldContainer) {
            fieldContainer.classList.toggle('invalid', !isValid);
            fieldContainer.classList.toggle('valid', isValid && value.trim() !== '');
            
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        }

        return { isValid, message: errorMessage };
    }

    validateForm(formId, validationRules) {
        let isFormValid = true;
        const errors = [];

        for (const [fieldId, rules] of Object.entries(validationRules)) {
            const field = document.getElementById(fieldId);
            if (field) {
                const result = this.validateField(field, rules);
                if (!result.isValid) {
                    isFormValid = false;
                    errors.push({ field: fieldId, message: result.message });
                }
            }
        }

        return { isValid: isFormValid, errors };
    }
}

// Toast Notification System
class ToastNotification {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.toasts = new Map();
        this.toastCounter = 0;
    }

    show(message, type = 'info', duration = 4000) {
        const toastId = `toast-${this.toastCounter++}`;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        toast.innerHTML = `
            <div>${message}</div>
            <button class="toast-close" onclick="toastSystem.hide('${toastId}')" aria-label="Close">×</button>
        `;

        this.container.appendChild(toast);
        this.toasts.set(toastId, toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.hide(toastId), duration);
        }

        return toastId;
    }

    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(toastId);
            }, 400);
        }
    }

    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Enhanced Error Handler
class ErrorHandler {
    constructor(toastSystem) {
        this.toast = toastSystem;
        this.debugMode = NYMPH_CONFIG.DEBUG.ENABLED;
    }

    handle(error, context = '') {
        let message = 'An unexpected error occurred';
        let details = '';

        if (typeof error === 'string') {
            message = error;
        } else if (error instanceof Error) {
            message = error.message;
            details = error.stack;
        } else if (error && error.message) {
            message = error.message;
        }

        // Log to console if debug mode
        if (this.debugMode) {
            console.error(`[${context}]`, error);
            if (details) console.error('Stack trace:', details);
        }

        // Show user-friendly toast
        this.toast.error(message);

        // Return formatted error for additional handling
        return {
            message,
            details,
            context,
            timestamp: new Date().toISOString()
        };
    }

    handleStorageError(operation) {
        const message = `Storage operation failed: ${operation}. Your data may not be saved.`;
        this.toast.warning(message, 8000);
        
        if (this.debugMode) {
            console.warn('Storage quota may be exceeded or localStorage unavailable');
        }
    }

    handleNetworkError(operation) {
        const message = `Network error during ${operation}. Please check your connection.`;
        this.toast.error(message, 6000);
    }

    handleValidationError(errors) {
        const message = `Please fix ${errors.length} validation error${errors.length > 1 ? 's' : ''}`;
        this.toast.warning(message, 5000);
    }
}

// Safe localStorage operations with error handling
class SafeStorage {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
    }

    setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.errorHandler.handleStorageError('save (quota exceeded)');
            } else {
                this.errorHandler.handle(error, 'localStorage.setItem');
            }
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            this.errorHandler.handle(error, 'localStorage.getItem');
            return defaultValue;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'localStorage.removeItem');
            return false;
        }
    }
}

// Initialize systems
const validator = new FormValidator();
const toastSystem = new ToastNotification();
const errorHandler = new ErrorHandler(toastSystem);
const safeStorage = new SafeStorage(errorHandler);

// Form validation rules
const bugFormValidation = {
    bugFeatureName: ['required', {minLength: 2}],
    bugExpectedBehavior: ['required', {minLength: 10}],
    bugActualBehavior: ['required', {minLength: 10}]
};

const featureFormValidation = {
    featureName: ['required', {minLength: 2}],
    expectedBehavior: ['required', {minLength: 10}],
    featureImportance: ['required', {minLength: 5}],
    desirability: ['required', {minLength: 5}]
};

// Real-time validation setup
function setupRealTimeValidation() {
    // Bug form fields
    Object.keys(bugFormValidation).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => {
                validator.validateField(field, bugFormValidation[fieldId]);
            });
            
            field.addEventListener('input', () => {
                // Clear error state on typing
                const fieldContainer = field.closest('.form-field');
                if (fieldContainer && fieldContainer.classList.contains('invalid')) {
                    fieldContainer.classList.remove('invalid');
                    const errorElement = fieldContainer.querySelector('.error-message');
                    if (errorElement) errorElement.textContent = '';
                }
            });
        }
    });

    // Feature form fields
    Object.keys(featureFormValidation).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => {
                validator.validateField(field, featureFormValidation[fieldId]);
            });
            
            field.addEventListener('input', () => {
                const fieldContainer = field.closest('.form-field');
                if (fieldContainer && fieldContainer.classList.contains('invalid')) {
                    fieldContainer.classList.remove('invalid');
                    const errorElement = fieldContainer.querySelector('.error-message');
                    if (errorElement) errorElement.textContent = '';
                }
            });
        }
    });
}

// Enhanced form submission
function enhancedSubmitBugForm() {
    try {
        // Validate form
        const validation = validator.validateForm('bug-form', bugFormValidation);
        
        if (!validation.isValid) {
            errorHandler.handleValidationError(validation.errors);
            return false;
        }

        // Get form values
        const formData = {
            featureName: document.getElementById('bugFeatureName').value.trim(),
            expectedBehaviour: document.getElementById('bugExpectedBehavior').value.trim(),
            actualBehaviour: document.getElementById('bugActualBehavior').value.trim(),
            errorCode: document.getElementById('bugErrorCode').value.trim(),
            errorMessage: document.getElementById('bugErrorMessage').value.trim()
        };

        // Create entry
        const entry = {
            id: Date.now(),
            type: 'Bug',
            ...formData,
            featureImportance: '',
            desirability: '',
            priority: 'Normal',
            status: 'Open',
            date: new Date().toISOString().split('T')[0]
        };

        // Save to storage
        const entries = safeStorage.getItem(NYMPH_CONFIG.DATA.STORAGE_KEY, []);
        entries.push(entry);
        
        if (safeStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, entries)) {
            // Success
            toastSystem.success('Bug report submitted successfully!');
            
            // Clear form
            Object.keys(bugFormValidation).forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = '';
                    const fieldContainer = field.closest('.form-field');
                    if (fieldContainer) {
                        fieldContainer.classList.remove('valid', 'invalid');
                    }
                }
            });
            
            // Clear optional fields
            document.getElementById('bugErrorCode').value = '';
            document.getElementById('bugErrorMessage').value = '';
            
            // Update UI
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof updateDataTable === 'function') updateDataTable();
            
            return true;
        } else {
            return false;
        }
        
    } catch (error) {
        errorHandler.handle(error, 'Bug Form Submission');
        return false;
    }
}

// Export for global access
window.validator = validator;
window.toastSystem = toastSystem;
window.errorHandler = errorHandler;
window.safeStorage = safeStorage;
window.enhancedSubmitBugForm = enhancedSubmitBugForm;
window.setupRealTimeValidation = setupRealTimeValidation;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupRealTimeValidation);
} else {
    setupRealTimeValidation();
}