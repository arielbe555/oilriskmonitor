# Architecture Research: Oil Risk Monitor AI

## Component Map

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE WAF                        │
│              (DDoS, bot protection, rate limiting)           │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
        ┌──────────▼──────────┐  ┌────────▼────────────┐
        │   NETLIFY (CDN)     │  │   RENDER (Backend)  │
        │   React + Vite SPA  │  │   Node.js + Express │
        │   oilriskmonitor.com│  │   api.oilrisk...    │
        └──────────┬──────────┘  └────────┬────────────┘
                   │                      │
        ┌──────────▼──────────────────────▼────────────────┐
        │               SUPABASE                            │
        │  PostgreSQL (schema-per-tenant) + Auth + Storage  │
        │  Realtime WebSocket + Edge Functions              │
        └───────┬──────────────────────────────────────────┘
                │
        ┌───────┼───────────────────────────────────────────┐
        │       │           EXTERNAL SERVICES               │
        │  ┌────▼──────┐  ┌──────────┐  ┌───────────────┐  │
        │  │ COPERNICUS│  │CLAUDE API│  │ NOTIFICATIONS │  │
        │  │ESA Sentinel│  │Anthropic │  │Resend/Twilio/ │  │
        │  │SAR + Optical│ │claude-   │  │Telegram Bot   │  │
        │  └────────────┘  │opus-4-5  │  └───────────────┘  │
        │                  └──────────┘                      │
        └────────────────────────────────────────────────────┘
```

## Data Flow

### Core Flow: Anomaly Detection (CRON every 6h)

```
node-cron (Render) 
  → GET /api/internal/scan-all
  → Supabase: SELECT active assets FROM all tenant schemas
  → For each asset (parallel):
      → Copernicus API: fetch Sentinel-1 + Sentinel-2 image
      → Supabase Storage: upload image → get signed URL
      → Claude API: analyze current + previous images
      → If anomaly:
          → Supabase INSERT: anomaly + alert + ticket
          → Supabase Realtime: broadcasts to frontend subscribers
          → notification.service: Resend + Twilio + Telegram
          → webhook.service: POST to tenant.webhook_url (if set)
```

### Auth Flow

```
User login
  → Supabase Auth (magic link or email/password)
  → JWT token (contains user_id + tenant_id + role)
  → Frontend stores in localStorage / memory
  → API requests: Authorization: Bearer <jwt>
  → Express middleware: supabase.auth.getUser(jwt) → validates
  → All Supabase queries: automatically filtered by RLS (user context set)
