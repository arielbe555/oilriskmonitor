# Features Research: Oil Risk Monitor AI

**Domain:** B2B SaaS Satellite-Based Environmental Monitoring for Oil & Gas
**Researched:** 2026-04-12
**Overall confidence:** MEDIUM (based on training data through early 2025; web verification unavailable)

> **Note on sources:** WebSearch and WebFetch were unavailable during this research session. All findings are based on training data covering the O&G satellite monitoring domain through early 2025. Competitive landscape details, ESG standards, and ISO requirements are well-established domains unlikely to have shifted dramatically, but specific product feature changes from late 2025/early 2026 may be missed. Flag items marked LOW confidence for live verification before finalizing roadmap.

---

## Competitive Landscape

### Tier 1: Satellite Data Providers with O&G Analytics

#### 1. Planet Labs (planet.com)
**What they do:** Largest commercial satellite constellation (~200 Doves). Daily global imaging at 3-5m resolution. Offers Planet Basemaps, Planet Analytics, and custom monitoring solutions for O&G.
**Key features:**
- Daily revisit rate (entire Earth surface)
- Ship detection and tracking (AIS correlation)
- Oil spill detection on water via SAR partnerships
- Change detection (infrastructure, vegetation, land use)
- API-first: Planet API for imagery tasking, search, and download
- Planet Analytics: pre-built ML models for asset monitoring
**O&G pricing:** Enterprise contracts starting ~$50K-$200K+/yr depending on AOI size
**Strengths:** Best revisit cadence, massive archive, strong API/developer experience
**Weaknesses:** Not a monitoring *platform* -- they sell imagery and analytics layers, not a ticket/workflow system. Customers must build their own SOC/dashboard. No ESG reporting built in. No audit trail for insurers.
**Confidence:** MEDIUM

#### 2. Airbus Defence & Space (OneAtlas)
**What they do:** High-resolution optical (Pleiades Neo at 30cm) and radar (TerraSAR-X) imagery. OneAtlas platform provides streaming access and change detection.
**Key features:**
- Very high resolution (30cm optical, 1m radar)
- OneAtlas Living Library: streaming access to archived imagery
- Change detection APIs
- Custom tasking for specific AOIs
- Integration with Airbus Defence intelligence tools
**O&G pricing:** Premium enterprise pricing, typically $100K+/yr
**Strengths:** Highest resolution commercial imagery available. Strong in defense/intelligence, so audit/chain-of-custody is mature.
**Weaknesses:** Expensive. Not designed as an environmental monitoring SaaS. No built-in ticket/workflow system. Requires integration work.
**Confidence:** MEDIUM

#### 3. Satellogic (satellogic.com)
**What they do:** Argentine NewSpace company. Constellation of hyperspectral + multispectral satellites. Sub-meter resolution. Focus on government and commercial customers in LATAM and globally.
**Key features:**
- Hyperspectral imaging (unique differentiator: chemical signature detection)
- Sub-meter resolution
- Constellation tasking via API
- Ground stations in Argentina
- Government partnerships in Argentina and LATAM
**O&G relevance:** Hyperspectral can detect hydrocarbon signatures directly (not just visual anomalies). Strong LATAM presence.
**Strengths:** Only commercial hyperspectral constellation at scale. Argentine company = local partnerships. Chemical detection capability is unique.
**Weaknesses:** Smaller constellation than Planet (lower revisit). Platform is data-provision, not monitoring SaaS. Limited self-service analytics.
**Confidence:** MEDIUM

### Tier 2: Environmental Intelligence Platforms

#### 4. IBM Environmental Intelligence Suite (formerly The Weather Company)
**What they do:** Enterprise environmental analytics platform combining weather, satellite, IoT, and AI for environmental risk management.
**Key features:**
- Geospatial analytics with weather + satellite fusion
- Carbon accounting and emissions tracking
- Climate risk scoring for assets
- Regulatory compliance reporting
- API-based with enterprise integrations
- AI-powered anomaly detection
**O&G relevance:** Strong on ESG/compliance side. Used by large enterprises for climate risk disclosure.
**Strengths:** Enterprise-grade. Strong compliance/ESG reporting. IBM brand trust. Watson AI integration.
**Weaknesses:** Very expensive (IBM enterprise pricing). Not focused on real-time spill detection. More oriented toward climate risk and carbon than operational incidents. Slow to deploy.
**Confidence:** MEDIUM

