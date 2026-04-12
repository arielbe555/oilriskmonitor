# Requirements: Oil Risk Monitor AI

**Defined:** 2026-04-12
**Core Value:** An oil operator can detect a spill via satellite, manage resolution through an auditable ticket, and generate a signed ESG compliance report — all before needing manual field inspection as a first step.

---

## v1 Requirements

### SOC Dashboard (Frontend)

- [ ] **DASH-01**: User can view a dark-theme SOC dashboard with a live Leaflet map showing all monitored assets color-coded by status
- [ ] **DASH-02**: User can see KPI widgets showing: active alerts count, open tickets count, monitored assets count, and scans performed today
- [ ] **DASH-03**: User can see a real-time alert feed sorted by severity (critical first) with visual severity indicator (red/orange/yellow/green)
- [ ] **DASH-04**: User can see recent ticket list with status and assigned operator
- [ ] **DASH-05**: User can toggle UI language between Spanish and English from the navbar
- [ ] **DASH-06**: User can click an asset on the map to open a side panel with asset details and latest scan status

### Alerts

- [ ] **ALRT-01**: User can view all alerts paginated and filterable by severity (critical/medium/low) and status (new/acknowledged/in_review/resolved/false_positive)
- [ ] **ALRT-02**: User can see each alert's severity badge, asset name, anomaly type, detection timestamp, and ticket link
- [ ] **ALRT-03**: User can acknowledge an alert (changes status to acknowledged, records user and timestamp)
- [ ] **ALRT-04**: User can mark an alert as false positive with a required note

### Tickets

- [ ] **TIKT-01**: User can view all tickets filterable by status (new/in_review/resolved/audited) and priority
- [ ] **TIKT-02**: User can view ticket detail with full timeline showing all events (created, assigned, comments, images, resolved, audited)
- [ ] **TIKT-03**: User can add a text comment to a ticket (recorded in ticket_events)
- [ ] **TIKT-04**: User (operator role) can mark a ticket as resolved with mandatory resolution_note
- [ ] **TIKT-05**: User (insurer/admin role) can audit a resolved ticket, adding an audit_note, accepting or rejecting the resolution
- [ ] **TIKT-06**: User can view satellite "before vs after" image comparison for the anomaly associated with a ticket

### Satellite Viewer

- [ ] **SATV-01**: User can view a side-by-side or slider comparison of the satellite image before and after the detected anomaly
- [ ] **SATV-02**: User can see Claude's analysis summary (anomaly type, confidence %, description, recommendation) alongside the image comparison

### ESG Reports

- [ ] **RPRT-01**: User can view a list of generated ESG reports with period, type, generated date, and download button
- [ ] **RPRT-02**: User can generate an ESG report for a selected time period (triggers Claude-based content generation)
- [ ] **RPRT-03**: User can download a signed ESG report PDF
- [ ] **RPRT-04**: User can verify a report's integrity (SHA-256 hash and RSA signature validation)

### Authentication & Multitenant

- [ ] **AUTH-01**: User can log in with email and password via Supabase Auth
- [ ] **AUTH-02**: User can request a magic link login (passwordless)
- [ ] **AUTH-03**: User session persists across browser refresh and tab close/reopen
- [ ] **AUTH-04**: User can log out from any page
- [ ] **AUTH-05**: Each tenant's data is fully isolated at the database schema level (schema-per-tenant)
- [ ] **AUTH-06**: User role (operator/supervisor/admin/insurer/consultant) enforces access boundaries at the database RLS level

### Assets

- [ ] **ASST-01**: Admin can create a new monitored asset with name, type, GPS coordinates or polygon, assigned responsible, and optionally linked insurer
- [ ] **ASST-02**: Admin can edit and deactivate assets
- [ ] **ASST-03**: User can view an asset's monitoring history (scan log, anomaly count, last scan timestamp)

### Settings & Responsible

- [ ] **SETT-01**: Admin can create/edit/delete responsible persons with name, role, email, phone, and Telegram chat ID
- [ ] **SETT-02**: Admin can configure notification channels per responsible (email / SMS / Telegram)
- [ ] **SETT-03**: Admin can configure tenant-level settings (language, timezone, primary color)
- [ ] **SETT-04**: Admin can view and regenerate the tenant API key for external integrations

### Satellite Scan Pipeline

- [ ] **SCAN-01**: System runs an automated satellite scan every 6 hours for all active assets across all tenants
- [ ] **SCAN-02**: System fetches Sentinel-1 SAR and Sentinel-2 optical images from Copernicus ESA free API
- [ ] **SCAN-03**: System sends images to Claude API (claude-opus-4-5) for anomaly analysis returning: type, severity, confidence, description, recommendation, estimated area
- [ ] **SCAN-04**: System creates anomaly + alert + ticket automatically when anomaly_detected=true with confidence ≥ threshold
- [ ] **SCAN-05**: System stores all satellite images in Supabase Storage with per-tenant bucket isolation

