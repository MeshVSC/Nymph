
console.log('reports.js: Script loaded and executing.');

/* 
=======================================================
NYMPH v2 - REPORTS (Bug & Feature)
=======================================================
Dedicated script for bug-reports.html and feature-requests.html
*/

document.addEventListener('DOMContentLoaded', () => {
    console.log('reports.js: DOMContentLoaded event fired.');
    console.log('reports.js: NYMPH config:', NYMPH);

    if (typeof supabase === 'undefined') {
        console.error('reports.js: Supabase client library not loaded.');
        return;
    }

    const supabaseClient = supabase.createClient(NYMPH.SUPABASE.URL, NYMPH.SUPABASE.ANON_KEY);
    console.log('reports.js: Supabase client created.', supabaseClient);

    const page = document.body.id;
    console.log('reports.js: Current page ID:', page);

    if (page === 'bug-reports-page') {
        loadBugReports(supabaseClient);
    } else if (page === 'feature-requests-page') {
        loadFeatureRequests(supabaseClient);
    }

    setupScrollNavigation();
});

async function loadBugReports(supabaseClient) {
    console.log('reports.js: Loading bug reports...');
    const openBugsList = document.getElementById('openBugsList');
    const resolvedBugsList = document.getElementById('resolvedBugsList');
    const openBugsCount = document.getElementById('openBugsCount');
    const resolvedBugsCount = document.getElementById('resolvedBugsCount');

    setLoadingState(openBugsList, resolvedBugsList);

    try {
        const { data, error } = await supabaseClient
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('reports.js: Supabase fetch error for bug reports:', error);
            throw error;
        }
        console.log('reports.js: Fetched bug reports data:', data);

        const openBugs = data.filter(item => item.status === 'Open');
        const resolvedBugs = data.filter(item => item.status === 'Resolved' || item.status === 'Closed');

        renderReportList(openBugsList, openBugs, 'bug');
        renderReportList(resolvedBugsList, resolvedBugs, 'bug');

        openBugsCount.textContent = openBugs.length;
        resolvedBugsCount.textContent = resolvedBugs.length;

    } catch (error) {
        console.error('reports.js: Error loading bug reports:', error);
        setErrorState(openBugsList, resolvedBugsList);
    }
}

async function loadFeatureRequests(supabaseClient) {
    console.log('reports.js: Loading feature requests...');
    const openFeaturesList = document.getElementById('openFeaturesList');
    const closedFeaturesList = document.getElementById('closedFeaturesList');
    const openFeaturesCount = document.getElementById('openFeaturesCount');
    const closedFeaturesCount = document.getElementById('closedFeaturesCount');

    setLoadingState(openFeaturesList, closedFeaturesList);

    try {
        const { data, error } = await supabaseClient
            .from('feature_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('reports.js: Supabase fetch error for feature requests:', error);
            throw error;
        }
        console.log('reports.js: Fetched feature requests data:', data);

        const openFeatures = data.filter(item => item.status === 'Open');
        const closedFeatures = data.filter(item => item.status === 'Closed' || item.status === 'Resolved');

        renderReportList(openFeaturesList, openFeatures, 'feature');
        renderReportList(closedFeaturesList, closedFeatures, 'feature');

        openFeaturesCount.textContent = openFeatures.length;
        closedFeaturesCount.textContent = closedFeatures.length;

    } catch (error) {
        console.error('reports.js: Error loading feature requests:', error);
        setErrorState(openFeaturesList, closedFeaturesList);
    }
}

function renderReportList(container, items, type) {
    console.log(`reports.js: renderReportList called for container: ${container.id}, with ${items.length} items of type ${type}.`);
    console.log('reports.js: Container element:', container);

    if (!container) {
        console.error(`reports.js: Container element with ID ${container.id} not found.`);
        return;
    }

    container.innerHTML = '';
    console.log(`reports.js: Container ${container.id} innerHTML cleared.`);

    if (items.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No ${type}s found</div>`;
        console.log(`reports.js: No ${type}s found message set for ${container.id}.`);
        return;
    }

    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'notification-item';
        itemEl.style.cursor = 'pointer'; // Add cursor for consistency

        let priorityIcon;
        if (type === 'bug') {
            priorityIcon = item.priority === 'Critical' ? '🔴' : 
                           item.priority === 'High' ? '🟠' : 
                           item.priority === 'Normal' ? '🟡' : '🟢';
        } else {
            priorityIcon = item.priority === 'Critical' ? '⭐' : 
                           item.priority === 'High' ? '🔸' : 
                           item.priority === 'Normal' ? '🔹' : '◽';
        }

        const itemTitle = item.feature_name || item.featureName || 'Untitled';
        itemEl.innerHTML = `
            <div class="notification-title">${priorityIcon} ${itemTitle}</div>
            <div class="notification-status">${item.status}</div>
            <div class="notification-desc">${(item.expected_behavior || item.expectedBehavior || '').substring(0, 100)}...</div>
        `;
        console.log(`reports.js: Item ${index} HTML generated:`, itemEl.innerHTML);
        console.log(`reports.js: Appending item ${index} to container ${container.id}.`);
        const appendResult = container.appendChild(itemEl);
        console.log(`reports.js: Append result for item ${index}:`, appendResult);
    });
    console.log(`reports.js: Finished rendering items for container: ${container.id}.`);
}

function setLoadingState(...lists) {
    lists.forEach(list => {
        if(list) list.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">Loading...</div>';
    });
}

function setErrorState(...lists) {
    lists.forEach(list => {
        if(list) list.innerHTML = '<div style="text-align: center; color: var(--error); padding: 20px;">Error loading data.</div>';
    });
}

function setupScrollNavigation() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
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
    });
}

