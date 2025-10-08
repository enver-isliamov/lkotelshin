# Telegram Mini App - Личный кабинет клиента

Современное веб-приложение для управления личным кабинетом клиентов сервиса хранения шин, интегрированное с Google Таблицами и Telegram.

## 🌟 Возможности

### Для клиентов
- 📱 Просмотр активного заказа с полной информацией
- 📜 История всех завершенных заказов  
- 🎨 Красивый адаптивный интерфейс в стиле Telegram
- 🌓 Автоматическая поддержка светлой и тёмной темы
- 🔐 Безопасная авторизация через Telegram

### Для администратора
- ⚙️ Гибкая настройка видимости полей для клиентов
- 📊 Группировка настроек по категориям
- 💾 Мгновенное сохранение изменений
- 🔒 Защищённый доступ только для админа

## 🚀 Быстрый старт

### 1. Подготовка Google Таблицы

Создайте Google Таблицу с двумя листами:

**Лист "WebBase"** - активные заказы клиентов
**Лист "Archive"** - завершенные заказы

Структура столбцов (A-U):
```
A: Chat ID (Telegram ID клиента)
B: Имя клиента
C: Телефон
D: Номер авто
E: Заказ - QR
F: Цена за месяц
G: Кол-во шин
H: Наличие дисков
I: Начало
J: Срок
K: Напомнить
L: Окончание
M: Склад хранения
N: Ячейка
O: Общая сумма
P: Долг
Q: Договор
R: Адрес клиента
S: Статус сделки
T: Источник трафика
U: DOT CODE
```

### 2. Создание Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте нового бота: `/newbot`
3. Следуйте инструкциям и сохраните **Bot Token**
4. Узнайте свой Chat ID через [@userinfobot](https://t.me/userinfobot)

### 3. Настройка Mini App в BotFather

```
/mybots
→ Выберите вашего бота
→ Bot Settings
→ Menu Button
→ Configure Menu Button
→ Введите название кнопки (например: "Личный кабинет")
→ Введите URL приложения (после деплоя)
```

### 4. Деплой на Vercel

#### Подготовка
1. Форкните этот репозиторий в свой GitHub
2. Зарегистрируйтесь на [Vercel](https://vercel.com)
3. Подключите Vercel к вашему GitHub аккаунту

#### Environment Variables

В настройках проекта на Vercel добавьте:

```env
GOOGLE_SHEET_ID=ваш_google_sheet_id
TELEGRAM_BOT_TOKEN=ваш_bot_token
ADMIN_CHAT_ID=ваш_telegram_chat_id
SESSION_SECRET=случайная_строка_для_сессий
```

**Как получить Google Sheet ID:**
Из URL вашей таблицы:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz/edit
                                      ^^^^^^^^^^^
                                      это ваш ID
```

#### Подключение Google Sheets API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект
3. Включите Google Sheets API
4. Создайте Service Account
5. Скачайте JSON ключ
6. Предоставьте доступ к таблице для email из Service Account
7. Конфигурируйте OAuth на Vercel (используйте интеграцию Replit для разработки)

#### Деплой

1. В Vercel: **New Project**
2. Выберите ваш репозиторий
3. Framework Preset: **Other**
4. Build Command: `npm run build`
5. Output Directory: `dist/public`
6. Install Command: `npm install`
7. Добавьте environment variables
8. Нажмите **Deploy**

После деплоя скопируйте URL приложения и настройте его в BotFather.

## 🛠 Локальная разработка

### Требования
- Node.js 18+
- npm или yarn

### Установка

```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd telegram-mini-app

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env

# Заполните переменные окружения в .env
```

### Запуск

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:5000`

Для тестирования в Telegram используйте ngrok:
```bash
ngrok http 5000
```

Используйте HTTPS URL от ngrok в настройках BotFather.

## 📋 API Endpoints

### GET `/api/client`
Получить данные активного заказа текущего клиента
- **Auth:** Требуется валидный Telegram init data
- **Response:** Объект Client

### GET `/api/archive`
Получить историю заказов текущего клиента
- **Auth:** Требуется валидный Telegram init data
- **Response:** Массив ArchiveOrder[]

### GET `/api/field-visibility`
Получить текущие настройки видимости полей
- **Auth:** Не требуется
- **Response:** Объект FieldVisibility

### POST `/api/field-visibility`
Обновить настройки видимости полей (только админ)
- **Auth:** Требуется валидный Telegram init data + admin права
- **Body:** Объект FieldVisibility
- **Response:** Обновлённый объект FieldVisibility

## 🔒 Безопасность

- ✅ Криптографическая валидация Telegram init data (HMAC-SHA256)
- ✅ Проверка срока действия данных (24 часа)
- ✅ Серверная проверка прав администратора
- ✅ Защита от подделки запросов
- ✅ Безопасное хранение токенов в environment variables
- ✅ CORS настроен для работы с Telegram

## 🎨 Дизайн

Приложение следует [Telegram Mini App Guidelines](https://core.telegram.org/bots/webapps):
- Telegram Blue (#47A3E6) как основной цвет
- Автоматическая поддержка светлой/тёмной темы
- Адаптивный дизайн для мобильных устройств
- Нативные Telegram UI паттерны

## 📊 Кэширование

- Client data: 5 минут
- Archive data: 5 минут  
- Field visibility: без TTL (инвалидируется при обновлении)

Кэш автоматически очищается при изменении настроек администратором.

## 🐛 Отладка

### Проблема: "Unauthorized: Invalid or missing Telegram authentication"

**Решение:**
1. Убедитесь, что TELEGRAM_BOT_TOKEN корректный
2. Проверьте, что приложение открыто через Telegram (не в браузере)
3. Убедитесь, что бот активен и не забанен

### Проблема: "Client not found"

**Решение:**
1. Проверьте, что в Google Таблице есть строка с вашим Chat ID
2. Убедитесь, что GOOGLE_SHEET_ID правильный
3. Проверьте права доступа к Google Таблице

### Проблема: "Forbidden: Admin access required"

**Решение:**
1. Убедитесь, что ADMIN_CHAT_ID совпадает с вашим Chat ID
2. Проверьте правильность Chat ID (число без пробелов)

## 📱 Структура проекта

```
.
├── client/               # Frontend (React + Telegram SDK)
│   ├── src/
│   │   ├── components/  # UI компоненты
│   │   ├── pages/       # Страницы приложения
│   │   ├── lib/         # Утилиты (Telegram, queryClient)
│   │   └── App.tsx      # Главный компонент
│   └── index.html
├── server/              # Backend (Express)
│   ├── routes.ts        # API endpoints
│   ├── google-sheets.ts # Google Sheets интеграция
│   ├── telegram-auth.ts # Telegram authentication
│   ├── storage.ts       # Хранение настроек
│   └── cache.ts         # Кэширование
├── shared/              # Общие типы и схемы
│   └── schema.ts
└── vercel.json          # Конфигурация Vercel
```

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте раздел "Отладка" выше
2. Убедитесь, что все environment variables настроены
3. Проверьте логи в Vercel Dashboard

## 📄 Лицензия

MIT

---

Создано с ❤️ для упрощения работы с клиентами
