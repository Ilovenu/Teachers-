const O = {};

function fmt(p){const d=p.replace(/\D/g,'');return d.length===12&&d.startsWith('91')?`+91 ${d.slice(2,7)} ${d.slice(7)}`:p;}

function makeTd(n){
  const o=O[n];
  const td=document.createElement('td');
  
  if (o) {
    // Owned plot - green with owner name
    td.className='owned';
    td.innerHTML=`<span class="pn">${n}</span><span class="po">${o[0].n.split(' ').pop()}</span>`;
  } else if (plotDatabase.find(record => record['Plot Number'] == n && record['Status'] === 'contacted')) {
    // Contacted plot - yellow with mobile number
    const contactedRecord = plotDatabase.find(record => record['Plot Number'] == n && record['Status'] === 'contacted');
    td.className='contacted';
    const mobile = contactedRecord['Primary Mobile'];
    const shortMobile = mobile.replace('+91', '').slice(-4); // Show last 4 digits
    td.innerHTML=`<span class="pn">${n}</span><span class="pc">${shortMobile}</span>`;
  } else {
    // Available plot - white
    td.className='available';
    td.innerHTML=`<span class="pn">${n}</span>`;
  }
  
  td.onclick=()=>show(n);
  return td;
}

function fill(id,nums){
  const el=document.getElementById(id);
  if(!el) return;
  nums.forEach(n=>el.appendChild(makeTd(n)));
}

// Don't render plots initially - wait for data to load
// fill('r161',[161,162,163,164,165,166]);
// fill('r160',[160,159,158,157,156,155]);
// fill('r167',[167,168,169,170,171,172,173,174,175]);
// fill('r154',[154,153,152,151,150,149,148,147,146]);
// fill('r130',[130,131,132,133,134,135,136]);
// fill('r129',[129,128,127,126,125,124,123]);
// fill('r137',[137,138,139,140,141,142,143,144,145]);
// fill('r122',[122,121,120,119,118,117,116,115,114]);
// fill('r98', [98,99,100,101,102,103,104]);
// fill('r97', [97,96,95,94,93,92,91]);
// fill('r105',[105,106,107,108,109,110,111,112,113]);
// fill('r90', [90,89,88,87,86,85,84,83,82]);
// fill('r65', [65,66,67,68,69,70,71,72]);
// fill('r64', [64,63,62,61,60,59,58,57]);
// fill('r73', [73,74,75,76,77,78,79,80,81]);
// fill('r56', [56,55,54,53,52,51,50,49,48]);
// fill('r33', [33,34,35,36,37,38,39]);
// fill('r32', [32,31,30,29,28,27,26]);
// fill('r40', [40,41,42,43,44,45,46,47]);
// fill('r25', [25,24,23,22,21,20,19,18]);
// fill('r9',  [9,8,7,6,5]);
// fill('r10', [10,11,12,13,14,15,16,17]);
// fill('r1',  [4,3,2,1]);

let selectedPlots = new Set();

function toggleSelection(n) {
  const td = event.target.closest('td');
  if (selectedPlots.has(n)) {
    selectedPlots.delete(n);
    td.style.backgroundColor = '';
  } else {
    selectedPlots.add(n);
    td.style.backgroundColor = '#ffeb3b';
  }
  updateSelectionCount();
}

function updateSelectionCount() {
  const count = selectedPlots.size;
  document.getElementById('selection-count').textContent = `${count} plots selected`;
}

function exportToExcel() {
  if (selectedPlots.size === 0) {
    alert('No plots selected! Please click on plot boxes to select them.');
    return;
  }
  
  // Create CSV content
  let csvContent = 'Plot Number,Status,Date\n';
  selectedPlots.forEach(plot => {
    csvContent += `${plot},Selected,${new Date().toLocaleDateString()}\n`;
  });
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selected_plots_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  alert(`Exported ${selectedPlots.size} plots to Excel file!`);
}

