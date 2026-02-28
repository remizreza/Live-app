const { fetchFromCommodities, getQueryValue, normalizeSymbols, normalizeUpper, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const date = getQueryValue(req.query.date) ? String(getQueryValue(req.query.date)).trim() : undefined;
  const base = normalizeUpper(req.query.base);
  const symbols = normalizeSymbols(req.query.symbols);

  if (!date) {
    return sendJson(res, 400, {
      success: false,
      error: 'Missing required query param: date (YYYY-MM-DD)',
    });
  }

  try {
    const data = await fetchFromCommodities(date, { base, symbols });
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      success: false,
      error: error.message,
    });
  }
};
