# Commodities Live Dashboard

A simple dashboard for commodity rates and market headlines.

## What changed

- Front-end calls local serverless endpoints (`/api/latest`, `/api/symbols`, `/api/news`).
- Vercel serverless functions proxy requests to Commodities-API.
- Added support for additional Commodities-API passthrough endpoints: `convert`, `historical`, `timeseries`, and `fluctuation`.
- API key is not stored in browser code.

## Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. In **Project Settings → Environment Variables**, add:
   - `COMMODITIES_API_KEY=rg9urswepoxfe6e2j896dzl0bn9v82mmpw7ctwou4l8gm6bdzhtdfnm8s5rk`
4. Deploy.

## Local run

### Static preview only (UI)

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

### Full local API + UI preview (recommended)

```bash
npm i -g vercel
vercel dev
```

Open the URL shown by `vercel dev`.

## API proxy endpoints

All calls below are made without exposing your API key in browser code.

- `GET /api/latest?base=USD&symbols=XAU,XAG`
- `GET /api/symbols`
- `GET /api/news`
- `GET /api/convert?from=USD&to=EUR&amount=25[&date=YYYY-MM-DD]`
- `GET /api/historical?date=YYYY-MM-DD&base=USD&symbols=XAU,XAG`
- `GET /api/timeseries?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&base=USD&symbols=XAU`
- `GET /api/fluctuation?base=USD&symbols=XAU,XAG&type=weekly[&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD]`

## MCP chat completion example

```bash
curl -X POST "https://commodities-api.mcp.commodities-api.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "openai_api_key": "YOUR_OPENAI_API_KEY",
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "What is the current price of gold?"}],
    "force_mcp_tool": {
      "tool_name": "commodities.latest",
      "params": {
        "api_key": "YOUR_COMMODITIES_API_KEY",
        "symbols": "XAU",
        "base": "USD"
      }
    }
  }'
```


## Verify all endpoints locally

Run the local verification harness for handler validation and query passthrough checks:

```bash
node tests/verify-api-handlers.js
```

This verifies:
- GET-only enforcement (`405`) across handlers.
- Required query validation for `convert`, `historical`, and `timeseries`.
- Query passthrough and normalization (e.g., `base`, `from`, `to` uppercasing).
- Missing `COMMODITIES_API_KEY` error handling in shared utilities.