function show(n){
  const o=O[n];
  document.getElementById('m-num').textContent='Plot '+n;
  
  // Check if plot is contacted
  const contactedRecord = plotDatabase.find(record => record['Plot Number'] == n && record['Status'] === 'contacted');
  
  if(o){
    // Owned plot
    document.getElementById('owner-info').style.display = 'block';
    document.getElementById('registration-form').style.display = 'none';
    
    document.getElementById('m-owner').textContent=o.map(x=>x.n).join(' / ');
    document.getElementById('m-phone').textContent=fmt(o[0].p);
    document.getElementById('m-c1').href='tel:'+o[0].p;
    const c2=document.getElementById('m-c2');
    if(o[1]&&o[1].p!==o[0].p){c2.href='tel:'+o[1].p;c2.style.display='block';}
    else c2.style.display='none';
    document.getElementById('m-contact').style.display='';
    document.getElementById('m-none').style.display='none';
    
    // Show plot details
    document.getElementById('plot-size').textContent = getPlotSize(n);
    document.getElementById('plot-status').textContent = 'Owned';
    document.getElementById('m-details').style.display = 'block';
  } else if(contactedRecord) {
    // Contacted plot - show contact info
    document.getElementById('owner-info').style.display = 'block';
    document.getElementById('registration-form').style.display = 'none';
    
    document.getElementById('m-owner').textContent = 'Contacted Lead';
    document.getElementById('m-phone').textContent = fmt(contactedRecord['Primary Mobile']);
    document.getElementById('m-c1').href = 'tel:' + contactedRecord['Primary Mobile'];
    document.getElementById('m-c2').style.display = 'none';
    document.getElementById('m-contact').style.display = '';
    document.getElementById('m-none').style.display = 'none';
    
    // Show plot details
    document.getElementById('plot-size').textContent = getPlotSize(n);
    document.getElementById('plot-status').textContent = 'Contacted';
    document.getElementById('m-details').style.display = 'block';
  } else {
    // Available plot - show registration form
    document.getElementById('owner-info').style.display = 'none';
    document.getElementById('registration-form').style.display = 'block';
    
    // Clear form
    document.getElementById('plot-form').reset();
    
    // Set current plot number
    window.currentPlot = n;
  }
  document.getElementById('ov').classList.add('open');
}

function getPlotSize(n) {
  // First check if plot exists in database with size
  const plotRecord = plotDatabase.find(record => record['Plot Number'] == n);
  if (plotRecord && plotRecord['Plot Size']) {
    return plotRecord['Plot Size'];
  }
  
  // If not in database, return empty string
  return '';
}

function closeModal(){document.getElementById('ov').classList.remove('open');}
document.getElementById('ov').addEventListener('click',function(e){if(e.target===this)closeModal();});

// Excel Database Management
let plotDatabase = [];

// Auto-load database from localStorage on page start
function autoLoadDatabase() {
  const savedData = localStorage.getItem('plotDatabaseExcel');
  if (savedData) {
    try {
      plotDatabase = JSON.parse(savedData);
      // Restore O object from saved data
      plotDatabase.forEach(record => {
        if (record['Plot Number'] && record['Owner Name'] && record['Primary Mobile']) {
          const plotNum = parseInt(record['Plot Number']);
          const owners = [];
          owners.push({n: record['Owner Name'], p: record['Primary Mobile']});
          if (record['Alternative Mobile']) {
            owners.push({n: record['Owner Name'], p: record['Alternative Mobile']});
          }
          O[plotNum] = owners;
        }
      });
      
      // Refresh display after loading
      setTimeout(() => {
        refreshPlotDisplay();
      }, 100);
      
      console.log(`Auto-loaded ${plotDatabase.length} plot registrations from previous session.`);
    } catch (error) {
      console.error('Error loading saved database:', error);
      // If localStorage fails, try loading from shared storage
      tryLoadFromSharedStorage();
    }
  } else {
    // If no saved data in localStorage, try loading from shared storage first
    console.log('No local data found, attempting to load from shared storage...');
    tryLoadFromSharedStorage();
  }
}

