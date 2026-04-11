/**
 * Teachers Colony Plot Management - Google Apps Script
 * Sheet ID: 1VTTnNkhHVrxcHfQ0BDOUYjkFEjFvVhKrt34AO6a-7NA
 */

/**
 * Handle POST requests from the web app
 */
function doPost(e) {
  try {
    // Parse JSON data from request
    const data = JSON.parse(e.postData.contents);
    console.log('Received data:', JSON.stringify(data));
    
    // Open the spreadsheet
    const sheetId = '1VTTnNkhHVrxcHfQ0BDOUYjkFEjFvVhKrt34AO6a-7NA';
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheets()[0]; // Get first sheet
    
    // Get headers and data
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('Headers:', headers);
    
    // Find Plot No column index
    let plotNoColumn = -1;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === 'Plot No') {
        plotNoColumn = i;
        break;
      }
    }
    
    if (plotNoColumn === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        'error': 'Plot No column not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data rows
    const lastRow = sheet.getLastRow();
    let rowIndex = -1;
    
    if (lastRow > 1) {
      const plotColumnValues = sheet.getRange(2, plotNoColumn + 1, lastRow - 1, 1).getValues();
      
      // Find matching plot number
      for (let i = 0; i < plotColumnValues.length; i++) {
        const cellValue = String(plotColumnValues[i][0]).trim();
        const searchValue = String(data.plotNo).trim();
        
        console.log('Comparing:', cellValue, 'with', searchValue);
        
        if (cellValue === searchValue) {
          rowIndex = i + 2; // +2 because: +1 for 0-index to 1-index, +1 for header row
          console.log('Found existing plot at row:', rowIndex);
          break;
        }
      }
    }
    
    // Prepare row data based on headers
    const rowData = [];
    for (let i = 0; i < headers.length; i++) {
      switch(headers[i]) {
        case 'Plot No':
          rowData[i] = data.plotNo;
          break;
        case 'Owner':
          rowData[i] = data.owner || '';
          break;
        case 'Owner1':
          rowData[i] = data.owner1 || '';
          break;
        case 'Mobile':
          rowData[i] = data.mobile || '';
          break;
        case 'AltMobile':
          rowData[i] = data.altMobile || '';
          break;
        case 'AltMobile1':
          rowData[i] = data.altMobile1 || '';
          break;
        case 'AltMobile2':
          rowData[i] = data.altMobile2 || '';
          break;
        case 'LRS':
          rowData[i] = data.lrs || '';
          break;
        case 'Size':
          rowData[i] = data.size || '';
          break;
        case 'Tax':
          rowData[i] = data.tax || '';
          break;
        default:
          rowData[i] = '';
      }
    }
    
    if (rowIndex > 0) {
      // Update existing row
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      console.log('Updated row', rowIndex);
    } else {
      // Add new row at the end
      sheet.appendRow(rowData);
      console.log('Added new row');
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'success': true,
      'message': rowIndex > 0 ? 'Plot updated successfully' : 'New plot added successfully',
      'plotNo': data.plotNo,
      'action': rowIndex > 0 ? 'updated' : 'added'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      'error': error.toString(),
      'success': false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing the URL)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'ok',
    'message': 'Teachers Colony API is running',
    'version': '2.0',
    'endpoints': {
      'GET': 'Test if API is running',
      'POST': 'Save plot data (plotNo, owner, mobile, lrs, tax, etc.)'
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this in Apps Script editor to test
 */
function testSave() {
  const testData = {
    plotNo: '161',
    owner: 'Test Owner',
    owner1: 'Alt Owner',
    mobile: '9876543210',
    altMobile: '9876543211',
    altMobile1: '9876543212',
    altMobile2: '9876543213',
    lrs: 'Yes',
    size: '200 sq yards',
    tax: 'Paid'
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  console.log('Test result:', result.getContent());
}

/**
 * Initialize spreadsheet headers if needed
 */
function initializeSheet() {
  const sheetId = '1VTTnNkhHVrxcHfQ0BDOUYjkFEjFvVhKrt34AO6a-7NA';
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheets()[0];
  
  // Check if headers exist
  const headers = sheet.getRange(1, 1, 1, 11).getValues()[0];
  const requiredHeaders = ['S.No', 'Owner', 'Owner1', 'Plot No', 'Mobile', 'LRS', 'Size', 'Tax', 'AltMobile', 'AltMobile1', 'AltMobile2'];
  
  let needsInit = false;
  for (let i = 0; i < requiredHeaders.length; i++) {
    if (headers[i] !== requiredHeaders[i]) {
      needsInit = true;
      break;
    }
  }
  
  if (needsInit) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    console.log('Headers initialized');
  } else {
    console.log('Headers already correct');
  }
}
