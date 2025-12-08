
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
    
    // Очистка номера от лишних символов для проверки
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Простая валидация: должно быть от 10 до 15 цифр
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError('Проверьте формат номера');
      return;
    }
    
    setError('');
    setStatus('submitting');
    try {
      await onSubmit(phone);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте позже.');
    }
  };
  
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fade-in bg-tg-bg">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-500">
          <CheckCircleIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-tg-text">Заявка принята!</h2>
        <p className="text-tg-hint max-w-xs leading-relaxed">
          Мы уже обрабатываем ваш запрос. Менеджер свяжется с вами в ближайшее время для подтверждения доступа.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-tg-bg overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none"></div>
      
      {/* Hero / Benefits Section */}
      <div className="flex-1 flex flex-col items-center pt-8 px-6 pb-4 z-10 overflow-y-auto">
        
        {/* Logo / Brand Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-tg-button to-blue-400 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center mb-6 transform rotate-3">
            <TireIcon className="w-9 h-9 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-tg-text text-center mb-2">
          Отель Шин
        </h1>
        <p className="text-tg-hint text-center text-sm mb-8 max-w-[280px]">
          Профессиональное хранение и забота о колесах вашего автомобиля
        </p>

        {/* Benefits Grid */}
        <div className="w-full max-w-sm space-y-4">
          <BenefitItem 
            icon={<HomeIcon />} 
            title="Свободный балкон" 
            text="Освободите место дома — шины хранятся на теплом складе." 
          />
          <BenefitItem 
            icon={<ShieldCheckIcon />} 
            title="Полная сохранность" 
            text="Защита от деформации, влаги и солнечных лучей по ГОСТу." 
          />
           <BenefitItem 
            icon={<ClockIcon />} 
            title="Быстрый сервис" 
            text="Замена шин в один клик без очередей и погрузки тяжестей." 
          />
        </div>
      </div>

      {/* Login Form Sheet */}
      <div className="relative z-20 bg-tg-secondary-bg rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] p-6 pb-8 transition-transform duration-300">
         <div className="w-12 h-1 bg-tg-hint/20 rounded-full mx-auto mb-6"></div>
         
         <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-tg-text">Личный кабинет</h2>
            <p className="text-xs text-tg-hint mt-1">Введите телефон, чтобы проверить статус шин</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-tg-hint font-bold text-lg">📱</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  required
                  className={`w-full pl-12 pr-4 py-3.5 bg-tg-bg border-2 rounded-xl text-lg font-medium text-tg-text placeholder-tg-hint/50 focus:outline-none transition-all
                    ${error 
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : 'border-transparent focus:border-tg-link focus:ring-4 focus:ring-tg-link/10'
                    }`}
                  disabled={status === 'submitting'}
                />
            </div>
            
            {error && (
               <div className="flex items-center justify-center gap-2 text-red-500 text-sm animate-shake">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  <span>{error}</span>
               </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'submitting' || phone.length < 5}
              className="w-full bg-tg-button text-tg-button-text font-bold text-lg py-3.5 px-4 rounded-xl shadow-lg shadow-tg-button/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   <span>Проверяем...</span>
                </>
              ) : (
                'Войти'
              )}
            </button>
         </form>
         
         <p className="text-[10px] text-center text-tg-hint/60 mt-4">
            Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
         </p>
      </div>
    </div>
  );
};

// --- Sub-components & Icons ---

const BenefitItem: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-black/10 transition-colors">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tg-button/10 text-tg-button flex items-center justify-center">
      {icon}
    </div>
    <div className="pt-0.5">
      <h3 className="font-bold text-tg-text text-sm mb-0.5">{title}</h3>
      <p className="text-xs text-tg-hint leading-snug">{text}</p>
    </div>
  </div>
);

const TireIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default NewUserForm;
