const API_BASE = 'https://commodities-api.com/api';

function getAccessKey() {
  const accessKey =
    process.env.COMMODITIES_API_KEY ||
    process.env.COMMODITIES_ACCESS_KEY ||
    process.env.ACCESS_KEY;

  if (!accessKey) {
    throw new Error(
      'Missing API key environment variable. Set COMMODITIES_API_KEY (preferred), COMMODITIES_ACCESS_KEY, or ACCESS_KEY.',
    );
  }
  return accessKey;
}

async function fetchFromCommodities(endpoint, params = {}) {
  const accessKey = getAccessKey();
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('access_key', accessKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const message = data.error?.info || data.message || `Commodities API request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status || 502;
    throw error;
  }

  return data;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

function getQueryValue(queryValue) {
  if (Array.isArray(queryValue)) {
    return queryValue[0];
  }
  return queryValue;
}

function normalizeUpper(value) {
  const resolved = getQueryValue(value);
  if (!resolved) return undefined;
  return String(resolved).trim().toUpperCase();
}

function normalizeSymbols(value) {
  const resolved = getQueryValue(value);
  if (!resolved) return undefined;

  const normalized = String(resolved)
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
    .join(',');

  return normalized || undefined;
}

module.exports = {
  fetchFromCommodities,
  getQueryValue,
  normalizeSymbols,
  normalizeUpper,
  sendJson,
};
