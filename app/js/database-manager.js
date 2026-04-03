/**
 * Database Manager - Handles all database operations, localStorage, and file operations
 */
class DatabaseManager {
    constructor() {
        this.storageKey = 'teachers_colony_database';
        this.defaultData = this.getDefaultData();
    }

    /**
     * Get default plot data (previously hardcoded data)
     */
    getDefaultData() {
        return [
            { number: 16, owner: 'L. Subramanyam', mobile: '+918499899833', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 17, owner: 'Jogi Kanakadurga', mobile: '+919963729133', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 25, owner: 'K. Nagambicamani', mobile: '+919949726566', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 27, owner: 'M. Sekhar', mobile: '+919866172123', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 29, owner: 'MD. Basheer', mobile: '+919491584669', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 30, owner: 'Kalilullah', mobile: '+919000548786', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 31, owner: 'Gose', mobile: '+919154078692', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 32, owner: 'MD. Basheer/Kalilullah/Gose', mobile: '+919491584669', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 33, owner: 'MD. Basheer/Kalilullah/Gose', mobile: '+919491584669', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 34, owner: 'MD. Basheer/Kalilullah/Gose', mobile: '+919491584669', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 35, owner: 'MD. Basheer/Kalilullah/Gose', mobile: '+919491584669', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 36, owner: 'MD. Basheer/Kalilullah/Gose', mobile: '+919491584669', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 37, owner: 'V. Sivaji', mobile: '+919949413409', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 40, owner: 'B. Radhakumari', mobile: '+919491380096', alternativeMobile: '+919908636250', plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 52, owner: 'P. Anjaneya Das', mobile: '+919848794767', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 65, owner: 'B. Padmavathi Devi', mobile: '+918074937593', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 73, owner: 'P. Rakesh', mobile: '+918919112471', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 75, owner: 'Gangaraju', mobile: '+919393049750', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 78, owner: 'Sambasivarao', mobile: '+919492482163', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 95, owner: 'Abdul Wajid', mobile: '+917893774846', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 102, owner: 'MD. Kareemullah', mobile: '+919291752412', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 106, owner: 'G. Kondababu', mobile: '+919989120209', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 109, owner: 'Pulagani Ramadevi', mobile: '+919393652827', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 110, owner: 'M. Nalani Kumari', mobile: '+919393911464', alternativeMobile: '+919393652827', plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 111, owner: 'M. Nalani Kumari', mobile: '+919393911464', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 113, owner: 'Collector Office Madam', mobile: '+919154769111', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 114, owner: 'VV. Nagabushan', mobile: '+918897972298', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 116, owner: 'V. Anitha', mobile: '+918374924161', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 121, owner: 'Sudhakar', mobile: '+919247402890', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 123, owner: 'MD. Abdullah', mobile: '+917569958038', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 124, owner: 'S. Nagaraju', mobile: '+919866341198', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 125, owner: 'L.V.N. Sastry', mobile: '+919989347789', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 127, owner: 'V. Vasu', mobile: '+919550529929', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 130, owner: 'CH. Rambabu', mobile: '+916302122508', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 132, owner: 'CH. Nageswara Rao', mobile: '+919849309522', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 133, owner: 'VV. Nagabushan', mobile: '+918897972298', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 137, owner: 'M. Ramana', mobile: '+919866172123', alternativeMobile: '+919866172123', plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 151, owner: 'P. Kalpana Devi', mobile: '+917036515490', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 152, owner: 'Tata Mounika', mobile: '+917904349625', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 216, owner: 'Marakani Vasu', mobile: '+919347222233', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 224, owner: 'V. Vijay Kumar', mobile: '+919247330326', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' },
            { number: 225, owner: 'L. Ramakrishna', mobile: '+919440540395', alternativeMobile: null, plotSize: '167 Sq. Yards', registrationDate: '2026-01-01', status: 'owned' }
        ];
    }

    /**
     * Initialize database
     */
    async initialize() {
        try {
            const stored = this.getFromStorage();
            if (!stored || stored.length === 0) {
                // Load default data if no data exists
                await this.saveToStorage(this.defaultData);
                return this.defaultData;
            }
            return stored;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            return this.defaultData;
        }
    }

    /**
     * Get all plots from storage
     */
    async getAllPlots() {
        try {
            const stored = this.getFromStorage();
            return stored || this.defaultData;
        } catch (error) {
            console.error('Failed to get all plots:', error);
            return this.defaultData;
        }
    }

    /**
     * Register a new plot
     */
    async registerPlot(plotNumber, plotData) {
        try {
            const plots = await this.getAllPlots();
            
            const newPlot = {
                number: plotNumber,
                owner: plotData.owner,
                mobile: plotData.mobile,
                alternativeMobile: plotData.alternativeMobile || null,
                plotSize: '167 Sq. Yards',
                registrationDate: new Date().toLocaleDateString(),
                status: 'owned'
            };
            
            // Remove existing entry for this plot number if it exists
            const filteredPlots = plots.filter(p => p.number !== plotNumber);
            filteredPlots.push(newPlot);
            
            await this.saveToStorage(filteredPlots);
            return newPlot;
        } catch (error) {
            console.error('Failed to register plot:', error);
            throw error;
        }
    }

    /**
     * Update plot information
     */
    async updatePlot(plotNumber, plotData) {
        try {
            const plots = await this.getAllPlots();
            const index = plots.findIndex(p => p.number === plotNumber);
            
            if (index !== -1) {
                plots[index] = { ...plots[index], ...plotData };
                await this.saveToStorage(plots);
                return plots[index];
            }
            throw new Error('Plot not found');
        } catch (error) {
            console.error('Failed to update plot:', error);
            throw error;
        }
    }

    /**
     * Delete plot
     */
    async deletePlot(plotNumber) {
        try {
            const plots = await this.getAllPlots();
            const filteredPlots = plots.filter(p => p.number !== plotNumber);
            await this.saveToStorage(filteredPlots);
            return true;
        } catch (error) {
            console.error('Failed to delete plot:', error);
            throw error;
        }
    }

    /**
     * Get data from localStorage
     */
    getFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get data from storage:', error);
            return [];
        }
    }

    /**
     * Save data to localStorage
     */
    async saveToStorage(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data to storage:', error);
            throw error;
        }
    }

    /**
     * Export data to Excel (CSV format)
     */
    async exportToExcel(plots) {
        try {
            const csvContent = this.generateCSV(plots);
            this.downloadFile(csvContent, 'teachers_colony_plots.csv', 'text/csv');
        } catch (error) {
            console.error('Failed to export to Excel:', error);
            throw error;
        }
    }

    /**
     * Generate CSV content
     */
    generateCSV(plots) {
        const headers = ['Plot Number', 'Owner Name', 'Primary Mobile', 'Alternative Mobile', 'Plot Size', 'Status', 'Registration Date'];
        const csvRows = [headers.join(',')];
        
        plots.forEach(plot => {
            const row = [
                plot.number,
                `"${plot.owner || ''}"`,
                plot.mobile || '',
                plot.alternativeMobile || '',
                `"${plot.plotSize || ''}"`,
                plot.status || 'available',
                plot.registrationDate || ''
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * Import data from file
     */
    async importFromFile(file) {
        try {
            const content = await this.readFile(file);
            const plots = this.parseCSV(content);
            await this.saveToStorage(plots);
            return plots;
        } catch (error) {
            console.error('Failed to import from file:', error);
            throw error;
        }
    }

    /**
     * Read file content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV content
     */
    parseCSV(content) {
        try {
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            const plots = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                if (values.length >= headers.length) {
                    const plot = {
                        number: parseInt(values[0]) || 0,
                        owner: values[1] || null,
                        mobile: values[2] || null,
                        alternativeMobile: values[3] || null,
                        plotSize: values[4] || '167 Sq. Yards',
                        status: values[5] || 'available',
                        registrationDate: values[6] || null
                    };
                    
                    if (plot.number > 0 && plot.number <= 175) {
                        plots.push(plot);
                    }
                }
            }
            
            return plots;
        } catch (error) {
            console.error('Failed to parse CSV:', error);
            throw error;
        }
    }

    /**
     * Sync to GitHub (create downloadable files)
     */
    async syncToGitHub(plots) {
        try {
            // Create JSON file for GitHub
            const jsonData = {
                metadata: {
                    colony_name: 'Teachers Colony',
                    location: 'Machilipatnam',
                    total_plots: 175,
                    last_updated: new Date().toISOString(),
                    version: '2.0'
                },
                plots: plots,
                statistics: {
                    owned_plots: plots.filter(p => p.status === 'owned').length,
                    available_plots: plots.filter(p => p.status === 'available').length,
                    ownership_percentage: ((plots.filter(p => p.status === 'owned').length / 175) * 100).toFixed(2) + '%'
                }
            };
            
            const jsonString = JSON.stringify(jsonData, null, 2);
            const csvContent = this.generateCSV(plots);
            
            // Download JSON file
            this.downloadFile(jsonString, 'teachers_colony_database.json', 'application/json');
            
            // Download CSV file
            this.downloadFile(csvContent, 'teachers_colony_database.csv', 'text/csv');
            
            return true;
        } catch (error) {
            console.error('Failed to sync to GitHub:', error);
            throw error;
        }
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            throw error;
        }
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        try {
            const plots = await this.getAllPlots();
            const owned = plots.filter(p => p.status === 'owned').length;
            const available = plots.filter(p => p.status === 'available').length;
            
            return {
                total: plots.length,
                owned,
                available,
                ownershipRate: ((owned / 175) * 100).toFixed(2) + '%'
            };
        } catch (error) {
            console.error('Failed to get statistics:', error);
            throw error;
        }
    }
}

// Initialize global database manager
const databaseManager = new DatabaseManager();
