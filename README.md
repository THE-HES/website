# H.E.S. Website — Vercel Deploy

Static HTML site. No build step.

## Deploy

### Option A — Vercel CLI
```bash
npm i -g vercel
cd vercel-deploy
vercel
```

### Option B — Drag & drop
1. Zip this folder.
2. Go to https://vercel.com/new
3. Drag the zip onto the page, or import from a Git repo.

### Option C — Git
1. Push this folder to a GitHub repo.
2. Import the repo on Vercel — it'll auto-detect as static.

## Settings (if Vercel asks)
- **Framework Preset:** Other
- **Build Command:** (leave empty)
- **Output Directory:** `.`
- **Install Command:** (leave empty)

## Files
- `index.html` — homepage
- `assets/` — images, logos, fonts
- `components/` — React components (loaded in-browser via Babel)
- `tweaks-panel.jsx` — design tweaks scaffold (hidden in production)
- `vercel.json` — caching + clean URL config
