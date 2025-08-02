// Конфигурационный файл для системы личного кабинета
// Этот файл можно использовать для настройки различных параметров

const CABINET_CONFIG = {
    // API настройки
    api: {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec',
        timeout: 10000, // 10 секунд
        retryAttempts: 3
    },

    // Пользователи
    users: {
        adminChatId: '96609347'
    },

    // URL настройки
    urls: {
        dashboardBase: 'https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/dashboard',
        mainSite: 'https://otelshin.vercel.app'
    },

    // Валидация
    validation: {
        phoneRegex: /^\+7\d{10}$/,
        phoneFormat: '+7xxxxxxxxxx'
    },

    // UI настройки
    ui: {
        loadingTimeout: 30000, // 30 секунд максимум для загрузки
        messageAutoHide: {
            error: 5000,   // 5 секунд
            success: 3000  // 3 секунды
        },
        redirectDelay: 1500 // 1.5 секунды
    },

    // Сообщения
    messages: {
        errors: {
            noTelegramData: 'Не удалось получить данные из Telegram. Убедитесь, что вы открыли страницу через Telegram бота.',
            userNotFound: 'Пользователь не найден в системе. Обратитесь к администратору.',
            authError: 'Произошла ошибка при авторизации. Попробуйте позже.',
            phoneInvalid: 'Введите корректный номер телефона в формате +7xxxxxxxxxx',
            phoneSaveError: 'Не удалось сохранить номер телефона. Попробуйте еще раз.',
            networkError: 'Произошла ошибка при сохранении. Попробуйте позже.'
        },
        success: {
            adminWelcome: 'Добро пожаловать, администратор!',
            loginSuccess: 'Вход выполнен успешно! Переходим в личный кабинет...',
            phoneSaved: 'Номер телефона сохранен успешно!',
            phoneRequired: 'Для завершения авторизации введите ваш номер телефона'
        },
        loading: {
            checking: 'Проверяем данные...',
            saving: 'Сохраняем данные...',
            redirecting: 'Переходим в кабинет...'
        }
    },

    // Режим разработки
    development: {
        enabled: false, // Установить в true для режима разработки
        testChatId: '123456789',
        debugMode: false
    }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CABINET_CONFIG;
}

// Глобальная переменная для браузера
if (typeof window !== 'undefined') {
    window.CABINET_CONFIG = CABINET_CONFIG;
}
