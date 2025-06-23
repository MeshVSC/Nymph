/* 
=======================================================
NYMPH BUG TRACKER - EXTRACTED SCRIPTS
=======================================================
Extracted from single HTML file for better maintainability
*/

// Create enhanced twinkling stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    const config = NYMPH_CONFIG.ANIMATIONS.STARS;
    
    for (let i = 0; i < config.COUNT; i++) {
        const star = document.createElement('div');
        
        // Assign random star sizes using config
        const rand = Math.random();
        if (rand < config.SIZES.SMALL_CHANCE) {
            star.className = 'star small';
        } else if (rand < config.SIZES.MEDIUM_CHANCE) {
            star.className = 'star medium';
        } else {
            star.className = 'star large';
        }
        
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * config.TWINKLE.MAX_DELAY + 's';
        star.style.animationDuration = (config.TWINKLE.MIN_DURATION + Math.random() * (config.TWINKLE.MAX_DURATION - config.TWINKLE.MIN_DURATION)) / 1000 + 's';
        starsContainer.appendChild(star);
    }
}

// Create distant galaxies
function createGalaxies() {
    const galaxiesContainer = document.getElementById('galaxies');
    const config = NYMPH_CONFIG.ANIMATIONS.GALAXIES;
    
    for (let i = 0; i < config.COUNT; i++) {
        const galaxy = document.createElement('div');
        
        // Assign random galaxy types from config
        const type = config.TYPES[Math.floor(Math.random() * config.TYPES.length)];
        galaxy.className = `galaxy ${type}`;
        
        // Random sizes using config
        const size = config.SIZE.MIN + Math.random() * (config.SIZE.MAX - config.SIZE.MIN);
        const heightFactor = config.SIZE.HEIGHT_FACTOR.MIN + Math.random() * (config.SIZE.HEIGHT_FACTOR.MAX - config.SIZE.HEIGHT_FACTOR.MIN);
        galaxy.style.width = size + 'px';
        galaxy.style.height = size * heightFactor + 'px';
        
        galaxy.style.left = Math.random() * 100 + '%';
        galaxy.style.top = Math.random() * 100 + '%';
        galaxy.style.animationDelay = Math.random() * config.PULSE_DELAY_MAX + 's';
        galaxiesContainer.appendChild(galaxy);
    }
}

// Create falling meteors
function createMeteor() {
    const meteorsContainer = document.getElementById('meteors');
    const config = NYMPH_CONFIG.ANIMATIONS.METEORS;
    const meteor = document.createElement('div');
    meteor.className = 'meteor';
    
    // Random starting position (off-screen top-right)
    meteor.style.left = (100 + Math.random() * 10) + '%';
    meteor.style.top = (Math.random() * 50 - 10) + '%';
    
    // Animation with config-based duration
    const duration = config.DURATION_MIN + Math.random() * (config.DURATION_MAX - config.DURATION_MIN);
    meteor.style.animation = `meteorFall ${duration / 1000}s linear`;
    
    meteorsContainer.appendChild(meteor);
    
    // Remove meteor after animation using config
    setTimeout(() => {
        if (meteor.parentNode) {
            meteor.parentNode.removeChild(meteor);
        }
    }, config.CLEANUP_DELAY);
}

// Start meteor shower
function startMeteorShower() {
    const config = NYMPH_CONFIG.ANIMATIONS.METEORS;
    
    // Create meteors at random intervals using config
    setInterval(() => {
        if (Math.random() < config.SPAWN_CHANCE) {
            createMeteor();
        }
    }, config.INTERVAL);
}

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
    console.log('showSection called with:', sectionId, sourceEvent);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error('Section not found:', sectionId);
    }
    
    // Update navigation - only if we have a source event
    if (sourceEvent && sourceEvent.target) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = sourceEvent.target.closest('.nav-item');
        if (navItem) {
            navItem.classList.add('active');
        }
    }
    
    // Update page title and subtitle
    updatePageTitle(sectionId);
    
    // Refresh data table when going to settings
    if (sectionId === 'settings-section') {
        setTimeout(() => {
            updateDataTable();
        }, 50);
    }
}

// Update page title function
function updatePageTitle(sectionId) {
    const pageInfo = pageTitles[sectionId];
    if (pageInfo) {
        document.querySelector('.app-title h1').textContent = pageInfo.title;
        const subtitleElement = document.querySelector('.app-title .subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = pageInfo.subtitle;
        }
    }
}

