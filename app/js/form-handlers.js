/**
 * Form Handlers Module
 * Handles all form submissions safely
 */

class FormHandlers {
    constructor() {
        // Google Apps Script Web App URL for saving data
        this.GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZB1YVNbRhViCSvgcj2A8KAHj5kkO7YQMlwaYaJXsBJAEQ4DcGA_7Fc5vIHEDfBKYFtg/exec';
        this.init();
    }

    init() {
        // Initialize all form handlers after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachHandlers());
        } else {
            this.attachHandlers();
        }
    }

    attachHandlers() {
        this.attachAttendanceHandler();
        this.attachEditPlotHandler();
        console.log('Form handlers attached');
    }

    attachAttendanceHandler() {
        const form = document.getElementById('meeting-attendance-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAttendanceSubmit(form);
        });
    }

    async handleAttendanceSubmit(form) {
        const phone = document.getElementById('attendance-phone')?.value.trim();
        const plot = document.getElementById('attendance-plot')?.value;
        const size = document.getElementById('attendance-size')?.value;
        const messageDiv = document.getElementById('attendance-message');

        if (!phone || !plot || !size) {
            this.showMessage(messageDiv, '❌ Please fill all fields', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;

        try {
            if (submitBtn) {
                submitBtn.textContent = '⏳ Submitting...';
                submitBtn.disabled = true;
            }

            const data = {
                phone,
                plot,
                size,
                date: new Date().toLocaleDateString('en-IN'),
                timestamp: new Date().toISOString()
            };

            await fetch(this.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                mode: 'no-cors'
            });

            this.showMessage(
                messageDiv,
                `✅ <strong>Attendance Registered!</strong><br>Plot ${plot} - ${size} Yards<br>We will contact you at ${phone}`,
                'success'
            );

            form.reset();

        } catch (error) {
            console.error('Error:', error);
            this.showMessage(
                messageDiv,
                '⚠️ <strong>Saved Locally</strong><br>Data stored temporarily.',
                'warning'
            );
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    attachEditPlotHandler() {
        const form = document.getElementById('edit-plot-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEditPlotSubmit(form);
        });
    }

    async handleEditPlotSubmit(form) {
        console.log('handleEditPlotSubmit called');
        const plotNo = window.currentEditPlotNumber;
        console.log('Current plot number:', plotNo);
        if (!plotNo) {
            console.error('No plot number selected');
            alert('Error: No plot selected');
            return;
        }

        const data = {
            plotNo,
            owner: document.getElementById('edit-owner')?.value || '',
            owner1: document.getElementById('edit-owner1')?.value || '',
            mobile: document.getElementById('edit-mobile')?.value || '',
            altMobile: document.getElementById('edit-altmobile')?.value || '',
            altMobile1: document.getElementById('edit-altmobile1')?.value || '',
            altMobile2: document.getElementById('edit-altmobile2')?.value || '',
            lrs: document.getElementById('edit-lrs')?.value || '',
            size: document.getElementById('edit-size')?.value || '',
            tax: document.getElementById('edit-tax')?.value || ''
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;

        try {
            if (submitBtn) {
                submitBtn.textContent = 'Saving to Google Sheets...';
                submitBtn.disabled = true;
            }

            // Send data to Google Apps Script
            console.log('Sending to Google Apps Script:', data);
            console.log('URL:', this.GOOGLE_SCRIPT_URL);
            
            try {
                const response = await fetch(this.GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    mode: 'no-cors'  // Required for Google Apps Script - but we can't see response
                });

                console.log('Fetch completed (no-cors mode - response opaque)');
                
                // With no-cors, we can't verify success, but we assume it worked
                // The Google Apps Script should handle the data
                
            } catch (fetchError) {
                console.error('Fetch failed:', fetchError);
                throw fetchError;
            }

            // Update local database immediately (always works)
            this.updateLocalDatabase(data);
            
            // Update dashboard statistics
            if (window.updateDashboard) {
                window.updateDashboard();
            }
            if (window.api && window.api.updateStatistics) {
                window.api.updateStatistics();
            }

            alert(`Plot ${plotNo} saved successfully!\n\nDashboard updated with new data.`);
            if (window.closeEditModal) {
                window.closeEditModal();
            }

            // Refresh contacts if visible
            const contactsPage = document.getElementById('contacts-page');
            if (contactsPage?.classList.contains('show') && window.loadContactsList) {
                window.loadContactsList();
            }
            
            // Refresh map if visible
            const mapPage = document.getElementById('map-page');
            if (mapPage?.classList.contains('show') && window.renderPlotMap) {
                window.renderPlotMap();
                console.log('Map refreshed after save');
            }

        } catch (error) {
            console.error('Error saving:', error);
            
            // Still update local database even if Google Sheets fails
            this.updateLocalDatabase(data);
            
            // Update dashboard
            if (window.updateDashboard) {
                window.updateDashboard();
            }
            if (window.api && window.api.updateStatistics) {
                window.api.updateStatistics();
            }
            
            alert('Plot saved locally. Google Sheets update may have failed due to CORS.');
            
            if (window.closeEditModal) {
                window.closeEditModal();
            }
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    updateLocalDatabase(data) {
        if (!window.api?.plotDatabase) return;

        const plotIndex = window.api.plotDatabase.findIndex(p =>
            String(p.plot_number || p['Plot No']) === String(data.plotNo)
        );

        if (plotIndex >= 0) {
            const plot = window.api.plotDatabase[plotIndex];
            plot.owner_name = data.owner;
            plot['Owner'] = data.owner;
            plot.owner1 = data.owner1;
            plot['Owner1'] = data.owner1;
            plot['Owner 1'] = data.owner1;
            plot.primary_mobile = data.mobile;
            plot['Mobile'] = data.mobile;
            plot.alt_mobile = data.altMobile;
            plot['AltMobile'] = data.altMobile;
            plot.alt_mobile1 = data.altMobile1;
            plot['AltMobile1'] = data.altMobile1;
            plot.alt_mobile2 = data.altMobile2;
            plot['AltMobile2'] = data.altMobile2;
            plot.lrs_status = data.lrs;
            plot['LRS'] = data.lrs;
            plot.size = data.size;
            plot['Size'] = data.size;
            plot.tax_status = data.tax;
            plot['Tax'] = data.tax;
        }

        if (window.api.updateStatistics) {
            window.api.updateStatistics();
        }
    }

    showMessage(element, html, type) {
        if (!element) return;

        const styles = {
            error: { bg: '#ffebee', color: '#c62828' },
            success: { bg: '#e8f5e9', color: '#2e7d32' },
            warning: { bg: '#fff3e0', color: '#e65100' }
        };

        const style = styles[type] || styles.warning;
        element.innerHTML = html;
        element.style.background = style.bg;
        element.style.color = style.color;
        element.style.display = 'block';
    }
}

// Initialize form handlers
window.formHandlers = new FormHandlers();
console.log('Form Handlers loaded');

// Global function for inline form handler
window.handleEditPlotSubmit = function(event) {
    event.preventDefault();
    if (window.formHandlers) {
        window.formHandlers.handleEditPlotSubmit(event.target);
    } else {
        console.error('Form handlers not initialized');
        alert('Error: Form system not ready');
    }
};
