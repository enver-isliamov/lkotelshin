
import React from 'react';
import { OrderHistory } from '../types';

interface HistoryTableProps {
  history: OrderHistory[];
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColor = status === 'Выполнен' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800';
    
  return (
    <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${statusColor}`}>
      {status}
    </span>
  );
};


const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-8 text-center flex flex-col items-center">
        <div className="text-tg-hint mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">История пуста</h2>
        <p className="text-tg-hint max-w-xs">Здесь будет отображаться список ваших прошлых заказов и услуг.</p>
      </div>
    );
  }

  // Filter out unwanted columns like 'Chat ID' and 'Услуга'
  const headers = Object.keys(history[0]).filter(h => h !== 'Chat ID' && h !== 'Услуга');

  return (
    <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 border-b border-tg-hint pb-3">История заказов</h2>
      
      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {history.map((order, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            {headers.map(header => (
              <div key={header} className="flex justify-between items-center text-sm mb-2 last:mb-0">
                <span className="text-tg-hint font-medium">{header}:</span>
                {header === 'Статус' ? (
                  <StatusBadge status={order[header]} />
                ) : (
                  <span className="text-tg-text font-semibold text-right">{order[header]}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b-2 border-tg-hint">
            <tr>
              {headers.map(header => (
                <th key={header} className="p-3 text-sm font-bold uppercase text-tg-hint">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((order, index) => (
              <tr key={index} className="border-b border-tg-hint/50">
                {headers.map(header => (
                  <td key={header} className="p-3 text-tg-text">
                    {header === 'Статус' ? (
                      <StatusBadge status={order[header]} />
                    ) : (
                     order[header]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
