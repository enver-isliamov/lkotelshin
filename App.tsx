
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSheetData } from './services/googleSheetService';
import { ClientData, OrderHistory } from './types';
import { ADMIN_CHAT_ID, APPS_SCRIPT_URL, WEB_BASE_COLUMNS, DEMO_CHAT_ID } from './constants';
import ClientDashboard from './components/ClientDashboard';
import AdminSettings from './components/AdminSettings';
import Loader from './components/Loader';

const demoClientData: ClientData = {
    'Chat ID': 'demo_user',
    'Имя клиента': 'Иван Демо',
    'Телефон': '+7 (000) 000-00-00',
    'Номер Авто': 'A000AA',
    'Заказ - QR': 'DEMO-QR-123',
    'Цена за месяц': '3000',
    'Кол-во шин': '4',
    'Наличие дисков': 'С дисками',
    'Начало': '01.10.2023',
    'Срок': '7 мес.',
    'Напомнить': '01.04.2024',
    'Окончание': '01.05.2024',
    'Склад хранения': 'Склад №1',
    'Ячейка': 'A-101',
    'Общая сумма': '21000',
    'Долг': '0',
    'Договор': 'DEMO/10/23',
    'Адрес клиента': 'г. Демо, ул. Тестовая, д. 1',
    'Статус сделки': 'Активен',
    'Источник трафика': 'Демо-вход',
    'DOT CODE': '1223',
};

const demoOrderHistory: OrderHistory[] = [
    {
        'Chat ID': 'demo_user',
        'Дата': '15.05.2023',
        'Услуга': 'Сезонное хранение',
        'Сумма': '18000',
        'Статус': 'Выполнен'
    },
    {
        'Chat ID': 'demo_user',
        'Дата': '20.10.2022',
        'Услуга': 'Сезонное хранение',
        'Сумма': '16000',
        'Статус': 'Выполнен'
    },
];


const App: React.FC = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allClients, setAllClients] = useState<ClientData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    setUserId(clientId || DEMO_CHAT_ID);
  }, []);

  const isAdmin = useMemo(() => userId === ADMIN_CHAT_ID, [userId]);

  useEffect(() => {
    const loadData = async () => {
      // FIX: Cast APPS_SCRIPT_URL to string to avoid a TypeScript error about non-overlapping types.
      // This preserves the check that ensures the placeholder URL has been replaced.
      if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
        setError("Пожалуйста, настройте URL-адрес Google Apps Script в файле constants.ts. Инструкция находится в файле instructions.md.");
        setIsLoading(false);
        return;
      }

      if (userId === DEMO_CHAT_ID) {
        setIsDemoMode(true);
        setClientData(demoClientData);
        setOrderHistory(demoOrderHistory);
        setIsLoading(false);
        return;
      }
      
      setIsDemoMode(false);
      setIsLoading(true);

      // Handle Admin view separately
      if (isAdmin) {
        try {
          const webBaseData = await fetchSheetData<ClientData>('WebBase');
          setAllClients(webBaseData);
        } catch(e) {
          console.error(e);
          setError(e instanceof Error ? e.message : 'Не удалось загрузить данные.');
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      // Handle Client view
      try {
        const [webBaseData, archiveData] = await Promise.all([
          fetchSheetData<ClientData>('WebBase'),
          fetchSheetData<OrderHistory>('Archive')
        ]);
        
        const currentClient = webBaseData.find(client => client['Chat ID'] === userId?.toString());
        if (currentClient) {
          setClientData(currentClient);
        } else {
          setError('Клиент с вашим ID не найден.');
        }

        const clientHistory = archiveData.filter(order => order['Chat ID'] === userId?.toString());
        setOrderHistory(clientHistory);

      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Не удалось загрузить данные.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      loadData();
    }
  }, [userId, isAdmin]);

  if (isLoading) {
    return <Loader />;
  }
  
  if (error && !isAdmin) {
     return (
      <div className="flex items-center justify-center h-screen p-4 text-center">
        <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold text-red-500 mb-2">Ошибка</h2>
          <p className="text-tg-hint">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {isAdmin ? (
        <AdminSettings allClients={allClients} webBaseColumns={WEB_BASE_COLUMNS} />
      ) : (
        <ClientDashboard 
          clientData={clientData} 
          orderHistory={orderHistory} 
          isDemo={isDemoMode}
        />
      )}
    </div>
  );
};

export default App;
