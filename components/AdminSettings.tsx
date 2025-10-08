import React, { useState } from 'react';
import { ClientData } from '../types';
import { VISIBLE_CLIENT_FIELDS } from '../constants';

interface AdminSettingsProps {
  allClients: ClientData[];
  webBaseColumns: string[];
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ allClients, webBaseColumns }) => {
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(VISIBLE_CLIENT_FIELDS));
  const [generatedConfig, setGeneratedConfig] = useState<string>('');

  const handleToggle = (field: string) => {
    const newSet = new Set(visibleFields);
    if (newSet.has(field)) {
      newSet.delete(field);
    } else {
      newSet.add(field);
    }
    setVisibleFields(newSet);
  };

  const generateConfig = () => {
    const configArray = Array.from(visibleFields);
    const configString = `export const VISIBLE_CLIENT_FIELDS: string[] = ${JSON.stringify(configArray, null, 2)};`;
    setGeneratedConfig(configString);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Панель Администратора</h1>
        <p className="text-tg-hint">Всего клиентов в базе: {allClients.length}</p>
      </header>

      <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b border-tg-hint pb-2">Список клиентов</h2>
        <div className="max-h-96 overflow-y-auto">
          <ul className="divide-y divide-tg-hint/20">
            {allClients.length > 0 ? allClients.map(client => (
              <li key={client['Chat ID']} className="py-3 flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-tg-text">{client['Имя клиента'] || 'Имя не указано'}</p>
                  <p className="text-sm text-tg-hint">ID: {client['Chat ID']}</p>
                </div>
                <a 
                  href={`/?clientId=${client['Chat ID']}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-tg-button text-tg-button-text font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
                >
                  Открыть кабинет
                </a>
              </li>
            )) : <p className="text-tg-hint py-4 text-center">Клиенты не найдены.</p>}
          </ul>
        </div>
      </div>
      
      <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b border-tg-hint pb-2">Настройка видимых полей для клиента</h2>
        <p className="text-tg-hint mb-6">Отметьте поля, которые должны быть видны клиентам в их личном кабинете.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {webBaseColumns.map(field => (
            <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={visibleFields.has(field)}
                onChange={() => handleToggle(field)}
                className="h-5 w-5 rounded border-gray-300 text-tg-link focus:ring-tg-link"
              />
              <span className="text-tg-text">{field}</span>
            </label>
          ))}
        </div>
        <button onClick={generateConfig} className="mt-8 w-full bg-tg-button text-tg-button-text font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
          Сгенерировать конфигурацию
        </button>
      </div>

      {generatedConfig && (
        <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Новая конфигурация</h3>
          <p className="text-tg-hint mb-4">Скопируйте этот код и вставьте его в файл <code className="bg-gray-700 text-white px-1 rounded">src/constants.ts</code>, заменив существующий массив <code className="bg-gray-700 text-white px-1 rounded">VISIBLE_CLIENT_FIELDS</code>. Затем пересоберите и опубликуйте приложение.</p>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
            <code>{generatedConfig}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
