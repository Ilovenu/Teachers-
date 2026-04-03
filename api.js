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
        console.log('GITHUB_CONFIG:', GITHUB_CONFIG);
        console.log('APP_CONFIG:', APP_CONFIG);
        console.log('PLOT_LAYOUT:', PLOT_LAYOUT);
        
        // Show GitHub status immediately
        this.checkGitHubAccess();
    }

    // Check GitHub access and show status
    async checkGitHubAccess() {
        try {
            const response = await fetch(`${GITHUB_CONFIG.apiEndpoint}/${GITHUB_CONFIG.gistId}`, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`
                }
            });

            if (response.status === 403) {
                this.showGitHubTokenRequired();
            } else if (response.ok) {
                this.loadFromSharedStorage();
            } else {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
        } catch (error) {
            console.error('GitHub access check failed:', error);
            this.showGitHubTokenRequired();
        }
    }

    // Show GitHub token required modal
    showGitHubTokenRequired() {
        this.showNotification('GitHub Gist access required. Please update your token with "gist" scope.', 'error');
        
        // Auto-open token modal after delay
        setTimeout(() => {
            // Try to open the token modal
            const tokenModal = document.getElementById('token-modal');
            if (tokenModal) {
                tokenModal.classList.add('show');
                
                // Pre-fill current values
                const currentToken = GITHUB_CONFIG.token;
                const currentGistId = GITHUB_CONFIG.gistId;
                
                const tokenInput = document.getElementById('github-token');
                const gistInput = document.getElementById('gist-id');
                
                if (tokenInput) tokenInput.value = currentToken;
                if (gistInput) gistInput.value = currentGistId;
            }
        }, 2000);
    }

    // ==========================================
    // DATA LOADING FUNCTIONS
    // ==========================================

    // Load data from GitHub Gist ONLY (central storage)
    async loadFromSharedStorage() {
        try {
            console.log('Loading data from GitHub Gist ONLY...');
            console.log('Using token:', GITHUB_CONFIG.token ? GITHUB_CONFIG.token.substring(0, 10) + '...' : 'undefined');
            console.log('Using gist ID:', GITHUB_CONFIG.gistId);
            console.log('API endpoint:', GITHUB_CONFIG.apiEndpoint);
            
            // Show loading state
            this.showNotification('Loading data from GitHub...', 'info');
            
            const url = `${GITHUB_CONFIG.apiEndpoint}/${GITHUB_CONFIG.gistId}`;
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                if (response.status === 403) {
                    // Try read-only access with public gist
                    console.log('403 error, trying public gist access...');
                    const publicResponse = await fetch(url);
                    if (publicResponse.ok) {
                        const data = await publicResponse.json();
                        console.log('Successfully loaded data from public GitHub Gist:', data.html_url);
                        console.log('Gist files:', Object.keys(data.files || {}));
                        
                        if (!data.files || !data.files['teachers_colony_database.json']) {
                            throw new Error('Database file not found in GitHub Gist');
                        }
                        
                        const sharedData = JSON.parse(data.files['teachers_colony_database.json'].content);
                        this.plotDatabase = sharedData;
                        console.log('Loaded', this.plotDatabase.length, 'records from public GitHub Gist');
                        
                        // Refresh display
                        this.updateStatistics();
                        this.initializePlots();
                        
                        this.showNotification(`Data loaded from public GitHub! ${this.plotDatabase.length} records found. (Read-only mode)`, 'success');
                        return true;
                    }
                }
                throw new Error(`GitHub API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Successfully loaded data from GitHub Gist:', data.html_url);
            console.log('Gist files:', Object.keys(data.files || {}));
            
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
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Check if it's a network error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                this.showNotification('Network error. Loading from local storage...', 'error');
            } else if (error.message.includes('401')) {
                this.showNotification('GitHub token error. Loading from local storage...', 'error');
            } else if (error.message.includes('403')) {
                this.showNotification('GitHub access restricted. Loading from local storage...', 'error');
            } else if (error.message.includes('404')) {
                this.showNotification('GitHub Gist not found. Loading from local storage...', 'error');
            } else {
                this.showNotification(`GitHub Error: ${error.message}. Loading from local storage...`, 'error');
            }
            
            console.log('Falling back to localStorage...');
            // Load from localStorage as final fallback
            await this.loadFromLocalStorage();
            
            return false;
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

    // Save data to GitHub Gist ONLY
    async saveToGitHub() {
        try {
            console.log('Saving to GitHub Gist...');
            this.showNotification('Saving to GitHub Gist...', 'info');
            
            // Upload directly to GitHub Gist (central storage only)
            const success = await this.uploadToSharedStorage();
            
            if (success) {
                this.showNotification('Data saved to GitHub Gist successfully!', 'success');
            } else {
                this.showNotification('Failed to save to GitHub Gist. Please check your token permissions.', 'error');
            }
            
            return success;
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            this.showNotification('Error saving to GitHub Gist. Please update your token with "gist" scope.', 'error');
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
            const plotData = this.plotDatabase.find(p => p['Plot Number'] == plotNum);
            let status = 'available';
            let ownerName = '';
            
            if (plotData) {
                // Handle both "Available" and "available" status from GitHub
                const plotStatus = plotData['Status'] || 'available';
                status = plotStatus.toLowerCase() === 'available' ? 'available' : 
                        plotStatus.toLowerCase() === 'owned' ? 'owned' : 
                        plotStatus.toLowerCase() === 'contacted' ? 'contacted' : 'available';
                ownerName = plotData['Owner Name'];
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

    // Update statistics
    updateStatistics() {
        const totalPlots = APP_CONFIG.totalPlots;
        const ownedPlots = this.plotDatabase.filter(p => (p['Status'] || '').toLowerCase() === 'owned').length;
        const contactedPlots = this.plotDatabase.filter(p => (p['Status'] || '').toLowerCase() === 'contacted').length;
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
        document.getElementById('modal-plot').textContent = 'Plot #' + plotNumber;
        document.getElementById('modal').classList.add('show');
        
        // Clear form
        document.getElementById('plot-form').reset();
        
        // Check if plot is already registered
        const existingData = this.plotDatabase.find(p => parseInt(p['Plot Number']) === plotNumber);
        if (existingData) {
            document.getElementById('reg-name').value = existingData['Owner Name'] || '';
            document.getElementById('reg-mobile').value = existingData['Primary Mobile'] || '';
            document.getElementById('reg-alt-mobile').value = existingData['Alternative Mobile'] || '';
            document.getElementById('reg-size').value = existingData['Plot Size'] || '';
        }
    }

    // Close modal
    closeModal() {
        const modalOverlay = document.getElementById('modal');
        if (modalOverlay && modalOverlay.parentElement) {
            modalOverlay.parentElement.classList.remove('show');
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
