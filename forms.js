import { updateDashboard, updateDataTable } from './dashboard.js';

// Bug form submission
export function submitBugForm() {
    const featureName = document.getElementById('bugFeatureName').value;
    const expectedBehaviour = document.getElementById('bugExpectedBehavior').value;
    const actualBehaviour = document.getElementById('bugActualBehavior').value;
    const errorCode = document.getElementById('bugErrorCode').value;
    const errorMessage = document.getElementById('bugErrorMessage').value;

    if (!featureName.trim()) {
        alert('Please fill in the Feature Name field.');
        return;
    }

    const entry = {
        id: Date.now(),
        type: 'Bug',
        featureName,
        expectedBehaviour,
        actualBehaviour,
        errorCode,
        errorMessage,
        featureImportance: '',
        desirability: '',
        priority: 'Normal',
        status: 'Open',
        date: new Date().toISOString().split('T')[0]
    };

    window.entries.push(entry);
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(window.entries));

    alert('Bug report submitted successfully!');
    clearBugForm();
    updateDashboard();
    updateDataTable();
}

export function clearBugForm() {
    document.getElementById('bugFeatureName').value = '';
    document.getElementById('bugExpectedBehavior').value = '';
    document.getElementById('bugActualBehavior').value = '';
    document.getElementById('bugErrorCode').value = '';
    document.getElementById('bugErrorMessage').value = '';
}

export function initializeFormHandlers() {
    const featureForm = document.getElementById('featureForm');
    if (featureForm) {
        featureForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const entry = {
                id: Date.now(),
                type: 'Feature Request',
                featureName: document.getElementById('featureName').value,
                expectedBehaviour: document.getElementById('expectedBehavior').value,
                actualBehaviour: '',
                errorCode: '',
                errorMessage: '',
                featureImportance: document.getElementById('featureImportance').value,
                desirability: document.getElementById('desirability').value,
                priority: 'Normal',
                status: 'Open',
                date: new Date().toISOString().split('T')[0]
            };

            window.entries.push(entry);
            localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(window.entries));

            this.reset();
            updateDashboard();
            updateDataTable();
            window.showSection('dashboard-section');
            window.updatePageTitle('dashboard-section');
        });
    }
}
