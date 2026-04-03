/**
 * Main Application Entry Point
 * Teachers Colony Plot Management System
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize UI manager first
        uiManager.initialize();
        
        // Show loading
        uiManager.showLoading('Initializing Teachers Colony System...');
        
        // Initialize database
        await databaseManager.initialize();
        
        // Initialize plot manager
        await plotManager.initialize();
        
        // Hide loading
        uiManager.hideLoading();
        
        // Show welcome message
        uiManager.showToast('Teachers Colony System loaded successfully!', 'success');
        
        // Add keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Add responsive behavior
        setupResponsiveBehavior();
        
        console.log('Teachers Colony Plot Management System initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        uiManager.hideLoading();
        uiManager.showToast('Failed to load application. Please refresh the page.', 'error');
    }
});

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + E: Export to Excel
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            plotManager.exportToExcel();
        }
        
        // Ctrl/Cmd + I: Import database
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            plotManager.importDatabase();
        }
        
        // Ctrl/Cmd + G: GitHub sync
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
            e.preventDefault();
            plotManager.syncToGitHub();
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        
        // Escape: Close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('plot-modal');
            if (!modal.classList.contains('hidden')) {
                plotManager.closeModal();
            }
        }
        
        // Ctrl/Cmd + R: Reset filters
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            plotManager.resetFilters();
        }
    });
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior() {
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Re-render plot map on resize if needed
            if (window.innerWidth < 768) {
                plotManager.renderPlotMap();
            }
        }, 250);
    });
    
    // Handle orientation change for mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            plotManager.renderPlotMap();
        }, 100);
    });
    
    // Add touch support for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
}

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    uiManager.showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    uiManager.showToast('An unexpected error occurred. Please refresh the page.', 'error');
});

/**
 * Service Worker registration (for PWA support)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

/**
 * Analytics and performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
    }
    
    mark(name) {
        this.metrics[name] = performance.now() - this.startTime;
    }
    
    getMetrics() {
        return this.metrics;
    }
    
    logMetrics() {
        console.log('Performance Metrics:', this.metrics);
    }
}

// Initialize performance monitor
const perfMonitor = new PerformanceMonitor();
perfMonitor.mark('app-start');

// Mark initialization milestones
document.addEventListener('DOMContentLoaded', () => {
    perfMonitor.mark('dom-loaded');
});

window.addEventListener('load', () => {
    perfMonitor.mark('fully-loaded');
    perfMonitor.logMetrics();
    
    // Log performance metrics
    const loadTime = perfMonitor.getMetrics()['fully-loaded'];
    if (loadTime < 1000) {
        console.log('🚀 Fast load time:', loadTime.toFixed(2), 'ms');
    } else if (loadTime < 3000) {
        console.log('⚡ Good load time:', loadTime.toFixed(2), 'ms');
    } else {
        console.log('🐌 Slow load time:', loadTime.toFixed(2), 'ms');
    }
});

/**
 * Feature detection and browser compatibility
 */
class BrowserCompatibility {
    static checkFeatures() {
        const features = {
            localStorage: this.checkLocalStorage(),
            fileApi: this.checkFileApi(),
            clipboard: this.checkClipboard(),
            fetch: this.checkFetch(),
            es6: this.checkES6()
        };
        
        console.log('Browser Features:', features);
        
        // Show warnings for missing features
        if (!features.localStorage) {
            uiManager.showToast('Your browser doesn\'t support localStorage. Some features may not work.', 'warning');
        }
        
        if (!features.fileApi) {
            uiManager.showToast('Your browser doesn\'t support File API. Import/Export may not work.', 'warning');
        }
        
        return features;
    }
    
    static checkLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    static checkFileApi() {
        return !!(window.File && window.FileReader && window.FileList && window.Blob);
    }
    
    static checkClipboard() {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
    }
    
    static checkFetch() {
        return !!(window.fetch && window.Request);
    }
    
    static checkES6() {
        try {
            eval('const test = () => {}');
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Check browser compatibility
BrowserCompatibility.checkFeatures();

/**
 * Theme management (dark mode support)
 */
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme();
    }
    
    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }
    
    applyTheme() {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${this.currentTheme}`);
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

/**
 * Export global functions for external access
 */
window.TeachersColonyApp = {
    plotManager,
    databaseManager,
    uiManager,
    themeManager,
    perfMonitor,
    BrowserCompatibility
};

/**
 * Development helpers (remove in production)
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.TeachersColonyApp.dev = {
        clearData: () => databaseManager.clearAllData(),
        exportData: () => plotManager.exportToExcel(),
        showMetrics: () => perfMonitor.logMetrics(),
        toggleTheme: () => themeManager.toggle()
    };
    
    console.log('🛠️ Development mode enabled');
    console.log('Available dev commands:');
    console.log('- TeachersColonyApp.dev.clearData()');
    console.log('- TeachersColonyApp.dev.exportData()');
    console.log('- TeachersColonyApp.dev.showMetrics()');
    console.log('- TeachersColonyApp.dev.toggleTheme()');
}
