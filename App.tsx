
import React, { useState, useEffect, useMemo } from 'react';
import { fetchSheetData, addNewUser, fetchConfig, updateConfig } from './services/googleSheetService';
import { ClientData, OrderHistory } from './types';
import { ADMIN_CHAT_ID, APPS_SCRIPT_URL, WEB_BASE_COLUMNS, DEMO_CHAT_ID, DEFAULT_VISIBLE_CLIENT_FIELDS } from './constants';
import ClientDashboard from './components/ClientDashboard';
import AdminSettings from './components/AdminSettings';
import Loader from './components/Loader';
import NewUserForm from './components/NewUserForm';
import ErrorMessage from './components/ErrorMessage';

// Add Telegram Web App types to the global window object
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string; // initData is always present in a real Mini App
        initDataUnsafe: {
          user?: {
            id: number;
          };
        };
        ready: () => void;
        themeParams: { [key: string]: string };
      };
    };
  }
}


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
  const [authStatus, setAuthStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [authErrorMessage, setAuthErrorMessage] = useState<string>('');
  
  // State for admin viewing a specific client
  const [viewingClient, setViewingClient] = useState<ClientData | null>(null);
  const [viewingClientHistory, setViewingClientHistory] = useState<OrderHistory[]>([]);
  
  // State for new user registration
  const [isNewUser, setIsNewUser] = useState(false);

  // State for dynamic UI configuration
  const [visibleFields, setVisibleFields] = useState<string[]>(DEFAULT_VISIBLE_CLIENT_FIELDS);


  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    // Mini App Environment: Check for initData which is always present
    if (tg && tg.initData) {
        tg.ready();
        if (tg.initDataUnsafe?.user?.id) {
            setUserId(tg.initDataUnsafe.user.id.toString());
            setAuthStatus('success');
        } else {
            setAuthErrorMessage("Не удалось получить ваш ID пользователя. Пожалуйста, откройте это приложение через кнопку меню в боте Telegram. Если вы уже делаете это, попробуйте перезапустить Telegram.");
            setAuthStatus('error');
        }
    } 
    // Web (Browser for testing) Environment
    else {
        console.warn("Running in browser/test mode. Use ?clientId=... to test a specific user.");
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('clientId');
        setUserId(clientId || DEMO_CHAT_ID); // Default to demo if no clientId
        setAuthStatus('success');
    }
  }, []);
  
  const isAdmin = useMemo(() => userId === ADMIN_CHAT_ID, [userId]);

  useEffect(() => {
    // This effect now depends on authStatus. It will only run after we have a userId.
    if (authStatus !== 'success' || !userId) {
        return;
    }
    
    const loadData = async () => {
      if ((APPS_SCRIPT_URL as string) === 'ВАШ_URL_СКРИПТА' || !APPS_SCRIPT_URL) {
        setError("Пожалуйста, настройте URL-адрес Google Apps Script в файле constants.ts. Инструкция находится в файле instructions.md.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch remote config first, fallback to default if fails
        const config = await fetchConfig();
        if (config.visibleClientFields && Array.isArray(config.visibleClientFields)) {
            setVisibleFields(config.visibleClientFields);
        }

        if (userId === DEMO_CHAT_ID) {
            setIsDemoMode(true);
            setClientData(demoClientData);
            setOrderHistory(demoOrderHistory);
            return;
        }
        
        setIsDemoMode(false);

        if (isAdmin) {
            const webBaseData = await fetchSheetData<ClientData>('WebBase');
            setAllClients(webBaseData);
            return;
        }
        
        const [webBaseData, archiveData] = await Promise.all([
            fetchSheetData<ClientData>('WebBase'),
            fetchSheetData<OrderHistory>('Archive')
        ]);
        
        const currentClient = webBaseData.find(client => client['Chat ID'] === userId);
        if (currentClient) {
            setClientData(currentClient);
            setIsNewUser(false);
        } else {
            setIsNewUser(true);
        }

        const clientHistory = archiveData.filter(order => order['Chat ID'] === userId);
        setOrderHistory(clientHistory);

      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'Не удалось загрузить данные.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, isAdmin, authStatus]);
  
  const handleAdminSelectClient = async (client: ClientData) => {
    setIsLoading(true);
    setViewingClient(client);
    try {
      // Fetch history for this specific client on demand
      const allHistory = await fetchSheetData<OrderHistory>('Archive');
      const clientHistory = allHistory.filter(order => order['Chat ID'] === client['Chat ID']?.toString());
      setViewingClientHistory(clientHistory);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Не удалось загрузить историю клиента.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminBack = () => {
    setViewingClient(null);
    setViewingClientHistory([]);
    setError(null); // Clear any client-specific errors
  };

  const handleNewUserSubmit = async (phone: string) => {
    if (!userId) {
      throw new Error("User ID is not available for submission.");
    }
    await addNewUser(userId, phone);
  };
  
  const handleConfigSave = async (fields: string[]) => {
    await updateConfig('visibleClientFields', fields);
    setVisibleFields(fields); // Update state locally for immediate feedback
  };

  if (authStatus === 'pending') {
    return <Loader />;
  }

  if (authStatus === 'error') {
     return <ErrorMessage type="auth" message={authErrorMessage} />;
  }

  if (isNewUser && userId && !isAdmin) {
    return <NewUserForm chatId={userId} onSubmit={handleNewUserSubmit} />;
  }

  if (isLoading) {
    return <Loader />;
  }
  
  if (error && !isAdmin) {
    const isConfigError = error.startsWith("Пожалуйста, настройте URL-адрес Google Apps Script");
    return <ErrorMessage type={isConfigError ? 'config' : 'data'} message={error} />;
  }


  return (
    <div className="min-h-screen p-4">
      {isAdmin ? (
         viewingClient ? (
          <ClientDashboard 
            clientData={viewingClient}
            orderHistory={viewingClientHistory}
            isDemo={false} // Never demo mode when admin is viewing
            onBack={handleAdminBack}
            visibleFields={visibleFields}
          />
        ) : (
          <AdminSettings 
            allClients={allClients} 
            webBaseColumns={WEB_BASE_COLUMNS}
            onClientSelect={handleAdminSelectClient}
            initialVisibleFields={visibleFields}
            onConfigSave={handleConfigSave}
          />
        )
      ) : (
        <ClientDashboard 
          clientData={clientData} 
          orderHistory={orderHistory} 
          isDemo={isDemoMode}
          visibleFields={visibleFields}
        />
      )}
    </div>
  );
};

export default App;
