/**
 * Plot Manager - Handles plot display, interactions, and management
 */
class PlotManager {
    constructor() {
        this.plots = new Map(); // Map of plot number -> plot data
        this.selectedPlots = new Set();
        this.filteredPlots = new Set();
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.plotLayout = this.generatePlotLayout();
    }

    /**
     * Generate the plot layout structure
     */
    generatePlotLayout() {
        return [
            // Top row (plots 161-175)
            { row: 'top', plots: [161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175] },
            // Second row (plots 154-160)
            { row: 'second', plots: [154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118, 117, 116, 115, 114] },
            // Third row (plots 105-113)
            { row: 'third', plots: [105, 106, 107, 108, 109, 110, 111, 112, 113] },
            // Fourth row (plots 98-104)
            { row: 'fourth', plots: [98, 99, 100, 101, 102, 103, 104] },
            // Fifth row (plots 90-97)
            { row: 'fifth', plots: [90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 40] },
            // Sixth row (plots 33-39)
            { row: 'sixth', plots: [33, 34, 35, 36, 37, 38, 39] },
            // Seventh row (plots 25-32)
            { row: 'seventh', plots: [25, 24, 23, 22, 21, 20, 19, 18, 32, 31, 30, 29, 28, 27, 26] },
            // Eighth row (plots 10-17)
            { row: 'eighth', plots: [10, 11, 12, 13, 14, 15, 16, 17] },
            // Bottom row (plots 1-9)
            { row: 'bottom', plots: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
        ];
    }

    /**
     * Initialize the plot manager
     */
    async initialize() {
        this.showLoading(true);
        try {
            await this.loadPlots();
            this.renderPlotMap();
            this.updateStatistics();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize plot manager:', error);
            uiManager.showToast('Failed to load plot data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Load plots from database
     */
    async loadPlots() {
        const plotData = await databaseManager.getAllPlots();
        this.plots.clear();
        
        // Initialize all plots (1-175)
        for (let i = 1; i <= 175; i++) {
            this.plots.set(i, {
                number: i,
                status: 'available',
                owner: null,
                mobile: null,
                alternativeMobile: null,
                plotSize: this.getPlotSize(i),
                registrationDate: null
            });
        }
        
        // Update with actual plot data
        plotData.forEach(plot => {
            this.plots.set(plot.number, {
                ...plot,
                status: 'owned'
            });
        });
    }

    /**
     * Get plot size based on plot number
     */
    getPlotSize(plotNumber) {
        // All plots are 167 Sq. Yards by default
        // This can be customized based on actual plot sizes
        return '167 Sq. Yards';
    }

    /**
     * Render the plot map
     */
    renderPlotMap() {
        const container = document.getElementById('plot-map-container');
        container.innerHTML = '';
        
        const plotGrid = document.createElement('div');
        plotGrid.className = 'plot-grid';
        
        this.plotLayout.forEach((row, index) => {
            // Add road label before each row (except first)
            if (index > 0) {
                const roadLabel = document.createElement('div');
                roadLabel.className = 'road-label';
                roadLabel.textContent = this.getRoadLabel(row.row);
                plotGrid.appendChild(roadLabel);
            }
            
            // Create plot row
            const plotRow = document.createElement('div');
            plotRow.className = 'plot-row';
            
            row.plots.forEach(plotNumber => {
                const plot = this.plots.get(plotNumber);
                if (plot && this.shouldShowPlot(plot)) {
                    const plotCell = this.createPlotCell(plot);
                    plotRow.appendChild(plotCell);
                }
            });
            
            plotGrid.appendChild(plotRow);
        });
        
        container.appendChild(plotGrid);
    }

    /**
     * Get road label for a row
     */
    getRoadLabel(rowName) {
        const roadLabels = {
            'top': '100 FEET PORT ROAD',
            'second': '30 FEET ROAD',
            'third': '40 FEET ROAD',
            'fourth': '40 FEET ROAD',
            'fifth': '40 FEET ROAD',
            'sixth': '40 FEET ROAD',
            'seventh': '30 FEET ROAD',
            'eighth': '40 FEET CENTER ROAD',
            'bottom': '100 FEET PORT ROAD'
        };
        return roadLabels[rowName] || 'ROAD';
    }

    /**
     * Check if a plot should be shown based on current filters
     */
    shouldShowPlot(plot) {
        // Apply status filter
        if (this.currentFilter === 'owned' && plot.status !== 'owned') {
            return false;
        }
        if (this.currentFilter === 'available' && plot.status !== 'available') {
            return false;
        }
        
        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            const plotNumber = plot.number.toString();
            const ownerName = plot.owner ? plot.owner.toLowerCase() : '';
            const mobile = plot.mobile ? plot.mobile.toLowerCase() : '';
            
            return plotNumber.includes(searchLower) || 
                   ownerName.includes(searchLower) || 
                   mobile.includes(searchLower);
        }
        
        return true;
    }

    /**
     * Create a plot cell element
     */
    createPlotCell(plot) {
        const cell = document.createElement('div');
        cell.className = `plot-cell ${plot.status} ${this.selectedPlots.has(plot.number) ? 'selected' : ''}`;
        cell.dataset.plotNumber = plot.number;
        
        const plotNumber = document.createElement('div');
        plotNumber.className = 'plot-number';
        plotNumber.textContent = plot.number;
        
        cell.appendChild(plotNumber);
        
        if (plot.status === 'owned' && plot.owner) {
            const plotOwner = document.createElement('div');
            plotOwner.className = 'plot-owner';
            plotOwner.textContent = plot.owner.split(' ').pop(); // Show last name only
            cell.appendChild(plotOwner);
        }
        
        cell.addEventListener('click', () => this.handlePlotClick(plot));
        
        return cell;
    }

    /**
     * Handle plot click
     */
    handlePlotClick(plot) {
        if (plot.status === 'owned') {
            this.showPlotDetails(plot);
        } else {
            this.showRegistrationForm(plot);
        }
    }

    /**
     * Show plot details modal
     */
    showPlotDetails(plot) {
        const modal = document.getElementById('plot-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = `Plot ${plot.number} Details`;
        
        modalContent.innerHTML = `
            <div class="modal-section">
                <h4>Plot Information</h4>
                <div class="info-row">
                    <span class="info-label">Plot Number:</span>
                    <span class="info-value">${plot.number}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                        <span class="status-badge status-owned">${plot.status}</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Plot Size:</span>
                    <span class="info-value">${plot.plotSize}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Registration Date:</span>
                    <span class="info-value">${plot.registrationDate || 'N/A'}</span>
                </div>
            </div>
            
            <div class="modal-section">
                <h4>Owner Information</h4>
                <div class="info-row">
                    <span class="info-label">Owner Name:</span>
                    <span class="info-value">${plot.owner || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Primary Mobile:</span>
                    <span class="info-value">
                        ${plot.mobile ? `
                            <a href="tel:${plot.mobile}" class="phone-link">
                                <i class="fas fa-phone"></i> ${plot.mobile}
                            </a>
                        ` : 'N/A'}
                    </span>
                </div>
                ${plot.alternativeMobile ? `
                    <div class="info-row">
                        <span class="info-label">Alternative Mobile:</span>
                        <span class="info-value">
                            <a href="tel:${plot.alternativeMobile}" class="phone-link">
                                <i class="fas fa-phone"></i> ${plot.alternativeMobile}
                            </a>
                        </span>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-section">
                <button onclick="plotManager.closeModal()" class="btn btn-outline" style="width: 100%;">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
    }

    /**
     * Show registration form modal
     */
    showRegistrationForm(plot) {
        const modal = document.getElementById('plot-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = `Register Plot ${plot.number}`;
        
        modalContent.innerHTML = `
            <form id="registration-form" onsubmit="plotManager.handleRegistration(event, ${plot.number})">
                <div class="modal-section">
                    <h4>Plot Information</h4>
                    <div class="info-row">
                        <span class="info-label">Plot Number:</span>
                        <span class="info-value">${plot.number}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Plot Size:</span>
                        <span class="info-value">${plot.plotSize}</span>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h4>Owner Details</h4>
                    <div class="form-group">
                        <label class="form-label" for="owner-name">Owner Name *</label>
                        <input type="text" id="owner-name" class="form-input" required 
                               placeholder="Enter owner's full name">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="primary-mobile">Primary Mobile *</label>
                        <input type="tel" id="primary-mobile" class="form-input" required 
                               pattern="[0-9]{10}" placeholder="10-digit mobile number">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="alternative-mobile">Alternative Mobile</label>
                        <input type="tel" id="alternative-mobile" class="form-input" 
                               pattern="[0-9]{10}" placeholder="Optional alternative mobile">
                    </div>
                </div>
                
                <div class="modal-section">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-save"></i> Register Plot
                    </button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
    }

    /**
     * Handle plot registration
     */
    async handleRegistration(event, plotNumber) {
        event.preventDefault();
        
        const formData = {
            owner: document.getElementById('owner-name').value,
            mobile: document.getElementById('primary-mobile').value,
            alternativeMobile: document.getElementById('alternative-mobile').value
        };
        
        // Format mobile numbers
        if (formData.mobile && !formData.mobile.startsWith('+91')) {
            formData.mobile = '+91' + formData.mobile;
        }
        if (formData.alternativeMobile && !formData.alternativeMobile.startsWith('+91')) {
            formData.alternativeMobile = '+91' + formData.alternativeMobile;
        }
        
        this.showLoading(true);
        
        try {
            await databaseManager.registerPlot(plotNumber, formData);
            await this.loadPlots(); // Reload plots
            this.renderPlotMap();
            this.updateStatistics();
            this.closeModal();
            uiManager.showToast(`Plot ${plotNumber} registered successfully!`, 'success');
        } catch (error) {
            console.error('Registration failed:', error);
            uiManager.showToast('Registration failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Update statistics dashboard
     */
    updateStatistics() {
        const totalPlots = this.plots.size;
        const ownedPlots = Array.from(this.plots.values()).filter(plot => plot.status === 'owned').length;
        const availablePlots = totalPlots - ownedPlots;
        const ownershipRate = totalPlots > 0 ? ((ownedPlots / totalPlots) * 100).toFixed(1) : 0;
        
        document.getElementById('total-plots').textContent = totalPlots;
        document.getElementById('owned-plots').textContent = ownedPlots;
        document.getElementById('available-plots').textContent = availablePlots;
        document.getElementById('ownership-rate').textContent = ownershipRate + '%';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderPlotMap();
        });
        
        // Filter functionality
        const filterSelect = document.getElementById('filter-status');
        filterSelect.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderPlotMap();
        });
    }

    /**
     * Reset filters
     */
    resetFilters() {
        this.searchTerm = '';
        this.currentFilter = 'all';
        document.getElementById('search-input').value = '';
        document.getElementById('filter-status').value = 'all';
        this.renderPlotMap();
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('plot-modal');
        modal.classList.add('hidden');
    }

    /**
     * Show/hide loading overlay
     */
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Export plots to Excel
     */
    async exportToExcel() {
        this.showLoading(true);
        try {
            const plots = Array.from(this.plots.values());
            await databaseManager.exportToExcel(plots);
            uiManager.showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            uiManager.showToast('Export failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Import database
     */
    async importDatabase() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx,.xls';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            this.showLoading(true);
            try {
                await databaseManager.importFromFile(file);
                await this.loadPlots();
                this.renderPlotMap();
                this.updateStatistics();
                uiManager.showToast('Database imported successfully!', 'success');
            } catch (error) {
                console.error('Import failed:', error);
                uiManager.showToast('Import failed. Please check the file format.', 'error');
            } finally {
                this.showLoading(false);
            }
        };
        input.click();
    }

    /**
     * Sync to GitHub
     */
    async syncToGitHub() {
        this.showLoading(true);
        try {
            const plots = Array.from(this.plots.values());
            await databaseManager.syncToGitHub(plots);
            uiManager.showToast('GitHub sync completed!', 'success');
        } catch (error) {
            console.error('GitHub sync failed:', error);
            uiManager.showToast('GitHub sync failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize global plot manager
const plotManager = new PlotManager();
