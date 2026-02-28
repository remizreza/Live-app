const { fetchFromCommodities, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const base = req.query.base ? String(req.query.base).toUpperCase() : undefined;
  const symbols = req.query.symbols ? String(req.query.symbols) : undefined;
  const type = req.query.type ? String(req.query.type) : undefined;
  const start_date = req.query.start_date ? String(req.query.start_date) : undefined;
  const end_date = req.query.end_date ? String(req.query.end_date) : undefined;

  try {
    const data = await fetchFromCommodities('fluctuation', {
      base,
      symbols,
      type,
      start_date,
      end_date,
    });
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      success: false,
      error: error.message,
    });
  }
};
