/**
 * Page Router Module
 * Handles all page navigation and visibility
 */

class PageRouter {
    constructor() {
        this.pages = {
            home: 'home-page',
            map: 'map-page',
            contacts: 'contacts-page',
            documents: 'documents-page',
            gallery: 'gallery-page',
            plotIssues: 'plot-issues-page',
            meetingNotes: 'meeting-notes-page'
        };
    }

    showPage(pageName) {
        // Hide all pages first
        this.hideAllPages();

        // Show requested page
        const pageId = this.pages[pageName];
        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'block';
            page.classList.add('show');
        }

        // Handle special cases
        switch(pageName) {
            case 'home':
                document.querySelector('.main-container').style.display = 'flex';
                break;
            case 'map':
                document.querySelector('.main-container').style.display = 'none';
                // Ensure api exists
                if (!window.api) {
                    window.api = { plotDatabase: [] };
                }
                // Load data if needed
                if (window.loadGoogleSheetData && window.api.plotDatabase.length === 0) {
                    window.loadGoogleSheetData();
                }
                // Initialize/refresh the map plots
                if (window.api.initializePlots) {
                    window.api.initializePlots();
                }
                break;
            case 'contacts':
                document.querySelector('.main-container').style.display = 'none';
                // Ensure api exists
                if (!window.api) {
                    window.api = { plotDatabase: [] };
                }
                // Always call loadContactsList - it will handle empty data
                if (window.loadContactsList) {
                    console.log('Loading contacts list...');
                    window.loadContactsList();
                } else {
                    console.error('loadContactsList function not found!');
                }
                break;
        }

        // Update active nav
        this.updateActiveNav(pageName);
    }

    hideAllPages() {
        document.querySelector('.main-container').style.display = 'none';
        Object.values(this.pages).forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.style.display = 'none';
                page.classList.remove('show');
            }
        });
    }

    updateActiveNav(activePage) {
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });
    }
}

// Initialize router
window.pageRouter = new PageRouter();

// Global navigation functions
function showHomePage() {
    window.pageRouter.showPage('home');
}

function showMapPage() {
    window.pageRouter.showPage('map');
}

function showContactsPage() {
    window.pageRouter.showPage('contacts');
}

function showDocumentsPage() {
    window.pageRouter.showPage('documents');
    loadDocumentsContent();
}

function showGalleryPage() {
    window.pageRouter.showPage('gallery');
}

function showPlotIssuesPage() {
    window.pageRouter.showPage('plotIssues');
    if (window.loadPlotIssues) {
        window.loadPlotIssues();
    }
}

function showMeetingNotesPage() {
    window.pageRouter.showPage('meetingNotes');
    if (window.loadMeetingNotes) {
        window.loadMeetingNotes();
    }
}

function showDocumentsContent() {
    const contentDiv = document.getElementById('documents-content');
    if (contentDiv) {
        contentDiv.innerHTML = '<iframe class="documents-iframe" src="https://drive.google.com/embeddedfolderview?id=1mUqWFHIQa08Z7wxsKGmXrsiHpqSuixKM#grid"></iframe>';
        contentDiv.style.display = 'block';
    }
}

console.log('Page Router loaded');
