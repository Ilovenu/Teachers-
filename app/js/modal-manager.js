/**
 * Modal Manager Module
 * Handles edit modal, add modal, and other dialogs
 */

// Global variable for tracking current edit
window.currentEditPlotNumber = null;

function openEditModal(plotNumber) {
    console.log('openEditModal called for plot:', plotNumber);
    window.currentEditPlotNumber = plotNumber;
    
    // Ensure api and database exist
    if (!window.api) {
        window.api = { plotDatabase: [] };
    }
    if (!window.api.plotDatabase) {
        window.api.plotDatabase = [];
    }
    
    const plot = window.api.plotDatabase.find(p => 
        String(p.plot_number || p['Plot No']) === String(plotNumber)
    );
    
    const plotNumSpan = document.getElementById('edit-plot-num');
    const ownerInput = document.getElementById('edit-owner');
    const owner1Input = document.getElementById('edit-owner1');
    const mobileInput = document.getElementById('edit-mobile');
    const mobileCallBtn = document.getElementById('edit-mobile-call');
    const altMobileInput = document.getElementById('edit-altmobile');
    const altMobile1Input = document.getElementById('edit-altmobile1');
    const altMobile2Input = document.getElementById('edit-altmobile2');
    const lrsInput = document.getElementById('edit-lrs');
    const sizeInput = document.getElementById('edit-size');
    const taxInput = document.getElementById('edit-tax');
    const modal = document.getElementById('edit-modal');
    
    if (plotNumSpan) plotNumSpan.textContent = plotNumber;
    
    if (plot) {
        if (ownerInput) ownerInput.value = plot['Owner'] || plot.owner_name || '';
        if (owner1Input) owner1Input.value = plot['Owner1'] || plot['Owner 1'] || plot.owner1 || '';
        if (mobileInput) mobileInput.value = plot['Mobile'] || plot.primary_mobile || '';
        if (mobileCallBtn) mobileCallBtn.href = 'tel:+91' + (plot['Mobile'] || plot.primary_mobile || '');
        if (altMobileInput) altMobileInput.value = plot['AltMobile'] || plot.alt_mobile || '';
        if (altMobile1Input) altMobile1Input.value = plot['AltMobile1'] || plot.alt_mobile1 || '';
        if (altMobile2Input) altMobile2Input.value = plot['AltMobile2'] || plot.alt_mobile2 || '';
        if (lrsInput) lrsInput.value = plot['LRS'] || plot.lrs_status || '';
        if (sizeInput) sizeInput.value = plot['Size'] || plot.size || '';
        if (taxInput) taxInput.value = plot['Tax'] || plot.tax_status || '';
    } else {
        // Clear form for new entry
        if (ownerInput) ownerInput.value = '';
        if (owner1Input) owner1Input.value = '';
        if (mobileInput) mobileInput.value = '';
        if (mobileCallBtn) mobileCallBtn.href = 'tel:';
        if (altMobileInput) altMobileInput.value = '';
        if (altMobile1Input) altMobile1Input.value = '';
        if (altMobile2Input) altMobile2Input.value = '';
        if (lrsInput) lrsInput.value = '';
        if (sizeInput) sizeInput.value = '';
        if (taxInput) taxInput.value = '';
    }
    
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeEditModal() {
    console.log('closeEditModal called');
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    window.currentEditPlotNumber = null;
}

function openAddModal(plotNumber) {
    console.log('openAddModal called for plot:', plotNumber);
    // For now, use same modal as edit but with empty fields
    openEditModal(plotNumber);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('edit-modal');
    if (modal && e.target === modal) {
        closeEditModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

console.log('Modal Manager loaded');
