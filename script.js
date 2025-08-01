const ADMIN_ID = '96609347';
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec';
let sheetUrl = DEFAULT_API_URL;

const user = Telegram.WebApp.initDataUnsafe.user;
const chatId = user.id.toString();
const app = document.getElementById('app');

if (chatId === ADMIN_ID) {
  app.innerHTML = `
    <h2>Админ панель</h2>
    <input type="text" id="sheetLink" placeholder="Новая ссылка" value="${sheetUrl}" />
    <button onclick="saveSheetURL()">Сохранить</button>
  `;
} else {
  fetch(`${sheetUrl}?chat_id=${chatId}`)
    .then(res => res.json())
    .then(data => {
      if (!data || Object.keys(data).length === 0) {
        app.innerHTML = '<p>Данные по вашему номеру не найдены. Обратитесь в поддержку.</p>';
      } else {
        showUserData(app, data);
      }
    })
    .catch(() => {
      app.innerHTML = '<p>Ошибка при загрузке данных</p>';
    });
}

function saveSheetURL() {
  const url = document.getElementById('sheetLink').value;
  if (url.includes('script.google.com')) {
    sheetUrl = url;
    alert('Ссылка обновлена. Перезагрузите страницу.');
  } else {
    alert('Неверная ссылка');
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
