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
 * Reads the 'Config' sheet and returns settings as a key-value object.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The spreadsheet instance.
 */
function getConfig(ss) {
  const configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    // If no config sheet, return empty object so the app can use defaults.
    return {}; 
  }
  const range = configSheet.getDataRange();
  const values = range.getValues();
  
  const config = {};
  // Start from row 1 to skip headers
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const key = row[0];
    const value = row[1];
    if (key) {
      try {
        // Try to parse value as JSON (for arrays, etc.)
        config[key] = JSON.parse(value);
      } catch (e) {
        // If not JSON, use as plain string
        config[key] = value;
      }
    }
  }
  return config;
}


/**
 * Handles HTTP GET requests to the web app.
 * @param {Object} e - The event parameter containing request details.
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Handle config requests
    if (e.parameter.action === 'getConfig') {
      const config = getConfig(ss);
      return createJsonResponse(config);
    }

    const sheetName = e.parameter.sheet || 'WebBase';
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return createJsonResponse({ error: `Sheet with name "${sheetName}" not found.` });
    }

    const range = sheet.getDataRange();
    const values = range.getDisplayValues(); 

    if (values.length < 2) {
      return createJsonResponse([]);
    }

    // Trim headers to prevent issues with leading/trailing whitespace.
    const headers = values.shift().map(h => h.trim());
    const chatIdColumnIndex = headers.indexOf('Chat ID');
    
    const data = values.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          // CRITICAL FIX: Trim every cell value to handle data entry errors (extra spaces).
          obj[header] = row[index] ? row[index].trim() : '';
        }
      });
      return obj;
    });

    const chatId = e.parameter.chatId;
    if (chatId && chatIdColumnIndex !== -1) {
       // Use loose equality (==) for robustness, e.g., to match "123" with 123.
      const filteredData = data.filter(row => row['Chat ID'] == chatId);
      // ALWAYS return an array. The frontend is designed to handle an array for all cases.
      return createJsonResponse(filteredData);
    }

    // If no chatId is provided, return all data from the sheet.
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
      
      // Trim headers to ensure indexOf works correctly.
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.trim());
      const chatIdColIndex = headers.indexOf('Chat ID');
      const phoneColIndex = headers.indexOf('Телефон');
      
      if (chatIdColIndex === -1 || phoneColIndex === -1) {
        return createJsonResponse({ error: 'Не найдены обязательные колонки "Chat ID" или "Телефон" в листе "WebBase".' });
      }
      
      // Check if user already exists
      const data = sheet.getDataRange().getValues();
      const existingUser = data.find(row => row[chatIdColIndex] == chatId);
      if(existingUser) {
        // You might want to update the existing user or return an error
        // For now, we'll just prevent duplicates.
        return createJsonResponse({ result: 'exists', message: 'Пользователь с таким Chat ID уже существует.' });
      }

      const newRow = Array(headers.length).fill('');
      newRow[chatIdColIndex] = chatId;
      newRow[phoneColIndex] = phone;
      newRow[headers.indexOf('Имя клиента')] = 'Новый клиент';
      newRow[headers.indexOf('Статус сделки')] = 'Ожидает обработки';
      
      sheet.appendRow(newRow);
      
      return createJsonResponse({ result: 'success', message: 'Пользователь успешно добавлен.' });
    }

    if (requestData.action === 'updateConfig') {
      const { key, value } = requestData;
      if (!key || value === undefined) {
        return createJsonResponse({ error: 'Требуется "key" и "value" для обновления конфигурации.' });
      }

      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName('Config');
      if (!sheet) {
        sheet = ss.insertSheet('Config');
        sheet.appendRow(['Key', 'Value']); // Add headers
      }

      const data = sheet.getDataRange().getValues();
      let keyFound = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(JSON.stringify(value, null, 2));
          keyFound = true;
          break;
        }
      }

      if (!keyFound) {
        sheet.appendRow([key, JSON.stringify(value, null, 2)]);
      }
      
      return createJsonResponse({ result: 'success', message: 'Конфигурация обновлена.' });
    }
    
    return createJsonResponse({ error: 'Неверное действие.' });

  } catch (error) {
    // Log the error for debugging
    console.error('doPost Error: ' + error.toString());
    return createJsonResponse({ error: error.message });
  }
}
