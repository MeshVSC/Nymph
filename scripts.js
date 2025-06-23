/*
=======================================================
NYMPH BUG TRACKER - CORE LOGIC
=======================================================
Main coordination script now imports modular features
*/

import { initBackground } from './background.js';
import { submitBugForm, clearBugForm, initializeFormHandlers } from './forms.js';
import { updateDashboard, updateDataTable } from './dashboard.js';

// Expose form functions for inline event handlers
window.submitBugForm = submitBugForm;
window.clearBugForm = clearBugForm;

// Page titles and subtitles from config
const pageTitles = {
    [NYMPH_CONFIG.PAGES.DASHBOARD.id]: {
        title: NYMPH_CONFIG.PAGES.DASHBOARD.title,
        subtitle: NYMPH_CONFIG.PAGES.DASHBOARD.subtitle
    },
    [NYMPH_CONFIG.PAGES.BUG_REPORT.id]: {
        title: NYMPH_CONFIG.PAGES.BUG_REPORT.title,
        subtitle: NYMPH_CONFIG.PAGES.BUG_REPORT.subtitle
    },
    [NYMPH_CONFIG.PAGES.FEATURE_REQUEST.id]: {
        title: NYMPH_CONFIG.PAGES.FEATURE_REQUEST.title,
        subtitle: NYMPH_CONFIG.PAGES.FEATURE_REQUEST.subtitle
    },
    [NYMPH_CONFIG.PAGES.SETTINGS.id]: {
        title: NYMPH_CONFIG.PAGES.SETTINGS.title,
        subtitle: NYMPH_CONFIG.PAGES.SETTINGS.subtitle
    }
};

// Navigation function
function showSection(sectionId, sourceEvent = null) {

    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('showSection called with:', sectionId, sourceEvent);
    }
    
    // Hide all sections

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    if (sourceEvent && sourceEvent.target) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navItem = sourceEvent.target.closest('.nav-item');
        if (navItem) navItem.classList.add('active');
    }

    updatePageTitle(sectionId);

    if (sectionId === 'settings-section') {
        setTimeout(updateDataTable, 50);
    }
}
window.showSection = showSection;

// Update page title function
function updatePageTitle(sectionId) {
    const pageInfo = pageTitles[sectionId];
    if (pageInfo) {
        document.querySelector('.app-title h1').textContent = pageInfo.title;
        const subtitleElement = document.querySelector('.app-title .subtitle');
        if (subtitleElement) subtitleElement.textContent = pageInfo.subtitle;
    }
}
window.updatePageTitle = updatePageTitle;

// Data storage using config
window.entries = JSON.parse(localStorage.getItem(NYMPH_CONFIG.DATA.STORAGE_KEY)) || NYMPH_CONFIG.DATA.DEFAULT_ENTRIES;


    // Update stat cards
    document.getElementById('totalBugs').textContent = bugs.length;
    document.getElementById('openBugs').textContent = openBugs.length;
    document.getElementById('resolvedBugs').textContent = resolvedBugs.length;
    document.getElementById('featureRequests').textContent = features.length;
    
    // Update graph
    updateGraph(bugs.length, openBugs.length, resolvedBugs.length, features.length);
}

// Update graph bars
function updateGraph(total, open, resolved, features) {
    const maxValue = Math.max(total, open, resolved, features, 1); // Avoid division by zero
    
    // Calculate percentages
    const totalPercent = (total / maxValue) * 100;
    const openPercent = (open / maxValue) * 100;
    const resolvedPercent = (resolved / maxValue) * 100;
    const featuresPercent = (features / maxValue) * 100;
    
    // Update bar heights with animation
    document.getElementById('totalBar').style.height = totalPercent + '%';
    document.getElementById('openBar').style.height = openPercent + '%';
    document.getElementById('resolvedBar').style.height = resolvedPercent + '%';
    document.getElementById('featureBar').style.height = featuresPercent + '%';
    
    // Update values
    document.getElementById('totalValue').textContent = total;
    document.getElementById('openValue').textContent = open;
    document.getElementById('resolvedValue').textContent = resolved;
    document.getElementById('featureValue').textContent = features;
}