```

### Frontend → Backend decisions

| Operation | Direct Supabase | Via Express Backend | Reason |
|-----------|----------------|---------------------|--------|
| Read alerts | ✓ Direct | — | RLS handles isolation, Realtime works |
| Read tickets | ✓ Direct | — | RLS handles isolation |
| Create ticket comment | ✓ Direct | — | Simple insert with RLS |
| Generate ESG report | — | ✓ Backend | Requires Claude API + Puppeteer/pdf-lib (server-side) |
| Satellite scan trigger | — | ✓ Backend | CRON job, server-side Claude + Copernicus |
| Send notifications | — | ✓ Backend | Resend/Twilio secrets must stay server-side |
| Public API (external) | — | ✓ Backend | API Key auth, webhooks |
| Tenant onboarding | — | ✓ Edge Function | Schema creation requires service role |

## Schema-per-Tenant Implementation

### Supabase Edge Function: create_tenant_schema

```sql
-- Called once at tenant creation
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_slug TEXT)
RETURNS void AS $$
BEGIN
  -- Create isolated schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', tenant_slug);
  
  -- Create all tenant tables from template
  EXECUTE format('
    CREATE TABLE %I.assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN (''well'',''pipeline'',''plant'',''tank'',''platform'')),
      status TEXT DEFAULT ''active'',
      latitude DECIMAL(10,8) NOT NULL,
      longitude DECIMAL(11,8) NOT NULL,
      polygon JSONB,
      radius_km DECIMAL DEFAULT 5,
      responsible_id UUID,
      insurer_tenant_id UUID,
      metadata JSONB DEFAULT ''{}''::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )', tenant_slug);
  
  -- (repeat for all tables: zones, satellite_scans, anomalies, alerts, tickets, 
  --  ticket_events, reports, responsible, audit_log, consents)
  
  -- Apply RLS
  EXECUTE format('ALTER TABLE %I.assets ENABLE ROW LEVEL SECURITY', tenant_slug);
  EXECUTE format('
    CREATE POLICY tenant_isolation ON %I.assets
    USING (
      auth.jwt()->>''tenant_id'' = %L
    )', tenant_slug, tenant_slug);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Cross-Tenant Access: INSURER model

```sql
-- INSURER can read alerts for operators that designated them
CREATE POLICY insurer_access ON {tenant}.alerts
USING (
  -- Direct tenant access
  auth.jwt()->>'tenant_id' = '{tenant}'
  OR
  -- Insurer cross-tenant read
  (
    auth.jwt()->>'role' = 'insurer' AND
    EXISTS (
      SELECT 1 FROM public.tenant_relationships tr
      WHERE tr.insurer_tenant_id = auth.jwt()->>'tenant_id'::uuid
      AND tr.operator_tenant_id = '{tenant}'::uuid
      AND tr.is_active = true
    )
  )
);
```

## CRON + Queue Architecture

### Recommended: node-cron with DB-backed queue

```
node-cron (every 6h)
  → INSERT scan_queue records (one per active asset)
  → Worker loop: SELECT FOR UPDATE SKIP LOCKED (one at a time)
  → Process asset → UPDATE scan_queue status
  → On error: UPDATE status='failed', increment retries

Benefits:
- No duplicate scans (SKIP LOCKED prevents race conditions)  
- Resumable after Render restart
- Observable (scan_queue table shows all pending/running/done)
- No external queue service needed (Supabase table acts as queue)
```

### Alternative for scale: BullMQ + Redis
Not needed for Phase 3 (< 100 tenants). Add when scan queue > 1000 jobs/day.

## Deployment Architecture

```
GitHub push to main
  → Netlify auto-deploy (frontend/)
  → Render auto-deploy (backend/)

Cloudflare DNS:
  oilriskmonitor.com → Netlify edge
  api.oilriskmonitor.com → Render service (proxy)

Supabase:
  Region: sa-east-1 (São Paulo) for LGPD compliance
  Backups: Daily automatic + weekly export to S3

Security layers:
  1. Cloudflare WAF → blocks attacks before they reach origin
  2. Netlify HTTPS → frontend served over TLS
  3. Render HTTPS → API over TLS  
  4. Supabase RLS → data access controlled at DB level
  5. Express JWT middleware → request-level auth
  6. Zod validation → input sanitization
```

## Build Order Implications

```
Phase 1: Frontend only (Netlify)
  - Can build UI without any backend
  - Mock data in src/data/mock.js
  - No Supabase connection yet

Phase 2: Backend + Supabase (Render)
  - Supabase schema must be ready before backend tests
  - RLS policies before any frontend integration
  - Auth before any protected routes

Phase 3: AI + Satellite (depends on Phase 2 fully working)
  - Copernicus API requires Phase 2 (storage, scan records)
  - Claude API requires Phase 2 (anomaly records)
  - Notifications require Phase 2 (alert records, responsible table)
  - PDF generation requires Phase 2 (report records, storage)

Phase 4: Mobile (depends on Phase 2 + Phase 3 notifications)
  - Expo app connects to same Supabase
  - Push notifications require Phase 3 Telegram/notification setup
  - Deep links require ticket system from Phase 2
```

## PDF Generation on Render

### Recommendation: pdf-lib (pure JS)

```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateESGReport(data) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  
  // Add content programmatically
  page.drawText('ESG REPORT', { x: 50, y: 800, size: 24, font, color: rgb(1, 0.42, 0) });
  // ... rest of content
  
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
```

**Why not Puppeteer on Render free tier:**
- Render free: 512MB RAM
- Chromium: ~250MB alone
- Total app: would exceed limit → OOM kill
- Solution: Use paid Render plan ($7/mo starter) OR use pdf-lib
