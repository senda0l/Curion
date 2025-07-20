const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalTableBody = modal.querySelector('tbody');
const modalTitle = modal.querySelector('h3');
const currencyGrid = document.querySelector('.currency-grid');

const targetCurrencies = ["USD", "EUR", "GBP", "JPY", "CNY", "KRW"];

const currencyFlags = {
  USD: 'us.png',
  EUR: 'eu.png',
  GBP: 'gb.png',
  JPY: 'jp.png',
  CNY: 'cn.png',
  KRW: 'kr.png',
  RUB: 'ru.png',
  CHF: 'ch.png',
  CAD: 'ca.png',
  AUD: 'au.png',
  TRY: 'tr.png',
  AED: 'ae.png',
  UZS: 'uz.png'
};

function getFlagHTML(code) {
  const filename = currencyFlags[code];
  return filename
    ? `<img src="Curion/flags/${filename}" alt="${code}" width="24" height="16">`
    : '';
}

// 📌 Генерация карточек валют
async function loadCurrencies() {
  try {
    const res = await fetch('https://api.frankfurter.app/currencies');
    const data = await res.json();
    const codes = Object.keys(data).slice(0, 30); // максимум 15 валют

    codes.forEach(code => {
      const card = document.createElement('div');
      card.classList.add('currency-card');
      card.dataset.currency = code;
      card.textContent = code;
      currencyGrid.appendChild(card);

      // Привязка обработчика к карточке
      card.addEventListener('click', () => openModal(code));
    });
  } catch (err) {
    console.error('Ошибка загрузки валют:', err);
    currencyGrid.innerHTML = '<p>Не удалось загрузить валюты.</p>';
  }
}

async function openModal(base) {
  modal.classList.add('active');
  modalTitle.textContent = `Курсы валют для ${base}`;
  modalTableBody.innerHTML = '<tr><td colspan="3">Загрузка...</td></tr>';

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    const data = await res.json();
    const rates = data.rates;

    let rows = '';
    targetCurrencies.forEach(curr => {
      if (curr !== base && rates[curr]) {
        rows += `
          <tr>
            <td class="currency-flag">${getFlagHTML(curr)}</td>
            <td class="currency-code">${curr}</td>
            <td>${rates[curr].toFixed(2)}</td>
          </tr>
        `;
      }
    });

    modalTableBody.innerHTML = rows || '<tr><td colspan="3">Нет данных</td></tr>';
  } catch (error) {
    modalTableBody.innerHTML = '<tr><td colspan="3">Ошибка загрузки</td></tr>';
    console.error('API Error:', error);
  }
}

// Закрытие модалки
modalClose.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('active');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') modal.classList.remove('active');
});

// Темная тема
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  toggleBtn.textContent = isDark ? '☀️' : '🌙';
});

// Сравнение валют
const form = document.getElementById('compare-form');
const resultEl = document.getElementById('compare-result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const from = document.getElementById('from-currency').value;
  const to = document.getElementById('to-currency').value;

  if (isNaN(amount) || amount <= 0 || from === to) {
    resultEl.textContent = 'Введите корректные значения.';
    return;
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
    );
    const data = await res.json();
    const rate = data.rates[to];

    resultEl.textContent = `${amount} ${from} = ${rate.toFixed(2)} ${to}`;
  } catch (err) {
    resultEl.textContent = 'Ошибка при получении курса.';
  }
});

// Загружаем валюты на старте
loadCurrencies();
