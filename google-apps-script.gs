/**
 * Google Apps Script for Teachers Colony Data Management
 * 
 * Deploy instructions:
 * 1. Go to https://script.google.com
 * 2. Create new project
 * 3. Paste this code
 * 4. Replace SHEET_ID with your actual sheet ID
 * 5. Save (Ctrl+S)
 * 6. Deploy → New deployment → Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Copy the Web App URL and paste in form-handlers.js
 */

// Your Google Sheet ID - REPLACE THIS
const SHEET_ID = '1VTTnNkhHVrxcHfQ0BDOUYjkFEjFvVhKrt34AO6a-7NA';
const SHEET_NAME = 'Sheet2'; // The sheet with plot data

/**
 * Handle POST requests (from the website form)
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Log for debugging
    console.log('Received data:', data);
    
    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        'error': 'Sheet not found: ' + SHEET_NAME
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Find the row with matching plot number
    let rowIndex = -1;
    const headers = values[0];
    const plotNoColumn = headers.indexOf('Plot No');
    
    if (plotNoColumn === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        'error': 'Plot No column not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find existing row
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][plotNoColumn]) === String(data.plotNo)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
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
        case 'Mobile':
          rowData[i] = data.mobile || '';
          break;
        case 'LRS':
          rowData[i] = data.lrs || '';
          break;
        case 'Owner1':
          rowData[i] = data.owner1 || '';
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
      'message': 'Data saved successfully',
      'plotNo': data.plotNo
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      'error': error.toString()
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
    'version': '1.0'
  })).setMimeType(ContentService.MimeType.JSON);
}
