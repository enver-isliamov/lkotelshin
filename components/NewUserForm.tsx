
import React, { useState } from 'react';

interface NewUserFormProps {
  chatId: string;
  onSubmit: (phone: string) => Promise<void>;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ chatId, onSubmit }) => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError('Пожалуйста, введите корректный номер');
      return;
    }
    setError('');
    setStatus('submitting');
    try {
      await onSubmit(phone);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Ошибка связи. Попробуйте позже.');
    }
  };
  
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in bg-tg-bg">
        <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-500/30">
          <CheckIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-tg-text">Заявка принята!</h2>
        <p className="text-tg-hint text-lg leading-relaxed max-w-xs">
          Ваш персональный менеджер уже получил уведомление. Мы свяжемся с вами в ближайшее время для открытия доступа.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-tg-bg overflow-hidden font-sans">
      
      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
        
        {/* Hero Section */}
        <div className="relative pt-12 pb-8 px-6 text-center">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent rounded-b-[50px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-blue-900/10 flex items-center justify-center mb-6 transform -rotate-6 border border-gray-100 dark:border-gray-700">
                    <LogoIcon className="w-12 h-12 text-tg-link" />
                </div>
                <h1 className="text-3xl font-extrabold text-tg-text mb-3 leading-tight">
                    Отель Шин
                </h1>
                <p className="text-tg-hint text-lg leading-snug max-w-[260px]">
                   Освободите балкон для жизни, а мы позаботимся о колесах.
                </p>
            </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="px-5 space-y-4">
            <FeatureCard 
                icon={<SunIcon />}
                title="Правильный климат"
                text="Храним шины в сухом, проветриваемом складе без доступа ультрафиолета. Резина не стареет и не трескается."
            />
            <FeatureCard 
                icon={<MuscleIcon />}
                title="Никаких тяжестей"
                text="Забудьте о погрузке грязных колес в салон. Приезжайте налегке — шины уже будут ждать вас на посту."
            />
            <FeatureCard 
                icon={<ShieldIcon />}
                title="Страховка и охрана"
                text="Заключаем официальный договор. Ваши колеса застрахованы и находятся под круглосуточным видеонаблюдением."
            />
        </div>

        {/* What's inside the app */}
        <div className="mt-10 px-6 mb-6">
            <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-tg-text">Ваш Личный Кабинет</h3>
                 <p className="text-sm text-tg-hint mt-1">Всё под контролем в вашем телефоне</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <MiniBenefit icon={<CameraIcon />} label="Фотоотчеты" />
                <MiniBenefit icon={<RulerIcon />} label="Остаток протектора" />
                <MiniBenefit icon={<CalendarIcon />} label="Онлайн-запись" />
                <MiniBenefit icon={<FileIcon />} label="История заказов" />
            </div>
        </div>
      </div>

      {/* --- BOTTOM SHEET FORM (Fixed) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
          {/* Gradient Fade to connect content */}
          <div className="h-12 bg-gradient-to-b from-transparent to-tg-bg/50 pointer-events-none"></div>
          
          <div className="bg-tg-secondary-bg rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-8 border-t border-tg-hint/10">
             <div className="max-w-md mx-auto">
                <div className="text-center mb-5">
                    <p className="text-sm font-medium text-tg-text">Введите номер телефона для входа</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <span className="text-tg-hint group-focus-within:text-tg-link transition-colors">🇷🇺 +7</span>
                        </div>
                        <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                            // Форматирование на лету (простое)
                            const val = e.target.value.replace(/^(\+7|8)/, '').replace(/\D/g, '');
                            setPhone(val);
                        }}
                        placeholder="(999) 000-00-00"
                        className={`w-full pl-20 pr-4 py-4 bg-tg-bg border-2 rounded-2xl text-xl font-bold tracking-wide text-tg-text placeholder-tg-hint/30 focus:outline-none transition-all
                            ${error 
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                            : 'border-transparent focus:border-tg-link focus:ring-4 focus:ring-tg-link/10'
                            }`}
                        inputMode="numeric"
                        />
                    </div>

                    {error && (
                        <div className="text-center text-red-500 text-sm font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={status === 'submitting' || phone.length < 10}
                        className="w-full bg-tg-button text-tg-button-text font-bold text-lg py-4 rounded-2xl shadow-lg shadow-tg-button/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'submitting' ? 'Обработка...' : 'Получить доступ'}
                    </button>
                    
                    <p className="text-[10px] text-center text-tg-hint/50 leading-tight px-4">
                        Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности сервиса OtelShin.ru
                    </p>
                </form>
             </div>
          </div>
      </div>

    </div>
  );
};

// --- Sub-components ---

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
    <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-tg-hint/5 shadow-sm">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-tg-link flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-tg-text text-[15px] mb-1">{title}</h3>
            <p className="text-xs text-tg-hint leading-relaxed">{text}</p>
        </div>
    </div>
);

const MiniBenefit: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="flex flex-col items-center justify-center p-3 bg-tg-bg rounded-xl border border-tg-hint/5 shadow-sm">
        <div className="text-tg-link mb-2 opacity-80">{icon}</div>
        <span className="text-[11px] font-bold text-tg-text text-center leading-none">{label}</span>
    </div>
);


// --- Icons ---

const LogoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10a7 7 0 11-14 0" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MuscleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const RulerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default NewUserForm;