// Try to load from shared storage with fallback to default data
function tryLoadFromSharedStorage() {
  const gistId = '5397a86680129b2d3534059577f8865c';
  const githubToken = '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';
  
  fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${githubToken}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('GitHub API request failed');
    }
    return response.json();
  })
  .then(data => {
    try {
      const sharedData = JSON.parse(data.files['teachers_colony_database.json'].content);
      
      // Load shared data into plotDatabase
      plotDatabase = sharedData;
      
      // Restore O object from shared data
      plotDatabase.forEach(record => {
        if (record['Plot Number'] && record['Owner Name'] && record['Primary Mobile']) {
          const plotNum = parseInt(record['Plot Number']);
          const owners = [];
          owners.push({n: record['Owner Name'], p: record['Primary Mobile']});
          if (record['Alternative Mobile']) {
            owners.push({n: record['Owner Name'], p: record['Alternative Mobile']});
          }
          O[plotNum] = owners;
        }
      });
      
      // Save to localStorage for future use
      localStorage.setItem('plotDatabaseExcel', JSON.stringify(plotDatabase));
      
      // Refresh display after loading
      setTimeout(() => {
        refreshPlotDisplay();
      }, 100);
      
      console.log(`Successfully loaded ${plotDatabase.length} plot registrations from shared storage.`);
      showNotification('Data loaded from cloud storage!');
    } catch (parseError) {
      console.error('Error parsing shared data:', parseError);
      loadDefaultData();
    }
  })
  .catch(error => {
    console.error('Error loading from shared storage:', error);
    console.log('Falling back to embedded default data...');
    loadDefaultData();
  });
}

// Load data from embedded CSV data
function loadDefaultData() {
  console.log('Loading embedded CSV data...');
  // Embed the CSV data directly to avoid CORS issues
  const csvData = `Plot Number,Owner Name,Primary Mobile,Alternative Mobile,Plot Size,Status,Registration Date,Colony,Location
1,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
2,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
3,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
4,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
5,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
6,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
7,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
8,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
9,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
10,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
11,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
12,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
13,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
14,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
15,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
16,"L. Subramanyam","+918499899833",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
17,"Jogi Kanakadurga","+919963729133",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
18,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
19,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
20,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
21,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
22,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
23,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
24,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
25,"K. Nagambicamani","+919949726566",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
26,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
27,"M. Sekhar","+919866172123",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
28,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
29,"MD. Basheer","+919491584669",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
30,"Kalilullah","+919000548786",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
31,"Gose","+919154078692",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
32,"MD. Basheer/Kalilullah/Gose","+919491584669",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
33,"MD. Basheer/Kalilullah/Gose","+919491584669",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
34,"MD. Basheer/Kalilullah/Gose","+919491584669",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
35,"MD. Basheer/Kalilullah/Gose","+919491584669",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
36,"MD. Basheer/Kalilullah/Gose","+919491584669",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
37,"V. Sivaji","+919949413409",,"167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam
38,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
39,"",,"","167 Sq. Yards","Available","",Teachers Colony,Machilipatnam
40,"B. Radhakumari","+919491380096","+919908636250","167 Sq. Yards","owned","2026-01-01",Teachers Colony,Machilipatnam`;
  
  parseCSVData(csvData);
  saveToLocalStorage();
  setTimeout(() => {
    refreshPlotDisplay();
  }, 100);
  console.log(`Loaded ${plotDatabase.length} plot records from embedded data.`);
}

// Parse CSV data
function parseCSVData(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  plotDatabase = [];
  let loadedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    plotDatabase.push(record);
    
    // Update the O object with owned plot data
    if (record['Plot Number'] && record['Owner Name'] && record['Primary Mobile'] && record['Status'] === 'owned') {
      const plotNum = parseInt(record['Plot Number']);
      const owners = [];
      owners.push({n: record['Owner Name'], p: record['Primary Mobile']});
      if (record['Alternative Mobile']) {
        owners.push({n: record['Owner Name'], p: record['Alternative Mobile']});
      }
      O[plotNum] = owners;
      loadedCount++;
    }
  }
  
  console.log(`Loaded ${loadedCount} owned plots from CSV`);
}

