// Form-related helpers

function initializeBugFormHandlers() {
    const submitBtn = document.querySelector('#bug-section .submit-btn');
    const cancelBtn = document.querySelector('#bug-section .reset-btn');

    if (submitBtn) {
        submitBtn.addEventListener('click', submitBugForm);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', clearBugForm);
    }
}

