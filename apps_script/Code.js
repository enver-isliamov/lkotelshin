
// This code should be pasted into the Google Apps Script editor.
// See instructions.md for a step-by-step guide.

/**
 * The ID of your Google Spreadsheet.
 * You can find this in the URL of your spreadsheet.
 * e.g., https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 */
const SPREADSHEET_ID = '1IBBn38ZD-TOgzO9VjYAyKz8mchg_RwWyD6kZ0Lu729A';

/**
 * Helper function to create a JSON response with correct headers.
 * @param {Object} data - The data to be stringified.
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Handles HTTP GET requests to the web app.
 * @param {Object} e - The event parameter containing request details.
 * e.g. e.parameter.sheet will contain the name of the sheet to fetch.
 */
function doGet(e) {
  const sheetName = e.parameter.sheet || 'WebBase';
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return createJsonResponse({ error: `Sheet with name "${sheetName}" not found.` });
    }

    const range = sheet.getDataRange();
    const values = range.getDisplayValues(); 

    if (values.length < 2) {
      return createJsonResponse([]);
    }

    const headers = values.shift(); 
    
    const data = values.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index];
        }
      });
      return obj;
    });

    return createJsonResponse(data);

  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

/**
 * Handles HTTP POST requests to the web app.
 * @param {Object} e - The event parameter containing request details.
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    
    if (requestData.action === 'addUser') {
      const { chatId, phone } = requestData;
      
      if (!chatId || !phone) {
        return createJsonResponse({ error: 'Требуется Chat ID и номер телефона.' });
      }
      
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName('WebBase');
      
      if (!sheet) {
        return createJsonResponse({ error: 'Лист "WebBase" не найден.' });
      }
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const chatIdColIndex = headers.indexOf('Chat ID');
      const phoneColIndex = headers.indexOf('Телефон');
      
      if (chatIdColIndex === -1 || phoneColIndex === -1) {
        return createJsonResponse({ error: 'Не найдены обязательные колонки "Chat ID" или "Телефон" в листе "WebBase".' });
      }
      
      // Create a new row array filled with empty strings to ensure correct length
      const newRow = Array(headers.length).fill('');
      newRow[chatIdColIndex] = chatId;
      newRow[phoneColIndex] = phone;
      
      sheet.appendRow(newRow);
      
      return createJsonResponse({ result: 'success', message: 'Пользователь успешно добавлен.' });
    }
    
    return createJsonResponse({ error: 'Неверное действие.' });

  } catch (error) {
    // Log the error for debugging
    console.error('doPost Error: ' + error.toString());
    return createJsonResponse({ error: error.message });
  }
}
