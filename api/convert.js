const { fetchFromCommodities, getQueryValue, normalizeUpper, sendJson } = require('./_utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const from = normalizeUpper(req.query.from);
  const to = normalizeUpper(req.query.to);
  const amount = getQueryValue(req.query.amount) ? String(getQueryValue(req.query.amount)).trim() : undefined;
  const date = getQueryValue(req.query.date) ? String(getQueryValue(req.query.date)).trim() : undefined;

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
