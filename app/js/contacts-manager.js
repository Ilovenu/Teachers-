/**
 * Contacts Manager Module
 * Handles contacts list display and management
 */

class ContactsManager {
    constructor() {
        this.currentFilter = 'all';
        this.searchTerm = '';
    }

    loadContactsList() {
        const listDiv = document.getElementById('contacts-list');
        console.log('loadContactsList called');

        if (!listDiv) {
            console.error('contacts-list element not found!');
            return;
        }

        // Ensure api exists
        if (!window.api) {
            window.api = { plotDatabase: [] };
        }

        // Check if data is empty
        const hasData = window.api.plotDatabase && window.api.plotDatabase.length > 0;
        console.log('Has data:', hasData, 'Count:', window.api.plotDatabase?.length);

        if (!hasData) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
                    <p style="margin-bottom: 20px;">No data loaded yet.</p>
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.loadGoogleSheetData()" 
                            style="background: #1e3c72; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                            📡 Load Real Data (Google Sheets)
                        </button>
                        <button onclick="window.loadSampleData()" 
                            style="background: #4caf50; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                            🧪 Load Sample Data
                        </button>
                    </div>
                    <p style="font-size: 0.85rem; color: #999; margin-top: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                        Note: Google Sheets may block requests from localhost. If real data doesn't load, use sample data for testing.
                    </p>
                </div>`;
            return;
        }

        // Render the contacts
        this.renderContacts(listDiv);
    }

    renderContacts(container) {
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; padding: 20px;">';

        // Create a map of existing plots for quick lookup
        const plotMap = new Map();
        window.api.plotDatabase.forEach(plot => {
            const plotNo = plot['Plot No'] || plot.plot_number;
            if (plotNo) {
                plotMap.set(String(plotNo), plot);
            }
        });

        // Show all plots 1-175
        for (let i = 1; i <= 175; i++) {
            const plotNo = String(i);
            const plot = plotMap.get(plotNo);
            
            if (plot) {
                // Plot has data - show Edit button
                const owner = plot['Owner'] || plot.owner_name || 'No Owner';
                const mobile = plot['Mobile'] || plot.primary_mobile || 'N/A';
                const lrs = plot['LRS'] || plot.lrs_status || 'N/A';
                const tax = plot['Tax'] || plot.tax_status || 'N/A';

                html += `
                    <div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 style="margin: 0; color: #1e3c72;">Plot ${plotNo}</h3>
                            <button onclick="openEditModal('${plotNo}')" 
                                style="background: #1e3c72; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                                ✏️ Edit
                            </button>
                        </div>
                        <div style="font-size: 0.95rem; color: #333;">
                            <p style="margin: 5px 0;"><strong>Owner:</strong> ${owner}</p>
                            <p style="margin: 5px 0; display: flex; align-items: center; gap: 8px;">
                                <strong>Mobile:</strong> ${mobile}
                                ${mobile !== 'N/A' ? `<a href="tel:${mobile}" style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 0.8rem;">📞 Call</a>` : ''}
                            </p>
                            <p style="margin: 5px 0;"><strong>LRS:</strong> ${lrs}</p>
                            <p style="margin: 5px 0;"><strong>Tax:</strong> ${tax}</p>
                        </div>
                    </div>
                `;
            } else {
                // Plot is empty - show Add button
                html += `
                    <div style="background: #f5f5f5; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px dashed #ccc;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 style="margin: 0; color: #999;">Plot ${plotNo}</h3>
                            <button onclick="openAddModal('${plotNo}')" 
                                style="background: #4caf50; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                                ➕ Add
                            </button>
                        </div>
                        <div style="font-size: 0.95rem; color: #999; text-align: center; padding: 20px 0;">
                            <p style="margin: 0;">No data available</p>
                            <p style="margin: 5px 0; font-size: 0.85rem;">Click Add to enter details</p>
                        </div>
                    </div>
                `;
            }
        }

        html += '</div>';
        container.innerHTML = html;

        console.log('Rendered 175 plots,', plotMap.size, 'have data');
    }
}

// Initialize and expose
window.contactsManager = new ContactsManager();
window.loadContactsList = function() {
    return window.contactsManager.loadContactsList();
};

console.log('Contacts Manager loaded');