#### 5. Ursa Space Systems
**What they do:** SAR (Synthetic Aperture Radar) analytics company. Specializes in oil storage monitoring, maritime surveillance, and environmental monitoring using radar satellite data.
**Key features:**
- Oil storage tank fill-level monitoring (shadow analysis on SAR)
- Maritime oil spill detection
- Vessel dark activity detection
- SAR change detection for infrastructure
- API access to analytics products
**O&G relevance:** Direct competitor for oil spill detection via SAR. Their oil storage monitoring is used by commodity traders and intelligence agencies.
**Strengths:** SAR-specialized expertise. Proven oil spill detection algorithms. Strong in maritime O&G.
**Weaknesses:** Narrow focus (SAR only, no optical). No integrated platform/SOC dashboard. No ESG reporting. Not a self-service SaaS -- more of a data analytics provider.
**Confidence:** MEDIUM

#### 6. SkyWatch (skywatch.com)
**What they do:** Satellite imagery marketplace and EarthCache platform. Simplifies access to imagery from multiple satellite providers (Planet, Airbus, etc.) through a single API.
**Key features:**
- Multi-provider imagery aggregation
- EarthCache API: search, order, and download from multiple constellations
- Area monitoring: automated repeat imagery collection
- Change detection (basic)
- Developer-friendly API
**O&G relevance:** Could be used as an imagery backend, but not an O&G-specific monitoring platform.
**Strengths:** Simplifies imagery procurement. Good API/DX. Lower barrier to entry vs going direct to Planet/Airbus.
**Weaknesses:** Not an analytics platform -- just imagery aggregation. No AI, no tickets, no ESG, no dashboards. A tool, not a product.
**Confidence:** MEDIUM

### Tier 3: Niche/Emerging Players

| Company | Focus | Notes |
|---------|-------|-------|
| Orbital Insight | Geospatial analytics (oil storage, activity) | Acquired by Maxar. Enterprise focus. |
| Kayrros | Energy market intelligence via satellite | Commodity trading focus, not monitoring ops. |
| Floodbase | Flood/water monitoring | Adjacent but not O&G specific. |
| Muon Space | Climate intelligence satellite | Early stage, launching constellation. |

### Competitive Gap Analysis

**What NONE of these competitors offer as an integrated platform:**

| Capability | Planet | Airbus | IBM | Ursa | Satellogic | Oil Risk Monitor |
|------------|--------|--------|-----|------|-----------|-----------------|
| Satellite anomaly detection | Yes | Yes | Partial | Yes (SAR) | Yes | Yes |
| SOC-style dashboard | No | No | Partial | No | No | **Yes** |
| Incident ticket lifecycle | No | No | No | No | No | **Yes** |
| Insurer audit portal | No | No | No | No | No | **Yes** |
| ESG report generation | No | No | Yes | No | No | **Yes** |
| Digital signature on reports | No | No | No | No | No | **Yes** |
| Multi-tenant (operator/insurer) | No | No | No | No | No | **Yes** |
| Mobile field operator app | No | No | No | No | No | **Yes** |
| SLA tracking per severity | No | No | No | No | No | **Yes** |
| Webhook integrations (SAP/Odoo) | API only | API only | Yes | API only | API only | **Yes** |
| LATAM-focused pricing | No | No | No | No | Partial | **Yes** |

**Key insight:** The market is fragmented. Satellite providers sell data, not workflows. Enterprise platforms (IBM) sell analytics, not operational tools. Nobody is offering the "Datadog for O&G environmental monitoring" -- a unified detection-to-resolution platform with audit trail for insurers. This is the gap Oil Risk Monitor fills.

---

## Table Stakes (Must Have)

Features that enterprise O&G clients will expect. Missing any of these means the product feels incomplete or untrustworthy for enterprise buyers.

### P0 -- Absolute Minimum for Enterprise Sale

| # | Feature | Why Expected | Complexity | Phase |
|---|---------|-------------|------------|-------|
| 1 | **Asset registry with geofencing** | Operators need to define monitored areas (wells, pipelines, storage). Geofence = AOI (Area of Interest) for satellite scans. Without this, there's nothing to monitor. | Medium | 2 |
| 2 | **Map visualization with asset overlay** | O&G operators think spatially. Every competitor has a map. No map = no sale. Dark SOC theme is a differentiator but the map itself is table stakes. | Medium | 1 |
| 3 | **Alert system with severity levels** | Critical/High/Medium/Low at minimum. O&G has strict escalation procedures -- alerts must map to their internal severity frameworks. | Low | 1 |
| 4 | **Incident ticket lifecycle** | new -> acknowledged -> in_review -> resolved -> audited. Enterprise O&G companies MUST have traceable incident records for regulatory audits. OSHA, EPA, and LATAM equivalents (Secretaria de Ambiente) require documented response. | Medium | 1-2 |
| 5 | **Audit trail (immutable event log)** | Every state change, every action, every user interaction logged with timestamp and actor. Non-negotiable for ISO 14001 and insurer audits. Log must be append-only and tamper-evident. | Medium | 2 |
| 6 | **Role-based access control (RBAC)** | At minimum: Admin, Operator, Viewer, Auditor. Insurers must have read-only access to specific data. Consultants need scoped access. RBAC is table stakes for any enterprise B2B SaaS. | Medium | 2 |
| 7 | **Multi-tenant data isolation** | Schema-per-tenant (already planned). Enterprise clients will ask "can other tenants see my data?" during procurement. The answer must be "no, by architecture, not just by policy." | High | 2 |
| 8 | **Email notifications on critical alerts** | The absolute minimum notification channel. Every monitoring platform has email alerts. Without email alerts, the platform is passive -- users must check the dashboard manually. | Low | 3 |
| 9 | **Report generation (PDF)** | O&G compliance officers need downloadable reports they can email to regulators. Must be professionally formatted, include incident data, resolution timeline, and evidence. | Medium | 3 |
| 10 | **Data export (CSV/JSON)** | Enterprise clients will ask for data export on day 1 of evaluation. They need to feed data into their own BI tools (Power BI, Tableau). | Low | 2 |

