# Telegram Mini App - Личный кабинет клиента

## Описание проекта

Telegram Mini App для управления личным кабинетом клиентов сервиса хранения шин. Приложение интегрировано с Google Таблицами для получения данных в реальном времени.

## Архитектура

### Frontend
- **React** с TypeScript
- **Telegram Mini App SDK** (@twa-dev/sdk) для интеграции с Telegram
- **Tailwind CSS** + **Shadcn UI** для современного дизайна
- **TanStack Query** для управления состоянием и кэшированием
- **Wouter** для роутинга

### Backend
- **Express.js** с TypeScript
- **Google Sheets API** через Replit интеграцию
- **Telegram WebApp Data Validation** - криптографическая проверка HMAC-SHA256
- **In-memory storage** для настроек администратора
- **Simple cache** (5 минут TTL) для оптимизации запросов к Google Sheets

## Безопасность

### Telegram Authentication
Приложение использует официальный метод валидации Telegram Web App init data:

1. **HMAC-SHA256 Signature Verification**
   - Создание secret key из bot token
   - Вычисление hash от отсортированных параметров
   - Сравнение с hash от Telegram

2. **Time-based Validation**
   - Проверка auth_date (данные должны быть не старше 24 часов)
   - Защита от replay атак

3. **Server-side Authorization**
   - Все проверки выполняются на сервере
   - Frontend не может подделать данные авторизации
   - Admin права проверяются отдельно по ADMIN_CHAT_ID

### Реализация
- `server/telegram-auth.ts` - модуль валидации
- `getTelegramUserIdFromRequest()` - извлечение и проверка user ID
- `isAdmin()` - проверка прав администратора

## Структура данных

### Google Sheets
Приложение работает с двумя листами:
- **WebBase** - активные заказы клиентов
- **Archive** - завершенные заказы

Столбцы (A-U):
1. Chat ID
2. Имя клиента
3. Телефон
4. Номер Авто
5. Заказ - QR
6. Цена за месяц
7. Кол-во шин
8. Наличие дисков
9. Начало
10. Срок
11. Напомнить
12. Окончание
13. Склад хранения
14. Ячейка
15. Общая сумма
16. Долг
17. Договор
18. Адрес клиента
19. Статус сделки
20. Источник трафика
21. DOT CODE

## Функциональность

### Для клиентов
1. **Dashboard (Главная)** - просмотр текущего активного заказа
2. **История** - просмотр архива завершенных заказов
3. Адаптивный дизайн для мобильных устройств
4. Автоматическая идентификация по Telegram Chat ID

### Для администратора
1. **Настройки видимости полей** - управление тем, какие поля показывать клиентам
2. Группировка полей по категориям
3. Сохранение настроек в реальном времени
4. Доступ только с проверенного admin Chat ID

## API Endpoints

### GET /api/client
Получить данные текущего активного заказа клиента.
- **Auth:** Требуется валидный Telegram init data с проверкой HMAC
- **Returns:** Client data из листа "WebBase"
- **Cache:** 5 минут
- **Errors:**
  - 401 - Invalid or missing Telegram authentication
  - 404 - Client not found

### GET /api/archive
Получить историю заказов клиента.
- **Auth:** Требуется валидный Telegram init data с проверкой HMAC
- **Returns:** Array of ArchiveOrder из листа "Archive"
- **Cache:** 5 минут
- **Errors:**
  - 401 - Invalid or missing Telegram authentication

### GET /api/field-visibility
Получить текущие настройки видимости полей.
- **Auth:** Не требуется (публичный endpoint)
- **Returns:** FieldVisibility object
- **Cache:** In-memory, без TTL

### POST /api/field-visibility
Обновить настройки видимости полей.
- **Auth:** Требуется валидный Telegram init data + admin права
- **Body:** FieldVisibility object
- **Returns:** Updated FieldVisibility
- **Side effects:** Очищает весь cache
- **Errors:**
  - 401 - Invalid or missing Telegram authentication
  - 403 - Admin access required
  - 400 - Invalid field visibility data