// Bug form submission function
function submitBugForm() {
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('submitBugForm called');
    }
    
    // Get values
    const featureName = document.getElementById('bugFeatureName').value;
    const expectedBehaviour = document.getElementById('bugExpectedBehavior').value;
    const actualBehaviour = document.getElementById('bugActualBehavior').value;
    const errorCode = document.getElementById('bugErrorCode').value;
    const errorMessage = document.getElementById('bugErrorMessage').value;
    
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('Form values:', { featureName, expectedBehaviour, actualBehaviour, errorCode, errorMessage });
    }
    
    // Check if at least feature name is filled
    if (!featureName.trim()) {
        alert('Please fill in the Feature Name field.');
        return;
    }
    
    const entry = {
        id: Date.now(),
        type: 'Bug',
        featureName: featureName,
        expectedBehaviour: expectedBehaviour,
        actualBehaviour: actualBehaviour,
        errorCode: errorCode,
        errorMessage: errorMessage,
        featureImportance: '',
        desirability: '',
        priority: 'Normal',
        status: 'Open',
        date: new Date().toISOString().split('T')[0]
    };
    
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('Created entry:', entry);
        console.log('entries before push:', entries);
    }
    
    // Add to entries array
    entries.push(entry);
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('entries after push:', entries);
    }
    
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(entries));
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('Saved to localStorage with key:', NYMPH_CONFIG.DATA.STORAGE_KEY);
    }
    
    // Show confirmation
    alert('Bug report submitted successfully!');
    
    // Clear form
    document.getElementById('bugFeatureName').value = '';
    document.getElementById('bugExpectedBehavior').value = '';
    document.getElementById('bugActualBehavior').value = '';
    document.getElementById('bugErrorCode').value = '';
    document.getElementById('bugErrorMessage').value = '';
    
    // Update UI
    updateDashboard();
    updateDataTable();
    
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('Form submission completed');
    }
}

// Update data table with dropdowns  
function updateDataTable() {
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('updateDataTableWithDropdowns called');
    }
    const tableBody = document.getElementById('dataTableBody');
    if (!tableBody) {
        if (NYMPH_CONFIG.DEBUG.ENABLED) {
            console.log('tableBody not found');
        }
        return;
    }
    
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('entries:', entries);
    }
    tableBody.innerHTML = '';
    
    entries.forEach((entry, index) => {
        if (NYMPH_CONFIG.DEBUG.ENABLED) {
            console.log('Processing entry:', entry);
        }
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        
        // Create cells manually
        const cells = [
            entry.type,
            entry.featureName || '',
            entry.expectedBehaviour || '',
            entry.actualBehaviour || '',
            entry.errorCode || '',
            entry.errorMessage || '',
            entry.featureImportance || '',
            entry.desirability || ''
        ];
        
        // Add regular cells
        cells.forEach(cellData => {
            const cell = document.createElement('td');
            cell.style.cssText = 'padding: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
            cell.textContent = cellData;
            row.appendChild(cell);
        });
        
        // Priority dropdown cell
        const priorityCell = document.createElement('td');
        priorityCell.style.cssText = 'padding: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
        const prioritySelect = document.createElement('select');
        prioritySelect.style.cssText = 'background: rgba(0, 0, 0, 0.3); border: none; color: white; padding: 4px; width: 100%;';
        prioritySelect.onchange = function() { updateEntryPriority(index, this.value); };
        
        ['Low', 'Normal', 'High', 'Critical'].forEach(priority => {
            const option = document.createElement('option');
            option.value = priority;
            option.textContent = priority;
            option.selected = entry.priority === priority;
            prioritySelect.appendChild(option);
        });
        priorityCell.appendChild(prioritySelect);
        row.appendChild(priorityCell);
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.style.cssText = 'padding: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
        dateCell.textContent = entry.date;
        row.appendChild(dateCell);
        
        // Status dropdown cell
        const statusCell = document.createElement('td');
        statusCell.style.cssText = 'padding: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
        const statusSelect = document.createElement('select');
        statusSelect.style.cssText = 'background: rgba(0, 0, 0, 0.3); border: none; color: white; padding: 4px; width: 100%;';
        statusSelect.onchange = function() { updateEntryStatus(index, this.value); };
        
        ['Open', 'In Progress', 'Resolved', 'Closed'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            option.selected = entry.status === status;
            statusSelect.appendChild(option);
        });
        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);
        
        tableBody.appendChild(row);
    });
    
    if (NYMPH_CONFIG.DEBUG.ENABLED) {
        console.log('Table updated with', entries.length, 'entries with dropdowns');
    }
}

