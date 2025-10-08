
import React, { useState, useMemo } from 'react';
import { ClientData } from '../types';
import { VISIBLE_CLIENT_FIELDS } from '../constants';

interface AdminSettingsProps {
  allClients: ClientData[];
  webBaseColumns: string[];
  onClientSelect: (client: ClientData) => void;
}

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'активен':
            return 'bg-green-500';
        case 'завершен':
            return 'bg-gray-400';
        case 'просрочен':
            return 'bg-red-500';
        default:
            return 'bg-yellow-400';
    }
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ allClients, webBaseColumns, onClientSelect }) => {
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(VISIBLE_CLIENT_FIELDS));
  const [generatedConfig, setGeneratedConfig] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const groupedAndFilteredClients = useMemo(() => {
    const filtered = allClients.filter(client => 
      client['Имя клиента'] && client['Имя клиента'].toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped: { [key: string]: ClientData[] } = {};
    
    filtered
      .sort((a, b) => (a['Имя клиента'] || '').localeCompare(b['Имя клиента'] || ''))
      .forEach(client => {
        const firstLetter = (client['Имя клиента'] || '#')[0].toUpperCase();
        if (!grouped[firstLetter]) {
          grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(client);
      });

    return grouped;
  }, [allClients, searchTerm]);

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
    setIsCopied(false);
  };
  
  const handleCopy = () => {
    if (!generatedConfig) return;
    navigator.clipboard.writeText(generatedConfig).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    });
  }

  const getInitials = (name: string = '') => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Панель Администратора</h1>
        <p className="text-tg-hint">Всего клиентов в базе: {allClients.length}</p>
      </header>
      
      {/* Client List Card */}
      <div className="bg-tg-secondary-bg rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-tg-hint/20">
            <h2 className="text-2xl font-semibold mb-4">Список клиентов</h2>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Поиск по имени..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-tg-hint/30 rounded-lg bg-tg-bg focus:outline-none focus:ring-2 focus:ring-tg-link"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-tg-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
            {Object.keys(groupedAndFilteredClients).length > 0 ? (
                Object.keys(groupedAndFilteredClients).sort().map(letter => (
                    <div key={letter}>
                        <div className="sticky top-0 bg-tg-secondary-bg/95 backdrop-blur-sm px-4 sm:px-6 py-1 border-b border-t border-tg-hint/20 z-10">
                            <h3 className="text-sm font-bold uppercase text-tg-hint tracking-wider">{letter}</h3>
                        </div>
                        <ul className="divide-y divide-tg-hint/20">
                            {groupedAndFilteredClients[letter].map(client => (
                                <li key={client['Chat ID']}>
                                    <button
                                        onClick={() => onClientSelect(client)}
                                        title={`Открыть кабинет клиента: ${client['Имя клиента']}`}
                                        className="flex w-full items-center gap-4 px-4 sm:px-6 py-3 hover:bg-tg-bg transition-colors text-left"
                                    >
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-tg-link text-white flex items-center justify-center font-bold text-base">
                                            {getInitials(client['Имя клиента'])}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(client['Статус сделки'])}`} title={`Статус: ${client['Статус сделки']}`}></span>
                                                <p className="font-semibold text-tg-text">{client['Имя клиента'] || 'Имя не указано'}</p>
                                            </div>
                                            <p className="text-sm text-tg-hint pl-[18px]">{client['Телефон'] || `ID: ${client['Chat ID']}`}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
             ) : (
                <div className="text-center py-12 px-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l-2.293-2.293a1 1 0 010-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 010 1.414L15 21m-5-4h2" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-tg-text">Клиенты не найдены</h3>
                    <p className="mt-1 text-sm text-tg-hint">Попробуйте изменить поисковый запрос.</p>
                </div>
             )}
        </div>
      </div>
      
      {/* Field Configuration Card */}
      <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b border-tg-hint/20 pb-2">Настройка видимых полей для клиента</h2>
        <p className="text-tg-hint mb-6">Отметьте поля, которые должны быть видны клиентам в их личном кабинете.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {webBaseColumns.map(field => (
            <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-tg-bg transition-colors">
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
          <p className="text-tg-hint mb-4">Скопируйте этот код и вставьте его в файл <code className="bg-gray-800 text-white px-1.5 py-0.5 rounded-md text-sm">src/constants.ts</code>, заменив существующий массив <code className="bg-gray-800 text-white px-1.5 py-0.5 rounded-md text-sm">VISIBLE_CLIENT_FIELDS</code>. Затем пересоберите и опубликуйте приложение.</p>
          <div className="relative">
            <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
                <code>{generatedConfig}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-1 px-2 rounded-md transition-all duration-200"
            >
                {isCopied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
