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

// Typography Settings Functions (unchanged)
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
    initializeFormHandlers();
    window.addEventListener('scroll', handleScroll);
    setTimeout(updateDataTable, 100);
}

document.readyState === 'loading' ?
    document.addEventListener('DOMContentLoaded', initialize) :
    initialize();
