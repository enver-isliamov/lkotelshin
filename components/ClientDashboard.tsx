
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
        </div>
    </>
);

const LicensePlateWidget: React.FC<{ value: string }> = ({ value }) => {
  // Normalize value: remove spaces, special chars, keep alphanumeric
  const cleanValue = value.replace(/[^a-zA-Zа-яА-Я0-9]/g, '').toUpperCase();
  
  // Standard Russian format: X 000 XX 00(0)
  const regex = /^([A-ZА-Я])(\d{3})([A-ZА-Я]{2})(\d{2,3})$/;
  const match = cleanValue.match(regex);

  if (match) {
    const [_, char1, nums, char2, region] = match;
    return (
      <div className="inline-flex items-stretch bg-white text-black border border-black rounded-[3px] shadow-sm select-none overflow-hidden h-[22px] font-sans mx-1">
        {/* Left Section: Num & Letters */}
        <div className="flex items-baseline px-1.5 gap-0.5 self-center">
           <span className="text-[10px] font-bold leading-none">{char1}</span>
           <span className="text-[16px] font-bold leading-none tracking-widest">{nums}</span>
           <span className="text-[10px] font-bold leading-none">{char2}</span>
        </div>
        
        {/* Vertical Divider */}
        <div className="w-px bg-black h-full"></div>
        
        {/* Right Section: Region & Flag */}
        <div className="flex flex-col items-center justify-between w-7 py-[2px]">
             <span className="text-[9px] font-bold leading-none -mt-px">{region}</span>
             <div className="flex items-center gap-[1px] mt-auto">
                <span className="text-[5px] font-bold leading-none">RUS</span>
                {/* Flag */}
                <div className="border-[0.5px] border-gray-400 flex flex-col h-[4px] w-[7px]">
                    <div className="h-1/3 bg-white"></div>
                    <div className="h-1/3 bg-blue-700"></div>
                    <div className="h-1/3 bg-red-600"></div>
                </div>
             </div>
        </div>
      </div>
    );
  }

  // Fallback for non-standard numbers
  return (
      <div className="inline-block px-2 py-0.5 bg-white border border-black rounded-[3px] text-black font-bold text-xs shadow-sm whitespace-nowrap">
        {value}
      </div>
  );
};


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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
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
                    <h1 className="text-xl font-bold break-words leading-tight">{clientData['Имя клиента']}</h1>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    {isDemo && (
                        <div className="bg-tg-secondary-bg border border-tg-hint/20 px-2 py-1 rounded-md flex items-center text-xs text-tg-hint" role="alert">
                          <span>Демо</span>
                        </div>
                    )}
                </div>
            </div>

            {isHeaderInfoVisible && (
              <div className="bg-tg-secondary-bg p-3 rounded-xl shadow-sm border border-tg-hint/10 flex flex-col gap-3">
                  {/* Top Row: Phone and Plate */}
                  <div className="flex justify-between items-start gap-2">
                      {visibleSet.has('Телефон') && clientData['Телефон'] ? (
                          <a href={`tel:${clientData['Телефон'].replace(/[^\d+]/g, '')}`} className="flex items-center gap-2.5 text-tg-link active:opacity-60 transition-opacity">
                                <div className="p-1.5 bg-tg-link/10 rounded-full text-tg-link">
                                    <PhoneIcon className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-lg leading-none pt-0.5">{clientData['Телефон']}</span>
                          </a>
                      ) : (
                          <div></div> // Spacer if phone is hidden
                      )}

                      {visibleSet.has('Номер Авто') && clientData['Номер Авто'] && (
                          <LicensePlateWidget value={clientData['Номер Авто']} />
                      )}
                  </div>
                  
                  {/* Bottom Row: Address and Status */}
                  {(visibleSet.has('Адрес клиента') || clientData['Статус сделки'] === 'Ожидает обработки') && (
                      <div className="flex flex-col gap-2 pt-1">
                           {visibleSet.has('Адрес клиента') && clientData['Адрес клиента'] && (
                                <div className="flex items-start gap-2 text-tg-hint text-sm">
                                    <HomeIcon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                                    <span className="leading-snug">{clientData['Адрес клиента']}</span>
                                </div>
                           )}
                           
                           {clientData['Статус сделки'] === 'Ожидает обработки' && (
                                <div className="flex items-center gap-2 text-xs self-start bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md dark:bg-yellow-900/50 dark:text-yellow-200">
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span className="font-medium">Ожидает обработки</span>
                                </div>
                           )}
                      </div>
                  )}
              </div>
            )}
            
            {/* Care Service Button */}
            {!onBack && (
                <a 
                    href="https://t.me/EnrikeTomas" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-tg-secondary-bg p-3 rounded-xl shadow-sm border border-tg-hint/10 flex items-center justify-center gap-3 text-tg-text active:scale-[0.98] transition-all group"
                >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <HeadsetIcon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">Служба заботы</span>
                </a>
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

// Icons with className prop support
const PhoneIcon = ({className = "w-6 h-6"}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);
const HomeIcon = ({className = "w-6 h-6"}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);
const StatusIcon = ({className = "w-6 h-6"}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const HeadsetIcon = ({className = "w-6 h-6"}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 2.25h3.5a8.25 8.25 0 018.25 8.25v2.25a6 6 0 01-6 6v-4.5a2.25 2.25 0 00-2.25-2.25H12a2.25 2.25 0 00-2.25 2.25v4.5a6 6 0 01-6-6v-2.25a8.25 8.25 0 018.25-8.25zM12.75 14.25v6.75m-1.5-6.75v6.75" />
    </svg>
);

export default ClientDashboard;
