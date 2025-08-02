// Чтение параметров из URL
const urlParams = new URLSearchParams(window.location.search);
const auth = urlParams.get('auth');

document.getElementById('status').textContent = 'Авторизация...';

if (auth) {
  fetch("https://script.google.com/macros/s/AKfycbx9JVpaW5WyaawgUWFrVquTh4SG6yOWw5g9_f3YLlXf3Oq_dZvnjKblTqZsQBlkSe9rAg/exec", {
    method: "POST",
    body: JSON.stringify({ chat_id: auth.replace('telegram_', '') }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        document.getElementById('status').textContent = "Добро пожаловать, " + (data.client[1] || "пользователь");
      } else {
        document.getElementById('status').textContent = data.message;
      }
    });
} else {
  document.getElementById('status').textContent = 'Не найдены параметры авторизации.';
}