### Notifications

- [ ] **NOTF-01**: System sends email notification (Resend) when a new alert is created for the responsible assigned to the asset
- [ ] **NOTF-02**: System sends SMS notification (Twilio) when alert severity is critical and responsible has phone configured
- [ ] **NOTF-03**: System sends Telegram message with inline acknowledge/view buttons when Telegram chat ID is configured
- [ ] **NOTF-04**: System sends webhook POST to tenant's configured webhook_url for: alert.created, ticket.status_changed, ticket.resolved, report.generated

### Public API

- [ ] **PAPI-01**: External system can authenticate using tenant API key (Bearer token)
- [ ] **PAPI-02**: External system can list assets, alerts, and tickets via REST API
- [ ] **PAPI-03**: External system can add a comment to a ticket via API
- [ ] **PAPI-04**: External system can verify a report's hash integrity via API

### Compliance & Security

- [ ] **COMP-01**: All API responses include ISO 27001 security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] **COMP-02**: All user actions are recorded in an immutable audit_log (INSERT only, no UPDATE/DELETE, with SHA-256 entry hash)
- [ ] **COMP-03**: ESG report PDFs are signed with RSA-2048 and SHA-256 hash stored for integrity verification
- [ ] **COMP-04**: All rate limiting applied to public and authenticated endpoints (express-rate-limit)

### Mobile App (Expo)

- [ ] **MOBL-01**: Field operator can view active alerts and assigned tickets from iOS/Android app
- [ ] **MOBL-02**: Field operator can upload photos from device camera as ticket evidence
- [ ] **MOBL-03**: Field operator receives push notifications (FCM/APNs) for new assigned tickets
- [ ] **MOBL-04**: Field operator can deep-link from Telegram bot message directly to ticket detail in app

---

## v2 Requirements (Deferred)

### Advanced Analytics
- **ANLX-01**: Heatmap overlay on map showing anomaly frequency per zone over time
- **ANLX-02**: Predictive risk scoring per asset based on historical anomaly patterns
- **ANLX-03**: Comparative period-over-period trend charts in dashboard

### Extended Compliance
- **XCOM-01**: MFA (TOTP/FIDO2) for admin and insurer roles
- **XCOM-02**: IP allowlist per tenant for enterprise security
- **XCOM-03**: Automatic DPA notification webhook for GDPR/LGPD data breach events
- **XCOM-04**: Session timeout configurable per tenant

### White-Labeling
- **WLAB-01**: Custom domain per tenant
- **WLAB-02**: Custom logo, colors, and branding applied to email templates and reports

### Commercial Satellite
- **CSAT-01**: Planet Labs integration for daily imagery (paid tier upsell)
- **CSAT-02**: SAOCOM L-band integration for Argentine national projects

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time video streaming | Bandwidth/infrastructure cost, satellite imagery sufficient |
| Custom hardware IoT sensors | Out of satellite-first scope — accept data via API webhooks only |
| Social/team chat between operators | Ticket comments + Telegram covers coordination |
| OAuth (Google/GitHub) login | Enterprise B2B — email/password + magic link sufficient |
| Custom ML model training | Need 500+ labeled incidents minimum; use Claude until then |
| Next.js / SSR frontend | Vite CSR is the QATECH standard stack; no SEO needs for dashboard |
| Multi-region database routing | Single sa-east-1 Supabase instance covers LATAM + USA for now |
| Stripe/payment integration | Out of scope for core platform — handle separately |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01–06 | Phase 1 | Pending |
| ALRT-01–04 | Phase 1 (UI mock) → Phase 2 (real data) | Pending |
| TIKT-01–06 | Phase 1 (UI mock) → Phase 2 (real data) | Pending |
| SATV-01–02 | Phase 1 (mock images) | Pending |
| RPRT-01–04 | Phase 1 (mock) → Phase 3 (real PDF+signature) | Pending |
| AUTH-01–06 | Phase 2 | Pending |
| ASST-01–03 | Phase 2 | Pending |
| SETT-01–04 | Phase 1 (mock) → Phase 2 (real) | Pending |
| SCAN-01–05 | Phase 3 | Pending |
| NOTF-01–04 | Phase 3 | Pending |
| PAPI-01–04 | Phase 2 | Pending |
| COMP-01–04 | Phase 2 (headers, audit log) + Phase 3 (report signing) | Pending |
| MOBL-01–04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after initial definition*
