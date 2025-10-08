import { APPS_SCRIPT_URL } from '../constants';
import { ClientData, OrderHistory } from '../types';

/**
 * A generic error handler and response parser for fetch requests to the Apps Script.
 * This function is now robust and guarantees that the return value is always an array.
 * @param promise The fetch promise to process.
 * @param context A string describing the context of the request for better error logging.
 */
async function handleApiResponse<T>(promise: Promise<Response>, context: string): Promise<T[]> {
  try {
    const response = await promise;
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
      // Pass the specific error from Apps Script
      throw new Error(data.error);
    }

    // CORE FIX: Ensure the result is always an array to prevent crashes.
    if (Array.isArray(data)) {
      return data;
    }
    // If the API returned a single object for a single result, wrap it in an array.
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      return [data];
    }
    // Default to an empty array for any other case (null, empty object from API, etc.)
    return [];

  } catch (error) {
    console.error(`Ошибка во время "${context}":`, error);
    if (error instanceof Error) {
      throw new Error(`Не удалось получить данные из таблицы. Проверьте правильность URL скрипта, его настройки доступа ("Кто имеет доступ: Все") и ваше интернет-соединение. (Ошибка: ${error.message})`);
    }
    throw new Error(`Не удалось получить данные из таблицы. Проверьте правильность URL скрипта, его настройки доступа ("Кто имеет доступ: Все") и ваше интернет-соединение.`);
  }
}

/**
 * Fetches all data from a given sheet. Used for fetching all clients or all history records.
 * @param sheetName The name of the sheet to fetch ('WebBase' or 'Archive').
 * @returns A promise that resolves to an array of objects representing the sheet rows.
 */
export async function fetchAllSheetData<T>(sheetName: 'WebBase' | 'Archive'): Promise<T[]> {
  const url = `${APPS_SCRIPT_URL}?sheet=${sheetName}&_=${new Date().getTime()}`;
  return handleApiResponse<T>(fetch(url, { method: 'GET', redirect: 'follow' }), `получение всех данных с листа ${sheetName}`);
}


/**
 * Fetches data from a sheet for a specific Chat ID.
 * @param sheetName The name of the sheet to fetch from.
 * @param chatId The Chat ID to filter by.
 * @returns A promise that resolves to an array of records matching the Chat ID.
 */
export async function fetchSheetDataByChatId<T>(sheetName: 'WebBase' | 'Archive', chatId: string): Promise<T[]> {
  const url = `${APPS_SCRIPT_URL}?sheet=${sheetName}&chatId=${chatId}&_=${new Date().getTime()}`;
  return handleApiResponse<T>(fetch(url, { method: 'GET', redirect: 'follow' }), `получение данных по chatId с листа ${sheetName}`);
}


/**
 * Fetches the application configuration from the 'Config' sheet.
 * @returns A promise that resolves to a configuration object.
 */
export async function fetchConfig(): Promise<{ [key: string]: any }> {
  if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
    console.warn('URL-адрес Google Apps Script не настроен, используется конфигурация по умолчанию.');
    return {};
  }
  const url = `${APPS_SCRIPT_URL}?action=getConfig&_=${new Date().getTime()}`;
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!response.ok) return {};
    const data = await response.json();
    return data.error ? {} : data;
  } catch (error) {
    console.error('Не удалось загрузить конфигурацию:', error);
    return {}; // Return empty object on error to allow fallback to defaults
  }
}

/**
 * Updates the application configuration in the 'Config' sheet.
 * @param key The configuration key to update.
 * @param value The new value for the key.
 */
export async function updateConfig(key: string, value: any): Promise<{result: string}> {
  if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
    throw new Error('URL-адрес Google Apps Script не настроен.');
  }
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateConfig', key, value })
    });
    if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error) {
    console.error('Ошибка при обновлении конфигурации:', error);
    if (error instanceof Error) throw new Error(`Не удалось сохранить настройки: ${error.message}`);
    throw new Error('Не удалось сохранить настройки.');
  }
}

/**
 * Adds a new user to the 'WebBase' sheet.
 * @param chatId The user's Telegram Chat ID.
 * @param phone The user's phone number.
 * @returns A promise that resolves to the result of the operation.
 */
export async function addNewUser(chatId: string, phone: string): Promise<{result: string}> {
   if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
    throw new Error('URL-адрес Google Apps Script не настроен.');
  }
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'addUser', chatId, phone })
    });
    if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error) {
      console.error('Ошибка при добавлении нового пользователя:', error);
      if (error instanceof Error) throw new Error(`Не удалось зарегистрировать: ${error.message}`);
      throw new Error('Не удалось зарегистрировать нового пользователя.');
  }
}