// Data storage using config
let entries = JSON.parse(localStorage.getItem(NYMPH_CONFIG.DATA.STORAGE_KEY)) || NYMPH_CONFIG.DATA.DEFAULT_ENTRIES;

// Update dashboard stats
function updateDashboard() {
    const bugs = entries.filter(e => e.type === 'Bug');
    const features = entries.filter(e => e.type === 'Feature Request');
    const openBugs = bugs.filter(b => b.status === 'Open');
    const resolvedBugs = bugs.filter(b => b.status === 'Resolved');

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
    console.log('submitBugForm called');
    
    // Get values
    const featureName = document.getElementById('bugFeatureName').value;
    const expectedBehaviour = document.getElementById('bugExpectedBehavior').value;
    const actualBehaviour = document.getElementById('bugActualBehavior').value;
    const errorCode = document.getElementById('bugErrorCode').value;
    const errorMessage = document.getElementById('bugErrorMessage').value;
    
    console.log('Form values:', { featureName, expectedBehaviour, actualBehaviour, errorCode, errorMessage });
    
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
    
    console.log('Created entry:', entry);
    console.log('entries before push:', entries);
    
    // Add to entries array
    entries.push(entry);
    console.log('entries after push:', entries);
    
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(entries));
    console.log('Saved to localStorage with key:', NYMPH_CONFIG.DATA.STORAGE_KEY);
    
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
    
    console.log('Form submission completed');
}

// Update data table with dropdowns  
function updateDataTable() {
    console.log('updateDataTableWithDropdowns called');
    const tableBody = document.getElementById('dataTableBody');
    if (!tableBody) {
        console.log('tableBody not found');
        return;
    }
    
    console.log('entries:', entries);
    tableBody.innerHTML = '';
    
    entries.forEach((entry, index) => {
        console.log('Processing entry:', entry);
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
    
    console.log('Table updated with', entries.length, 'entries with dropdowns');
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
    // Get all input values
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

    // Create dynamic CSS
    const dynamicStyles = `
        /* Dynamic Typography Styles */
        .app-title h1 {
            font-size: ${titlePx}px !important;
            font-weight: ${titleWeight} !important;
        }
        .app-title .subtitle {
            font-size: ${subtitlePx}px !important;
            font-weight: ${subtitleWeight} !important;
        }
        .activity-title {
            font-size: ${cardTitlePx}px !important;
            font-weight: ${cardTitleWeight} !important;
        }
        .activity-name, .system-label {
            font-size: ${cardSubtitlePx}px !important;
            font-weight: ${cardSubtitleWeight} !important;
        }
        .action-title, .widget-label {
            font-size: ${buttonTitlePx}px !important;
            font-weight: ${buttonTitleWeight} !important;
        }
    `;

    // Remove existing dynamic styles
    const existingStyle = document.getElementById('dynamic-typography');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Add new dynamic styles
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-typography';
    styleElement.textContent = dynamicStyles;
    document.head.appendChild(styleElement);

    // Save settings to localStorage
    const settings = {
        titlePx, titleWeight,
        subtitlePx, subtitleWeight,
        cardTitlePx, cardTitleWeight,
        cardSubtitlePx, cardSubtitleWeight,
        buttonTitlePx, buttonTitleWeight
    };
    localStorage.setItem('typographySettings', JSON.stringify(settings));

    alert('Typography settings applied successfully!');
}

function resetTypographySettings() {
    // Reset to default values
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

    // Remove dynamic styles
    const existingStyle = document.getElementById('dynamic-typography');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Remove from localStorage
    localStorage.removeItem('typographySettings');

    alert('Typography settings reset to defaults!');
}

function loadSavedTypographySettings() {
    const saved = localStorage.getItem('typographySettings');
    if (saved) {
        const settings = JSON.parse(saved);
        
        // Check if elements exist before setting values
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
        
        // Apply the saved settings
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
        // User scrolled down - hide top nav, show side nav
        topNav.classList.add('hidden');
        sideNav.classList.add('visible');
    } else {
        // User at top - show top nav, hide side nav
        topNav.classList.remove('hidden');
        sideNav.classList.remove('visible');
    }
    
    lastScrollTop = scrollTop;
}

// Initialize everything when DOM is loaded
function initialize() {
    // Initialize background elements
    createGalaxies();
    createStars();
    startMeteorShower();
    randomizePlanets();
    
    // Initialize app functionality
    updateDashboard();
    updateDataTable();
    loadSavedTypographySettings();
    updatePageTitle('dashboard-section');
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Force refresh data table after short delay
    setTimeout(() => {
        updateDataTable();
    }, 100);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}