// Save database to localStorage and upload to shared storage
function saveToLocalStorage() {
  console.log('Saving to localStorage...');
  try {
    localStorage.setItem('plotDatabaseExcel', JSON.stringify(plotDatabase));
    console.log('Successfully saved to localStorage');
    
    // Also upload to shared storage for multi-user access
    uploadToSharedStorage();
    
    // Save to central CSV hub
    saveToCentralCSVHub();
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Upload data to shared Google Sheet (for multi-user access)
function uploadToSharedStorage() {
  if (plotDatabase.length === 0) {
    console.log('No data to upload to shared storage');
    return;
  }
  
  // Using GitHub Gist for simplicity (free, public, multi-user)
  const gistData = {
    description: `Teachers Colony Plot Database - Updated ${new Date().toLocaleString()}`,
    public: true,
    files: {
      'teachers_colony_database.json': {
        content: JSON.stringify(plotDatabase, null, 2)
      }
    }
  };
  
  const githubToken = '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';
  const gistId = '5397a86680129b2d3534059577f8865c';
  
  fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gistData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Successfully uploaded to shared storage:', data.html_url);
    showNotification('Data saved to shared storage! All users can see updates.');
  })
  .catch(error => {
    console.error('Error uploading to shared storage:', error);
    showNotification('Using local storage only. Shared storage unavailable.');
  });
}

// Save to Central CSV Hub
function saveToCentralCSVHub() {
  if (plotDatabase.length === 0) {
    console.log('No data to save to central CSV hub');
    return;
  }

  // Create CSV content matching the master database format
  let csvContent = 'Plot Number,Owner Name,Primary Mobile,Alternative Mobile,Plot Size,Status,Registration Date,Owner Type,Colony,Location,Last Updated\n';
  
  plotDatabase.forEach(record => {
    const csvRow = [
      record['Plot Number'] || '',
      `"${record['Owner Name'] || ''}"`,
      record['Primary Mobile'] || '',
      record['Alternative Mobile'] || '',
      `"${record['Plot Size'] || ''}"`,
      record['Status'] || 'Available',
      record['Registration Date'] || '',
      record['Owner Type'] || 'Primary',
      record['Colony'] || 'Teachers Colony',
      record['Location'] || 'Machilipatnam',
      new Date().toISOString()
    ];
    csvContent += csvRow.join(',') + '\n';
  });

  // Upload to central CSV hub using GitHub Gist
  const gistCSVData = {
    description: `Teachers Colony Central CSV Database - Updated ${new Date().toLocaleString()}`,
    public: true,
    files: {
      'teachers_colony_master_database.csv': {
        content: csvContent
      }
    }
  };

  const githubToken = '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';
  const gistId = '5397a86680129b2d3534059577f8865c';

  // Upload CSV to GitHub Gist
  fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gistCSVData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Successfully saved CSV to central hub:', data.html_url);
    showNotification('Data saved to central CSV hub!');
  })
  .catch(error => {
    console.error('Error saving to central CSV hub:', error);
    // Fallback: Save to localStorage as backup
    localStorage.setItem('centralCSVBackup', csvContent);
    showNotification('Central hub unavailable. Data saved locally.');
  });

  console.log('Central CSV hub save initiated');
}

// Show notification to user
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Refresh plot display
function refreshPlotDisplay() {
  // Clear all existing plot tables
  const tableIds = ['r161', 'r160', 'r167', 'r154', 'r130', 'r129', 'r137', 'r122', 
                   'r98', 'r97', 'r105', 'r90', 'r65', 'r64', 'r73', 'r56', 
                   'r33', 'r32', 'r40', 'r25', 'r9', 'r10', 'r1'];
  
  tableIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = '';
    }
  });
  
  // Re-render plots with current data
  fill('r161',[161,162,163,164,165,166]);
  fill('r160',[160,159,158,157,156,155]);
  fill('r167',[167,168,169,170,171,172,173,174,175]);
  fill('r154',[154,153,152,151,150,149,148,147,146]);
  fill('r130',[130,131,132,133,134,135,136]);
  fill('r129',[129,128,127,126,125,124,123]);
  fill('r137',[137,138,139,140,141,142,143,144,145]);
  fill('r122',[122,121,120,119,118,117,116,115,114]);
  fill('r98', [98,99,100,101,102,103,104]);
  fill('r97', [97,96,95,94,93,92,91]);
  fill('r105',[105,106,107,108,109,110,111,112,113]);
  fill('r90', [90,89,88,87,86,85,84,83,82]);
  fill('r65', [65,66,67,68,69,70,71,72]);
  fill('r64', [64,63,62,61,60,59,58,57]);
  fill('r73', [73,74,75,76,77,78,79,80,81]);
  fill('r56', [56,55,54,53,52,51,50,49,48]);
  fill('r33', [33,34,35,36,37,38,39]);
  fill('r32', [32,31,30,29,28,27,26]);
  fill('r40', [40,41,42,43,44,45,46,47]);
  fill('r25', [25,24,23,22,21,20,19,18]);
  fill('r9',  [9,8,7,6,5]);
  fill('r10', [10,11,12,13,14,15,16,17]);
  fill('r1',  [4,3,2,1]);
  
  // Update statistics
  updateStatistics();
}

