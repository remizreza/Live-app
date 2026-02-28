const { fetchFromCommodities, getQueryValue, normalizeSymbols, normalizeUpper, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const start_date = getQueryValue(req.query.start_date)
    ? String(getQueryValue(req.query.start_date)).trim()
    : undefined;
  const end_date = getQueryValue(req.query.end_date)
    ? String(getQueryValue(req.query.end_date)).trim()
    : undefined;
  const base = normalizeUpper(req.query.base);
  const symbols = normalizeSymbols(req.query.symbols);

  if (!start_date || !end_date) {
    return sendJson(res, 400, {
      success: false,
      error: 'Missing required query params: start_date, end_date',
    });
  }

  try {
    const data = await fetchFromCommodities('timeseries', {
      start_date,
      end_date,
      base,
      symbols,
    });
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      success: false,
      error: error.message,
    });
  }
};
