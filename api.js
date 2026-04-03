// ==========================================
// TEACHERS COLONY - API FUNCTIONS
// ==========================================
// This file contains all API and data management functions

class TeachersColonyAPI {
    constructor() {
        this.plotDatabase = [];
        this.currentPlotNumber = null;
        this.init();
    }

    // Initialize the application
    init() {
        console.log('Teachers Colony API Initialized');
        this.loadFromSharedStorage();
    }

    // ==========================================
    // DATA LOADING FUNCTIONS
    // ==========================================

    // Load data from GitHub Gist ONLY (central storage)
    async loadFromSharedStorage() {
        try {
            console.log('Loading data from GitHub Gist ONLY...');
            
            // Show loading state
            this.showNotification('Loading data from GitHub...', 'info');
            
            const response = await fetch(`${CONFIG.GITHUB.apiEndpoint}/${CONFIG.GITHUB.gistId}`, {
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Successfully loaded data from GitHub Gist:', data.html_url);
            
            // Check if the file exists
            if (!data.files || !data.files['teachers_colony_database.json']) {
                throw new Error('Database file not found in GitHub Gist');
            }
            
            const sharedData = JSON.parse(data.files['teachers_colony_database.json'].content);
            this.plotDatabase = sharedData;
            console.log('Loaded', this.plotDatabase.length, 'records from GitHub Gist ONLY');
            
            // Refresh display
            this.updateStatistics();
            this.initializePlots();
            
            this.showNotification(`Data loaded from GitHub! ${this.plotDatabase.length} records found.`, 'success');
            return true;
        } catch (error) {
            console.error('Error loading from GitHub Gist:', error);
            this.showNotification(`GitHub Error: ${error.message}. Please check your token and Gist.`, 'error');
            
            // Initialize with empty database if GitHub fails
            this.plotDatabase = [];
            this.updateStatistics();
            this.initializePlots();
            
            return false;
        }
    }

    // ==========================================
    // DATA SAVING FUNCTIONS
    // ==========================================

    // Save data to GitHub Gist ONLY
    async saveToLocalStorage() {
        try {
            console.log('Saving data to GitHub Gist ONLY...');
            
            // Show saving state
            this.showNotification('Saving to GitHub...', 'info');
            
            // Upload directly to GitHub Gist (central storage only)
            const success = await this.uploadToSharedStorage();
            
            if (success) {
                this.showNotification('Data saved to GitHub successfully!', 'success');
            } else {
                this.showNotification('Failed to save to GitHub. Please check your connection.', 'error');
            }
            
            return success;
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            this.showNotification('Error saving to GitHub. Please try again.', 'error');
            return false;
        }
    }

    // Upload data to GitHub Gist ONLY
    async uploadToSharedStorage() {
        if (this.plotDatabase.length === 0) {
            console.log('No data to upload to GitHub Gist');
            this.showNotification('No data to save to GitHub.', 'info');
            return false;
        }
        
        try {
            const gistData = {
                description: `${CONFIG.APP.name} - Updated ${new Date().toLocaleString()} - ${this.plotDatabase.length} records`,
                public: true,
                files: {
                    'teachers_colony_database.json': {
                        content: JSON.stringify(this.plotDatabase, null, 2)
                    }
                }
            };
            
            console.log('Uploading to GitHub Gist:', this.plotDatabase.length, 'records');
            
            const response = await fetch(`${CONFIG.GITHUB.apiEndpoint}/${CONFIG.GITHUB.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Successfully uploaded to GitHub Gist:', data.html_url);
            console.log('GitHub URL:', CONFIG.GITHUB.gistUrl);
            
            return true;
        } catch (error) {
            console.error('Error uploading to GitHub Gist:', error);
            throw error; // Re-throw to handle in calling function
        }
    }

    // ==========================================
    // PLOT MANAGEMENT FUNCTIONS
    // ==========================================

    // Initialize all plots
    initializePlots() {
        // Fill all plot rows from configuration
        [...CONFIG.PLOT_LAYOUT.left, ...CONFIG.PLOT_LAYOUT.right].forEach(row => {
            this.fill(row.rowId, row.plots);
        });
    }

    // Fill plot cells
    fill(rowId, plotNumbers) {
        const row = document.getElementById(rowId);
        if (!row) return;
        
        let html = '';
        plotNumbers.forEach(plotNum => {
            const plotData = this.plotDatabase.find(p => p['Plot Number'] == plotNum);
            let status = 'available';
            let ownerName = '';
            let mobile = '';
            
            if (plotData) {
                status = plotData['Status'];
                ownerName = plotData['Owner Name'];
                mobile = plotData['Primary Mobile'];
            }
            
            html += `<td class="${status}" onclick="api.openModal(${plotNum})">
                <span class="pn">${plotNum}</span>`;
            
            if (ownerName) {
                html += `<span class="po">${ownerName}</span>`;
            }
            
            if (mobile && status === 'contacted') {
                html += `<span class="pc">Contacted</span>`;
            }
            
            html += `</td>`;
        });
        
        row.innerHTML = html;
    }

    // ==========================================
    // STATISTICS FUNCTIONS
    // ==========================================

    // Update statistics
    updateStatistics() {
        const totalPlots = CONFIG.APP.totalPlots;
        const ownedPlots = this.plotDatabase.filter(p => p['Status'] === 'owned').length;
        const contactedPlots = this.plotDatabase.filter(p => p['Status'] === 'contacted').length;
        const availablePlots = totalPlots - ownedPlots - contactedPlots;
        
        document.getElementById('total-plots').textContent = totalPlots;
        document.getElementById('owned-plots').textContent = ownedPlots;
        document.getElementById('contacted-plots').textContent = contactedPlots;
        document.getElementById('available-plots').textContent = availablePlots;
        
        console.log(`Stats updated: ${ownedPlots} owned, ${contactedPlots} contacted, ${availablePlots} available`);
    }

    // ==========================================
    // MODAL FUNCTIONS
    // ==========================================

    // Open modal for plot registration
    openModal(plotNumber) {
        this.currentPlotNumber = plotNumber;
        document.getElementById('plotNumber').textContent = plotNumber;
        document.getElementById('plotModal').classList.add('show');
        
        // Clear form
        document.getElementById('registrationForm').reset();
        
        // Check if plot is already registered
        const existingData = this.plotDatabase.find(p => parseInt(p['Plot Number']) === plotNumber);
        if (existingData) {
            document.getElementById('ownerName').value = existingData['Owner Name'] || '';
            document.getElementById('primaryMobile').value = existingData['Primary Mobile'] || '';
            document.getElementById('alternativeMobile').value = existingData['Alternative Mobile'] || '';
            document.getElementById('plotSize').value = existingData['Plot Size'] || '';
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('plotModal').classList.remove('show');
        this.currentPlotNumber = null;
    }

    // ==========================================
    // REGISTRATION FUNCTIONS
    // ==========================================

    // Handle form submission
    async handleRegistrationSubmit(formData) {
        const ownerName = formData.ownerName;
        const primaryMobile = formData.primaryMobile;
        const alternativeMobile = formData.alternativeMobile;
        const plotSize = formData.plotSize;
        
        if (!ownerName || !primaryMobile || !plotSize) {
            this.showNotification('Please fill in all required fields', 'error');
            return false;
        }
        
        // Format mobile numbers
        const formattedMobile = primaryMobile.startsWith('+91') ? primaryMobile : `+91${primaryMobile}`;
        const formattedAltMobile = alternativeMobile ? (alternativeMobile.startsWith('+91') ? alternativeMobile : `+91${alternativeMobile}`) : '';
        
        // Create registration record
        const registration = {
            'Plot Number': this.currentPlotNumber.toString(),
            'Owner Name': ownerName,
            'Primary Mobile': formattedMobile,
            'Alternative Mobile': formattedAltMobile,
            'Plot Size': plotSize,
            'Status': 'owned',
            'Registration Date': new Date().toLocaleDateString()
        };
        
        // Remove existing record for this plot if it exists
        this.plotDatabase = this.plotDatabase.filter(p => parseInt(p['Plot Number']) !== this.currentPlotNumber);
        
        // Add new record
        this.plotDatabase.push(registration);
        
        // Save to storage
        await this.saveToLocalStorage();
        
        // Refresh display
        this.initializePlots();
        this.updateStatistics();
        
        this.showNotification(`Registration successful for Plot ${this.currentPlotNumber}!`, 'success');
        this.closeModal();
        return true;
    }

    // Mark as contacted
    async markAsContacted(formData) {
        const ownerName = formData.ownerName || 'Contacted Lead';
        const primaryMobile = formData.primaryMobile || '0000000000';
        
        // Format mobile number
        const formattedMobile = primaryMobile.startsWith('+91') ? primaryMobile : `+91${primaryMobile}`;
        
        // Create contacted record
        const contacted = {
            'Plot Number': this.currentPlotNumber.toString(),
            'Owner Name': ownerName,
            'Primary Mobile': formattedMobile,
            'Alternative Mobile': '',
            'Plot Size': '167 Sq. Yards',
            'Status': 'contacted',
            'Registration Date': new Date().toLocaleDateString()
        };
        
        // Remove existing record for this plot if it exists
        this.plotDatabase = this.plotDatabase.filter(p => parseInt(p['Plot Number']) !== this.currentPlotNumber);
        
        // Add contacted record
        this.plotDatabase.push(contacted);
        
        // Save to storage
        await this.saveToLocalStorage();
        
        // Refresh display
        this.initializePlots();
        this.updateStatistics();
        
        this.showNotification(`Plot ${this.currentPlotNumber} marked as contacted!`, 'success');
        this.closeModal();
        return true;
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification show';
        
        if (type === 'error') {
            notification.style.background = '#f44336';
        } else if (type === 'info') {
            notification.style.background = '#2196f3';
        } else {
            notification.style.background = '#4caf50';
        }
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, CONFIG.UI.notificationDuration);
    }

    // Refresh data from GitHub
    async refreshFromGitHub() {
        console.log('Manual refresh requested...');
        return await this.loadFromSharedStorage();
    }

    // Export data to CSV
    exportData() {
        if (this.plotDatabase.length === 0) {
            this.showNotification('No data to export', 'error');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Plot Number,Owner Name,Primary Mobile,Alternative Mobile,Plot Size,Status,Registration Date\n';
        this.plotDatabase.forEach(record => {
            csvContent += `${record['Plot Number'] || ''},"${record['Owner Name'] || ''}",${record['Primary Mobile'] || ''},${record['Alternative Mobile'] || ''},"${record['Plot Size'] || ''}",${record['Status'] || ''},${record['Registration Date'] || ''}\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teachers_colony_database_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification(`Database exported successfully! ${this.plotDatabase.length} records exported.`, 'success');
    }
}

// Initialize API instance
window.api = new TeachersColonyAPI();

console.log('API functions loaded successfully');
