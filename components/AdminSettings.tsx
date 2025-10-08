
import React, { useState, useMemo, useEffect } from 'react';
import { ClientData } from '../types';

interface AdminSettingsProps {
  allClients: ClientData[];
  webBaseColumns: string[];
  onClientSelect: (client: ClientData) => void;
  initialVisibleFields: string[];
  onConfigSave: (fields: string[]) => Promise<void>;
  isLoading: boolean;
}

type Tab = 'clients' | 'settings';

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

const AdminSettings: React.FC<AdminSettingsProps> = ({ allClients, webBaseColumns, onClientSelect, initialVisibleFields, onConfigSave, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(initialVisibleFields));
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Sync state with props when the initial config loads
  useEffect(() => {
    setVisibleFields(new Set(initialVisibleFields));
  }, [initialVisibleFields]);

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
  
  const handleSaveConfig = async () => {
    setSaveStatus('saving');
    try {
        await onConfigSave(Array.from(visibleFields));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (e) {
        console.error('Failed to save config:', e);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
        case 'saving': return 'Сохранение...';
        case 'saved': return '✓ Сохранено!';
        case 'error': return 'Ошибка! Повторите';
        default: return 'Сохранить настройки';
    }
  };

  const getInitials = (name: string = '') => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  
  const ListSkeleton = () => (
    <div className="animate-pulse">
        <div className="sticky top-0 bg-tg-secondary-bg/95 px-4 sm:px-6 py-1 border-b border-t border-tg-hint/20 z-10 h-[37px]">
            <div className="h-5 w-1/4 bg-gray-300 dark:bg-gray-700 rounded-md mt-2"></div>
        </div>
        <ul className="divide-y divide-tg-hint/20">
            {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-4 px-4 sm:px-6 py-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </li>
            ))}
        </ul>
    </div>
  );
  
  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`py-2 px-4 w-full text-center font-semibold rounded-md transition-colors duration-300 ${
        activeTab === tab 
          ? 'bg-tg-button text-tg-button-text shadow-sm' 
          : 'bg-tg-secondary-bg text-tg-text hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-800/20 p-2 sm:p-4 rounded-xl">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <header className="text-center pt-2">
            <h1 className="text-3xl font-bold">Панель Администратора</h1>
            <p className="text-tg-hint mt-1">Всего клиентов в базе: {isLoading ? '...' : allClients.length}</p>
          </header>
          
          <div className="grid grid-cols-2 gap-2 p-1 bg-tg-secondary-bg rounded-lg shadow-inner">
            <TabButton tab="clients" label="Клиенты" />
            <TabButton tab="settings" label="Настройки" />
          </div>

          <main>
            {/* Client List Section */}
            <div style={{ display: activeTab === 'clients' ? 'block' : 'none' }}>
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
                    {isLoading ? (
                        <ListSkeleton />
                     ) : Object.keys(groupedAndFilteredClients).length > 0 ? (
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
                                                className="group flex w-full items-center gap-4 px-4 sm:px-6 py-3 hover:bg-tg-bg transition-colors text-left"
                                            >
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-tg-link text-white flex items-center justify-center font-bold text-base transition-transform group-hover:scale-110">
                                                    {getInitials(client['Имя клиента'])}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(client['Статус сделки'])}`} title={`Статус: ${client['Статус сделки']}`}></span>
                                                        <p className="font-semibold text-tg-text">{client['Имя клиента'] || 'Имя не указано'}</p>
                                                    </div>
                                                    <p className="text-sm text-tg-hint pl-[18px]">{client['Телефон'] || `ID: ${client['Chat ID']}`}</p>
                                                </div>
                                                <div className="text-tg-hint opacity-0 group-hover:opacity-100 transition-opacity">
                                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
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
            </div>

            {/* Field Configuration Section */}
            <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
              <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 border-b border-tg-hint/20 pb-2">Настройка видимых полей для клиента</h2>
                <p className="text-tg-hint mb-6">Отметьте поля, которые будут видны клиентам. Настройки применяются для всех сразу после сохранения.</p>
                <div className="flex flex-wrap gap-3">
                  {webBaseColumns.map(field => (
                    <button
                        key={field}
                        type="button"
                        onClick={() => handleToggle(field)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 ${
                            visibleFields.has(field)
                                ? 'bg-tg-link text-white shadow-md'
                                : 'bg-tg-bg text-tg-text ring-1 ring-inset ring-tg-hint/30 hover:bg-tg-hint/10'
                        }`}
                      >
                      {field}
                    </button>
                  ))}
                </div>
                <button 
                    onClick={handleSaveConfig} 
                    disabled={saveStatus === 'saving'}
                    className={`mt-8 w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-70
                        ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-tg-button text-tg-button-text hover:opacity-90'}`}
                >
                  {getSaveButtonText()}
                </button>
              </div>
            </div>
          </main>
        </div>
    </div>
  );
};

export default AdminSettings;
