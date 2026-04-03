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
        console.log('APP_CONFIG:', APP_CONFIG);
        
        // Load from local JSON file directly
        this.loadFromSharedStorage();
    }

    // ==========================================
    // DATA LOADING FUNCTIONS
    // ==========================================

    // Load data from shared storage (try local JSON first, then localStorage)
    async loadFromSharedStorage() {
        try {
            // Try loading from local JSON file first (simplest method)
            console.log('Loading from local JSON file...');
            const response = await fetch('teachers_colony_database.json');
            
            if (response.ok) {
                const data = await response.json();
                // Handle new structure with plots array
                this.plotDatabase = data.plots || data || [];
                console.log('Loaded', this.plotDatabase.length, 'records from local JSON file');
                
                this.updateStatistics();
                this.initializePlots();
                
                this.showNotification(`Loaded ${this.plotDatabase.length} records from local file.`, 'success');
                return true;
            }
            
            throw new Error('Local file not found');
        } catch (error) {
            console.log('Local file load failed, using localStorage fallback...', error);
            return await this.loadFromLocalStorage();
        }
    }

    // ==========================================
    // DATA SAVING FUNCTIONS
    // ==========================================

    // Load data from localStorage (fallback)
    async loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('plotDatabase');
            if (savedData) {
                this.plotDatabase = JSON.parse(savedData);
                console.log('Loaded', this.plotDatabase.length, 'records from localStorage');
            } else {
                console.log('No saved data found, starting with empty database');
                this.plotDatabase = [];
            }
            
            // Update UI
            this.updateStatistics();
            this.initializePlots();
            
            this.showNotification(`Loaded ${this.plotDatabase.length} records from local storage.`, 'success');
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.plotDatabase = [];
            this.updateStatistics();
            this.initializePlots();
        }
    }

    // Save data to localStorage (simplest method)
    async saveToGitHub() {
        try {
            console.log('Saving to localStorage...');
            this.showNotification('Saving data locally...', 'info');
            
            // Save to localStorage
            localStorage.setItem('plotDatabase', JSON.stringify(this.plotDatabase));
            
            this.showNotification('Data saved locally!', 'success');
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving data.', 'error');
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
                description: `${APP_CONFIG.name} - Updated ${new Date().toLocaleString()} - ${this.plotDatabase.length} records`,
                public: true,
                files: {
                    'teachers_colony_database.json': {
                        content: JSON.stringify(this.plotDatabase, null, 2)
                    }
                }
            };
            
            console.log('Uploading to GitHub Gist:', this.plotDatabase.length, 'records');
            
            const response = await fetch(`${GITHUB_CONFIG.apiEndpoint}/${GITHUB_CONFIG.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
            
            if (!response.ok) {
                if (response.status === 403) {
                    this.showNotification('Cannot save to GitHub: Token lacks gist write permissions. Data saved locally only.', 'error');
                    console.log('403 error on upload, saving to localStorage only');
                    await this.saveToLocalStorage();
                    return false;
                }
                throw new Error(`Upload failed: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Successfully uploaded to GitHub Gist:', data.html_url);
            console.log('GitHub URL:', GITHUB_CONFIG.gistUrl);
            
            this.showNotification('Data saved to GitHub successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error uploading to GitHub Gist:', error);
            this.showNotification('Saving to local storage only. GitHub sync unavailable.', 'error');
            
            // Save to localStorage as fallback
            await this.saveToLocalStorage();
            throw error; // Re-throw to handle in calling function
        }
    }

    // ==========================================
    // PLOT MANAGEMENT FUNCTIONS
    // ==========================================

    // Initialize all plots
    initializePlots() {
        // Fill all plot rows from configuration
        [...PLOT_LAYOUT.left, ...PLOT_LAYOUT.right].forEach(row => {
            this.fill(row.rowId, row.plots);
        });
    }

    // Fill plot cells
    fill(rowId, plotNumbers) {
        const row = document.getElementById(rowId);
        if (!row) return;
        
        let html = '';
        plotNumbers.forEach(plotNum => {
            // Support both old Title Case and new snake_case formats
            const plotData = this.plotDatabase.find(p => {
                const pn = p['Plot Number'] || p['plot_number'] || p.plot_number;
                return parseInt(pn) === plotNum;
            });
            let status = 'available';
            let ownerName = '';
            
            if (plotData) {
                // Handle both Title Case and snake_case status
                const plotStatus = plotData['Status'] || plotData['status'] || plotData.status || 'available';
                status = plotStatus.toLowerCase() === 'available' ? 'available' : 
                        plotStatus.toLowerCase() === 'owned' ? 'owned' : 
                        plotStatus.toLowerCase() === 'contacted' ? 'contacted' : 'available';
                ownerName = plotData['Owner Name'] || plotData['owner_name'] || plotData.owner_name;
            }
            
            html += `<td class="${status}" onclick="api.openModal(${plotNum})">
                <span class="pn">${plotNum}</span>`;
            
            if (ownerName) {
                html += `<span class="po">${ownerName}</span>`;
            }
            
            if (status === 'contacted') {
                html += `<span class="pc">Contacted</span>`;
            }
            
            html += `</td>`;
        });
        
        row.innerHTML = html;
    }

    // ==========================================
    // STATISTICS FUNCTIONS
    // ==========================================

    // Update statistics - support both Title Case and snake_case
    updateStatistics() {
        const totalPlots = APP_CONFIG.totalPlots;
        
        // Count plots with status='owned' and have a mobile number
        const ownedPlots = this.plotDatabase.filter(p => {
            const status = (p['Status'] || p['status'] || p.status || '').toLowerCase();
            const mobile = p['Primary Mobile'] || p['primary_mobile'] || p.primary_mobile || '';
            return status === 'owned' && mobile.length > 0;
        }).length;
        
        // Count plots with status='contacted' 
        const contactedPlots = this.plotDatabase.filter(p => {
            const status = (p['Status'] || p['status'] || p.status || '').toLowerCase();
            return status === 'contacted';
        }).length;
        
        const availablePlots = totalPlots - ownedPlots - contactedPlots;
        const ownershipRate = Math.round((ownedPlots / totalPlots) * 100);
        
        document.getElementById('total-plots').textContent = totalPlots;
        document.getElementById('owned-plots').textContent = ownedPlots;
        document.getElementById('available-plots').textContent = availablePlots;
        document.getElementById('ownership-rate').textContent = ownershipRate + '%';
        
        console.log(`Stats updated: ${ownedPlots} owned, ${contactedPlots} contacted, ${availablePlots} available, ${ownershipRate}% rate`);
    }

    // ==========================================
    // MODAL FUNCTIONS
    // ==========================================

    // Open modal for plot registration
    openModal(plotNumber) {
        this.currentPlotNumber = plotNumber;
        document.getElementById('modal-plot-num').textContent = plotNumber;
        document.getElementById('modal').classList.add('show');
        
        // Clear form
        document.getElementById('plot-form').reset();
        
        // Check if plot is already registered
        const existingData = this.plotDatabase.find(p => parseInt(p['Plot Number']) === plotNumber);
        const contactActions = document.getElementById('contact-actions');
        const plotForm = document.getElementById('plot-form');
        const ownerNameDiv = document.getElementById('modal-owner-name');
        
        if (existingData && existingData['Primary Mobile']) {
            // Show owner name
            ownerNameDiv.textContent = existingData['Owner Name'] || 'Contact';
            
            // Show mobile and plot size
            document.getElementById('display-mobile').textContent = existingData['Primary Mobile'];
            const plotSize = existingData['Plot Size'] || 'Not specified';
            document.getElementById('display-size').textContent = 'Plot Size: ' + plotSize;
            
            // Show action buttons
            contactActions.style.display = 'block';
            plotForm.style.display = 'none';
            
            // Format mobile number (remove +91 for links)
            const mobile = existingData['Primary Mobile'].replace('+91', '').replace(/\D/g, '');
            
            // Set up action links
            document.getElementById('call-btn').href = 'tel:+91' + mobile;
            document.getElementById('whatsapp-btn').href = 'https://wa.me/91' + mobile;
            document.getElementById('sms-btn').href = 'sms:+91' + mobile;
        } else {
            // Show form for new entry
            ownerNameDiv.textContent = 'Enter Details';
            contactActions.style.display = 'none';
            plotForm.style.display = 'block';
            
            if (existingData) {
                document.getElementById('reg-name').value = existingData['Owner Name'] || '';
                document.getElementById('reg-mobile').value = existingData['Primary Mobile'] || '';
            }
        }
    }

    // Close modal
    closeModal() {
        const modalOverlay = document.getElementById('modal');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
        }
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
        const plotSize = formData.plotSize || 'Not specified';
        
        if (!ownerName || !primaryMobile) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
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
        
        // Save to GitHub Gist only
        await this.saveToGitHub();
        
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
            'Plot Size': 'Not specified',
            'Status': 'contacted',
            'Registration Date': new Date().toLocaleDateString()
        };
        
        // Remove existing record for this plot if it exists
        this.plotDatabase = this.plotDatabase.filter(p => parseInt(p['Plot Number']) !== this.currentPlotNumber);
        
        // Add contacted record
        this.plotDatabase.push(contacted);
        
        // Save to GitHub Gist only
        await this.saveToGitHub();
        
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
        }, 3000); // 3 seconds default
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
