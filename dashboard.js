// Dashboard update functions extracted from scripts.js

export function updateDashboard() {
    const bugs = window.entries.filter(e => e.type === 'Bug');
    const features = window.entries.filter(e => e.type === 'Feature Request');
    const openBugs = bugs.filter(b => b.status === 'Open');
    const resolvedBugs = bugs.filter(b => b.status === 'Resolved');

    document.getElementById('totalBugs').textContent = bugs.length;
    document.getElementById('openBugs').textContent = openBugs.length;
    document.getElementById('resolvedBugs').textContent = resolvedBugs.length;
    document.getElementById('featureRequests').textContent = features.length;

    updateGraph(bugs.length, openBugs.length, resolvedBugs.length, features.length);
}

export function updateGraph(total, open, resolved, features) {
    const maxValue = Math.max(total, open, resolved, features, 1);
    const totalPercent = (total / maxValue) * 100;
    const openPercent = (open / maxValue) * 100;
    const resolvedPercent = (resolved / maxValue) * 100;
    const featuresPercent = (features / maxValue) * 100;

    document.getElementById('totalBar').style.height = totalPercent + '%';
    document.getElementById('openBar').style.height = openPercent + '%';
    document.getElementById('resolvedBar').style.height = resolvedPercent + '%';
    document.getElementById('featureBar').style.height = featuresPercent + '%';

    document.getElementById('totalValue').textContent = total;
    document.getElementById('openValue').textContent = open;
    document.getElementById('resolvedValue').textContent = resolved;
    document.getElementById('featureValue').textContent = features;
}

export function updateDataTable() {
    const tableBody = document.getElementById('dataTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    window.entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
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

        cells.forEach(cellData => {
            const cell = document.createElement('td');
            cell.style.cssText = 'padding: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
            cell.textContent = cellData;
            row.appendChild(cell);
        });

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

        const dateCell = document.createElement('td');
        dateCell.style.cssText = 'padding: 8px; border: 1px solid rgba(255, 255, 255, 0.1);';
        dateCell.textContent = entry.date;
        row.appendChild(dateCell);

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
}

export function updateEntryPriority(index, newPriority) {
    window.entries[index].priority = newPriority;
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(window.entries));
    updateDashboard();
}

export function updateEntryStatus(index, newStatus) {
    window.entries[index].status = newStatus;
    localStorage.setItem(NYMPH_CONFIG.DATA.STORAGE_KEY, JSON.stringify(window.entries));
    updateDashboard();
}
