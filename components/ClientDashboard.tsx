
import React, { useState } from 'react';
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

type Tab = 'current' | 'history';

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData, orderHistory, isDemo, onBack, visibleFields, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('current');

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
       <div className="flex items-center justify-end gap-4 min-h-[50px]">
          {isDemo && (
            <div className="bg-tg-secondary-bg border border-tg-hint/20 p-3 rounded-lg flex items-center text-sm text-tg-hint" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 text-tg-link" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p><span className="font-semibold text-tg-text">Демо-режим:</span> Вы просматриваете тестовые данные.</p>
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
      {onBack && (
         <button onClick={onBack} className="flex items-center text-tg-link font-semibold transition-opacity hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Назад к списку
        </button>
      )}
      <header className="space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{onBack ? 'Кабинет клиента' : 'Личный кабинет'}</h1>
           {isLoading ? (
            <div className="mt-1 h-7 w-48 mx-auto bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
          ) : clientData ? (
            <p className="text-tg-hint text-lg">{onBack ? clientData['Имя клиента'] : `Здравствуйте, ${clientData['Имя клиента']}!`}</p>
          ) : null}

          {!isLoading && clientData && clientData['Статус сделки'] === 'Ожидает обработки' && (
            <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-200">
              Статус: {clientData['Статус сделки']}
            </div>
          )}
        </div>
      </header>


      <div className="grid grid-cols-2 gap-2 p-1 bg-tg-secondary-bg rounded-lg shadow-inner">
        <TabButton tab="current" label="Текущий заказ" />
        <TabButton tab="history" label="История заказов" />
      </div>

      <main>
        <div style={{ display: activeTab === 'current' ? 'block' : 'none' }}>
            <InfoCard clientData={clientData} visibleFields={visibleFields} isLoading={isLoading} />
        </div>
        <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
            <HistoryTable history={orderHistory} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
