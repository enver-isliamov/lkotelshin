const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const BOT_TOKEN = '6473374979:AAH8OHCxWN2kO0ep9wrbLXolk2ys4__GLqg';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const ADMIN_ID = '96609347';
const SERVER_URL = 'https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Добро пожаловать! Нажмите кнопку 📋 Меню`, {
    reply_markup: {
      keyboard: [[{ text: '📋 Меню', request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const phone_number = msg.contact.phone_number;

  try {
    const res = await axios.post(SERVER_URL, {
      chat_id: String(chatId),
      phone_number: phone_number
    });

    if (res.data.status === 'success') {
      bot.sendMessage(chatId, `Вот ссылка на ваш ЛК: ${res.data.authUrl}`);
    } else {
      bot.sendMessage(chatId, res.data.message || 'Ошибка доступа');
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Произошла ошибка при авторизации');
  }
});

bot.on('message', async (msg) => {
  if (msg.text === '📋 Меню') {
    const chatId = msg.chat.id;
    try {
      const res = await axios.post(SERVER_URL, { chat_id: String(chatId) });
      if (res.data.status === 'success') {
        bot.sendMessage(chatId, `🔐 Ваша ссылка на ЛК: ${res.data.authUrl}`);
      } else {
        bot.sendMessage(chatId, res.data.message);
      }
    } catch (e) {
      bot.sendMessage(chatId, 'Ошибка подключения к серверу.');
    }
  }
});
