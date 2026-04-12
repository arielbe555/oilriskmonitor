# Project State: Oil Risk Monitor AI

## Current Phase
Phase 1: SOC Demo Frontend — NOT STARTED

## Project Reference
See: .planning/PROJECT.md (updated 2026-04-12)
**Core value:** Detect spill via satellite → manage ticket → generate signed ESG report before needing field inspection
**Current focus:** Phase 1 — SOC Demo Frontend

## Phases
| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | SOC Demo Frontend | Not started | TBD |
| 2 | Backend + Real Data | Not started | TBD |
| 3 | AI + Satellite + Notifications | Not started | TBD |
| 4 | Mobile App | Not started | TBD |

## Current Position

```
[Phase 1 ░░░░░░░░░░] [Phase 2 ░░░░░░░░░░] [Phase 3 ░░░░░░░░░░] [Phase 4 ░░░░░░░░░░]
  0%                    0%                    0%                    0%
```

**Overall progress:** 0/48 requirements delivered

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases total | 4 |
| Requirements total (v1) | 48 |
| Requirements delivered | 0 |
| Plans created | 0 |
| Plans complete | 0 |

## Accumulated Context

### Key Decisions Made
- Schema-per-tenant from day 1 (Supabase schemas: public + {tenant_slug})
- Phase 1 is pure frontend with mock data — validate UX and grant before any backend
- react-leaflet + CartoDB.DarkMatter (no Mapbox token required for Phase 1)
- RSA-2048 + SHA-256 for ESG report signing (ISO 14001 differentiator)
- claude-opus-4-5 for satellite anomaly analysis; claude-sonnet-4-6 for ESG report generation
- Copernicus ESA free API (Sentinel-1 SAR + Sentinel-2 optical) — no paid satellite provider

### Credentials Pending (needed Phase 2+)
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- Sentinel Hub / Copernicus API credentials
- Twilio (account SID + auth token)
- Telegram Bot token
- MAPBOX_TOKEN (optional Phase 2+ upgrade)
- Supabase service role key

### Infrastructure
- Frontend: React + Vite + TailwindCSS + shadcn/ui → Netlify (oilriskmonitor.com)
- Backend: Node.js + Express → Render
- DB: Supabase (https://panmgqtzqlpqubdeqxid.supabase.co)
- CDN/WAF: Cloudflare
- GitHub: https://github.com/arielbe555/oilriskmonitor

### Blockers
None at start.

### Todos
- [ ] Run /gsd:plan-phase 1 to create Phase 1 plans
- [ ] Set up GitHub repo and Netlify site before first plan executes
- [ ] Collect pending API credentials before Phase 2 begins

## Last Session
2026-04-12 — Project initialized. GSD new-project complete. Roadmap created (4 phases, 48 requirements mapped). Ready for Phase 1.
