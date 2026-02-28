const API_BASE = 'https://commodities-api.com/api';

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
    error.status = response.status || 502;
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
  sendJson,
};
