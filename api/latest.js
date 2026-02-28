const { fetchFromCommodities, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const base = req.query.base ? String(req.query.base).toUpperCase() : undefined;
  const symbols = req.query.symbols ? String(req.query.symbols) : undefined;

  try {
    const data = await fetchFromCommodities('latest', { base, symbols });
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      success: false,
      error: error.message,
    });
  }
};
