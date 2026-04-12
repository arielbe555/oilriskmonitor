# Roadmap: Oil Risk Monitor AI

**Project:** Oil Risk Monitor AI
**Core Value:** Detect spill via satellite → manage ticket → generate signed ESG report before needing field inspection
**Granularity:** Standard
**Total v1 Requirements:** 48
**Coverage:** 48/48 ✓

---

## Phases

- [ ] **Phase 1: SOC Demo Frontend** — Pure React frontend with mock data: validate UX, show to clients, secure innovation grant
- [ ] **Phase 2: Backend + Real Data** — Node.js/Express + Supabase + Auth + RLS + Realtime: all mock replaced with live tenant data
- [ ] **Phase 3: AI + Satellite + Notifications** — Copernicus pipeline + Claude analysis + CRON + notifications + ESG signed PDF
- [ ] **Phase 4: Mobile App** — Expo React Native app for field operators on iOS/Android

---

## Phase Details

### Phase 1: SOC Demo Frontend

**Goal**: Stakeholders and grant evaluators can experience the full SOC workflow across all 8 screens using realistic mock data — no backend required
**Depends on**: Nothing (first phase)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, ALRT-01, ALRT-02, TIKT-01, TIKT-02, SATV-01, SATV-02, RPRT-01, SETT-01
**Success Criteria** (what must be TRUE):
  1. User can navigate all 8 screens (Dashboard, Alerts, Tickets, Ticket Detail, Satellite Viewer, Reports, Settings, Asset Panel) with realistic mock data visible on every screen
  2. Leaflet map renders in dark theme showing 5 mock assets color-coded by status; clicking an asset opens a side panel with asset details
  3. ES/EN language toggle in the navbar switches all UI strings instantly with zero hardcoded text
  4. Alert feed displays severity badges (critical/medium/low) and ticket list shows status and assigned operator
  5. App deploys successfully to Netlify at oilriskmonitor.com and loads without errors
**Plans**: TBD

---

### Phase 2: Backend + Real Data

**Goal**: Authenticated users access their tenant's real data in isolation; all mock data is replaced; the public API is live for external integrations
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, ASST-01, ASST-02, ASST-03, SETT-02, SETT-03, SETT-04, ALRT-03, ALRT-04, TIKT-03, TIKT-04, TIKT-05, TIKT-06, PAPI-01, PAPI-02, PAPI-03, PAPI-04, COMP-01, COMP-02, COMP-04, SETT-01
**Success Criteria** (what must be TRUE):
  1. User can log in with email/password or magic link, stay logged in across browser refresh and tab reopen, and log out from any page
  2. Two tenants with separate schemas cannot see each other's assets, alerts, or tickets — verified by direct Supabase query
  3. User can create a ticket comment, mark a ticket resolved with a resolution note, and an insurer/admin can audit and accept or reject it — full lifecycle persisted in database
  4. Live alert feed updates in the frontend within 2 seconds of a new alert being inserted in Supabase, without page refresh
  5. External system authenticated with tenant API key can list assets/alerts/tickets and add ticket comments via REST API; all responses include ISO 27001 security headers
**Plans**: TBD

---

### Phase 3: AI + Satellite + Notifications

**Goal**: The platform autonomously scans all active assets every 6 hours, detects anomalies using Claude AI, creates tickets with satellite evidence, notifies responsible persons, and produces downloadable signed ESG compliance reports
**Depends on**: Phase 2
**Requirements**: SCAN-01, SCAN-02, SCAN-03, SCAN-04, SCAN-05, NOTF-01, NOTF-02, NOTF-03, NOTF-04, RPRT-02, RPRT-03, RPRT-04, COMP-03
**Success Criteria** (what must be TRUE):
  1. Automated CRON scan runs every 6 hours, fetches Sentinel-1 SAR and Sentinel-2 optical images from Copernicus ESA, and stores them in per-tenant Supabase Storage buckets
  2. When anomaly confidence meets threshold, Claude API (claude-opus-4-5) analysis auto-creates an anomaly + alert + ticket with type, severity, confidence score, description, and recommendation
  3. Responsible person receives email (Resend), SMS for critical alerts (Twilio), and Telegram message with inline acknowledge/view buttons — all within 60 seconds of alert creation
  4. User can generate an ESG report for a time period, download a signed PDF, and verify its SHA-256 hash and RSA-2048 signature via the UI or API
  5. Tenant webhook receives POST notifications for alert.created, ticket.status_changed, ticket.resolved, and report.generated events
