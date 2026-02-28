const API_BASE = 'https://commodities-api.com/api';

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : undefined;
  }
  return value !== undefined && value !== null ? String(value) : undefined;
}

function normalizeSymbols(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(',');
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  const normalized = String(value).trim();
  return normalized || undefined;
}

function getAccessKey() {
  const accessKey = process.env.COMMODITIES_API_KEY;
  if (!accessKey) {
    throw new Error('Missing COMMODITIES_API_KEY environment variable.');
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
    error.status = response.ok && data.success === false ? 502 : response.status || 502;
    throw error;
  }

  return data;
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(payload));
}

module.exports = {
  fetchFromCommodities,
  getQueryValue,
  normalizeSymbols,
  sendJson,
};
