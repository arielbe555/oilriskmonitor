# Oil Risk Monitor AI

## What This Is

Oil Risk Monitor AI is a B2B SaaS multitenant platform for the Oil & Gas industry that uses satellite imagery and AI to detect spills, leaks, and operational anomalies in near real-time. It generates auditable incident tickets, ESG compliance reports with RSA digital signatures and SHA-256 hashes, and provides a centralized SOC-style dashboard for oil operators, insurers, and environmental consultants to manage operational risk from a single pane of glass.

**Tagline:** "Hoy esto lo detectás tarde. Con Oil Risk Monitor AI, lo detectás antes."

## Core Value

An oil operator can monitor all their assets via satellite, receive an alert when a spill or anomaly is detected, manage the resolution through an auditable ticket, and generate a compliance ESG report — all without needing manual field inspection as a first step.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Phase 1 — Demo Frontend (mock data):**
- [ ] Full SOC dashboard with Leaflet map (dark theme), KPI widgets, alert feed, ticket list
- [ ] Alerts page with severity filter (critical/medium/low) and real-time-style badge
- [ ] Ticket lifecycle UI: list + detail + timeline (new → in_review → resolved → audited)
- [ ] SatelliteViewer: before/after image slider for anomaly visualization
- [ ] ESG Reports page: table + mock PDF download
- [ ] Settings page: responsible person config + notification channels
- [ ] i18n ES/EN toggle in navbar (react-i18next)
- [ ] Deploy on Netlify at oilriskmonitor.com

**Phase 2 — Backend + Database:**
- [ ] Supabase schema-per-tenant: public + {tenant_slug} schemas with all tables
- [ ] RLS policies on every table for multitenant isolation
- [ ] Supabase Auth with magic link + email/password, session management
- [ ] Node.js/Express REST API for assets, alerts, tickets, reports
- [ ] Public API with API Key authentication and webhooks for external integrations (SAP, Odoo)
- [ ] Supabase Realtime subscriptions for live alert feed in frontend

**Phase 3 — AI + Satellite + Notifications:**
- [ ] Copernicus API integration: Sentinel-1 SAR + Sentinel-2 optical image fetching
- [ ] Claude API image analysis: spill/leak/fire detection with confidence score
- [ ] CRON job every 6 hours: scan all active assets, detect anomalies, auto-create tickets
- [ ] Notification service: Resend (email) + Twilio (SMS) + Telegram Bot API
- [ ] ESG report generation: Claude API + Puppeteer PDF + RSA-2048 digital signature + SHA-256 hash
- [ ] Supabase Storage for satellite images and signed PDF reports

**Phase 4 — Mobile App:**
- [ ] Expo React Native app: dashboard, alerts, ticket detail, camera upload
- [ ] Push notifications via Expo Notifications (FCM + APNs)
- [ ] Deep links from Telegram bot to ticket detail in app

### Out of Scope

- Real-time video streaming of assets — bandwidth/complexity, use satellite imagery instead
- Custom hardware IoT sensors — platform is satellite-first
- Planet Labs or paid satellite providers — Sentinel (ESA) free tier first
- OAuth social login — email/password + magic link sufficient for enterprise B2B
- Chat between operators — ticket system covers coordination needs

## Context

**Industry:** Oil & Gas (O&G), Latin America primary market (Argentina, Brazil), US secondary
**Compliance drivers:** ISO 27001, SOC 2 Type II, ISO 14001 (core product), GDPR/LGPD, OWASP
**Grant context:** Applying for Argentina Agencia I+D+i innovation grant — compliance from day 1 is a differentiator
**Multitenant model:** Schema-per-tenant in PostgreSQL. Tenant types: OPERATOR, INSURER, CONSULTANT, ADMIN
**Satellite sources:** Sentinel-1 SAR (spill detection via low backscatter), Sentinel-2 optical (visual + NDVI), SAOCOM L-band (Argentine national projects)
**AI model routing:** claude-opus-4-5 for critical satellite analysis, claude-sonnet-4-6 for ESG report generation
**Map:** react-leaflet + CartoDB.DarkMatter (Mapbox token optional for later upgrade)
**Mobile:** Expo React Native — one codebase for iOS + Android, Phase 4

**Infrastructure:**
- Frontend: React + Vite + TailwindCSS + shadcn/ui → Netlify
- Backend: Node.js + Express → Render
- DB: Supabase (https://panmgqtzqlpqubdeqxid.supabase.co)
- CDN/WAF: Cloudflare (domain: oilriskmonitor.com)
- GitHub: https://github.com/arielbe555/oilriskmonitor

## Constraints

- **Tech Stack**: React/Vite/Tailwind/shadcn + Node/Express + Supabase — fixed, matches QATECH standard
- **Multitenant**: Schema-per-tenant from day 1, no refactoring later
- **i18n**: All UI strings in react-i18next ES/EN from day 1 — no hardcoded text
- **Security**: RLS on every Supabase table, Cloudflare WAF, compliance headers on all API responses
- **AI Models**: claude-opus-4-5 for image analysis (critical), claude-sonnet-4-6 for reports (cost optimization)
- **Map**: react-leaflet + OSM free tier (Mapbox token pending for Phase 2+ upgrade)
- **Credentials pending**: ANTHROPIC_API_KEY, RESEND_API_KEY, Sentinel Hub, Twilio, Telegram Bot, MAPBOX_TOKEN, Supabase service role key

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Schema-per-tenant isolation | Maximum data isolation for enterprise clients + insurance companies. Required for ISO 27001 and SOC 2 Type II compliance. | — Pending |
| Phase 1 = demo with mock data | Validate UX, show to clients, secure grant funding before building backend. Reduces time-to-demo from weeks to days. | — Pending |
| react-leaflet over Mapbox for Phase 1 | No token required, free, CartoDB DarkMatter gives same dark SOC aesthetic. Mapbox can be added later. | — Pending |
| RSA-2048 + SHA-256 for report integrity | ISO 14001 compliance evidence for clients' own certifications. Core product differentiator vs competitors. | — Pending |
| Supabase Realtime for live alerts | Eliminates polling, zero additional infrastructure, built into Supabase. | — Pending |
| claude-opus-4-5 for anomaly analysis | Critical decisions (spill detection) need highest accuracy. Cost is justified by the severity of false negatives. | — Pending |
| Free Copernicus/ESA satellite APIs | Free academic-grade APIs with commercial use rights. Sentinel-1 SAR ideal for oil spill detection (penetrates clouds). | — Pending |

---
*Last updated: 2026-04-12 after initialization*
