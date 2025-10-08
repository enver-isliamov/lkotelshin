
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
    // Simple validation for Russian phone numbers
    if (!/^\+?[78][-\s(]?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(phone)) {
      setError('Пожалуйста, введите корректный номер телефона (например, +79991234567).');
      return;
    }
    setError('');
    setStatus('submitting');
    try {
      await onSubmit(phone);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка.');
    }
  };
  
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center h-screen p-4 text-center">
        <div className="bg-tg-secondary-bg p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold text-green-500 mb-2">Заявка принята!</h2>
          <p className="text-tg-hint">Спасибо! Ваш запрос зарегистрирован. Менеджер свяжется с вами в ближайшее время.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="w-full max-w-sm bg-tg-secondary-bg p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-bold mb-2">Регистрация</h2>
        <p className="text-tg-hint mb-6">Мы не нашли вас в базе клиентов. Пожалуйста, оставьте ваш номер телефона для связи.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="sr-only">Номер телефона</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-tg-link"
              disabled={status === 'submitting'}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-tg-button text-tg-button-text font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewUserForm;
