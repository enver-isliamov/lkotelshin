const ADMIN_ID = '96609347';
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec';
let sheetUrl = DEFAULT_API_URL;

async function initApp() {
  const tg = window.Telegram.WebApp;
  tg.ready();
  const user = tg.initDataUnsafe?.user;
  const chatId = user?.id?.toString();
  const app = document.getElementById('app');

  if (!chatId) {
    app.innerHTML = '<p>Ошибка: не удалось получить ChatID</p>';
    return;
  }

  if (chatId === ADMIN_ID) {
    app.innerHTML = `
      <h2>Админ панель</h2>
      <input type="text" id="sheetLink" placeholder="Вставьте новую ссылку на API Google Sheets" value="${sheetUrl}" />
      <button onclick="saveSheetURL()">Сохранить ссылку</button>
    `;
    return;
  }

  try {
    const res = await fetch(`${sheetUrl}?chat_id=${chatId}`);
    const data = await res.json();

    if (!data || Object.keys(data).length === 0) {
      requestPhoneAssociation(app, sheetUrl, chatId);
    } else {
      showUserData(app, data);
    }
  } catch (e) {
    app.innerHTML = '<p>Ошибка при загрузке данных</p>';
  }
}

function saveSheetURL() {
  const url = document.getElementById('sheetLink').value;
  if (url.includes('script.google.com')) {
    sheetUrl = url;
    alert('Ссылка обновлена! Перезагрузите страницу.');
  } else {
    alert('Неверная ссылка');
  }
}

function requestPhoneAssociation(container, sheetUrl, chatId) {
  container.innerHTML = `
    <h2>Введите номер телефона</h2>
    <input type="tel" id="phoneInput" placeholder="+7XXXXXXXXXX" />
    <button onclick="verifyPhone('${chatId}', '${sheetUrl}')">Отправить</button>
  `;
}

async function verifyPhone(chatId, sheetUrl) {
  const phone = document.getElementById('phoneInput').value;
  const app = document.getElementById('app');
  try {
    const res = await fetch(`${sheetUrl}?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (data && data.chat_id && data.chat_id === chatId) {
      showUserData(app, data);
    } else {
      alert('Номер не найден или не соответствует вашему аккаунту.');
    }
  } catch (e) {
    alert('Ошибка при проверке номера');
  }
}

function showUserData(container, data) {
  container.innerHTML = '<h2>Ваш заказ:</h2>';
  const card = document.createElement('div');
  card.className = 'card';
  for (const [key, value] of Object.entries(data)) {
    const p = document.createElement('p');
    p.innerHTML = `<strong>${key}:</strong> ${value}`;
    card.appendChild(p);
  }
  container.appendChild(card);
}

window.onload = initApp;
