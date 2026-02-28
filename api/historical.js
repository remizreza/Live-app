const { fetchFromCommodities, getQueryValue, normalizeSymbols, sendJson } = require('./_utils');

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const date = getQueryValue(req.query.date);
  const base = getQueryValue(req.query.base)?.toUpperCase();
  const symbols = normalizeSymbols(req.query.symbols);

  if (!date) {
    return sendJson(res, 400, {
      success: false,
      error: 'Missing required query param: date (YYYY-MM-DD)',
    });
  }

  if (!DATE_FORMAT.test(date)) {
    return sendJson(res, 400, {
      success: false,
      error: 'Invalid date format. Use YYYY-MM-DD.',
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
