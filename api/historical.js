const { fetchFromCommodities, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const date = req.query.date ? String(req.query.date) : undefined;
  const base = req.query.base ? String(req.query.base).toUpperCase() : undefined;
  const symbols = req.query.symbols ? String(req.query.symbols) : undefined;

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