// Update statistics display
function updateStatistics() {
  const totalPlots = 175;
  const ownedPlots = plotDatabase.filter(record => record['Status'] === 'owned').length;
  const contactedPlots = plotDatabase.filter(record => record['Status'] === 'contacted').length;
  const availablePlots = totalPlots - ownedPlots - contactedPlots;
  const ownershipRate = ((ownedPlots / totalPlots) * 100).toFixed(1);
  
  document.getElementById('total-plots').textContent = totalPlots;
  document.getElementById('owned-plots').textContent = ownedPlots;
  document.getElementById('available-plots').textContent = availablePlots;
  document.getElementById('ownership-rate').textContent = ownershipRate + '%';
}

// Handle form submission
document.getElementById('plot-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('reg-name').value;
  const mobile = document.getElementById('reg-mobile').value;
  const altMobile = document.getElementById('reg-alt-mobile').value;
  const plotSize = document.getElementById('reg-size').value;
  
  if (!name || !mobile || !plotSize) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Format mobile number with +91 if not already formatted
  const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;
  const formattedAltMobile = altMobile ? (altMobile.startsWith('+91') ? altMobile : `+91${altMobile}`) : '';
  
  // Create registration record
  const registration = {
    'Plot Number': window.currentPlot,
    'Owner Name': name,
    'Primary Mobile': formattedMobile,
    'Alternative Mobile': formattedAltMobile,
    'Status': 'owned',
    'Registration Date': new Date().toLocaleDateString(),
    'Colony': 'Teachers Colony',
    'Location': 'Machilipatnam'
  };
  
  // Add to database
  plotDatabase.push(registration);
  
  // Save to localStorage for persistence
  saveToLocalStorage();
  
  // Add to the O object to show as owned
  O[window.currentPlot] = [{n: name, p: formattedMobile}];
  if (formattedAltMobile) {
    O[window.currentPlot].push({n: name, p: formattedAltMobile});
  }
  
  // Refresh display
  refreshPlotDisplay();
  
  // Close modal
  closeModal();
  
  alert(`Plot ${window.currentPlot} registered successfully!`);
});

// Mark as contacted function
function markAsContacted() {
  const name = document.getElementById('reg-name').value || 'Contacted Lead';
  const mobile = document.getElementById('reg-mobile').value || '0000000000';
  
  // Format mobile number
  const formattedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;
  
  // Create contacted record
  const contacted = {
    'Plot Number': window.currentPlot,
    'Owner Name': name,
    'Primary Mobile': formattedMobile,
    'Alternative Mobile': '',
    'Status': 'contacted',
    'Registration Date': new Date().toLocaleDateString(),
    'Colony': 'Teachers Colony',
    'Location': 'Machilipatnam'
  };
  
  // Add to database
  plotDatabase.push(contacted);
  
  // Save to localStorage
  saveToLocalStorage();
  
  // Refresh display
  refreshPlotDisplay();
  
  // Close modal
  closeModal();
  
  alert(`Plot ${window.currentPlot} marked as contacted!`);
}

// Auto-load database when page starts
autoLoadDatabase();