## Переменные окружения

### Обязательные
- `GOOGLE_SHEET_ID` - ID Google Таблицы
- `TELEGRAM_BOT_TOKEN` - Токен Telegram бота (для HMAC валидации)
- `ADMIN_CHAT_ID` - Telegram Chat ID администратора
- `SESSION_SECRET` - секрет для сессий

### Для frontend (настраивается автоматически)
- `VITE_ADMIN_CHAT_ID` - копия ADMIN_CHAT_ID для отображения admin UI

### Для Replit Connectors
- `REPLIT_CONNECTORS_HOSTNAME` - автоматически
- `REPL_IDENTITY` или `WEB_REPL_RENEWAL` - автоматически

## Deployment

### Development (Replit)
1. Настроить Google Sheets интеграцию через Replit Connectors
2. Добавить secrets: GOOGLE_SHEET_ID, TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID
3. `npm run dev` - запуск в режиме разработки

### Production (Vercel)
1. Подключить репозиторий к Vercel
2. Настроить environment variables
3. Настроить Google Sheets OAuth для production
4. Deploy автоматически

См. README.md для детальных инструкций по деплою.

## Кэширование

### Client & Archive Data
- **TTL:** 5 минут
- **Key format:** `client:${telegramUserId}` или `archive:${telegramUserId}`
- **Invalidation:** Автоматическая по истечении TTL

### Field Visibility
- **TTL:** Без ограничения
- **Storage:** In-memory
- **Invalidation:** При обновлении настроек через POST /api/field-visibility

### Cache Strategy
- Весь кэш очищается при обновлении настроек видимости
- Это гарантирует, что клиенты увидят изменения при следующем запросе
- Google Sheets запросы минимизированы благодаря кэшированию

## Дизайн

Следует Telegram Mini App Guidelines:
- **Primary Color:** Telegram Blue (47 84% 57%)
- **Theme Support:** Автоматическое определение из Telegram (light/dark)
- **Typography:** System fonts для нативного ощущения
- **Layout:** Mobile-first, адаптивный дизайн
- **Components:** Shadcn UI с кастомизацией под Telegram

### Цветовая палитра
См. `design_guidelines.md` для полной информации о цветах, отступах и компонентах.

## Последние изменения

### 2025-10-08
- ✅ Создан MVP с полной интеграцией Google Sheets
- ✅ Реализована криптографическая валидация Telegram init data (HMAC-SHA256)
- ✅ Добавлена серверная проверка admin прав
- ✅ Настроено безопасное кэширование для оптимизации
- ✅ Реализованы все основные функции для клиентов и администратора
- ✅ Создан адаптивный дизайн в стиле Telegram

## Известные ограничения

1. **Google Sheets Performance**
   - API имеет лимиты запросов
   - Большие таблицы (>1000 строк) могут загружаться медленно
   - Решение: кэширование на 5 минут

2. **In-memory Storage**
   - Настройки администратора сбрасываются при перезапуске сервера
   - Для production рекомендуется использовать базу данных

3. **Development Environment**
   - В среде разработки без реального Telegram контекста API возвращает 401
   - Для полноценного тестирования используйте ngrok + реальный Telegram бот

## Troubleshooting

### 401 Unauthorized
- Проверьте TELEGRAM_BOT_TOKEN
- Убедитесь, что приложение открыто через Telegram
- Проверьте, что init data передаются корректно

### 403 Forbidden (admin endpoints)
- Проверьте ADMIN_CHAT_ID совпадает с вашим Telegram ID
- Убедитесь, что нет пробелов или лишних символов

### 404 Client not found
- Убедитесь, что в Google Sheets есть строка с вашим Chat ID в первом столбце
- Проверьте GOOGLE_SHEET_ID
- Проверьте права доступа к таблице

### Google Sheets не загружаются
- Проверьте Google Sheets интеграцию в Replit
- Убедитесь, что токен доступа не истёк
- Проверьте, что листы называются именно "WebBase" и "Archive"
