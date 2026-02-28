const API_BASE = '/api';
const refreshBtn = document.getElementById('refreshBtn');
const baseCurrencyInput = document.getElementById('baseCurrency');
const lastUpdated = document.getElementById('lastUpdated');
const ratesContainer = document.getElementById('rates');
const newsList = document.getElementById('newsList');
const symbolsContainer = document.getElementById('symbols');
const rateCardTemplate = document.getElementById('rateCardTemplate');

async function fetchJson(endpoint, params = {}) {
  const url = new URL(`${API_BASE}/${endpoint}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed for ${endpoint}`);
  }

  return data;
}

function renderRates(rates = {}) {
  ratesContainer.replaceChildren();

  Object.entries(rates).forEach(([symbol, value]) => {
    const card = rateCardTemplate.content.cloneNode(true);
    card.querySelector('.symbol').textContent = symbol.toUpperCase();
    card.querySelector('.value').textContent = Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
    ratesContainer.appendChild(card);
  });
}

function renderNews(news = []) {
  newsList.replaceChildren();

  if (!Array.isArray(news) || news.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No news returned by API.';
    newsList.appendChild(li);
    return;
  }

  news.slice(0, 8).forEach((item) => {
    const li = document.createElement('li');
    const title = item.title || item.headline || 'Untitled story';
    const url = item.url || item.link;

    if (url) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = title;
      li.appendChild(anchor);
    } else {
      li.textContent = title;
    }

    newsList.appendChild(li);
  });
}

function renderSymbols(symbols = {}) {
  symbolsContainer.replaceChildren();
  const sortedKeys = Object.keys(symbols).sort().slice(0, 40);

  sortedKeys.forEach((key) => {
    const chip = document.createElement('span');
    chip.className = 'symbol-chip';
    chip.textContent = key;
    symbolsContainer.appendChild(chip);
  });
}

async function loadDashboard() {
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Loading...';

  const base = (baseCurrencyInput.value || '').trim().toUpperCase();

  try {
    const latestParams = {};
    if (base) latestParams.base = base;

    const [symbolsData, latestData, newsData] = await Promise.all([
      fetchJson('symbols'),
      fetchJson('latest', latestParams),
      fetchJson('news'),
    ]);

    renderSymbols(symbolsData.data || symbolsData.symbols || {});
    renderRates(latestData.data?.rates || latestData.rates || {});
    renderNews(newsData.data || newsData.news || []);
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
  } catch (error) {
    lastUpdated.textContent = `Error: ${error.message}`;
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh now';
  }
}

refreshBtn.addEventListener('click', loadDashboard);
baseCurrencyInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadDashboard();
  }
});

loadDashboard();
setInterval(loadDashboard, 60_000);
