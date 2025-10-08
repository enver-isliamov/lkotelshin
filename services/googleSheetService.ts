

import { APPS_SCRIPT_URL } from '../constants';

/**
 * Fetches data from the Google Sheet via the deployed Google Apps Script.
 * @param sheetName The name of the sheet to fetch ('WebBase' or 'Archive').
 * @returns A promise that resolves to an array of objects representing the sheet rows.
 */
export async function fetchSheetData<T>(sheetName: 'WebBase' | 'Archive'): Promise<T[]> {
  // FIX: Cast APPS_SCRIPT_URL to string to avoid a TypeScript error about non-overlapping types.
  // This preserves the check that ensures the placeholder URL has been replaced.
  if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
    throw new Error('Пожалуйста, настройте URL-адрес Google Apps Script в файле constants.ts. Инструкция находится в файле instructions.md.');
  }

  // Добавляем параметр для выбора нужного листа и кэш-бастер
  const url = `${APPS_SCRIPT_URL}?sheet=${sheetName}&_=${new Date().getTime()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow' // Apps Script URL может делать редирект
    });

    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Проверяем, не вернул ли скрипт внутреннюю ошибку
    if (data.error) {
        throw new Error(`Ошибка от Google Apps Script: ${data.error}`);
    }

    return data as T[];

  } catch (error) {
    console.error(`Не удалось загрузить данные для листа "${sheetName}":`, error);
    // Перебрасываем ошибку с более понятным сообщением для пользователя
    throw new Error(`Не удалось получить данные из таблицы. Проверьте правильность URL скрипта, его настройки доступа ("Кто имеет доступ: Все") и ваше интернет-соединение.`);
  }
}
