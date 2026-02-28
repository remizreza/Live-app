const { fetchFromCommodities, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const from = req.query.from ? String(req.query.from).toUpperCase() : undefined;
  const to = req.query.to ? String(req.query.to).toUpperCase() : undefined;
  const amount = req.query.amount ? String(req.query.amount) : undefined;
  const date = req.query.date ? String(req.query.date) : undefined;

  if (!from || !to || !amount) {
    return sendJson(res, 400, {
      success: false,
      error: 'Missing required query params: from, to, amount',
    });
  }

  try {
    const data = await fetchFromCommodities('convert', { from, to, amount, date });
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      success: false,
      error: error.message,
    });
  }
};
