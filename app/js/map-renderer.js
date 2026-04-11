/**
 * Map Renderer - Simple version
 * Renders the plot map directly
 */

window.renderPlotMap = function() {
    console.log('renderPlotMap called');
    
    // Ensure we have data
    if (!window.api) {
        window.api = { plotDatabase: [] };
    }
    
    // Load sample data if no data available
    if (!window.api.plotDatabase || window.api.plotDatabase.length === 0) {
        console.log('No data, loading sample data...');
        if (window.loadSampleData) {
            window.loadSampleData();
        }
    }
    
    const plots = window.api.plotDatabase || [];
    console.log('Rendering map with', plots.length, 'plots');
    
    if (plots.length === 0) {
        console.warn('No plot data available!');
    }
    
    // Create a map of plot numbers to plot data
    const plotMap = new Map();
    plots.forEach(p => {
        const num = p['Plot No'] || p.plot_number || p['Plot Number'];
        if (num) plotMap.set(String(num), p);
    });
    
    // Define rows
    const rows = [
        // Top left - 160-166 block (South side)
        {id: 'r161', plots: [161,162,163,164,165,166]},
        {id: 'r160', plots: [160,159,158,157,156,155]},
        // 130-136 block (80 Foot Road) - 7 plots each
        {id: 'r130', plots: [130,131,132,133,134,135,136]},
        {id: 'r129', plots: [129,128,127,126,125,124,123]},
        // 98-104 block (30 Foot Road) - 7 plots each
        {id: 'r98', plots: [98,99,100,101,102,103,104]},
        {id: 'r97', plots: [97,96,95,94,93,92,91]},
        // 65-72 block (40 Foot Road)
        {id: 'r65', plots: [65,66,67,68,69,70,71,72]},
        {id: 'r64', plots: [64,63,62,61,60,59,58,57]},
        // 33-39 block (20 Foot Road)
        {id: 'r33', plots: [33,34,35,36,37,38,39]},
        {id: 'r32', plots: [32,31,30,29,28,27,26]},
        // Top right - 167-175 block
        {id: 'r167', plots: [167,168,169,170,171,172,173,174,175]},
        {id: 'r154', plots: [154,153,152,151,150,149,148,147,146]},
        // 137-145 block (30 Foot Road)
        {id: 'r137', plots: [137,138,139,140,141,142,143,144,145]},
        {id: 'r122', plots: [122,121,120,119,118,117,116,115,114]},
        // 105-113 block (30 Foot Road)
        {id: 'r105', plots: [105,106,107,108,109,110,111,112,113]},
        {id: 'r90', plots: [90,89,88,87,86,85,84,83,82]},
        // 73-81 block (40 Foot Road)
        {id: 'r73', plots: [73,74,75,76,77,78,79,80,81]},
        {id: 'r56', plots: [56,55,54,53,52,51,50,49,48]},
        // 40-47 block (30 Foot Road) - 8 plots each
        {id: 'r40', plots: [40,41,42,43,44,45,46,47]},
        {id: 'r25', plots: [25,24,23,22,21,20,19,18]},
        // 10-17 block - single row on right side
        {id: 'r10', plots: [10,11,12,13,14,15,16,17]},
        // Bottom left - plots 9, 8, 7, 6, 5
        {id: 'r9', plots: [9,8,7,6,5]},
        // Bottom right - plots 4, 3, 2, 1
        {id: 'r1', plots: [4,3,2,1]}
    ];
    
    let totalRendered = 0;
    
    rows.forEach(row => {
        const rowEl = document.getElementById(row.id);
        if (rowEl) {
            let html = '';
            row.plots.forEach(num => {
                const plot = plotMap.get(String(num));
                const owner = plot ? (plot['Owner'] || plot.owner_name || '') : '';
                const lrsPaid = plot ? (plot['LRS Paid'] || plot.lrs_paid || '') : '';
                // Determine status: lrs-paid, owned (has owner), reserved (in DB but no owner), available (not in DB)
                let status = 'available';
                if (plot) {
                    if (lrsPaid === 'Yes') {
                        status = 'lrs-paid';
                    } else if (owner) {
                        status = 'owned';
                    } else {
                        status = 'reserved';
                    }
                }
                html += `<td class="${status}" onclick="openEditModal(${num})"><span class="pn">${num}</span>${owner ? `<span class="po">${owner.substring(0, 2).toUpperCase()}</span>` : ''}</td>`;
                totalRendered++;
            });
            rowEl.innerHTML = html;
        }
    });
    
    console.log('Map rendered:', totalRendered, 'plots');
    
    // Show success message
    if (totalRendered > 0) {
        console.log(`✅ Map successfully rendered with ${totalRendered} plots`);
    } else {
        console.warn('⚠️ No plots were rendered - check if row IDs match HTML');
    }
};