### P1 -- Expected Within 6 Months of Go-Live

| # | Feature | Why Expected | Complexity | Phase |
|---|---------|-------------|------------|-------|
| 11 | **SSO/SAML integration** | Enterprise procurement requires SSO. Not needed for Phase 1 demo, but will block enterprise deals if missing past pilot stage. Okta, Azure AD, Google Workspace. | Medium | Post-MVP |
| 12 | **API with documentation** | Enterprise integration teams expect a well-documented REST API. Swagger/OpenAPI spec. Versioned. API keys with scoping. | Medium | 2 |
| 13 | **Webhook system** | Push events to customer systems (SAP, Salesforce, Odoo) when incidents are created, escalated, or resolved. Enterprise integration pattern. | Medium | 2 |
| 14 | **Historical trend analysis** | "Show me all incidents in the last 12 months for Well #47." Time-series analysis of incident frequency, severity distribution, resolution time trends. | Medium | 3 |
| 15 | **Dashboard KPI widgets** | Total active alerts, MTTR (Mean Time to Resolution), open tickets by severity, assets by risk score. SOC operators live in dashboards. | Low | 1 |

### P2 -- Expected Within 12 Months

| # | Feature | Why Expected | Complexity | Notes |
|---|---------|-------------|------------|-------|
| 16 | **Scheduled reports** | Auto-generate and email weekly/monthly ESG summary reports. Compliance officers expect this. | Low | Phase 3+ |
| 17 | **Custom alert rules** | "Alert me only if confidence > 85% AND severity = critical." Enterprise clients want control over alert sensitivity. | Medium | Phase 3+ |
| 18 | **Bulk operations** | Acknowledge/resolve multiple tickets at once. Operations teams managing 50+ assets need efficiency. | Low | Phase 2+ |

**Confidence:** HIGH -- these are well-established enterprise SaaS patterns confirmed across multiple B2B monitoring domains.

---

## Differentiators (Our Edge)

Features where Oil Risk Monitor can stand out from the fragmented competitor landscape.

