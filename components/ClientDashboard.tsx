import React, { useState } from 'react';
import { ClientData, OrderHistory } from '../types';
import InfoCard from './InfoCard';
import HistoryTable from './HistoryTable';

interface ClientDashboardProps {
  clientData: ClientData | null;
  orderHistory: OrderHistory[];
  isDemo?: boolean;
}

type Tab = 'current' | 'history';

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.647 8.533-2.147 10.04c-.15.703-.64.88-1.21.543l-4.08-3.003-1.97 1.893c-.21.21-.39.39-.77.39l.28-4.16 7.79-7.003c.33-.29-.08-.44-.51-.15l-9.59 6.043-4.01-.12c-.69-.02-1.01-.42-.58-1.02l11.09-8.54c.64-.49 1.21-.23 1.01.6z"/>
  </svg>
);


const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientData, orderHistory, isDemo }) => {
  const [activeTab, setActiveTab] = useState<Tab>('current');

  if (!clientData) {
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
       {isDemo && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md" role="alert">
          <p className="font-bold">Демонстрационный режим</p>
          <p>Вы просматриваете тестовые данные. Для доступа к вашему кабинету используйте персональную ссылку.</p>
        </div>
      )}
      <header className="space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-tg-hint text-lg">Здравствуйте, {clientData['Имя клиента']}!</p>
        </div>
        <a 
          href="https://t.me/EnrikeTomas" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full bg-tg-button text-tg-button-text font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          <TelegramIcon />
          Связаться с менеджером
        </a>
      </header>


      <div className="grid grid-cols-2 gap-2 p-1 bg-tg-secondary-bg rounded-lg shadow-inner">
        <TabButton tab="current" label="Текущий заказ" />
        <TabButton tab="history" label="История заказов" />
      </div>

      <main>
        {activeTab === 'current' && <InfoCard clientData={clientData} />}
        {activeTab === 'history' && <HistoryTable history={orderHistory} />}
      </main>
    </div>
  );
};

export default ClientDashboard;
