
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
      <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">История заказов</h2>
        <p className="text-tg-hint">У вас пока нет завершенных заказов.</p>
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
