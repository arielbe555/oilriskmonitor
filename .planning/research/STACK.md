# Stack Research: Oil Risk Monitor AI

## Validated Stack (non-negotiable)

The stack is fixed per project spec. Versions verified for 2025:

| Layer | Technology | Version (2025) | Notes |
|-------|-----------|----------------|-------|
| Frontend framework | React | 18.3.x | Stable, not React 19 yet (shadcn/ui compatibility) |
| Build tool | Vite | 5.4.x | Fast HMR, ESM-first |
| CSS | TailwindCSS | 3.4.x | v4 alpha not production-ready yet |
| UI components | shadcn/ui | latest | Radix-based, copy-paste model |
| i18n | react-i18next | 15.x | Lazy loading + namespace support |
| Map | react-leaflet | 4.x + leaflet 1.9.x | CartoDB.DarkMatter tiles via leaflet-providers |
| HTTP client | axios / fetch | native fetch | Use native fetch with wrappers |
| State | TanStack Query | 5.x | Server state, caching, realtime sync |
| Forms | react-hook-form + zod | 7.x + 3.x | |
| Backend | Node.js + Express | 20 LTS + 4.x | |
| Auth middleware | Supabase JWT | via @supabase/supabase-js | |
| Validation | Zod | 3.x | Shared schemas frontend+backend |
| Rate limiting | express-rate-limit | 7.x | |
| CRON | node-cron | 3.x | In-process scheduler |
| PDF | Puppeteer | 22.x OR pdf-lib 1.17.x | See notes below |
| Digital sig | node-forge | 1.3.x | RSA-2048 + SHA-256 |
| Email | Resend SDK | 3.x | |
| SMS | Twilio SDK | 5.x | |
| DB client | @supabase/supabase-js | 2.x | |
| Mobile | Expo SDK | 51/52 | React Native 0.74+ |
| Monorepo | None (simple folders) | — | frontend/ backend/ mobile/ supabase/ |

## Critical Library Versions & Install Commands

```bash
# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom@6 @tanstack/react-query@5
npm install react-i18next i18next i18next-browser-languagedetector
npm install leaflet react-leaflet leaflet-providers @types/leaflet
npm install react-hook-form zod @hookform/resolvers
npm install @supabase/supabase-js
npm install lucide-react date-fns
npx shadcn-ui@latest init

# Backend
cd backend
npm init -y
npm install express cors helmet express-rate-limit
npm install @supabase/supabase-js
npm install zod
npm install node-cron
npm install resend twilio
npm install node-forge
npm install pdf-lib  # or puppeteer@22
npm install dotenv
npm install -D nodemon
```

## Satellite Pipeline

### Step-by-step: Copernicus → Claude → Alert

```
1. CRON triggers (every 6h)
   ↓
2. Fetch active assets from Supabase (all tenants)
   ↓
3. For each asset in parallel (Promise.allSettled):
   a. Call Copernicus OData API (Sentinel-1 + Sentinel-2)
   b. Filter: last 24h, cloud coverage < 20% (Sentinel-2 only)
   c. If no new scene: skip, record "no_data" in scan log
   d. Download image (512×512 PNG via ProcessingAPI evalscript)
   e. Upload to Supabase Storage (bucket: satellite-images/{tenant_slug}/{asset_id}/)
   f. Get signed URL (1hr expiry)
   g. Fetch previous image URL for comparison
   h. Call Claude API with both images (base64 encoded)
   i. Parse Claude JSON response
   j. If anomaly_detected: create anomaly → alert → ticket → notify
   k. Record scan result in satellite_scans table
```

### Copernicus API Authentication
```javascript
// OAuth2 Client Credentials
const tokenRes = await fetch('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.SENTINEL_HUB_CLIENT_ID,
    client_secret: process.env.SENTINEL_HUB_CLIENT_SECRET
  })
});
const { access_token } = await tokenRes.json();
// Token valid for 10 minutes — cache it
```

### Sentinel-1 Oil Spill Evalscript
```javascript
const OIL_SPILL_EVALSCRIPT = `//VERSION=3
function setup() { return { input: ['VV', 'VH'], output: { bands: 3 } }; }
function evaluatePixel(sample) {
  if (sample.VV < -18 && sample.VH < -24) return [1, 0, 0]; // Red = spill
  return [sample.VV * 5, sample.VH * 5, (sample.VV - sample.VH) * 3];
}`;
```

## Key Implementation Decisions

### PDF Generation: pdf-lib over Puppeteer
**Recommendation: pdf-lib** for Render deployment.
- Puppeteer requires ~300MB Chromium binary — Render's 512MB RAM containers will OOM
- pdf-lib is pure JavaScript, no system dependencies, works on any Node.js environment
- For complex HTML-to-PDF layout: use puppeteer locally, but host on Railway (2GB RAM) or use Render with `--memory 1024`
- **Decision: Start with pdf-lib for Render, add Puppeteer option for self-hosted tenants**

### node-forge RSA Key Generation
- RSA key generation is CPU-blocking — run in worker_threads or generate once at tenant onboarding
- Store private key encrypted in Supabase (AES-256-CBC with tenant-specific passphrase)
- Public key stored plaintext in `public.tenants.public_key`

### Supabase Realtime + TanStack Query
```javascript
// Pattern: Supabase Realtime → invalidate TanStack Query cache
useEffect(() => {
  const channel = supabase
    .channel(`alerts:${tenantSlug}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: tenantSlug,
      table: 'alerts'
    }, () => queryClient.invalidateQueries(['alerts']))
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [tenantSlug]);
```

### react-i18next Structure
```
src/i18n/
├── index.js          # i18n config with lazy loading
├── es/
│   ├── common.json   # Buttons, labels, status values
│   ├── dashboard.json
│   ├── alerts.json
│   ├── tickets.json
│   ├── reports.json
│   └── settings.json
└── en/
    └── (mirror of es/)
```

## Confidence Levels

| Decision | Confidence | Notes |
|----------|-----------|-------|
| React 18 + Vite 5 + Tailwind 3 | High | Battle-tested combination |
| shadcn/ui | High | Works perfectly with this stack |
| react-leaflet 4 + CartoDB DarkMatter | High | Free, dark industrial aesthetic |
| pdf-lib over Puppeteer on Render | High | Memory constraints on Render proven |
| node-cron in-process | Medium | Works but watch for dyno sleeping on Render free tier |
| node-forge for RSA | Medium | Mature but consider Web Crypto API as alternative |
| Supabase Realtime for alerts | High | Well-documented, production-ready |
| TanStack Query 5 | High | Industry standard for server state |

## Pitfalls Specific to This Stack

1. **Render free dyno sleeps after 15min inactivity** — CRON jobs will miss. Use paid plan ($7/mo) or keep-alive ping.
2. **Tailwind + shadcn purge**: Add `./src/**/*.{ts,tsx,js,jsx}` to `content` array in tailwind.config.js
3. **Leaflet SSR**: react-leaflet doesn't support SSR — not an issue with Vite (CSR-only) but remember for any Next.js migration
4. **Supabase anon key exposure**: The `VITE_SUPABASE_ANON_KEY` is public — this is by design, RLS protects the data
5. **Zod schema drift**: Keep a shared `packages/schemas` if monorepo grows — don't duplicate between frontend and backend
6. **node-cron timezone**: Always pass `{ timezone: 'UTC' }` to avoid daylight saving issues
