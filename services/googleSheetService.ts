
import { APPS_SCRIPT_URL } from '../constants';

/**
 * Fetches data from the Google Sheet via the deployed Google Apps Script.
 * @param sheetName The name of the sheet to fetch ('WebBase' or 'Archive').
 * @returns A promise that resolves to an array of objects representing the sheet rows.
 */
export async function fetchSheetData<T>(sheetName: 'WebBase' | 'Archive'): Promise<T[]> {
  if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
    throw new Error('Пожалуйста, настройте URL-адрес Google Apps Script в файле constants.ts. Инструкция находится в файле instructions.md.');
  }

  const url = `${APPS_SCRIPT_URL}?sheet=${sheetName}&_=${new Date().getTime()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      // Pass the specific error from Apps Script
      throw new Error(data.error);
    }

    return data as T[];

  } catch (error) {
    console.error(`Не удалось загрузить данные для листа "${sheetName}":`, error);
    // Re-throw the error with a more user-friendly prefix, but keep the original message for debugging
    if (error instanceof Error) {
      throw new Error(`Не удалось получить данные из таблицы. Проверьте правильность URL скрипта, его настройки доступа ("Кто имеет доступ: Все") и ваше интернет-соединение. (Ошибка: ${error.message})`);
    }
    throw new Error(`Не удалось получить данные из таблицы. Проверьте правильность URL скрипта, его настройки доступа ("Кто имеет доступ: Все") и ваше интернет-соединение.`);
  }
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
    if (error instanceof Error) {
      throw new Error(`Не удалось сохранить настройки: ${error.message}`);
    }
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
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid CORS preflight for simple requests
      },
      body: JSON.stringify({ action: 'addUser', chatId, phone })
    });
    
    if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (result.error) {
        throw new Error(result.error);
    }
    
    return result;

  } catch (error) {
      console.error('Ошибка при добавлении нового пользователя:', error);
      if (error instanceof Error) {
        throw new Error(`Не удалось зарегистрировать: ${error.message}`);
      }
      throw new Error('Не удалось зарегистрировать нового пользователя.');
  }
}
