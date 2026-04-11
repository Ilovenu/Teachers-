/**
 * Data Loader Module
 * Handles Google Sheets data loading
 */

class DataLoader {
    constructor() {
        this.SHEET_ID = '1VTTnNkhHVrxcHfQ0BDOUYjkFEjFvVhKrt34AO6a-7NA';
        this.SHEET_GID = '1991758122';
        this.isLoading = false;
    }

    async loadGoogleSheetData() {
        if (this.isLoading) {
            console.log('Data already loading...');
            return;
        }

        this.isLoading = true;
        console.log('Loading Google Sheets data...');

        // Show loading indicator in contacts page if visible
        const contactsList = document.getElementById('contacts-list');
        if (contactsList) {
            contactsList.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 20px; animation: spin 1s linear infinite;">⏳</div>
                    <p style="font-size: 1.1rem;">Loading real data from Google Sheets...</p>
                    <p style="font-size: 0.9rem; color: #999; margin-top: 10px;">This may take a few seconds</p>
                </div>
                <style>
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                </style>
            `;
        }

        try {
            // Try gviz API first
            const gvizUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/gviz/tq?tqx=out:csv&gid=${this.SHEET_GID}`;
            
            const response = await fetch(gvizUrl);
            if (!response.ok) throw new Error('GViz API failed');
            
            const csvText = await response.text();
            const plots = this.parseGoogleSheetCSV(csvText);
            
            if (plots && plots.length > 0) {
                this.updateDatabase(plots);
                this.showLoadingStatus(`Loaded ${plots.length} plots from Google Sheets!`, 'success');
                return plots;
            } else {
                throw new Error('No plots parsed from CSV');
            }
        } catch (error) {
            console.error('GViz error:', error);
            
            // Show loading message for fallback attempt
            const contactsList = document.getElementById('contacts-list');
            if (contactsList) {
                contactsList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 2rem; margin-bottom: 15px;">🔄</div>
                        <p>Trying alternative method...</p>
                    </div>`;
            }
            
            // Try publish URL fallback
            try {
                const pubUrl = `https://docs.google.com/spreadsheets/d/e/${this.SHEET_ID}/pub?gid=${this.SHEET_GID}&single=true&output=csv`;
                const response = await fetch(pubUrl);
                const csvText = await response.text();
                const plots = this.parseGoogleSheetCSV(csvText);
                
                if (plots && plots.length > 0) {
                    this.updateDatabase(plots);
                    this.showLoadingStatus(`Loaded ${plots.length} plots (fallback)!`, 'success');
                    return plots;
                }
            } catch (pubError) {
                console.error('Publish URL also failed:', pubError);
                
                // Show error in contacts page
                const contactsList = document.getElementById('contacts-list');
                if (contactsList) {
                    contactsList.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                            <p style="color: #c62828; font-weight: bold;">Could not load from Google Sheets</p>
                            <p style="font-size: 0.9rem; color: #999; margin: 10px 0;">
                                CORS policy may be blocking localhost requests.<br>
                                Try using sample data instead.
                            </p>
                            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
                                <button onclick="window.loadGoogleSheetData()" 
                                    style="background: #1e3c72; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                                    🔄 Try Again
                                </button>
                                <button onclick="window.loadSampleData()" 
                                    style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                                    🧪 Use Sample Data
                                </button>
                            </div>
                        </div>`;
                }
            }
        } finally {
            this.isLoading = false;
        }
        
        return null;
    }

    parseGoogleSheetCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        // Parse headers
        const headers = this.parseCSVLine(lines[0]);
        console.log('CSV Headers:', headers);

        const plots = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length < 2) continue;

            const plot = {};
            headers.forEach((header, index) => {
                plot[header] = values[index] || '';
            });

            // Normalize field names to match Google Sheet columns
            plot.plot_number = plot['Plot No'] || plot['Plot Number'] || '';
            plot.owner_name = plot['Owner'] || plot['Owner Name'] || '';
            plot.owner1 = plot['Owner1'] || plot['Owner 1'] || '';
            plot.primary_mobile = plot['Mobile'] || plot['Primary Mobile'] || '';
            plot.alt_mobile = plot['AltMobile'] || '';
            plot.alt_mobile1 = plot['AltMobile1'] || '';
            plot.alt_mobile2 = plot['AltMobile2'] || '';
            plot.lrs_status = plot['LRS'] || '';
            plot.size = plot['Size'] || '';
            plot.tax_status = plot['Tax'] || '';

            if (plot.plot_number) {
                plots.push(plot);
            }
        }

        return plots;
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    }

    updateDatabase(plots) {
        if (!window.api) {
            window.api = {};
        }
        window.api.plotDatabase = plots;
        
        // Update dashboard statistics
        if (window.api.updateStatistics) {
            console.log('Updating dashboard statistics...');
            window.api.updateStatistics();
        }
        
        // Also try to call updateDashboard for safety
        if (window.updateDashboard) {
            window.updateDashboard();
        }
        
        // Refresh contacts list if on contacts page
        const contactsPage = document.getElementById('contacts-page');
        if (contactsPage && contactsPage.classList.contains('show')) {
            console.log('Refreshing contacts list after data load...');
            if (window.loadContactsList) {
                window.loadContactsList();
            }
        }
        
        console.log('Database updated with', plots.length, 'plots');
        
        // Show notification
        if (window.api && window.api.showNotification) {
            window.api.showNotification(`Loaded ${plots.length} plots! Dashboard updated.`, 'success');
        }
    }

    showLoadingStatus(message, type = 'info') {
        console.log(`[DataLoader] ${message}`);
        
        // Try to show in UI if contacts page is visible
        const contactsContainer = document.getElementById('contacts-container');
        if (contactsContainer && type !== 'success') {
            const statusDiv = contactsContainer.querySelector('.loading-message');
            if (statusDiv) {
                statusDiv.textContent = message;
            }
        }
    }
}

// Initialize and expose globally
window.dataLoader = new DataLoader();

// Create a global function for the page router
window.loadGoogleSheetData = function() {
    return window.dataLoader.loadGoogleSheetData();
};

// Auto-load data on startup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataLoader.loadGoogleSheetData();
    });
} else {
    window.dataLoader.loadGoogleSheetData();
}

console.log('Data Loader initialized');

// Load sample data for testing (fallback when Google Sheets fails)
window.loadSampleData = function() {
    console.log('Loading sample data...');
    window.api = window.api || {};
    window.api.plotDatabase = [];

    // Create sample plots 1-175 with some having data
    for (let i = 1; i <= 175; i++) {
        const hasData = Math.random() > 0.5; // 50% have data
        if (hasData) {
            window.api.plotDatabase.push({
                'Plot No': String(i),
                'plot_number': String(i),
                'Owner': `Owner ${i}`,
                'owner_name': `Owner ${i}`,
                'Mobile': `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
                'primary_mobile': `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
                'LRS': Math.random() > 0.5 ? 'Done' : 'Pending',
                'lrs_status': Math.random() > 0.5 ? 'Done' : 'Pending',
                'Tax': Math.random() > 0.5 ? 'Paid' : 'Pending',
                'tax_status': Math.random() > 0.5 ? 'Paid' : 'Pending'
            });
        }
    }

    console.log('Sample data loaded:', window.api.plotDatabase.length, 'plots');

    // Refresh contacts list if on contacts page
    const contactsPage = document.getElementById('contacts-page');
    if (contactsPage && contactsPage.classList.contains('show') && window.loadContactsList) {
        window.loadContactsList();
    }

    // Update statistics
    if (window.api && window.api.updateStatistics) {
        window.api.updateStatistics();
    }
    
    // Update dashboard
    if (window.updateDashboard) {
        window.updateDashboard();
    }
};

// Global function to update dashboard based on current data
window.updateDashboard = function() {
    if (!window.api || !window.api.plotDatabase) {
        console.log('Teachers Colony Application - Google Sheets Data Source');
    
    // Create API instance
    window.api = new TeachersColonyAPI();
    console.log('API initialized:', window.api);
    
    // Show alert banner first, then load map after 3 seconds
    console.log('Showing meeting alert banner...');
    
    setTimeout(() => {
        // Load map page after user sees the alert
        if (window.pageRouter) {
            window.pageRouter.showPage('map');
        } else {
            // Fallback: manually show map page
            document.getElementById('home-page').style.display = 'none';
            document.getElementById('map-page').style.display = 'block';
            document.getElementById('map-page').classList.add('show');
        }
        console.log('Map page loaded after alert');
    }, 3000);

    console.log('No data to update dashboard');
    return;
    }
    
    const plots = window.api.plotDatabase;
    console.log('Updating dashboard with', plots.length, 'plots');
    
    // Count registered plots (plots with owner data)
    const registeredPlots = plots.filter(p => 
        p.owner_name || p['Owner Name'] || p['Owner'] || p.status === 'owned'
    );
    const registered = registeredPlots.length;
    
    // Count available plots
    const available = 175 - registered;
    
    // Count plots with mobile numbers
    const plotsWithMobile = plots.filter(p => {
        const mobile = p.primary_mobile || p['Mobile'] || p.mobile || '';
        return mobile && mobile.trim() !== '';
    });
    const mobileCount = plotsWithMobile.length;
    
    // Update dashboard elements
    const ownedPlotsEl = document.getElementById('owned-plots');
    const availablePlotsEl = document.getElementById('available-plots');
    const mobileCountEl = document.getElementById('mobile-count');
    const ownershipRateEl = document.getElementById('ownership-rate');
    
    if (ownedPlotsEl) ownedPlotsEl.textContent = registered;
    if (availablePlotsEl) availablePlotsEl.textContent = available;
    if (mobileCountEl) mobileCountEl.textContent = mobileCount;
    if (ownershipRateEl) {
        const rate = Math.round((registered / 175) * 100);
        ownershipRateEl.textContent = rate + '%';
    }
    
    // Also update home page stats if they exist
    const homeOwned = document.getElementById('home-owned-plots');
    const homeAvailable = document.getElementById('home-available-plots');
    if (homeOwned) homeOwned.textContent = registered;
    if (homeAvailable) homeAvailable.textContent = available;
    
    console.log('Dashboard updated:', {registered, available, mobileCount});
};

// Don't auto-load sample data - let user choose via UI
