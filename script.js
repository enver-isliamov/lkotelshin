const ADMIN_ID = '96609347';
const API_URL = 'https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec; // замените на свой ID
let sheetUrl = DEFAULT_API_URL;


function onTelegramAuth(user) {
  const chatId = user.id.toString();
  const app = document.getElementById('app');
  app.innerHTML = 'Загрузка...';

  if (chatId === ADMIN_ID) {
    app.innerHTML = '<h2>Добро пожаловать, админ!</h2>';
    return;
  }

  fetch(`${API_URL}?chat_id=${chatId}`)
    .then(res => res.json())
    .then(data => {
      if (!data || Object.keys(data).length === 0) {
        app.innerHTML = 'Вы ещё не зарегистрированы. Пожалуйста, свяжитесь с администратором.';
      } else {
        showUserData(app, data);
      }
    })
    .catch(() => {
      app.innerHTML = 'Ошибка при загрузке данных.';
    });
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

// запуск после загрузки
onTelegramAuth(window.Telegram.WebApp.initDataUnsafe.user);
