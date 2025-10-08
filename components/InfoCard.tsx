
import React from 'react';
import { ClientData } from '../types';

interface InfoCardProps {
  clientData: ClientData;
  visibleFields: string[];
}

// Utility to parse Russian date format DD.MM.YYYY
const parseDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null;
  const parts = dateString.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(p => parseInt(p, 10));
    // JavaScript months are 0-indexed
    return new Date(year, month - 1, day);
  }
  return null;
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
    <div className="flex items-center mb-3">
      <div className="mr-3 text-tg-link">{icon}</div>
      <h3 className="text-lg font-semibold text-tg-text">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);


const InfoCard: React.FC<InfoCardProps> = ({ clientData, visibleFields }) => {

  const InfoItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value || !visibleFields.includes(label)) return null;
    return (
      <div>
        <p className="text-sm text-tg-hint">{label}</p>
        <p className="text-md font-medium text-tg-text">{value}</p>
      </div>
    );
  };

  const FinancialItem: React.FC<{ label: string; value?: string | null; isDebt?: boolean }> = ({ label, value, isDebt = false }) => {
      if (!value || !visibleFields.includes(label)) return null;
      
      const isValuePositive = parseFloat(value.replace(/\s/g, '')) > 0;
      const valueClass = isDebt && isValuePositive ? "text-red-500 font-bold" : "text-tg-text";

      return (
          <div>
              <p className="text-sm text-tg-hint">{label}</p>
              <p className={`text-md font-medium ${valueClass}`}>{value}</p>
          </div>
      )
  }

  const ProgressBar: React.FC<{ start?: string; end?: string }> = ({ start, end }) => {
    if (!start || !end || !visibleFields.includes('Начало') || !visibleFields.includes('Окончание')) return null;

    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const today = new Date();
    
    if (!startDate || !endDate || endDate < startDate) return null;

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    let progress = (elapsedDuration / totalDuration) * 100;
    progress = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100

    return (
      <div>
        <div className="flex justify-between text-sm text-tg-hint mb-1">
          <span>{start}</span>
          <span>{end}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-tg-link h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6 border-b border-tg-hint pb-3">Детали заказа</h2>
      <div className="space-y-5">

        <Section title="Основная информация" icon={<CarIcon />}>
          <InfoItem label="Номер Авто" value={clientData['Номер Авто']} />
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Кол-во шин" value={clientData['Кол-во шин']} />
            <InfoItem label="Наличие дисков" value={clientData['Наличие дисков']} />
          </div>
        </Section>
        
        <Section title="Сроки хранения" icon={<CalendarIcon />}>
           <ProgressBar start={clientData['Начало']} end={clientData['Окончание']} />
           <InfoItem label="Напомнить" value={clientData['Напомнить']} />
        </Section>

        <Section title="Финансы" icon={<WalletIcon />}>
           <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Общая сумма" value={clientData['Общая сумма']} />
            <FinancialItem label="Долг" value={clientData['Долг']} isDebt />
           </div>
        </Section>

        <Section title="Место хранения" icon={<LocationIcon />}>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Склад хранения" value={clientData['Склад хранения']} />
            <InfoItem label="Ячейка" value={clientData['Ячейка']} />
          </div>
        </Section>
        
      </div>
    </div>
  );
};

// SVG Icons
const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17H6.516a1 1 0 01-.985-.826l-1.6-6.4a1 1 0 01.986-1.174h13.168a1 1 0 01.986 1.174l-1.6 6.4a1 1 0 01-.986.826H13m-2-5h2m-2-4h2" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default InfoCard;
