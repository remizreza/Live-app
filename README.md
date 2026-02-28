# Commodities Live Dashboard

A simple dashboard for commodity rates and market headlines.

## What changed

- Front-end now calls local serverless endpoints (`/api/latest`, `/api/symbols`, `/api/news`).
- Vercel serverless functions proxy requests to Commodities-API.
- API key is no longer hardcoded in browser code.

## Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. In **Project Settings → Environment Variables**, add:
   - `COMMODITIES_API_KEY=<your key>`
4. Deploy.

That is enough because Vercel automatically serves static files and the `/api/*` functions.

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
