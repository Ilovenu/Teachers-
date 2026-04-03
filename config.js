// ==========================================
// TEACHERS COLONY - CONFIGURATION FILE
// ==========================================
// This file contains all configuration settings
// Update this file for easy maintenance

// GitHub Configuration
const GITHUB_CONFIG = {
    token: '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',
    gistId: '5397a86680129b2d3534059577f8865c',
    gistUrl: 'https://gist.github.com/Ilovenu/5397a86680129b2d3534059577f8865c',
    apiEndpoint: 'https://api.github.com/gists'
};

// Application Configuration
const APP_CONFIG = {
    name: 'Teachers Colony Plot Management System',
    version: '2.0.0',
    totalPlots: 175,
    colony: 'Teachers Colony',
    location: 'Machilipatnam',
    description: 'Premium Residential Plots in Machilipatnam'
};

// Plot Layout Configuration
const PLOT_LAYOUT = {
    // Left side plots (West)
    left: [
        { rowId: 'r161', plots: [161, 162, 163, 164, 165, 166] },
        { rowId: 'r160', plots: [160, 159, 158, 157, 156, 155] },
        { rowId: 'r130', plots: [130, 131, 132, 133, 134, 135, 136] },
        { rowId: 'r129', plots: [129, 128, 127, 126, 125, 124, 123] },
        { rowId: 'r98', plots: [98, 99, 100, 101, 102, 103, 104] },
        { rowId: 'r97', plots: [97, 96, 95, 94, 93, 92, 91] },
        { rowId: 'r65', plots: [65, 66, 67, 68, 69, 70, 71, 72] },
        { rowId: 'r64', plots: [64, 63, 62, 61, 60, 59, 58, 57] },
        { rowId: 'r33', plots: [33, 34, 35, 36, 37, 38, 39] },
        { rowId: 'r32', plots: [32, 31, 30, 29, 28, 27, 26] },
        { rowId: 'r9', plots: [9, 8, 7, 6, 5] },
        { rowId: 'r1', plots: [4, 3, 2, 1] }
    ],
    
    // Right side plots (East)
    right: [
        { rowId: 'r167', plots: [167, 168, 169, 170, 171, 172, 173, 174, 175] },
        { rowId: 'r154', plots: [154, 153, 152, 151, 150, 149, 148, 147, 146] },
        { rowId: 'r137', plots: [137, 138, 139, 140, 141, 142, 143, 144, 145] },
        { rowId: 'r122', plots: [122, 121, 120, 119, 118, 117, 116, 115, 114] },
        { rowId: 'r105', plots: [105, 106, 107, 108, 109, 110, 111, 112, 113] },
        { rowId: 'r90', plots: [90, 89, 88, 87, 86, 85, 84, 83, 82] },
        { rowId: 'r73', plots: [73, 74, 75, 76, 77, 78, 79, 80, 81] },
        { rowId: 'r56', plots: [56, 55, 54, 53, 52, 51, 50, 49, 48] },
        { rowId: 'r40', plots: [40, 41, 42, 43, 44, 45, 46, 47] },
        { rowId: 'r25', plots: [25, 24, 23, 22, 21, 20, 19, 18] },
        { rowId: 'r10', plots: [10, 11, 12, 13, 14, 15, 16, 17] }
    ]
};

// Sample Data Configuration
const SAMPLE_DATA = [
    {
        'Plot Number': '16',
        'Owner Name': 'L. Subramanyam',
        'Primary Mobile': '+918499899833',
        'Alternative Mobile': '',
        'Plot Size': '167 Sq. Yards',
        'Status': 'owned',
        'Registration Date': new Date().toLocaleDateString()
    },
    {
        'Plot Number': '17',
        'Owner Name': 'Jogi Kanakadurga',
        'Primary Mobile': '+919963729133',
        'Alternative Mobile': '',
        'Plot Size': '167 Sq. Yards',
        'Status': 'owned',
        'Registration Date': new Date().toLocaleDateString()
    },
    {
        'Plot Number': '25',
        'Owner Name': 'K. Nagambicamani',
        'Primary Mobile': '+919949726566',
        'Alternative Mobile': '',
        'Plot Size': '167 Sq. Yards',
        'Status': 'owned',
        'Registration Date': new Date().toLocaleDateString()
    },
    {
        'Plot Number': '27',
        'Owner Name': 'M. Sekhar',
        'Primary Mobile': '+919866172123',
        'Alternative Mobile': '',
        'Plot Size': '167 Sq. Yards',
        'Status': 'owned',
        'Registration Date': new Date().toLocaleDateString()
    },
    {
        'Plot Number': '1',
        'Owner Name': 'Contacted Lead',
        'Primary Mobile': '+919876543213',
        'Alternative Mobile': '',
        'Plot Size': '167 Sq. Yards',
        'Status': 'contacted',
        'Registration Date': new Date().toLocaleDateString()
    }
];

// UI Configuration
const UI_CONFIG = {
    colors: {
        owned: '#e8f5e9',
        ownedHover: '#c8e6c9',
        contacted: '#fff3cd',
        contactedHover: '#ffe69c',
        available: '#ffffff',
        availableHover: '#f8f9fa'
    },
    plotSizes: [
        '167 Sq. Yards',
        '200 Sq. Yards',
        '250 Sq. Yards',
        '300 Sq. Yards'
    ],
    notificationDuration: 3000
};

// Export all configurations
window.CONFIG = {
    GITHUB: GITHUB_CONFIG,
    APP: APP_CONFIG,
    PLOT_LAYOUT: PLOT_LAYOUT,
    SAMPLE_DATA: SAMPLE_DATA,
    UI: UI_CONFIG
};

console.log('Configuration loaded successfully');
