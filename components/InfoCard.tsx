
import React, { useMemo } from 'react';
import { ClientData } from '../types';

interface InfoCardProps {
  clientData: ClientData | null;
  visibleFields: string[];
  isLoading: boolean;
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

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; isCompact?: boolean }> = ({ title, icon, children, isCompact }) => (
  <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg ${isCompact ? 'p-3' : 'p-4'}`}>
    <div className={`flex items-center ${isCompact ? 'mb-2' : 'mb-3'}`}>
      <div className={`mr-2 text-tg-link ${isCompact ? 'scale-90 origin-left' : ''}`}>{icon}</div>
      <h3 className={`font-semibold text-tg-text ${isCompact ? 'text-xs uppercase tracking-wider' : 'text-lg'}`}>{title}</h3>
    </div>
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>{children}</div>
  </div>
);

const InfoCardSkeleton: React.FC = () => (
  <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-4 sm:p-6 animate-pulse">
     <div className="space-y-4">
        {/* Simulating 3 sections of different sizes */}
        <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg h-32">
            <div className="flex items-center mb-3">
                 <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                 <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="w-full h-12 bg-white dark:bg-gray-800 rounded mb-2"></div>
            <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg h-24">
             <div className="flex items-center mb-3">
                 <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
                 <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg h-32"></div>
            <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg h-32"></div>
        </div>
     </div>
  </div>
);

const getStatusStyling = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'активен':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'завершен':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'просрочен':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'ожидает обработки':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
};

const StatusBadge: React.FC<{ status?: string | null; isCompact?: boolean }> = ({ status, isCompact }) => {
    if (!status) return null;
    return (
        <span className={`inline-block font-medium rounded-full ${getStatusStyling(status)} ${isCompact ? 'px-2 py-0.5 text-xs truncate max-w-full' : 'px-2.5 py-1 text-sm'}`}>
            {status}
        </span>
    );
};

// --- NEW TIRE CARD COMPONENT AND LOGIC ---

interface TireSet {
  brand: string;
  model: string; // Not explicitly used if brand contains full name, but good to have
  size: string;
  count: string;
  season: string;
  disks: string;
  dot: string;
}

const parseTireData = (clientData: ClientData): TireSet[] => {
    const split = (str: string) => str ? str.split('\n').map(s => s.trim()) : [];

    const brands = split(clientData['Бренд_Модель']);
    const sizes = split(clientData['Размер шин']);
    const counts = split(clientData['Кол-во шин']);
    const dots = split(clientData['DOT CODE']);
    const seasons = split(clientData['Сезон']);
    const disks = split(clientData['Наличие дисков']);

    // Determine the number of tire sets based on the field with the most lines (usually brand or size)
    const maxSets = Math.max(brands.length, sizes.length, counts.length);
    const sets: TireSet[] = [];

    for (let i = 0; i < maxSets; i++) {
        sets.push({
            brand: brands[i] || brands[0] || '', // Fallback to first line if subsequent are empty (common in sheets)
            model: '',
            size: sizes[i] || sizes[0] || '',
            count: counts[i] || counts[0] || '',
            season: seasons[i] || seasons[0] || '',
            disks: disks[i] || disks[0] || '',
            dot: dots[i] || (i === 0 ? dots[0] : '') || '', // DOT might only be listed once
        });
    }
    return sets;
};

const TireCard: React.FC<{ data: TireSet }> = ({ data }) => {
    const hasDisks = data.disks && (data.disks.toLowerCase().includes('с дисками') || data.disks.toLowerCase().includes('да') || data.disks.toLowerCase().includes('есть'));
    
    // Clean up count (remove "шт" if present to add it cleanly later)
    const cleanCount = data.count.replace(/\D/g, '');

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-2 shadow-sm">
            {/* Top Row: Count | Size */}
            <div className="flex items-center gap-3 mb-1.5">
                <div className="flex items-baseline">
                    <span className="font-bold text-lg text-tg-text">{cleanCount || '-'}</span>
                    <span className="text-sm font-medium ml-1 text-tg-text">шт</span>
                </div>
                
                <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
                
                <span className="font-bold text-xl text-tg-link tracking-tight">{data.size || 'Размер не указан'}</span>
            </div>

            {/* Middle Row: Brand + Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-2 mb-2">
                <span className="font-medium text-tg-text mr-1 leading-snug">
                    {data.brand || 'Модель не указана'}
                </span>
                
                <div className="flex gap-2">
                    {data.season && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs font-semibold">
                            {data.season}
                        </span>
                    )}
                    
                    {hasDisks && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold">
                            Диски
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom Row: DOT */}
            {data.dot && (
                <div className="text-xs text-tg-hint font-mono mt-1 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    DOT: {data.dot}
                </div>
            )}
            
             {/* Delete Icon would go here, but omitted for Client View as requested by context logic */}
        </div>
    );
};

// --- END NEW TIRE COMPONENTS ---


const InfoCard: React.FC<InfoCardProps> = ({ clientData, visibleFields, isLoading }) => {
  if (isLoading) {
    return <InfoCardSkeleton />;
  }

  if (!clientData) {
    return null; // Should be handled by parent component
  }
  
  const visibleSet = new Set(visibleFields);
  const isFieldVisible = (field: string) => visibleSet.has(field);

  // Parse Tire Data for the new display
  const tireSets = useMemo(() => parseTireData(clientData), [clientData]);

  // Section Visibility Logic
  // Show main info if any key field is visible.
  const isMainInfoVisible = isFieldVisible('Бренд_Модель') || isFieldVisible('Кол-во шин') || isFieldVisible('Наличие дисков') || isFieldVisible('Размер шин') || isFieldVisible('DOT CODE');
  
  const isTimingVisible = (isFieldVisible('Начало') && isFieldVisible('Окончание')) || isFieldVisible('Напомнить') || isFieldVisible('Срок');
  
  // Finance Section Visibility
  const isFinanceVisible = isFieldVisible('Общая сумма') || isFieldVisible('Долг') || isFieldVisible('Цена за месяц');
  
  // Merged "Storage & Info" Section Visibility
  const isStorageOrDetailsVisible = 
    isFieldVisible('Склад хранения') || 
    isFieldVisible('Ячейка') || 
    isFieldVisible('Договор') || 
    isFieldVisible('Статус сделки') || 
    isFieldVisible('Источник трафика');


  const InfoItem: React.FC<{ label: string; fieldKey?: string; value?: string | null; isEmphasized?: boolean; isCompact?: boolean }> = ({ label, fieldKey, value, isEmphasized = false, isCompact = false }) => {
    if (!value) return null;
    
    // Check visibility using fieldKey if provided, otherwise use label
    const keyToCheck = fieldKey || label;
    if (!isFieldVisible(keyToCheck)) return null;

    const containerClass = isEmphasized 
        ? "bg-tg-bg/50 dark:bg-tg-bg/10 p-2.5 rounded-lg border border-tg-hint/10" 
        : "";
    
    const labelClass = isCompact ? "text-xs text-tg-hint leading-tight" : "text-sm text-tg-hint";
    const valueClass = isCompact 
        ? `text-sm font-medium leading-tight break-words ${isEmphasized ? 'text-tg-link' : 'text-tg-text'}`
        : `text-md font-medium ${isEmphasized ? 'text-lg text-tg-link' : 'text-tg-text'}`;

    return (
      <div className={containerClass}>
        <p className={labelClass}>{label}</p>
        <p className={valueClass}>{value}</p>
      </div>
    );
  };
  
  const StatusItem: React.FC<{ label: string; fieldKey?: string; value?: string | null; isCompact?: boolean }> = ({ label, fieldKey, value, isCompact }) => {
    const keyToCheck = fieldKey || label;
    if (!value || !isFieldVisible(keyToCheck)) return null;

    return (
      <div className="min-w-0">
        <p className={isCompact ? "text-xs text-tg-hint mb-0.5" : "text-sm text-tg-hint"}>{label}</p>
        <div className={isCompact ? "" : "mt-1"}>
          <StatusBadge status={value} isCompact={isCompact} />
        </div>
      </div>
    );
  };

  const FinancialItem: React.FC<{ label: string; fieldKey?: string; value?: string | null; isDebt?: boolean; isCompact?: boolean }> = ({ label, fieldKey, value, isDebt = false, isCompact = false }) => {
      const keyToCheck = fieldKey || label;
      if (!value || !isFieldVisible(keyToCheck)) return null;
      
      const isValuePositive = parseFloat(value.replace(/\s/g, '')) > 0;
      const valueBaseClass = isCompact ? "text-sm font-medium leading-tight" : "text-md font-medium";
      const valueClass = isDebt && isValuePositive ? `${valueBaseClass} text-red-500 font-bold` : `${valueBaseClass} text-tg-text`;
      const labelClass = isCompact ? "text-xs text-tg-hint leading-tight" : "text-sm text-tg-hint";

      return (
          <div>
              <p className={labelClass}>{label}</p>
              <p className={valueClass}>{value}</p>
          </div>
      )
  }

  const ProgressBar: React.FC<{ start?: string; end?: string }> = ({ start, end }) => {
    if (!start || !end || !isFieldVisible('Начало') || !isFieldVisible('Окончание')) return null;

    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const today = new Date();
    
    if (!startDate || !endDate || endDate < startDate) return null;

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    let progress = (elapsedDuration / totalDuration) * 100;
    progress = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100

    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs text-tg-hint mb-1">
          <span>{start}</span>
          <span>{end}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div className="bg-tg-link h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-tg-secondary-bg rounded-lg shadow-lg p-4 sm:p-6">
      <div className="space-y-3">

        {isMainInfoVisible && (
            <Section title="Основная информация" icon={<CarIcon />} isCompact={true}>
                <div className="pt-1">
                   {tireSets.map((set, index) => (
                       <TireCard key={index} data={set} />
                   ))}
                </div>
            </Section>
        )}
        
        {isTimingVisible && (
            <Section title="Сроки хранения" icon={<CalendarIcon />} isCompact={true}>
                <ProgressBar start={clientData['Начало']} end={clientData['Окончание']} />
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <InfoItem label="Срок" value={clientData['Срок']} isCompact={true} />
                    <InfoItem label="Напомнить" value={clientData['Напомнить']} isCompact={true} />
                </div>
            </Section>
        )}

        {/* Two Column Layout for Finance and Merged Details */}
        {(isFinanceVisible || isStorageOrDetailsVisible) && (
            <div className={`grid gap-3 ${isFinanceVisible && isStorageOrDetailsVisible ? 'grid-cols-2' : 'grid-cols-1'}`}>
                
                {isFinanceVisible && (
                    <Section title="Финансы" icon={<WalletIcon />} isCompact={true}>
                        <div className="flex flex-col gap-2">
                            <FinancialItem label="Общая сумма" value={clientData['Общая сумма']} isCompact={true} />
                            <FinancialItem label="В месяц" fieldKey="Цена за месяц" value={clientData['Цена за месяц']} isCompact={true} />
                            <FinancialItem label="Долг" value={clientData['Долг']} isDebt isCompact={true} />
                        </div>
                    </Section>
                )}

                {isStorageOrDetailsVisible && (
                    <Section title="ХРАНЕНИЕ" icon={<LocationIcon />} isCompact={true}>
                         <div className="flex flex-col gap-2">
                             <StatusItem label="Статус" fieldKey="Статус сделки" value={clientData['Статус сделки']} isCompact={true} />
                            
                            {/* Storage Info - Side by Side in a Grid */}
                            {( (clientData['Склад хранения'] && isFieldVisible('Склад хранения')) || (clientData['Ячейка'] && isFieldVisible('Ячейка')) ) && (
                                <div className="grid grid-cols-2 gap-2">
                                    <InfoItem label="Склад" fieldKey="Склад хранения" value={clientData['Склад хранения']} isCompact={true} />
                                    <InfoItem label="Ячейка" value={clientData['Ячейка']} isCompact={true} />
                                </div>
                            )}
                            
                            {/* Deal Info */}
                            <InfoItem label="Договор" value={clientData['Договор']} isCompact={true} />
                            <InfoItem label="Трафик" fieldKey="Источник трафика" value={clientData['Источник трафика']} isCompact={true} />
                        </div>
                    </Section>
                )}
            </div>
        )}
        
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
