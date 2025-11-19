
import React, { useState, useMemo } from 'react';
import { ClientData, OrderHistory } from '../types';
import InfoCard from './InfoCard';
import HistoryTable from './HistoryTable';

interface ClientDashboardProps {
  clientData: ClientData | null;
  orderHistory: OrderHistory[];
  visibleFields: string[];
  isLoading: boolean;
  isDemo?: boolean;
  onBack?: () => void;
}

type Tab = 'current' | 'archive';

const HeaderSkeleton: React.FC = () => (
    <>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
                <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="bg-tg-secondary-bg p-4 rounded-lg shadow-md space-y-3 animate-pulse">
            <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div className="h-5 w-3/5 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
    </>
);


const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData, orderHistory, isDemo, onBack, visibleFields, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const visibleSet = useMemo(() => new Set(visibleFields), [visibleFields]);

  const isHeaderInfoVisible = useMemo(() => {
    if (!clientData) return false;
    const fieldsToCheck = ['Телефон', 'Номер Авто', 'Адрес клиента'];
    const hasVisibleFields = fieldsToCheck.some(field => visibleSet.has(field) && clientData[field]);
    const hasPendingStatus = clientData['Статус сделки'] === 'Ожидает обработки';
    return hasVisibleFields || hasPendingStatus;
  }, [clientData, visibleSet]);

  if (!isLoading && !clientData) {
    return (
      <div className="flex items-center justify-center h-screen p-4 text-center">
        <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-2">Добро пожаловать!</h2>
          <p className="text-tg-hint">Ваши данные не найдены. Если вы уверены, что являетесь клиентом, пожалуйста, свяжитесь с поддержкой.</p>
        </div>
      </div>
    );
  }

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
  
  const InfoRow: React.FC<{ icon: React.ReactNode; value?: string | null }> = ({ icon, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 text-tg-text">
            <div className="flex-shrink-0 w-5 h-5 text-tg-hint">{icon}</div>
            <span className="text-sm">{value}</span>
        </div>
    )
  };


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
        {onBack && (
         <button onClick={onBack} className="flex items-center text-tg-link font-semibold transition-opacity hover:opacity-80 -mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Назад к списку
        </button>
      )}

      {isLoading ? <HeaderSkeleton /> : clientData && (
          <>
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 pt-1">
                    <h1 className="text-lg font-bold break-words leading-tight">{clientData['Имя клиента']}</h1>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                    {isDemo && (
                        <div className="bg-tg-secondary-bg border border-tg-hint/20 p-2 rounded-lg flex items-center text-xs text-tg-hint" role="alert">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-tg-link" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Демо-режим</span>
                        </div>
                    )}
                    {!onBack && (
                        <a 
                          href="https://t.me/EnrikeTomas" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0 bg-tg-button text-tg-button-text font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                          aria-label="Связаться с менеджером"
                        >
                          Связаться
                        </a>
                    )}
                </div>
            </div>

            {isHeaderInfoVisible && (
              <div className="bg-tg-secondary-bg p-4 rounded-lg shadow-md space-y-3">
                  {visibleSet.has('Телефон') && <InfoRow icon={<PhoneIcon />} value={clientData['Телефон']} />}
                  {visibleSet.has('Номер Авто') && <InfoRow icon={<CarPlateIcon />} value={clientData['Номер Авто']} />}
                  {visibleSet.has('Адрес клиента') && <InfoRow icon={<HomeIcon />} value={clientData['Адрес клиента']} />}
                  {clientData['Статус сделки'] === 'Ожидает обработки' && (
                      <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 h-5 text-tg-hint"><StatusIcon /></div>
                          <div className="text-sm inline-block bg-yellow-100 text-yellow-800 font-medium px-2 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
                            {clientData['Статус сделки']}
                          </div>
                      </div>
                  )}
              </div>
            )}
        </>
      )}


      <div className="grid grid-cols-2 gap-2 p-1 bg-tg-secondary-bg rounded-lg shadow-inner">
        <TabButton tab="current" label="Текущий заказ" />
        <TabButton tab="archive" label="Архив" />
      </div>

      <main>
        <div style={{ display: activeTab === 'current' ? 'block' : 'none' }}>
            <InfoCard clientData={clientData} visibleFields={visibleFields} isLoading={isLoading} />
        </div>
        <div style={{ display: activeTab === 'archive' ? 'block' : 'none' }}>
            <HistoryTable history={orderHistory} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

// Icons
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);
const CarPlateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
    </svg>
);
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);
const StatusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default ClientDashboard;