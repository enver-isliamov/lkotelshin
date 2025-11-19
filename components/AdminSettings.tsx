
import React, { useState, useMemo, useEffect } from 'react';
import { ClientData } from '../types';
import { DEMO_CHAT_ID } from '../constants';
import { sendMessageFromBot } from '../services/googleSheetService';

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

// Action Icons
const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
);
const ChatIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
     </svg>
);

const fieldGroups: Record<string, string[]> = {
  "Контактная информация": ["Имя клиента", "Телефон", "Номер Авто", "Адрес клиента"],
  "Детали заказа": ["Заказ - QR", "Кол-во шин", "Наличие дисков", "DOT CODE"],
  "Сроки и даты": ["Начало", "Окончание", "Срок", "Напомнить"],
  "Место хранения": ["Склад хранения", "Ячейка"],
  "Финансы": ["Цена за месяц", "Общая сумма", "Долг"],
  "Информация о сделке": ["Договор", "Статус сделки", "Источник трафика"],
};

const SendMessageModal: React.FC<{client: ClientData; onClose: () => void}> = ({ client, onClose }) => {
    const [text, setText] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSend = async () => {
        if (!text.trim()) return;
        setStatus('sending');
        setError('');
        try {
            await sendMessageFromBot(client['Chat ID'], text);
            setStatus('sent');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (e) {
            setStatus('error');
            setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
        }
    };
    
    const getButtonText = () => {
        switch (status) {
            case 'sending': return 'Отправка...';
            case 'sent': return '✓ Отправлено!';
            case 'error': return 'Ошибка. Повторить';
            default: return 'Отправить';
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-tg-secondary-bg rounded-lg shadow-2xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-tg-hint hover:text-tg-text transition-colors"
                    aria-label="Закрыть"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold mb-1">Сообщение клиенту</h3>
                <p className="text-tg-hint text-sm mb-4 truncate">Кому: {client['Имя клиента']}</p>
                
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Введите ваше сообщение..."
                    rows={5}
                    className="w-full p-2 border border-tg-hint/30 rounded-lg bg-tg-bg focus:outline-none focus:ring-2 focus:ring-tg-link text-sm"
                    disabled={status === 'sending' || status === 'sent'}
                />
                
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                
                <button 
                    onClick={handleSend}
                    disabled={!text.trim() || status === 'sending' || status === 'sent'}
                    className={`mt-4 w-full font-bold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-60
                        ${status === 'sent' ? 'bg-green-500 text-white' : 'bg-tg-button text-tg-button-text hover:opacity-90'}`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};


const AdminSettings: React.FC<AdminSettingsProps> = ({ allClients, webBaseColumns, onClientSelect, initialVisibleFields, onConfigSave, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(initialVisibleFields));
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [messagingClient, setMessagingClient] = useState<ClientData | null>(null);


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
    setSaveStatus('idle'); // Reset save status on change
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
  
  const handleOpenMessageModal = (client: ClientData) => {
    if (!client['Chat ID'] || client['Chat ID'] === DEMO_CHAT_ID) {
      alert('Невозможно отправить сообщение этому пользователю (отсутствует реальный Chat ID).');
      return;
    }
    setMessagingClient(client);
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

  const FieldToggle: React.FC<{ field: string; isVisible: boolean; onToggle: (field: string) => void }> = ({ field, isVisible, onToggle }) => (
    <div
      onClick={() => onToggle(field)}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-tg-bg"
      role="checkbox"
      aria-checked={isVisible}
      tabIndex={0}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggle(field)}
    >
      <div className={`w-5 h-5 rounded flex-shrink-0 border-2 ${isVisible ? 'bg-tg-link border-tg-link' : 'border-tg-hint/50 bg-tg-bg'} flex items-center justify-center transition-all`}>
        {isVisible && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="font-medium text-tg-text select-none">{field}</span>
    </div>
  );

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-800/20 p-2 sm:p-4 rounded-xl">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <header className="text-center pt-2">
              <h2 className="font-semibold">Панель администратора</h2>
              <p className="text-tg-hint mt-1 text-sm">Всего клиентов в базе: {isLoading ? '...' : allClients.length}</p>
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
                                          <li key={client['Chat ID']} className="group flex w-full items-center justify-between gap-4 px-4 sm:px-6 py-3 hover:bg-tg-bg transition-colors text-left">
                                              <div
                                                  onClick={() => onClientSelect(client)}
                                                  title={`Открыть кабинет клиента: ${client['Имя клиента']}`}
                                                  className="flex flex-1 items-center gap-4 cursor-pointer min-w-0"
                                              >
                                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-tg-link text-white flex items-center justify-center font-bold text-base transition-transform group-hover:scale-110">
                                                      {getInitials(client['Имя клиента'])}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                          <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(client['Статус сделки'])}`} title={`Статус: ${client['Статус сделки']}`}></span>
                                                          <p className="font-semibold text-sm text-tg-text truncate">{client['Имя клиента'] || 'Имя не указано'}</p>
                                                      </div>
                                                      <p className="text-sm text-tg-hint pl-[18px] truncate">{client['Телефон'] || `ID: ${client['Chat ID']}`}</p>
                                                  </div>
                                              </div>
                                              
                                              <div className="flex flex-shrink-0 items-center gap-2 text-tg-hint">
                                                  {client['Телефон'] && (
                                                      <a
                                                          href={`tel:${client['Телефон'].replace(/\D/g, '')}`}
                                                          onClick={(e) => e.stopPropagation()}
                                                          title={`Позвонить ${client['Телефон']}`}
                                                          className="p-2 rounded-full hover:bg-tg-hint/10 hover:text-tg-link transition-colors"
                                                      >
                                                          <PhoneIcon />
                                                      </a>
                                                  )}
                                                  <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenMessageModal(client);
                                                      }}
                                                      title={`Написать клиенту в Telegram от имени бота`}
                                                      className="p-2 rounded-full hover:bg-tg-hint/10 hover:text-tg-link transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                      disabled={!client['Chat ID'] || client['Chat ID'] === DEMO_CHAT_ID}
                                                  >
                                                      <ChatIcon />
                                                  </button>
                                                  <div className="text-tg-hint opacity-50 group-hover:opacity-100 transition-opacity pl-1">
                                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                      </svg>
                                                  </div>
                                              </div>
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
                <div className="bg-tg-secondary-bg p-4 sm:p-6 rounded-lg shadow-lg">
                  <div className="mb-6 pb-3 border-b border-tg-hint/20">
                    <h2 className="text-xl font-semibold">Настройка видимых полей</h2>
                    <p className="text-tg-hint mt-1">Выберите информацию, которую будут видеть клиенты в своем кабинете.</p>
                  </div>
                  
                  <div className="space-y-6">
                      {Object.entries(fieldGroups).map(([groupName, fields]) => (
                          <div key={groupName}>
                              <h4 className="text-md font-semibold text-tg-text mb-2 pb-2 border-b border-tg-hint/10">{groupName}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                  {fields
                                    .filter(field => webBaseColumns.includes(field))
                                    .map(field => (
                                      <FieldToggle 
                                        key={field}
                                        field={field} 
                                        isVisible={visibleFields.has(field)} 
                                        onToggle={handleToggle} 
                                      />
                                  ))}
                              </div>
                          </div>
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
      {messagingClient && (
        <SendMessageModal 
          client={messagingClient}
          onClose={() => setMessagingClient(null)}
        />
      )}
    </>
  );
};

export default AdminSettings;