// Clear bug form function
function clearBugForm() {
    document.getElementById('bugFeatureName').value = '';
    document.getElementById('bugExpectedBehavior').value = '';
    document.getElementById('bugActualBehavior').value = '';
    document.getElementById('bugErrorCode').value = '';
    document.getElementById('bugErrorMessage').value = '';
}

// Form submissions
function initializeFormHandlers() {
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
            
            entries.push(entry);
            localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(entries));
            
            this.reset();
            updateDashboard();
            updateDataTable();
            showSection('dashboard-section');
            updatePageTitle('dashboard-section');
        });
    }
}

// Attach click handlers for action cards
function attachActionCardHandlers() {
    document.querySelectorAll('.action-card[data-section]').forEach(card => {
        card.addEventListener('click', e => {
            const target = card.getAttribute('data-section');
            if (target) {
                showSection(target, e);
                updatePageTitle(target);
            }
        });
    });
}

// Attach click handlers for navigation items
function attachNavigationHandlers() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', e => {
            const target = item.getAttribute('data-section');
            if (target) {
                showSection(target, e);
                updatePageTitle(target);
            }
        });
    });
}


// Update entry priority
function updateEntryPriority(index, newPriority) {
    entries[index].priority = newPriority;
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(entries));
    updateDashboard(); // Refresh dashboard stats
}

// Update entry status
function updateEntryStatus(index, newStatus) {
    entries[index].status = newStatus;
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(entries));
    updateDashboard(); // Refresh dashboard stats
}

// Randomize planet starting positions
function randomizePlanets() {
    for (let i = 1; i <= 5; i++) {
        const orbit = document.getElementById(`orbit-${i}`);
        if (orbit) {
            const randomRotation = Math.random() * 360;
            orbit.style.transform = `translate(-50%, -50%) rotate(${randomRotation}deg)`;
        }
    }
}

// Typography Settings Functions

function applyTypographySettings() {
    const titlePx = document.getElementById('title-px').value;
    const titleWeight = document.getElementById('title-weight').value;
    const subtitlePx = document.getElementById('subtitle-px').value;
    const subtitleWeight = document.getElementById('subtitle-weight').value;
    const cardTitlePx = document.getElementById('cardtitle-px').value;
    const cardTitleWeight = document.getElementById('cardtitle-weight').value;
    const cardSubtitlePx = document.getElementById('cardsubtitle-px').value;
    const cardSubtitleWeight = document.getElementById('cardsubtitle-weight').value;
    const buttonTitlePx = document.getElementById('buttontitle-px').value;
    const buttonTitleWeight = document.getElementById('buttontitle-weight').value;

    const style = document.createElement('style');
    style.id = 'dynamic-typography';
    style.textContent = `
        h1 { font-size: ${titlePx}px; font-weight: ${titleWeight}; }
        h2 { font-size: ${subtitlePx}px; font-weight: ${subtitleWeight}; }
        .activity-title { font-size: ${cardTitlePx}px; font-weight: ${cardTitleWeight}; }
        .activity-subtitle { font-size: ${cardSubtitlePx}px; font-weight: ${cardSubtitleWeight}; }
        button { font-size: ${buttonTitlePx}px; font-weight: ${buttonTitleWeight}; }
    `;
    const existing = document.getElementById('dynamic-typography');
    if (existing) existing.remove();
    document.head.appendChild(style);

    const settings = {
        titlePx,
        titleWeight,
        subtitlePx,
        subtitleWeight,
        cardTitlePx,
        cardTitleWeight,
        cardSubtitlePx,
        cardSubtitleWeight,
        buttonTitlePx,
        buttonTitleWeight
    };
    localStorage.setItem('typographySettings', JSON.stringify(settings));
    alert('Typography settings applied successfully!');
}
window.applyTypographySettings = applyTypographySettings;

