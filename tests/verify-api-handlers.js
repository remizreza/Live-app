const assert = require('assert');

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
  };
}

async function invoke(handler, req) {
  const res = createRes();
  await handler(req, res);
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    json: JSON.parse(res.body || '{}'),
  };
}

async function run() {
  const originalFetch = global.fetch;
  const originalKey = process.env.COMMODITIES_API_KEY;

  process.env.COMMODITIES_API_KEY = 'test_key_123';

  const calls = [];
  global.fetch = async (url) => {
    calls.push(url);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          success: true,
          base: 'USD',
          rates: { XAU: 0.00034 },
        };
      },
    };
  };

  const latest = require('../api/latest');
  const convert = require('../api/convert');
  const historical = require('../api/historical');
  const timeseries = require('../api/timeseries');
  const fluctuation = require('../api/fluctuation');

  let res = await invoke(latest, { method: 'POST', query: {} });
  assert.equal(res.statusCode, 405);

  res = await invoke(latest, { method: 'GET', query: { base: 'usd', symbols: 'xau,xag' } });
  assert.equal(res.statusCode, 200);
  assert(calls.at(-1).includes('/latest?'));
  assert(calls.at(-1).includes('base=USD'));
  assert(calls.at(-1).includes('symbols=xau%2Cxag'));

  res = await invoke(latest, { method: 'GET', query: { symbols: ['XAU', 'XAG'] } });
  assert.equal(res.statusCode, 200);
  assert(calls.at(-1).includes('symbols=XAU%2CXAG'));

  res = await invoke(convert, { method: 'GET', query: {} });
  assert.equal(res.statusCode, 400);

  res = await invoke(convert, { method: 'GET', query: { from: 'usd', to: 'eur', amount: '25', date: '2024-01-01' } });
  assert.equal(res.statusCode, 200);
  assert(calls.at(-1).includes('/convert?'));
  assert(calls.at(-1).includes('from=USD'));
  assert(calls.at(-1).includes('to=EUR'));
  assert(calls.at(-1).includes('amount=25'));
  assert(calls.at(-1).includes('date=2024-01-01'));

  res = await invoke(historical, { method: 'GET', query: {} });
  assert.equal(res.statusCode, 400);

  res = await invoke(historical, { method: 'GET', query: { date: '2024-02-01', base: 'usd', symbols: 'XAU,XAG' } });
  assert.equal(res.statusCode, 200);
  assert(calls.at(-1).includes('/2024-02-01?'));
  assert(calls.at(-1).includes('base=USD'));

  res = await invoke(historical, { method: 'GET', query: { date: '../../foo' } });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json.error, 'Invalid date format. Use YYYY-MM-DD.');

  res = await invoke(timeseries, { method: 'GET', query: { start_date: '2024-01-01' } });
  assert.equal(res.statusCode, 400);

  res = await invoke(timeseries, { method: 'GET', query: { start_date: '2024-01-01', end_date: '2024-01-31', base: 'usd', symbols: 'XAU' } });
  assert.equal(res.statusCode, 200);
  assert(calls.at(-1).includes('/timeseries?'));
  assert(calls.at(-1).includes('start_date=2024-01-01'));
  assert(calls.at(-1).includes('end_date=2024-01-31'));

  res = await invoke(fluctuation, { method: 'GET', query: { base: 'usd', symbols: 'XAU,XAG', type: 'weekly', start_date: '2024-01-01', end_date: '2024-01-31' } });
  assert.equal(res.statusCode, 200);
  assert(calls.at(-1).includes('/fluctuation?'));
  assert(calls.at(-1).includes('type=weekly'));

  delete require.cache[require.resolve('../api/_utils')];
  delete process.env.COMMODITIES_API_KEY;
  const { fetchFromCommodities } = require('../api/_utils');
  let threw = false;
  try {
    await fetchFromCommodities('latest');
  } catch (error) {
    threw = true;
    assert(error.message.includes('COMMODITIES_API_KEY'));
  }
  assert(threw);

  global.fetch = originalFetch;
  process.env.COMMODITIES_API_KEY = originalKey;

  process.env.COMMODITIES_API_KEY = 'test_key_123';
  global.fetch = async () => ({
    ok: true,
    status: 200,
    async json() {
      return {
        success: false,
        error: { info: 'Upstream rejected request' },
      };
    },
  });
  const errorRes = await invoke(latest, { method: 'GET', query: {} });
  assert.equal(errorRes.statusCode, 502);
  assert.equal(errorRes.json.error, 'Upstream rejected request');

  global.fetch = originalFetch;
  process.env.COMMODITIES_API_KEY = originalKey;

  console.log('All API handler checks passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