| # | Feature | Value Proposition | Complexity | Why Competitors Don't Have It |
|---|---------|-------------------|------------|------------------------------|
| 1 | **Unified detection-to-resolution workflow** | Single platform from satellite alert to ticket to ESG report. No other product does this end-to-end. Competitors require stitching 3-4 tools together. | High (but it's the core product) | Satellite providers sell data, not workflows. |
| 2 | **Insurer audit portal (read-only tenant)** | Insurance companies monitoring O&G portfolios get a dedicated view: incident history, resolution quality, SLA compliance, evidence chain. No tool exists for this today. | Medium | Nobody has built for the insurer persona in this space. |
| 3 | **RSA-signed ESG reports with SHA-256 hash** | Tamper-proof compliance evidence. A regulator or insurer can verify a report hasn't been altered. This is a legal-grade differentiator. | Medium | Competitors generate reports but none digitally sign them with cryptographic proof. |
| 4 | **AI confidence scoring on anomalies** | Every detection comes with a confidence percentage and reasoning. Reduces false-positive fatigue (the #1 complaint in monitoring systems). Operators can set thresholds. | Medium | Most competitors offer binary detection (yes/no), not probabilistic with explanation. |
| 5 | **LATAM-first pricing and compliance** | USD pricing accessible to Argentine/Brazilian companies (not IBM's $500K/yr). Compliance aligned with Secretaria de Ambiente (Argentina), IBAMA (Brazil), not just EPA/OSHA. | Low | Competitors are US/EU-focused with enterprise pricing. |
| 6 | **Telegram Bot integration** | Field operators in LATAM heavily use Telegram (more than Slack). Deep link from Telegram alert to mobile app ticket detail is a workflow accelerator for field teams. | Low | US competitors integrate with Slack/Teams, not Telegram. |
| 7 | **Before/after satellite image slider** | Visual evidence comparison. Operators can see exactly what changed between scans. Compelling for non-technical stakeholders and regulators. | Low | Available in some GIS tools but not integrated into a monitoring workflow. |
| 8 | **Schema-per-tenant with per-asset audit** | Each tenant's data is physically isolated at database level. Each asset has its own audit history. This is architecturally superior to row-level-only isolation for regulated industries. | High (already planned) | Most SaaS competitors use shared-schema multi-tenancy. |

**Confidence:** MEDIUM -- the gap analysis is based on competitors' publicly documented features as of early 2025. Some may have added features since.

---

## Tenant-Specific Feature Needs

### Feature Access Matrix

| Feature | OPERATOR | INSURER | CONSULTANT | ADMIN |
|---------|----------|---------|------------|-------|
| **Dashboard (full SOC)** | Full | Portfolio view | Scoped to assigned operators | Full + admin panel |
| **Map with assets** | Own assets | All insured operators' assets (read-only) | Assigned operators' assets | All tenants |
| **Create/edit assets** | Yes | No | No | Yes |
| **Receive alerts** | Yes (all channels) | Yes (email digest) | Yes (scoped) | Yes |
| **Create tickets** | Yes (manual + auto) | No | Yes (field findings) | Yes |
| **Update ticket status** | Yes | No (audit only) | Yes (field reports) | Yes |
| **Add evidence to tickets** | Yes (photos, notes) | No | Yes (field photos, reports) | Yes |
| **View audit trail** | Own tickets | All insured tickets (read-only) | Assigned tickets | All |
| **Generate ESG reports** | Yes | Request reports on insured operators | Generate for assigned operators | Yes |
| **Verify report signatures** | Yes | Yes (critical feature) | Yes | Yes |
| **API access** | Full CRUD | Read-only | Scoped read + write field data | Full |
| **Webhook configuration** | Yes | Yes (receive events) | No | Yes |
| **User management** | Own org users | Own org users | Own org users | All tenants' users |
| **SLA configuration** | Yes (set own SLAs) | Yes (set audit SLAs) | No | Yes |
| **Billing/subscription** | Yes | Yes | Invited (no billing) | Yes |

### OPERATOR-Specific Features

1. **Asset management CRUD** -- create, edit, deactivate wells/pipelines/storage
2. **Alert threshold configuration** -- set confidence thresholds per asset type
3. **Ticket assignment** -- assign tickets to specific team members
4. **Field evidence upload** -- photos, notes, GPS coordinates from mobile
5. **Notification channel config** -- choose email, SMS, Telegram per user
6. **Integration config** -- set up webhooks to SAP/Odoo/Salesforce
7. **Monthly trend dashboard** -- incident frequency, MTTR, risk scores over time

### INSURER-Specific Features

1. **Portfolio dashboard** -- aggregate view of all insured operators' risk
2. **Risk score per operator** -- calculated from incident frequency, MTTR, severity distribution
3. **SLA compliance tracker** -- did the operator meet response time commitments?
4. **Audit workflow** -- mark tickets as "audited" or "audit failed" with notes
5. **Evidence integrity verification** -- verify RSA signatures on reports and evidence
6. **Comparative analytics** -- benchmark operator X against portfolio average
7. **Audit report generation** -- generate insurer's own summary of operator compliance
8. **Read-only access enforced architecturally** -- insurer cannot modify operator data, enforced at DB level (RLS + role), not just UI

### CONSULTANT-Specific Features

1. **Scoped access** -- only sees operators who have invited them
2. **Field report submission** -- submit findings from site visits with photos
3. **Recommendation workflow** -- attach remediation recommendations to tickets
4. **Environmental impact assessment template** -- structured form for EIA findings
5. **Time tracking** -- log hours spent on-site for billing purposes
6. **Document upload** -- attach lab results, soil samples, water quality reports

**Confidence:** MEDIUM -- tenant model is well-defined in PROJECT.md. Insurer features are based on insurance industry audit patterns in industrial monitoring.

---

## ESG Reporting Standards for LATAM O&G

### Applicable Standards (Priority Order for Argentina/LATAM)

#### 1. GRI Standards (Global Reporting Initiative) -- PRIMARY
**Status:** Most widely adopted ESG framework globally and in LATAM. GRI 2024 Universal Standards are current.
**Relevance for O&G:**
- **GRI 306: Waste (2020)** -- reporting on spills and waste
- **GRI 303: Water and Effluents (2018)** -- water contamination from O&G ops
- **GRI 305: Emissions (2016)** -- flaring, methane leaks
- **GRI 304: Biodiversity (2016)** -- impact on ecosystems near extraction sites
- **GRI 11: Oil and Gas Sector Standard (2021)** -- THE specific standard for O&G companies. Covers 22 topics including: GHG emissions, air emissions, biodiversity, water, waste, spills, decommissioning, community impact.
**What Oil Risk Monitor should generate:**
- Incident count by type (spill, leak, fire, land change) mapped to GRI 306-3 (significant spills)
- Resolution timeline data mapped to GRI reporting period
- Evidence of remediation mapped to GRI 306-4 (waste diverted from disposal)
**Confidence:** HIGH -- GRI is the dominant framework in LATAM.

#### 2. IFRS S1/S2 (ISSB Sustainability Disclosure Standards)
**Status:** Published June 2023 by the International Sustainability Standards Board. Becoming mandatory in multiple jurisdictions. Argentina's CNV (Comision Nacional de Valores) is evaluating adoption timeline.
**Relevance:**
- **IFRS S1:** General sustainability-related financial disclosures
- **IFRS S2:** Climate-related disclosures (building on TCFD)
**What Oil Risk Monitor should support:**
- Climate-related risk data that feeds into IFRS S2 disclosure
- Integration-ready data export (JSON/CSV) for sustainability reporting teams
- Scope 1 emission incident tracking (flaring events, methane leaks)
**Confidence:** MEDIUM -- Argentina adoption timeline uncertain, but directionally this will become required.

#### 3. TCFD (Task Force on Climate-related Financial Disclosures)
**Status:** TCFD recommendations have been subsumed into IFRS S2 as of 2024. The TCFD itself was disbanded in October 2023, with monitoring responsibilities transferred to ISSB/IFRS Foundation.
**What this means:** Don't build TCFD-specific reports. Build IFRS S2-aligned reports, which incorporate TCFD's framework.
**Confidence:** HIGH -- TCFD dissolution is well-documented.

#### 4. Argentina-Specific Regulatory Requirements
- **Secretaria de Ambiente y Desarrollo Sustentable:** Requires incident reporting for environmental contamination events. No specific digital format mandated, but documented evidence with chain of custody is expected.
- **Ley General del Ambiente 25.675:** Establishes environmental insurance requirements. Insurers in the INSURER tenant need to verify compliance.
- **Resolucion SAyDS 1639/2007:** Specific to contaminated sites and remediation plans.
- **Ley de Hidrocarburos 17.319:** Governs O&G operations, including environmental obligations.
**What Oil Risk Monitor should provide:**
- Spanish-language report templates aligned with Argentine regulatory expectations
- Chain of custody documentation for incident evidence
- Remediation timeline evidence
**Confidence:** MEDIUM -- regulatory specifics may have evolved in 2025-2026.

#### 5. Brazil-Specific (Secondary Market)
- **IBAMA (Instituto Brasileiro do Meio Ambiente):** Strictest environmental regulator in LATAM
- **Resolucao CONAMA 398/2008:** Specifically addresses oil spill emergency plans
- **ANP (Agencia Nacional do Petroleo):** Requires incident reporting
**What Oil Risk Monitor should provide:**
- Portuguese-language support (i18n already planned for ES/EN, add PT)
- IBAMA-compatible incident classification
**Confidence:** MEDIUM

### ESG Report Content Requirements

An Oil Risk Monitor ESG report should contain:

```
1. HEADER
   - Report ID (UUID)
   - Generated date/time (UTC)
   - Reporting period (start/end)
   - Tenant/organization details
   - Digital signature metadata (RSA-2048 key fingerprint)
   - SHA-256 hash of report content

2. EXECUTIVE SUMMARY
   - Total incidents in period
   - Incidents by severity
   - Mean time to resolution
   - Assets monitored count
   - Risk score trend

3. INCIDENT DETAIL (per incident)
   - Incident ID
   - Detection timestamp
   - Asset affected (name, coordinates)
   - Anomaly type (spill/leak/fire/land_change)
   - AI confidence score
   - Satellite evidence (before/after images with timestamps)
   - Response timeline (acknowledged/in_review/resolved timestamps)
   - Resolution description
   - Field evidence (photos, notes)
   - Responsible person

4. GRI MAPPING TABLE
   - GRI 306-3: Number and volume of significant spills
   - GRI 306-4: Waste diverted from disposal
   - GRI 304-2: Significant impacts on biodiversity

5. COMPLIANCE STATUS
   - SLA compliance percentage
   - Regulatory notifications sent (y/n)
   - Remediation plans filed (y/n)

6. APPENDIX
   - Methodology (satellite sources, AI model, confidence thresholds)
   - Audit trail extract for each incident
   - Glossary of terms

7. SIGNATURE BLOCK
   - RSA-2048 digital signature (base64)
   - SHA-256 content hash
   - Verification instructions
   - Signing key public certificate reference
```

---

## SLA Standards for O&G Incident Response

### Industry-Standard SLA Tiers

Based on O&G operational risk management practices and ISO 14001 incident response expectations:

#### Severity Classification

| Severity | Definition | Examples | Color Code |
|----------|-----------|----------|------------|
| **CRITICAL (P1)** | Active environmental contamination, immediate regulatory reporting required, potential human safety risk | Large oil spill on water, uncontrolled well blowout, fire detected | Red |
| **HIGH (P2)** | Confirmed anomaly requiring urgent response, potential environmental impact if unaddressed | Small spill detected, pipeline leak indication, significant land change near sensitive area | Orange |
| **MEDIUM (P3)** | Anomaly detected with moderate confidence, requires investigation but no immediate risk | Possible leak (AI confidence 60-80%), minor vegetation change, equipment anomaly | Yellow |
| **LOW (P4)** | Informational alert, scheduled review, or low-confidence detection | AI confidence < 60%, routine monitoring flag, historical comparison note | Blue |

#### SLA Response Times

| Metric | CRITICAL (P1) | HIGH (P2) | MEDIUM (P3) | LOW (P4) |
|--------|---------------|-----------|-------------|----------|
| **Acknowledge** | 15 minutes | 1 hour | 4 hours | 24 hours |
| **First response** | 1 hour | 4 hours | 24 hours | 72 hours |
| **Investigation start** | 2 hours | 8 hours | 48 hours | 1 week |
| **Resolution target** | 24 hours | 72 hours | 1 week | 2 weeks |
| **Regulatory notification** | Immediately (within 1 hour) | Within 24 hours | As needed | N/A |
| **Post-incident report** | Within 48 hours | Within 1 week | Within 2 weeks | Monthly batch |

#### SLA Compliance Metrics to Track

| Metric | Formula | Target |
|--------|---------|--------|
| **MTTA** (Mean Time to Acknowledge) | avg(acknowledged_at - detected_at) | Below SLA threshold per severity |
| **MTTR** (Mean Time to Resolve) | avg(resolved_at - detected_at) | Below SLA threshold per severity |
| **SLA compliance rate** | (tickets resolved within SLA / total tickets) * 100 | >95% |
| **Escalation rate** | (tickets escalated / total tickets) * 100 | <10% |
| **False positive rate** | (tickets resolved as false_positive / total tickets) * 100 | <20% (decreasing over time) |
| **Reopen rate** | (tickets reopened / tickets resolved) * 100 | <5% |

#### SLA Features to Build

1. **SLA timer on each ticket** -- visible countdown showing time remaining before SLA breach
2. **Auto-escalation** -- if MTTA SLA is about to breach, escalate notification (email -> SMS -> phone call chain)
3. **SLA breach alerts** -- separate alert type: "SLA BREACH: Ticket #1234 was not acknowledged within 15 minutes"
4. **SLA dashboard** -- percentage compliance by severity, trend over time, worst-performing assets
5. **SLA configuration per tenant** -- operators can customize SLA thresholds to match their internal policies
6. **Insurer SLA view** -- insurers see SLA compliance as a risk indicator for their portfolio

**Confidence:** MEDIUM -- SLA times are derived from industry practice and ISO 14001 incident response patterns. Specific numbers may vary by client; the configurability feature handles this.

---

## Mobile Field Operator Features

### What Field Operators Actually Need

Based on O&G field operations workflows and enterprise mobile app patterns:

#### Must Have (Phase 4 Core)

| Feature | Why | Details |
|---------|-----|---------|
| **Push notification on assigned tickets** | Field operator gets alerted the moment they're assigned to an incident | Include: severity, asset name, brief description, one-tap to open ticket |
| **Ticket detail view** | Read full incident info in the field | Map with asset location, satellite images (before/after), timeline, notes from other team members |
| **Photo capture with GPS and timestamp** | Document field findings as evidence | Auto-embed GPS coordinates and timestamp in EXIF. Multiple photos per update. |
| **Status update** | Move ticket through lifecycle from the field | One-tap: "I'm on site" (acknowledged), "Investigating" (in_review), "Resolved" (with required resolution notes) |
| **Add notes to ticket** | Text observations from the field | Voice-to-text option for hands-busy situations (Expo supports this) |
| **Offline capability** | Field sites often have poor connectivity | Queue status updates, photos, and notes locally. Sync when connection returns. Critical for remote well sites. |
| **Navigation to asset** | Get directions to the incident location | Deep link to Google Maps / Waze with asset coordinates |

#### Should Have (Phase 4+)

| Feature | Why | Details |
|---------|-----|---------|
| **Checklist/form for field inspection** | Standardized data collection | Configurable checklist per incident type: "Containment deployed? Y/N", "Spill area estimated: ___m2" |
| **QR code scanner for asset identification** | Quickly identify which asset you're at | Scan QR plate on well/pipeline, auto-link to asset in system |
| **Signature capture** | Responsible person signs off on resolution | Digital signature on-device, embedded in ticket as evidence |
| **Measurement tools** | Estimate spill area from photos | Basic polygon drawing on a photo to estimate affected area in m2 |

#### Anti-Features for Mobile

| Don't Build | Why |
|-------------|-----|
| Full dashboard on mobile | Field operators don't need KPI widgets. They need their assigned tickets and quick actions. |
| Report generation on mobile | Reports are office work. Don't clutter the field app. |
| Admin/settings on mobile | User management, SLA config, webhook setup -- all desktop tasks. |
| Real-time satellite viewer on mobile | Too data-heavy for field connectivity. Show cached before/after images. |

**Confidence:** MEDIUM -- based on enterprise field service app patterns (ServiceNow Mobile, Salesforce Field Service) adapted for O&G context.

---

## Anti-Features (Deliberately Skip in v1)

Features that look compelling but should NOT be built in initial phases. Each has a specific reason.

### Critical Anti-Features (Building These Would Hurt)

| # | Anti-Feature | Why It Looks Good | Why to Avoid | What to Do Instead |
|---|-------------|-------------------|-------------|-------------------|
| 1 | **Real-time satellite video streaming** | Impressive demo. "Watch your assets live." | Satellite imagery is captured in passes (revisit cycles), not streaming video. Even the most advanced constellations (Planet) capture stills. Promising "real-time video" is technically misleading and sets wrong expectations. | Communicate honestly: "Near real-time monitoring with 6-hour scan cycles." Show latest available imagery with timestamps. |
| 2 | **Own ML model for anomaly detection** | "We have proprietary AI." Sounds defensible. | Training a custom CV model for oil spill detection requires: (a) labeled training data you don't have, (b) ML engineering team you don't have, (c) 6-12 months of iteration, (d) ongoing model maintenance. Claude API vision analysis is 80/20 -- good enough to ship, improve later. | Use Claude API for v1 (already planned). Collect labeled data from real incidents. Train custom model in v2 when you have 500+ labeled samples. |
| 3 | **IoT sensor integration** | "Real-time" ground truth data. | Requires hardware partnerships, device provisioning, connectivity infrastructure, edge computing. Completely different product domain. Distracts from satellite-first value proposition. | Accept third-party sensor data via webhook API. Don't own the sensor stack. |
| 4 | **Predictive analytics / "risk prediction"** | "Predict spills before they happen." | Requires years of historical data, domain expertise in O&G failure modes, and sophisticated time-series modeling. With zero historical data, any "predictions" would be statistically meaningless and potentially legally dangerous (imagine predicting "no risk" and then a spill happens). | Build trend analysis first (incident frequency over time). Call it "risk scoring" based on historical patterns, not "prediction." |
| 5 | **Blockchain-based audit trail** | "Immutable, decentralized, tamper-proof." | RSA digital signatures + SHA-256 hashes provide equivalent tamper-evidence without the operational complexity, cost, and performance overhead of blockchain. No regulator or insurer has ever asked for blockchain-based audit trails -- they ask for digital signatures and chain of custody. | Already planned: RSA-2048 + SHA-256. This is sufficient and industry-standard. |
| 6 | **Chat/messaging system** | "Collaborate on incidents in real-time." | Building a chat system is a product unto itself (presence, threading, search, notifications). Ticket comments + Telegram integration cover 95% of coordination needs. Building chat distracts from core monitoring value. | Ticket comments for async coordination. Telegram for real-time. Consider Slack integration later if enterprise clients demand it. |
| 7 | **White-label / custom branding** | "Each client gets their own branded platform." | White-labeling adds complexity to every UI component, email template, PDF report, and mobile app. It's an enterprise feature that delays everything else. | Offer basic logo placement in navbar and reports. Full white-label in Year 2 if demand validates it. |
| 8 | **Multi-satellite constellation management** | "Integrate Planet, Airbus, and Maxar." | Each satellite provider has different APIs, data formats, resolution, pricing, and licensing terms. Integrating multiple providers is a massive engineering effort. Copernicus/Sentinel is free and sufficient for v1. | Start with Copernicus Sentinel-1 (SAR) + Sentinel-2 (optical). Add commercial providers (Planet, SAOCOM) as paid tier features in later phases. |

### Moderate Anti-Features (Defer, Don't Delete)

| # | Anti-Feature | Defer Until | Trigger to Build |
|---|-------------|-------------|-----------------|
| 9 | **AI chatbot for natural language queries** | Phase 5+ | When operators request "ask questions about my data" in customer interviews |
| 10 | **Automated regulatory filing** | Phase 5+ | When you understand the specific regulatory submission formats for each jurisdiction |
| 11 | **Custom report builder (drag-and-drop)** | Phase 4+ | When >10 clients request reports beyond the standard ESG template |
| 12 | **Multi-language beyond ES/EN** | Phase 4+ | When entering Brazil (Portuguese) or other markets |
| 13 | **SSO/SAML** | Phase 3+ | When enterprise procurement blocks a deal specifically on SSO |
| 14 | **Marketplace for third-party integrations** | Never (v1) | This is a Year 3+ feature if the platform becomes a true ecosystem |

**Confidence:** HIGH -- these anti-patterns are well-established across B2B SaaS product development and O&G industry specifics.

---

## Feature Dependencies

```
Asset Registry ──────────────────────────────┐
    │                                         │
    ▼                                         │
Geofence/AOI Definition                       │
    │                                         │
    ▼                                         │
Satellite Image Fetching (Copernicus API)     │
    │                                         │
    ▼                                         │
AI Anomaly Detection (Claude Vision)          │
    │                                         │
    ├──────────────────────┐                  │
    ▼                      ▼                  │
Alert Generation     Confidence Scoring       │
    │                      │                  │
    ▼                      │                  │
Notification System  ◄─────┘                  │
    │                                         │
    ▼                                         │
Ticket Creation (auto from alert)             │
    │                                         │
    ├──────────────┐                          │
    ▼              ▼                          │
SLA Timer    Ticket Assignment                │
    │              │                          │
    ▼              ▼                          │
Escalation   Field Response (Mobile App)      │
    │              │                          │
    ▼              ▼                          │
SLA Breach   Evidence Upload (photos/notes)   │
  Alert            │                          │
                   ▼                          │
              Ticket Resolution               │
                   │                          │
                   ▼                          │
              Audit Trail (immutable log) ◄───┘
                   │
                   ▼
              ESG Report Generation
                   │
                   ▼
              RSA Signature + SHA-256 Hash
                   │
                   ▼
              Insurer Audit Portal (read-only)
```

**Critical path:** Asset Registry -> Satellite Fetching -> AI Detection -> Alert -> Ticket -> Resolution -> Report. This is the core value chain and must be built in order.

---

## MVP Recommendation

### Phase 1 (Demo -- Mock Data): Build These

1. SOC Dashboard with map, KPI widgets, alert feed (table stakes #2, #3, #15)
2. Ticket lifecycle UI with timeline (table stakes #4)
3. Before/after satellite image slider (differentiator #7)
4. Alert severity levels with filtering (table stakes #3)
5. ESG report mock with download (table stakes #9)

### Phase 2 (Backend -- Real Data): Build These

6. Asset registry with geofence definition (table stakes #1)
7. Multi-tenant schema with RLS (table stakes #7)
8. RBAC for all four tenant types (table stakes #6)
9. Immutable audit trail (table stakes #5)
10. REST API with OpenAPI docs (table stakes #12)
11. Webhook system (table stakes #13)
12. Data export CSV/JSON (table stakes #10)

### Phase 3 (AI + Satellite + Notifications): Build These

13. Copernicus API integration (core product)
14. Claude Vision anomaly detection with confidence (differentiator #4)
15. Notification system: email + SMS + Telegram (table stakes #8, differentiator #6)
16. ESG report generation with RSA signature (differentiator #3)
17. SLA timers and auto-escalation
18. Historical trend analysis (table stakes #14)

### Phase 4 (Mobile + Insurer): Build These

19. Mobile app with offline support (field operator features)
20. Insurer audit portal (differentiator #2)
21. Risk scoring per operator for insurers
22. SLA compliance dashboard

### Explicitly Defer

- SSO/SAML: until it blocks a specific deal
- Custom ML model: until 500+ labeled incidents
- Predictive analytics: until 2+ years of historical data
- Multi-satellite providers: until commercial tier pricing
- White-labeling: until Year 2 demand validation
- IoT sensor integration: accept via webhook only

---

## Sources

All findings based on training data (cutoff early 2025). Key knowledge domains:

- Planet Labs product documentation and API specifications
- Airbus OneAtlas product pages and technical documentation
- Satellogic investor presentations and product announcements
- IBM Environmental Intelligence Suite documentation
- Ursa Space Systems product descriptions
- GRI Standards Universal 2021 and Sector Standard for O&G (GRI 11)
- IFRS S1/S2 (ISSB) published standards June 2023
- TCFD final report and dissolution announcement October 2023
- ISO 14001:2015 Environmental Management Systems standard
- Argentine environmental law (Ley 25.675, Ley 17.319)
- Brazilian CONAMA Resolution 398/2008
- Enterprise SaaS patterns from ServiceNow, Datadog, PagerDuty incident management
- O&G industry incident response best practices (API/IOGP guidelines)

**Verification needed:** Competitive landscape may have shifted in late 2025/early 2026. ESG regulatory timelines for Argentina CNV should be verified. Specific SLA numbers should be validated with target customers during discovery interviews.