function resetTypographySettings() {
    document.getElementById('title-px').value = '56';
    document.getElementById('title-weight').value = '300';
    document.getElementById('subtitle-px').value = '28';
    document.getElementById('subtitle-weight').value = '350';
    document.getElementById('cardtitle-px').value = '24';
    document.getElementById('cardtitle-weight').value = '300';
    document.getElementById('cardsubtitle-px').value = '15';
    document.getElementById('cardsubtitle-weight').value = '400';
    document.getElementById('buttontitle-px').value = '16';
    document.getElementById('buttontitle-weight').value = '500';
    const existingStyle = document.getElementById('dynamic-typography');
    if (existingStyle) existingStyle.remove();
    localStorage.removeItem('typographySettings');
    alert('Typography settings reset to defaults!');
}
window.resetTypographySettings = resetTypographySettings;

function loadSavedTypographySettings() {
    const saved = localStorage.getItem('typographySettings');
    if (saved) {
        const settings = JSON.parse(saved);
        const titlePxEl = document.getElementById('title-px');
        const titleWeightEl = document.getElementById('title-weight');
        const subtitlePxEl = document.getElementById('subtitle-px');
        const subtitleWeightEl = document.getElementById('subtitle-weight');
        const cardTitlePxEl = document.getElementById('cardtitle-px');
        const cardTitleWeightEl = document.getElementById('cardtitle-weight');
        const cardSubtitlePxEl = document.getElementById('cardsubtitle-px');
        const cardSubtitleWeightEl = document.getElementById('cardsubtitle-weight');
        const buttonTitlePxEl = document.getElementById('buttontitle-px');
        const buttonTitleWeightEl = document.getElementById('buttontitle-weight');

        if (titlePxEl) titlePxEl.value = settings.titlePx || '56';
        if (titleWeightEl) titleWeightEl.value = settings.titleWeight || '300';
        if (subtitlePxEl) subtitlePxEl.value = settings.subtitlePx || '28';
        if (subtitleWeightEl) subtitleWeightEl.value = settings.subtitleWeight || '350';
        if (cardTitlePxEl) cardTitlePxEl.value = settings.cardTitlePx || '24';
        if (cardTitleWeightEl) cardTitleWeightEl.value = settings.cardTitleWeight || '300';
        if (cardSubtitlePxEl) cardSubtitlePxEl.value = settings.cardSubtitlePx || '15';
        if (cardSubtitleWeightEl) cardSubtitleWeightEl.value = settings.cardSubtitleWeight || '400';
        if (buttonTitlePxEl) buttonTitlePxEl.value = settings.buttonTitlePx || '16';
        if (buttonTitleWeightEl) buttonTitleWeightEl.value = settings.buttonTitleWeight || '500';

        applyTypographySettings();
    }
}

// Scroll detection for navigation switching
let lastScrollTop = 0;
function handleScroll() {
    const topNav = document.getElementById('topNav');
    const sideNav = document.getElementById('sideNav');
    if (!topNav || !sideNav) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 100) {
        topNav.classList.add('hidden');
        sideNav.classList.add('visible');
    } else {
        topNav.classList.remove('hidden');
        sideNav.classList.remove('visible');
    }
    lastScrollTop = scrollTop;
}

function initialize() {
    initBackground();
    updateDashboard();
    updateDataTable();
    loadSavedTypographySettings();
    updatePageTitle('dashboard-section');


    attachActionCardHandlers();
    attachNavigationHandlers();
    
    // Initialize form handlers

    initializeFormHandlers();
    window.addEventListener('scroll', handleScroll);
    setTimeout(updateDataTable, 100);
}

document.readyState === 'loading' ?
    document.addEventListener('DOMContentLoaded', initialize) :
    initialize();

}

