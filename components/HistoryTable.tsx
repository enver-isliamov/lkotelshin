
import React from 'react';
import { OrderHistory } from '../types';

interface HistoryTableProps {
  history: OrderHistory[];
  isLoading: boolean;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColor = status === 'Выполнен' 
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    
  return (
    <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${statusColor}`}>
      {status}
    </span>
  );
};

const HistoryTableSkeleton: React.FC = () => (
  <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-4 sm:p-6 animate-pulse">
    <div className="flex items-center mb-6 border-b border-tg-hint/20 pb-3">
        <div className="h-6 w-6 mr-3 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="h-7 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
    </div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="w-px h-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                </div>
            </div>
        </div>
      ))}
    </div>
  </div>
);


const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);


const HistoryTable: React.FC<HistoryTableProps> = ({ history, isLoading }) => {
  if (isLoading) {
    return <HistoryTableSkeleton />;
  }
  
  if (history.length === 0) {
    return (
      <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-8 text-center flex flex-col items-center">
        <div className="text-tg-hint mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Архив пуст</h2>
        <p className="text-tg-hint max-w-xs">Здесь будет отображаться список ваших завершенных заказов.</p>
      </div>
    );
  }

  return (
    <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-4 sm:p-6">
       <div className="flex items-center mb-6 border-b border-tg-hint/20 pb-3">
        <div className="mr-3 text-tg-link"><ArchiveIcon /></div>
        <h2 className="text-2xl font-semibold">Архив заказов</h2>
      </div>
      
      {/* Vertical Timeline View */}
      <div className="space-y-6">
        {history.slice().reverse().map((order, index) => {
          const period = (order['Начало'] && order['Окончание']) 
              ? `${order['Начало']} - ${order['Окончание']}` 
              : (order['Дата'] || 'Дата не указана');

          return (
            <div key={index} className="flex gap-4">
              {/* Timeline decorator */}
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-tg-link/20 text-tg-link flex items-center justify-center font-semibold">{history.length - index}</div>
                {index < history.length - 1 && <div className="w-px h-full bg-tg-hint/30"></div>}
              </div>
              {/* Card Content */}
              <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-lg text-tg-text">{order['Услуга'] || 'Услуга не указана'}</h3>
                  {order['Статус'] && <StatusBadge status={order['Статус']} />}
                </div>
                <div className="flex flex-wrap justify-between items-center text-sm gap-x-4 gap-y-1">
                   <p className="text-tg-hint">{period}</p>
                   <p className="text-tg-text font-semibold">{order['Сумма'] ? `${order['Сумма'].replace(/\s/g, '')} ₽` : ''}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTable;
