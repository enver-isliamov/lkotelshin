// This code should be pasted into the Google Apps Script editor.
// See instructions.md for a step-by-step guide.

/**
 * The ID of your Google Spreadsheet.
 * You can find this in the URL of your spreadsheet.
 * e.g., https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 */
const SPREADSHEET_ID = '1IBBn38ZD-TOgzO9VjYAyKz8mchg_RwWyD6kZ0Lu729A';

/**
 * Handles HTTP GET requests to the web app.
 * @param {Object} e - The event parameter containing request details.
 * e.g. e.parameter.sheet will contain the name of the sheet to fetch.
 */
function doGet(e) {
  // Get the sheet name from the URL parameter, default to 'WebBase'
  const sheetName = e.parameter.sheet || 'WebBase';
  
  // Set the correct CORS headers to allow requests from any origin
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=UTF-8',
  };

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      const errorResponse = JSON.stringify({ error: `Sheet with name "${sheetName}" not found.` });
      return ContentService.createTextOutput(errorResponse).setMimeType(ContentService.MimeType.JSON);
    }

    const range = sheet.getDataRange();
    // getDisplayValues() is used to get formatted values (dates, currencies) as they appear in the sheet.
    const values = range.getDisplayValues(); 

    if (values.length < 2) {
      // Return an empty array if there are no data rows (only a header or empty)
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }

    // The first row is the headers
    const headers = values.shift(); 
    
    // Convert the 2D array of rows into an array of objects
    const data = values.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) { // Only add property if header is not empty
          obj[header] = row[index];
        }
      });
      return obj;
    });

    const jsonResponse = JSON.stringify(data, null, 2);
    return ContentService.createTextOutput(jsonResponse).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResponse = JSON.stringify({ error: error.message });
    return ContentService.createTextOutput(errorResponse).setMimeType(ContentService.MimeType.JSON);
  }
}
