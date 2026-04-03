/**
 * UI Manager - Handles UI interactions, notifications, and user experience
 */
class UIManager {
    constructor() {
        this.toastContainer = null;
        this.modals = new Map();
        this.initializeToastContainer();
    }

    /**
     * Initialize toast container
     */
    initializeToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            pointer-events: auto;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        // Remove on click
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }

    /**
     * Get toast color based on type
     */
    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show confirmation dialog
     */
    showConfirmation(message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div class="mb-4">
                    <h3 class="text-lg font-bold text-gray-800">Confirm Action</h3>
                </div>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex space-x-3">
                    <button id="confirm-btn" class="btn btn-danger flex-1">
                        <i class="fas fa-check mr-2"></i>Confirm
                    </button>
                    <button id="cancel-btn" class="btn btn-outline flex-1">
                        <i class="fas fa-times mr-2"></i>Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const confirmBtn = modal.querySelector('#confirm-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');
        
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            if (onConfirm) onConfirm();
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            if (onCancel) onCancel();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                if (onCancel) onCancel();
            }
        });
    }

    /**
     * Show loading spinner
     */
    showLoading(message = 'Loading...') {
        const existing = document.getElementById('global-loading');
        if (existing) return;
        
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        loading.innerHTML = `
            <div class="bg-white rounded-lg p-8 flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        
        document.body.appendChild(loading);
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.parentNode.removeChild(loading);
        }
    }

    /**
     * Show modal with custom content
     */
    showModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                        <button class="close-modal text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        return modal;
    }

    /**
     * Animate number counting
     */
    animateNumber(element, target, duration = 1000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    /**
     * Add CSS animations dynamically
     */
    addAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            .fade-in {
                animation: fadeIn 0.3s ease-in;
            }
            
            .pulse {
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Format phone number
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
        }
        
        if (cleaned.length === 10) {
            return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
        
        return phone;
    }

    /**
     * Validate phone number
     */
    validatePhoneNumber(phone) {
        if (!phone) return false;
        
        const cleaned = phone.replace(/\D/g, '');
        
        // Check if it's a valid 10-digit number or starts with +91
        return (cleaned.length === 10) || 
               (cleaned.length === 12 && cleaned.startsWith('91'));
    }

    /**
     * Validate email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
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
     * Format date
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString();
        }
        
        if (format === 'long') {
            return d.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        if (format === 'time') {
            return d.toLocaleString();
        }
        
        return d.toLocaleDateString();
    }

    /**
     * Initialize UI enhancements
     */
    initialize() {
        this.addAnimations();
        
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Add form validation styles
        const style = document.createElement('style');
        style.textContent = `
            .form-input.error {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
            
            .form-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize global UI manager
const uiManager = new UIManager();
