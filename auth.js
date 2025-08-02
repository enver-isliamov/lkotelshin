// Конфигурация
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec',
    ADMIN_CHAT_ID: '96609347',
    DASHBOARD_BASE_URL: 'https://id-preview--86de7c90-bfa2-4ea9-b1d2-216984f4b59d.lovable.app/dashboard'
};

// Глобальные переменные
let currentUser = null;
let telegramWebApp = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeTelegramWebApp();
    setupEventListeners();
});

// Инициализация Telegram Web App
function initializeTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        telegramWebApp = window.Telegram.WebApp;
        telegramWebApp.ready();
        telegramWebApp.expand();
        
        // Получаем данные пользователя из Telegram
        const initData = telegramWebApp.initDataUnsafe;
        if (initData && initData.user) {
            currentUser = {
                chatId: initData.user.id.toString(),
                firstName: initData.user.first_name,
                lastName: initData.user.last_name || '',
                username: initData.user.username || ''
            };
            
            console.log('Telegram user data:', currentUser);
            
            // Автоматически начинаем процесс авторизации
            handleTelegramLogin();
        } else {
            showError('Не удалось получить данные из Telegram. Убедитесь, что вы открыли страницу через Telegram бота.');
        }
    } else {
        // Fallback для тестирования вне Telegram
        console.log('Telegram Web App не доступен. Режим тестирования.');
        setupTestMode();
    }
}

// Настройка режима тестирования (для разработки)
function setupTestMode() {
    const testChatId = prompt('Введите Chat ID для тестирования:');
    if (testChatId) {
        currentUser = {
            chatId: testChatId,
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser'
        };
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.getElementById('telegram-login').addEventListener('click', handleTelegramLogin);
    document.getElementById('save-phone').addEventListener('click', handlePhoneSave);
    
    // Форматирование номера телефона
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// Обработка входа через Telegram
async function handleTelegramLogin() {
    if (!currentUser || !currentUser.chatId) {
        showError('Данные пользователя не найдены');
        return;
    }

    showLoading(true);
    hideMessages();

    try {
        // Проверяем, является ли пользователь админом
        if (currentUser.chatId === CONFIG.ADMIN_CHAT_ID) {
            // Админ переходит на страницу управления
            redirectToAdminPanel();
            return;
        }

        // Проверяем данные пользователя в Google Sheets
        const userData = await checkUserData(currentUser.chatId);
        
        if (userData.found) {
            if (userData.phone) {
                // У пользователя есть телефон, авторизуем
                redirectToDashboard(currentUser.chatId);
            } else {
                // Нужно запросить телефон
                showPhoneForm();
            }
        } else {
            showError('Пользователь не найден в системе. Обратитесь к администратору.');
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        showError('Произошла ошибка при авторизации. Попробуйте позже.');
    } finally {
        showLoading(false);
    }
}

// Проверка данных пользователя в Google Sheets
async function checkUserData(chatId) {
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=checkUser&chatId=${chatId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
        throw error;
    }
}

// Сохранение номера телефона
async function handlePhoneSave() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    
    if (!validatePhone(phone)) {
        showError('Введите корректный номер телефона в формате +7xxxxxxxxxx');
        return;
    }

    showLoading(true);
    hideMessages();

    try {
        const success = await saveUserPhone(currentUser.chatId, phone);
        
        if (success) {
            showSuccess('Номер телефона сохранен успешно!');
            setTimeout(() => {
                redirectToDashboard(currentUser.chatId);
            }, 1500);
        } else {
            showError('Не удалось сохранить номер телефона. Попробуйте еще раз.');
        }
    } catch (error) {
        console.error('Ошибка сохранения телефона:', error);
        showError('Произошла ошибка при сохранении. Попробуйте позже.');
    } finally {
        showLoading(false);
    }
}

// Сохранение телефона в Google Sheets
async function saveUserPhone(chatId, phone) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updatePhone',
                chatId: chatId,
                phone: phone
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Ошибка сохранения телефона:', error);
        throw error;
    }
}

// Валидация номера телефона
function validatePhone(phone) {
    const phoneRegex = /^\+7\d{10}$/;
    return phoneRegex.test(phone);
}

// Форматирование номера телефона при вводе
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length > 0 && !value.startsWith('7')) {
        if (value.startsWith('8')) {
            value = '7' + value.slice(1);
        } else if (value.startsWith('9')) {
            value = '7' + value;
        }
    }
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    event.target.value = value.length > 0 ? '+' + value : '';
}

// Переход в админ панель
function redirectToAdminPanel() {
    showSuccess('Добро пожаловать, администратор!');
    setTimeout(() => {
        window.location.href = CONFIG.GOOGLE_SCRIPT_URL;
    }, 1500);
}

// Переход в личный кабинет пользователя
function redirectToDashboard(chatId) {
    const timestamp = Date.now();
    const authToken = `telegram_${chatId}_${timestamp}`;
    const dashboardUrl = `${CONFIG.DASHBOARD_BASE_URL}?auth=${authToken}`;
    
    showSuccess('Вход выполнен успешно! Переходим в личный кабинет...');
    
    setTimeout(() => {
        if (telegramWebApp) {
            telegramWebApp.openLink(dashboardUrl);
        } else {
            window.location.href = dashboardUrl;
        }
    }, 1500);
}

// Показать форму ввода телефона
function showPhoneForm() {
    document.getElementById('telegram-auth').classList.remove('active');
    document.getElementById('phone-form').classList.add('active');
    
    showSuccess('Для завершения авторизации введите ваш номер телефона');
}

// Управление состоянием загрузки
function showLoading(show) {
    const loading = document.getElementById('loading');
    const buttons = document.querySelectorAll('.btn');
    
    if (show) {
        loading.classList.add('active');
        buttons.forEach(btn => btn.disabled = true);
    } else {
        loading.classList.remove('active');
        buttons.forEach(btn => btn.disabled = false);
    }
}

// Показать ошибку
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('active');
    
    // Автоматически скрыть через 5 секунд
    setTimeout(() => {
        errorDiv.classList.remove('active');
    }, 5000);
}

// Показать успешное сообщение
function showSuccess(message) {
    const successDiv = document.getElementById('success');
    successDiv.textContent = message;
    successDiv.classList.add('active');
    
    // Автоматически скрыть через 3 секунды
    setTimeout(() => {
        successDiv.classList.remove('active');
    }, 3000);
}

// Скрыть все сообщения
function hideMessages() {
    document.getElementById('error').classList.remove('active');
    document.getElementById('success').classList.remove('active');
}