**Plans**: TBD

---

### Phase 4: Mobile App

**Goal**: Field operators can receive push notifications, view and manage their assigned tickets, and upload photo evidence directly from their iOS or Android device
**Depends on**: Phase 2
**Requirements**: MOBL-01, MOBL-02, MOBL-03, MOBL-04
**Success Criteria** (what must be TRUE):
  1. Field operator receives a push notification (FCM on Android, APNs on iOS) when a new ticket is assigned to them
  2. Field operator can open the app, view active alerts and assigned tickets, and navigate to ticket detail
  3. Field operator can upload a photo from the device camera as ticket evidence and see it appear in the ticket timeline
  4. Tapping a Telegram bot message deep-link opens the exact ticket detail screen in the app
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. SOC Demo Frontend | 0/6 | Not started | - |
| 2. Backend + Real Data | 0/5 | Not started | - |
| 3. AI + Satellite + Notifications | 0/5 | Not started | - |
| 4. Mobile App | 0/3 | Not started | - |

---

## Coverage Map

| Requirement | Phase | Category |
|-------------|-------|----------|
| DASH-01 | 1 | SOC Dashboard |
| DASH-02 | 1 | SOC Dashboard |
| DASH-03 | 1 | SOC Dashboard |
| DASH-04 | 1 | SOC Dashboard |
| DASH-05 | 1 | SOC Dashboard |
| DASH-06 | 1 | SOC Dashboard |
| ALRT-01 | 1 | Alerts (display only) |
| ALRT-02 | 1 | Alerts (display only) |
| ALRT-03 | 2 | Alerts (actions) |
| ALRT-04 | 2 | Alerts (actions) |
| TIKT-01 | 1 | Tickets (display only) |
| TIKT-02 | 1 | Tickets (display only) |
| TIKT-03 | 2 | Tickets (actions) |
| TIKT-04 | 2 | Tickets (actions) |
| TIKT-05 | 2 | Tickets (actions) |
| TIKT-06 | 2 | Tickets (actions) |
| SATV-01 | 1 | Satellite Viewer |
| SATV-02 | 1 | Satellite Viewer |
| RPRT-01 | 1 | ESG Reports (display only) |
| RPRT-02 | 3 | ESG Reports (generation) |
| RPRT-03 | 3 | ESG Reports (signed PDF) |
| RPRT-04 | 3 | ESG Reports (integrity) |
| AUTH-01 | 2 | Authentication |
| AUTH-02 | 2 | Authentication |
| AUTH-03 | 2 | Authentication |
| AUTH-04 | 2 | Authentication |
| AUTH-05 | 2 | Multitenant |
| AUTH-06 | 2 | Multitenant |
| ASST-01 | 2 | Assets |
| ASST-02 | 2 | Assets |
| ASST-03 | 2 | Assets |
| SETT-01 | 1 (mock) / 2 (real) | Settings |
| SETT-02 | 2 | Settings |
| SETT-03 | 2 | Settings |
| SETT-04 | 2 | Settings |
| SCAN-01 | 3 | Satellite Scan Pipeline |
| SCAN-02 | 3 | Satellite Scan Pipeline |
| SCAN-03 | 3 | Satellite Scan Pipeline |
| SCAN-04 | 3 | Satellite Scan Pipeline |
| SCAN-05 | 3 | Satellite Scan Pipeline |
| NOTF-01 | 3 | Notifications |
| NOTF-02 | 3 | Notifications |
| NOTF-03 | 3 | Notifications |
| NOTF-04 | 3 | Notifications |
| PAPI-01 | 2 | Public API |
| PAPI-02 | 2 | Public API |
| PAPI-03 | 2 | Public API |
| PAPI-04 | 2 | Public API |
| COMP-01 | 2 | Compliance & Security |
| COMP-02 | 2 | Compliance & Security |
| COMP-03 | 3 | Compliance & Security |
| COMP-04 | 2 | Compliance & Security |
| MOBL-01 | 4 | Mobile App |
| MOBL-02 | 4 | Mobile App |
| MOBL-03 | 4 | Mobile App |
| MOBL-04 | 4 | Mobile App |

**Total v1:** 48 requirements
**Mapped:** 48/48 ✓
**Orphaned:** 0 ✓

---

*Roadmap created: 2026-04-12*
*Last updated: 2026-04-12 after initialization*