// Function to show map and render it
window.showMapAndRender = function() {
    console.log('showMapAndRender called');
    
    // Hide home page elements (not the one inside map-page)
    const homePage = document.getElementById('home-page');
    if (homePage) homePage.style.display = 'none';
    
    // Hide other pages
    const pages = ['contacts-page', 'documents-page', 'gallery-page', 'plot-issues-page', 'meeting-notes-page'];
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('show');
        }
    });
    
    // Show map page
    const mapPage = document.getElementById('map-page');
    if (mapPage) {
        mapPage.style.display = 'block';
        mapPage.classList.add('show');
        console.log('Map page shown');
        
        // Ensure main-container inside map-page is visible
        const mapMainContainer = mapPage.querySelector('.main-container');
        if (mapMainContainer) {
            mapMainContainer.style.display = 'block';
        }
    } else {
        console.error('Map page element not found!');
    }
    
    // Ensure we have data
    if (!window.api || !window.api.plotDatabase || window.api.plotDatabase.length === 0) {
        console.log('No data, loading sample data...');
        if (window.loadSampleData) {
            window.loadSampleData();
        }
    } else {
        console.log('Data available:', window.api.plotDatabase.length, 'plots');
    }
    
    // Render the map
    console.log('Calling renderPlotMap...');
    setTimeout(() => {
        window.renderPlotMap();
    }, 300);
};

// Override the global showMapPage to use our renderer
window.showMapPage = function() {
    console.log('showMapPage (map-renderer) called');
    window.showMapAndRender();
};

// Global test function - can be called from console: testMap()
window.testMap = function() {
    console.log('testMap called manually');
    window.showMapAndRender();
};

// Direct render for debugging - bypasses page navigation
window.renderDirect = function() {
    console.log('renderDirect called');
    
    // Show map page
    var mapPage = document.getElementById('map-page');
    mapPage.style.display = 'block';
    mapPage.classList.add('show');
    
    // Hide home page
    var homePage = document.getElementById('home-page');
    if (homePage) homePage.style.display = 'none';
    
    // Ensure main-container INSIDE map-page is visible
    var mapMainContainer = mapPage.querySelector('.main-container');
    if (mapMainContainer) {
        mapMainContainer.style.display = 'block';
        console.log('Map main-container made visible');
    }
    
    // Ensure data
    if (!window.api || !window.api.plotDatabase || window.api.plotDatabase.length === 0) {
        if (window.loadSampleData) window.loadSampleData();
    }
    
    // Render with delay
    setTimeout(() => {
        window.renderPlotMap();
        console.log('Direct render complete');
    }, 300);
};

// Ensure api.initializePlots is set for page-router
if (!window.api) window.api = {};
window.api.initializePlots = window.renderPlotMap;

// Manual test - type in console: manualTest()
window.manualTest = function() {
    console.log('Manual test - checking rows...');
    var rowIds = ['r161', 'r160', 'r130', 'r129', 'r98', 'r97', 'r65', 'r64', 'r33', 'r32', 'r9', 'r1', 'r167', 'r154', 'r137', 'r122', 'r105', 'r90', 'r73', 'r56', 'r40', 'r25', 'r10'];
    rowIds.forEach(function(id) {
        var el = document.getElementById(id);
        console.log(id + ': ' + (el ? 'EXISTS' : 'NOT FOUND'));
        if (el) {
            el.innerHTML = '<td style="background:#4CAF50;color:white;padding:10px;">TEST ' + id + '</td>';
        }
    });
    console.log('Manual test complete - check if green TEST boxes appear');
};

console.log('Map renderer loaded - type testMap() or manualTest() in console');
