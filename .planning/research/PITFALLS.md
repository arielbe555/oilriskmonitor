# Domain Pitfalls

**Domain:** B2B SaaS Satellite Monitoring Platform (Oil & Gas)
**Project:** Oil Risk Monitor AI
**Researched:** 2026-04-12
**Source basis:** Training data (WebSearch/WebFetch unavailable). Confidence levels adjusted accordingly. All critical claims should be verified against current docs during implementation.

---

## 1. Schema-Per-Tenant Multitenancy

### 1.1 search_path Injection Allows Cross-Tenant Data Access
**What goes wrong:** The `search_path` in PostgreSQL determines which schema is queried when table names are unqualified. If the application sets `search_path` based on user input (e.g., a tenant slug from a JWT or header) without strict validation, an attacker can inject a different schema name and read another tenant's data. Even without malicious intent, a bug in middleware that fails to set `search_path` defaults it to `public`, which may contain shared tables or — worse — another tenant's data if the default schema was misconfigured.
**Warning signs:** Any code path where a SQL query runs without explicitly setting the schema first. Queries that work "sometimes" across tenants. Database logs showing queries hitting the wrong schema.
**Prevention:**
- Validate tenant slugs against a strict regex (`^[a-z][a-z0-9_]{2,30}$`) and verify against an allowlist in the `public.tenants` table before ever using them in SQL.
- Set `search_path` in a Supabase RPC or at the connection level, never by string-concatenating into queries.
- Use a middleware that ALWAYS sets the schema at the start of every request and throws hard if the tenant cannot be resolved.
- Write integration tests that attempt cross-tenant access by manipulating the tenant header/JWT.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** HIGH — well-documented PostgreSQL behavior

### 1.2 RLS Policies That Look Correct But Are Not
**What goes wrong:** RLS policies in Supabase use `auth.uid()` and `auth.jwt()` to enforce access. Common mistakes:
1. **Missing policy on a new table** — Supabase defaults to DENY when RLS is enabled but no policy exists, which is safe. But if a developer disables RLS "temporarily" for debugging and forgets to re-enable it, the table is wide open.
2. **SELECT policy exists but INSERT/UPDATE/DELETE policies don't** — each operation needs its own policy. A table with a SELECT policy but no INSERT policy will silently block inserts (safe) but developers often "fix" this by adding an overly permissive INSERT policy.
3. **Using `security definer` functions that bypass RLS** — any function marked `SECURITY DEFINER` runs as the function owner (typically `postgres`), which bypasses ALL RLS. If application code calls such a function with user-supplied parameters, it's a complete RLS bypass.
4. **Policies that check `tenant_id` from a column but the column is user-writable** — if a user can UPDATE the `tenant_id` column on their own row, they can move their data to another tenant's scope (or worse, read another tenant's data if policies check the column value).
**Warning signs:** Any `SECURITY DEFINER` function called from the API. Tables where RLS is enabled but `SELECT * FROM pg_policies WHERE tablename = 'x'` returns fewer than 4 policies (one per operation). Any policy using `true` as the condition.
**Prevention:**
- Automated CI check: query `pg_tables` and `pg_policies` to verify every table has RLS enabled and has policies for SELECT, INSERT, UPDATE, DELETE.
- Never use `SECURITY DEFINER` in functions callable from the client. Use `SECURITY INVOKER` (the default).
- Make `tenant_id` columns have a DEFAULT set by a trigger or generated column, and add a CHECK constraint or policy that prevents UPDATE on `tenant_id`.
- Create a `verify_rls_coverage()` function that runs in CI and fails the build if any table lacks complete policies.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** HIGH — documented Supabase/PostgreSQL behavior

### 1.3 Schema Migration Fails Midway Across 100+ Tenants
**What goes wrong:** When you need to ALTER TABLE across all tenant schemas (e.g., adding a column), you run a loop that applies the migration to each schema sequentially. If it fails at schema #47 out of 120, you have 47 schemas with the new column and 73 without. Your application code that references the new column will crash for the 73 un-migrated tenants. Rolling back the 47 successful ones is non-trivial, especially if data has already been written to the new column.
**Warning signs:** Migration scripts that iterate over schemas without transaction management. Migrations that take longer than 30 seconds per schema (risk of lock timeouts). No tracking of which schemas have been migrated.
**Prevention:**
- Create a `schema_migrations` table in each tenant schema (or a central `public.tenant_migrations` table) that tracks which migrations have been applied to which tenant.
- Wrap each per-tenant migration in its own transaction — if one fails, it rolls back only that tenant. Record success/failure.
- Build a migration runner that can resume from the last failure point (idempotent migrations).
- For destructive migrations (DROP COLUMN, type changes), use a two-phase approach: Phase A deploys code that handles both old and new schema, Phase B runs the migration, Phase C removes old-schema handling.
- Test migrations against a staging tenant schema before running across all.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** HIGH — standard distributed migration problem

### 1.4 Connection Pool Exhaustion with Many Schemas
**What goes wrong:** Each time you `SET search_path = tenant_schema`, you're changing session state on the connection. If you use a connection pool (Supabase uses PgBouncer in transaction mode), `SET` commands are session-level and may leak across requests when the connection is returned to the pool. In transaction mode, PgBouncer resets session state between transactions — but `search_path` set outside a transaction may persist.
With 100+ tenants, if each request opens a new connection instead of reusing pooled ones (because `search_path` doesn't match), you exhaust the pool. Supabase free tier has a hard limit of ~60 direct connections and the pooler handles more but not unlimited.
**Warning signs:** `FATAL: too many connections` errors in Supabase logs. Increasing response times under moderate load. Requests timing out waiting for a connection.
**Prevention:**
- Always set `search_path` INSIDE the transaction, not as a session-level SET. This way PgBouncer's transaction mode resets it properly.
- Use `SET LOCAL search_path = 'tenant_schema'` which is transaction-scoped and automatically reset.
- Alternatively, use fully-qualified table names (`tenant_schema.alerts` instead of just `alerts`) and never change `search_path` at all — this is the safest approach with PgBouncer.
- Monitor connection counts via Supabase dashboard and set up alerts at 70% capacity.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** High
**Confidence:** HIGH — well-documented PgBouncer behavior

### 1.5 Supabase Service Role Key in Backend Bypasses All RLS
**What goes wrong:** The Supabase `service_role` key bypasses ALL RLS policies. This is by design — it's for server-side admin operations. But if your Node.js/Express backend uses the service_role key for ALL queries (because "it's the backend, it needs access"), you've effectively disabled multitenant isolation at the database level. Any bug in your application code (wrong tenant ID in a query, missing WHERE clause) becomes a data leak.
**Warning signs:** Backend code that initializes a single Supabase client with `service_role` key for all operations. No use of `anon` key or user-impersonation in backend queries.
**Prevention:**
- Use the `service_role` key ONLY for admin operations (creating schemas, running migrations, managing users).
- For tenant data queries, use the user's JWT to create a per-request Supabase client: `supabase.auth.setSession(userJWT)`. This ensures RLS is enforced even on backend queries.
- Alternatively, use the service_role key but set `request.jwt.claims` via RPC to impersonate the user context for RLS evaluation.
- Audit every backend endpoint to verify it uses the correct client (tenant-scoped vs admin).
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** HIGH — documented Supabase behavior

---

## 2. Satellite API (Copernicus/Sentinel)

### 2.1 Copernicus API Requests Fail Silently or Return Empty Results
**What goes wrong:** The Copernicus Data Space Ecosystem (CDSE) API, which replaced the old Copernicus Open Access Hub (SciHub) in 2023, has several modes of silent failure:
1. **Catalog search returns 0 results** — not an error, just an empty array. This happens when the time range has no satellite passes over the area of interest (AOI), when cloud coverage filters are too strict, or when the product hasn't been ingested yet (Sentinel products can take 2-24 hours to appear in the catalog after acquisition).
2. **Download URL returns 403** — the product exists in the catalog but hasn't been moved to "online" storage. Copernicus has a tiered storage system; older products (>30 days for some collections) are in offline/long-term storage and need to be "ordered" before download. The order can take hours.
3. **API returns 200 but the response body is truncated or malformed** — happens under heavy load on the CDSE infrastructure, especially during peak European hours.
**Warning signs:** CRON job logs showing 0 alerts created for known active assets. Download jobs silently completing with no images stored. Alert generation working for some regions but not others.
**Prevention:**
- Treat 0 results as a distinct state: log it, increment a "no_data_passes" counter on the asset, and alert the operator if an asset has had 0 satellite passes for >12 days (Sentinel-1 revisit time is 6-12 days depending on latitude).
- Implement product availability checking: query the catalog, check if the product is "ONLINE", and if not, submit an order and retry in a subsequent CRON cycle.
- Validate response bodies before parsing. Check Content-Length header matches actual body length.
- Cache catalog results to avoid repeated queries for the same time window.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Critical
**Confidence:** MEDIUM — based on known CDSE architecture and community reports from training data. Verify current quotas against https://documentation.dataspace.copernicus.eu/Quotas.html during Phase 3.

### 2.2 Sentinel-1 SAR Look-Alikes Cause False Positives
**What goes wrong:** Sentinel-1 SAR detects oil spills by identifying areas of low radar backscatter on the ocean surface (oil dampens capillary waves, making the surface smoother). However, several natural phenomena produce identical low-backscatter signatures:
1. **Biogenic slicks** — natural oils from phytoplankton blooms, common in tropical/subtropical waters. Can look identical to petroleum spills on SAR.
2. **Low-wind zones** — areas with wind speed below ~3 m/s produce calm water that mimics oil slick signatures. Very common in sheltered waters, near coastlines, and at dawn/dusk.
3. **Rain cells** — heavy rain can locally dampen wave patterns, creating dark patches on SAR.
4. **Ship wakes** — turbulence behind vessels can produce elongated low-backscatter signatures.
5. **Internal waves** — subsurface ocean phenomena that modulate surface roughness.
The false positive rate for automated SAR-based oil spill detection is typically 30-70% without additional context (wind data, AIS ship tracking, historical patterns).
**Warning signs:** Alerts triggering in the same areas repeatedly without corresponding real incidents. Alerts concentrated at dawn/dusk. Alerts in open ocean far from any infrastructure.
**Prevention:**
- ALWAYS cross-reference SAR detections with wind speed data (from ERA5 or Copernicus Marine). Discard detections where wind speed is <3 m/s or >12 m/s (too little wind = false positive, too much wind = oil breaks up and is undetectable).
- Use the Claude API analysis as a SECOND opinion, not a confirmation. Include wind data, asset proximity, and historical patterns in the prompt context.
- Assign confidence levels: SAR-only = LOW confidence, SAR + wind confirmation = MEDIUM, SAR + wind + proximity to asset = HIGH, SAR + optical confirmation (Sentinel-2) = VERY HIGH.
- Store all detections (including discarded) for training data and audit trail.
- Include a manual review step for all detections below HIGH confidence before creating tickets.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Critical
**Confidence:** HIGH — well-established remote sensing science, extensively documented in peer-reviewed literature

### 2.3 Copernicus Free Tier Quota Limits Hit During Scaling
**What goes wrong:** The Copernicus Data Space Ecosystem free tier has quotas that are generous for individual researchers but restrictive for production SaaS:
- **Processing API (Sentinel Hub):** Limited "processing units" per month. Each image request consumes PUs based on resolution, area, and band count. A full Sentinel-1 IW scene at native resolution (~5x20m) for a large AOI can consume significant PUs.
- **Catalog/Download API:** Rate limits on concurrent requests (typically 2-4 concurrent downloads on free tier). Download bandwidth may be throttled.
- **Monthly volume:** Free tier typically allows a fixed number of requests or data volume per month. With 50+ assets scanned every 6 hours, you'll hit quota within the first week.
The exact numbers change over time and differ between CDSE services (OData API vs Sentinel Hub Process API vs direct download).
**Warning signs:** HTTP 429 responses from Copernicus APIs. Downloads taking progressively longer. Monthly quota exhausted in the first week of the month.
**Prevention:**
- Start with the free tier but architect for paid tier from day 1. Use an abstraction layer (a `SatelliteProvider` interface) so you can switch to Sentinel Hub paid tier or Planet Labs without rewriting.
- Implement request queuing with backoff: queue satellite image requests and process them at a rate below the quota limit.
- Cache aggressively: once a satellite image is downloaded and analyzed, store the result. Never re-download the same scene.
- Batch requests by geographic proximity: if multiple assets are within the same Sentinel-1 swath (~250km width), fetch one scene and crop for each asset instead of making separate requests.
- Track quota usage in your database and pause non-critical scans when approaching limits.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** MEDIUM — quota specifics vary and should be verified against current CDSE documentation at implementation time

### 2.4 Sentinel-1 Revisit Gaps at Low Latitudes
**What goes wrong:** Sentinel-1's revisit time depends on latitude. At high latitudes (>60 degrees), orbits overlap and revisit can be 1-3 days. At equatorial latitudes (common for oil operations in Brazil, Ecuador, Nigeria), revisit time stretches to 6-12 days. After the failure of Sentinel-1B in December 2021 (with Sentinel-1C launched in late 2024 to replace it), coverage gaps widened significantly. For assets in equatorial regions, there may be no usable SAR image for 10+ days.
**Warning signs:** Assets in tropical regions showing "no data" status for extended periods. Users complaining about stale monitoring data. Gap between "near real-time" marketing promise and actual data freshness.
**Prevention:**
- Set explicit SLA expectations per region in the UI. Show "Last satellite pass: X days ago" and "Next expected pass: ~Y" on each asset.
- Supplement Sentinel-1 with Sentinel-2 optical data (5-day revisit globally) for visual confirmation, while clearly communicating that optical doesn't work through clouds.
- Pre-compute Sentinel-1 overpass schedules using orbital prediction tools (e.g., the ESA SNAP desktop application or the `sentinelsat` Python library can approximate future passes).
- For premium clients, integrate commercial SAR providers (ICEYE, Capella Space) as an upsell — daily revisit for critical assets.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — orbital mechanics are deterministic, Sentinel-1B loss is documented

---

## 3. Claude API + Image Analysis

### 3.1 Token Cost Explosion with Base64 Satellite Images
**What goes wrong:** Claude's vision API calculates token cost based on image dimensions. A full Sentinel-1 GRD scene can be thousands of pixels in each dimension. When encoded as base64 and sent to the API:
- Images are resized internally but the cost is still based on the original dimensions up to Claude's maximum.
- A 1568x1568 image consumes roughly 1,600 tokens. But a 4096x4096 satellite crop could cost significantly more.
- With `claude-opus-4-5` at ~$15/million input tokens, scanning 100 assets every 6 hours = 400 API calls/day. If each sends a 2000-token image + 500-token prompt + 500-token response, that's ~$18/day just on AI analysis. Scale to 500 assets and you're at $90/day = $2,700/month.
- Base64 encoding increases payload size by ~33% compared to the raw image, increasing upload time and bandwidth costs.
**Warning signs:** Anthropic billing dashboard showing unexpectedly high costs. API response times increasing (large payloads take longer to process). CRON jobs not completing within the 6-hour window.
**Prevention:**
- Pre-process images before sending to Claude: resize to maximum 1024x1024, convert to JPEG with quality 80 (satellite imagery doesn't need lossless for visual analysis).
- Use URL-based image passing if available instead of base64 (reduces payload size).
- Implement a two-tier analysis: first pass with `claude-sonnet-4-6` (cheaper, ~$3/M input) as a triage to detect obvious anomalies. Only escalate to `claude-opus-4-5` when the sonnet model flags something with >50% confidence. This can reduce opus costs by 80-90%.
- Track per-tenant AI costs and build cost caps into the subscription model.
- Cache analysis results: if the satellite image hasn't changed (same scene ID), don't re-analyze.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** MEDIUM — token pricing and image handling details should be verified against current Anthropic pricing docs at implementation time

### 3.2 Claude Returns Invalid or Unstructured JSON
**What goes wrong:** Even with explicit JSON schema instructions in the prompt, Claude can:
1. Return JSON wrapped in markdown code fences (```json ... ```) that breaks `JSON.parse()`.
2. Include "thinking" text before the JSON ("Based on my analysis, here is the result: {...}").
3. Return valid JSON but with missing fields, extra fields, or wrong types (e.g., confidence as a string "high" instead of a number 0.85).
4. On rare occasions, return truncated JSON if the response hits the `max_tokens` limit mid-output.
5. Hallucinate field values — stating high confidence when the image is actually ambiguous.
**Warning signs:** CRON jobs logging JSON parse errors. Alerts with missing severity levels. Database INSERT failures due to schema violations. Inconsistent data in the alerts table.
**Prevention:**
- Use Anthropic's tool use (function calling) feature instead of raw JSON prompting. Tool use forces Claude to return structured output matching a defined schema. This eliminates markdown wrapping, preamble text, and most schema violations.
- If using raw JSON: strip markdown fences with a regex before parsing. Use a JSON schema validator (e.g., `ajv` or `zod`) after parsing to verify all required fields are present and correctly typed.
- Set `max_tokens` high enough (at least 1024) that the response won't truncate. Monitor for truncation by checking if the response's `stop_reason` is `max_tokens` vs `end_turn`.
- For confidence scores, calibrate by running Claude against known positive/negative test images and measuring actual accuracy. Do not trust the model's self-reported confidence without calibration.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — well-documented Claude API behavior and common LLM integration pattern

### 3.3 Rate Limiting During Bulk CRON Scans
**What goes wrong:** Anthropic applies rate limits per API key based on tier: requests per minute (RPM) and tokens per minute (TPM). A CRON job that fires 200 Claude API calls simultaneously (one per asset) will immediately hit the RPM limit. Rate-limited requests return HTTP 429 with a `retry-after` header. If the CRON job doesn't handle 429s, those assets get no analysis for that cycle.
**Warning signs:** 429 errors in CRON job logs. Some assets consistently analyzed while others are always skipped. Uneven alert distribution across assets.
**Prevention:**
- Implement a queue-based approach: enqueue all analysis tasks and process them with a controlled concurrency (e.g., 5 concurrent requests) with exponential backoff on 429s.
- Use Anthropic's batch API if available for non-time-critical analysis — it offers 50% cost savings and higher throughput limits.
- Stagger CRON scans: instead of scanning all assets every 6 hours, distribute them across the 6-hour window (e.g., scan 1/6 of assets every hour).
- Monitor Anthropic's rate limit headers (`x-ratelimit-limit-requests`, `x-ratelimit-remaining-requests`) and adjust concurrency dynamically.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — standard API rate limiting behavior

### 3.4 Claude Hallucinating Spill Detections (False Positives from AI)
**What goes wrong:** Claude is a general-purpose LLM, not a domain-specific remote sensing model. It may:
1. Identify dark patches in SAR images as spills when they're shadows, land features, or artifacts.
2. Over-interpret ambiguous imagery to "be helpful" — LLMs have a bias toward providing an answer rather than saying "inconclusive."
3. Be inconsistent across runs — the same image sent twice may get different confidence scores.
4. Lack the domain knowledge to differentiate biogenic slicks from petroleum slicks.
If the system auto-creates tickets from Claude's analysis without human review, operators will be flooded with false positives and will stop trusting the system within weeks.
**Warning signs:** Alert volume much higher than expected. Operators marking most alerts as "false positive." Confidence scores clustered around 0.6-0.8 (model is uncertain but reporting as moderate confidence). Same image analyzed twice producing different results.
**Prevention:**
- NEVER auto-create tickets from AI analysis alone. Use a tiered workflow: AI flags anomalies -> human reviewer confirms -> ticket created. (Can be auto-created only for VERY HIGH confidence with multiple confirming signals.)
- Include explicit "I cannot determine" as a valid response option in the prompt/tool schema. Calibrate the prompt to prefer false negatives over false positives ("If uncertain, report as no_anomaly_detected").
- Run each image through the analysis 2-3 times and take the consensus (majority vote). This catches stochastic inconsistency.
- Build a feedback loop: when operators mark alerts as false positive/true positive, store this as training data for prompt refinement.
- Set temperature to 0 for deterministic outputs in analysis tasks.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Critical
**Confidence:** HIGH — well-known LLM limitation, amplified in high-stakes domain

---

## 4. CRON Job Reliability

### 4.1 CRON Run Overlaps: Previous Cycle Not Finished When Next Starts
**What goes wrong:** The CRON is set to run every 6 hours. But a run that processes 200 assets with satellite download + AI analysis could take 4-8 hours depending on Copernicus API speed, Claude API latency, and retry backoff. If a run takes 7 hours, the next scheduled run starts while the first is still running. This causes:
1. Duplicate alerts for the same satellite scene (both runs analyze the same image).
2. Database deadlocks if both runs try to UPDATE the same asset record.
3. Doubled API costs (Copernicus and Claude).
4. Memory pressure from two concurrent runs.
**Warning signs:** Duplicate alerts with timestamps 6 hours apart but referencing the same satellite scene. Increasing memory usage on the Render dyno. Database lock timeout errors.
**Prevention:**
- Use a distributed lock (Redis `SETNX` or a `cron_locks` table in Supabase) that the CRON job acquires before starting and releases on completion. If the lock is held, the new run skips or queues.
- Record the start and end time of each CRON run in a `cron_runs` table. The next run checks if the previous one completed.
- Set a maximum runtime for CRON jobs (e.g., 5 hours). If exceeded, the run terminates gracefully, marking unprocessed assets for the next cycle.
- Use a job queue (Bull/BullMQ with Redis, or `pg-boss` with PostgreSQL) instead of a naive CRON. Job queues handle concurrency, retries, and deduplication natively.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — standard distributed systems problem

### 4.2 Render Free Tier Dyno Sleeping Misses CRON Triggers
**What goes wrong:** Render's free tier spins down services after ~15 minutes of inactivity. A sleeping service doesn't execute CRON jobs. Even on paid tiers, Render's native CRON service has limitations. If you're using `node-cron` or similar in-process CRON library, the CRON only runs while the Node.js process is alive. A sleeping dyno means:
1. The 6-hour CRON simply doesn't fire during sleep periods.
2. When the service wakes up (on the next HTTP request), the CRON library has "missed" its scheduled time. Most in-process CRON libraries don't fire missed events.
3. Users see stale data and assume the system is broken.
**Warning signs:** Gaps in the `cron_runs` table during off-peak hours. Alerts only appearing during business hours when users are actively using the platform. First morning request taking 30+ seconds (cold start).
**Prevention:**
- Use Render's paid tier ($7/month starter) which doesn't sleep. For a B2B SaaS, this is non-negotiable for production.
- Use an external CRON trigger (e.g., cron-job.org, UptimeRobot, or Cloudflare Workers scheduled triggers) that hits your API endpoint to trigger the scan, instead of relying on in-process scheduling.
- Implement a "catch-up" mechanism: on startup, check the last CRON run time. If it's been more than 6 hours, immediately trigger a scan.
- Use Render's native Cron Jobs feature (separate service type) rather than in-process scheduling — these run on their own infrastructure and aren't affected by web service sleeping.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Critical
**Confidence:** HIGH — documented Render behavior

### 4.3 Duplicate Alert Creation from CRON Retries and Idempotency Failures
**What goes wrong:** A CRON run analyzes a satellite image, detects an anomaly, and creates an alert. The database INSERT succeeds but the CRON job crashes before marking the scene as "processed." On the next run (or retry), the same scene is analyzed again and a duplicate alert is created. Over time, operators see 2-5 alerts for the same incident, eroding trust.
**Warning signs:** Multiple alerts with the same geographic coordinates and similar timestamps. Operators regularly merging duplicate tickets. Alert count much higher than actual incident count.
**Prevention:**
- Create a UNIQUE constraint on `(asset_id, satellite_scene_id, detection_type)` in the alerts table. Use `INSERT ... ON CONFLICT DO NOTHING` to prevent duplicates.
- Record processed scene IDs in a `processed_scenes` table BEFORE creating alerts (mark as "processing", then "completed" after alert creation).
- Make the entire detection pipeline idempotent: processing the same scene twice should produce the same alert (or skip if already exists) without side effects.
- Include a deduplication window: if an alert for the same asset with the same detection type exists within the last 24 hours, don't create a new one — update the existing one instead.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — standard idempotency concern

### 4.4 Memory Leaks in Long-Running Node.js CRON Processes
**What goes wrong:** A Node.js process running CRON jobs that process satellite images accumulates memory over time:
1. **Buffer accumulation:** Downloading satellite images (100MB+ GeoTIFF files) into Node.js Buffers. If references aren't released, the garbage collector can't reclaim them.
2. **Unreleased sharp/jimp instances:** Image processing libraries allocate native memory outside the V8 heap. If you process images but don't explicitly `.destroy()` or release references, native memory grows unbounded.
3. **Event listener leaks:** Each CRON cycle creates HTTP connections, database connections, and event listeners. If error paths don't clean up, listeners accumulate.
4. **Supabase client instances:** Creating a new Supabase client per request without cleanup.
Render kills processes that exceed their memory allocation (512MB on starter plans). A single killed CRON process can leave assets in a "processing" state permanently.
**Warning signs:** Render dyno memory usage increasing monotonically in the dashboard. Process restarts (OOM kills) in Render logs. `process.memoryUsage().heapUsed` growing over time.
**Prevention:**
- Stream satellite image downloads to disk (or Supabase Storage) instead of loading entirely into memory. Process images in chunks.
- Use `--max-old-space-size=384` to set a V8 heap limit below the container limit, giving room for native memory.
- Implement a health check that monitors `process.memoryUsage()` and gracefully restarts if heap exceeds 70% of available memory.
- Use `worker_threads` for image processing to isolate memory — when the worker thread terminates, all its memory is reclaimed.
- Run the CRON job as a separate Render service (background worker) from the API server, so a CRON crash doesn't take down the API.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — well-documented Node.js behavior

---

## 5. Supabase Realtime

### 5.1 Connection Limits Per Project Exhausted
**What goes wrong:** Supabase Realtime uses WebSocket connections. Each connected client (browser tab, mobile app) holds one connection. Supabase free tier allows ~200 concurrent Realtime connections. Pro tier allows more but still has limits. In a B2B context:
- Each logged-in operator has at least 1 connection.
- If they open multiple tabs, each tab creates a new connection.
- Mobile app adds another connection per user.
- If connections aren't cleaned up on logout/navigation, zombie connections persist until timeout (default 60 seconds).
At 50 concurrent users with 2 tabs each + mobile = 150 connections. Add the backend's own Realtime subscriptions for monitoring = you're near the limit.
**Warning signs:** Users reporting that alerts stop appearing in real-time. Supabase dashboard showing connection count near the limit. Intermittent WebSocket disconnection errors in browser console.
**Prevention:**
- Implement connection multiplexing: use a single Realtime channel per tenant (not per table). Subscribe to a tenant-level channel and filter events client-side.
- Unsubscribe from channels on component unmount and page navigation. Use React cleanup effects (`useEffect` return function) to remove subscriptions.
- Set up a connection counter in the backend that monitors `supabase.getChannels()` and alerts at 70% capacity.
- For the free tier, cap at one connection per user (detect duplicate tabs and show a "already connected in another tab" warning).
- Consider upgrading to Supabase Pro ($25/month) early — the connection limit on free tier will be hit before other limits.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** High
**Confidence:** MEDIUM — exact connection limits should be verified against current Supabase pricing/docs

### 5.2 Reconnection After Network Drop Causes Missed Events
**What goes wrong:** When a client's network drops (common on mobile, unreliable corporate networks), the WebSocket disconnects. Supabase's JavaScript client has built-in reconnection, but events that occurred during the disconnection window are LOST. Realtime is a live stream, not a message queue — there's no replay or catch-up mechanism.
For an oil spill monitoring platform, a 30-second network drop during which a critical alert was generated means the operator doesn't see it until they refresh the page.
**Warning signs:** Operators reporting they "never got the alert" but it exists in the database. Inconsistent alert counts between operators viewing the same dashboard.
**Prevention:**
- Implement a "catch-up" query on reconnection: when the Realtime channel reconnects (listen for `SUBSCRIBED` event after `CLOSED`), query the database for all events since the last received event's timestamp.
- Use a hybrid approach: Realtime for instant push + polling every 60 seconds as a safety net to catch missed events.
- Store the timestamp of the last received Realtime event in client state. On reconnect, fetch all events newer than that timestamp.
- Show a visual indicator when Realtime is disconnected ("Live updates paused — reconnecting...") so operators know to manually refresh if needed.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** High
**Confidence:** HIGH — fundamental limitation of WebSocket-based systems without message queues

### 5.3 RLS Not Applied to Realtime Subscriptions (Or Applied Incorrectly)
**What goes wrong:** Supabase Realtime DOES apply RLS to Postgres Changes (database change events) — but only if RLS is enabled on the table AND the client is authenticated. However:
1. If you use the `service_role` key for Realtime subscriptions (bypasses RLS), events from ALL tenants flow to that subscription.
2. Broadcast and Presence channels do NOT go through the database, so RLS doesn't apply to them. If you use Broadcast to send custom events, you need to implement your own authorization.
3. If RLS policies use `auth.uid()` but the Realtime connection was established before the user's JWT expired or was revoked, the subscription continues receiving events until the WebSocket reconnects and re-evaluates the JWT.
**Warning signs:** Tenant A seeing alerts from Tenant B in their real-time feed. Broadcast messages leaking across tenant channels. Fired/revoked users continuing to receive events.
**Prevention:**
- Use tenant-specific channel names: `tenant:{tenant_id}:alerts` instead of generic `alerts`. This adds a layer of isolation on top of RLS.
- Never use `service_role` key in client-side Realtime subscriptions.
- For Broadcast channels, validate the tenant context server-side before broadcasting events.
- Implement JWT refresh checks: when a JWT is nearing expiration, refresh it. When a user is deactivated, force-disconnect their Realtime connection server-side.
- Test cross-tenant isolation explicitly: log in as Tenant A and verify Tenant B's events don't appear.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** MEDIUM — Supabase Realtime's RLS behavior has evolved over versions. Verify against current Supabase docs during implementation.

---

## 6. PDF Generation (Puppeteer on Render)

### 6.1 Headless Chrome OOM on Render's Memory-Limited Containers
**What goes wrong:** Puppeteer launches a Chromium browser instance to render HTML to PDF. Chromium is a memory hog — a single instance uses 100-300MB. Render's starter plan has 512MB total. If the ESG report template includes:
- Embedded satellite images (each 1-5MB)
- Complex charts (Chartjs/D3 rendered in the browser context)
- Multiple pages (a full ESG report can be 20+ pages)
Chromium's rendering process will OOM-kill, producing either a truncated PDF, a corrupted PDF, or crashing the entire Node.js process.
**Warning signs:** PDF generation silently producing 0-byte files. Render logs showing `SIGKILL` on the process. PDF generation working for small reports but failing for larger ones. Render dyno restarting during PDF generation.
**Prevention:**
- Use `puppeteer-core` with `@sparticuz/chromium` (lightweight Chromium build optimized for serverless/containers, ~50MB vs ~200MB for full Chromium).
- Process images before embedding: resize satellite images to 800px max width, compress to JPEG quality 70. A 20-page report shouldn't need more than 5MB of embedded images.
- Generate PDFs on a SEPARATE Render service with higher memory (1GB+). Don't generate on the API server.
- Implement a page-by-page generation approach for large reports: render each section as a separate PDF, then merge with `pdf-lib` (pure JavaScript, no Chromium needed for merging).
- Set `--disable-dev-shm-usage` and `--no-sandbox` Chromium flags for containerized environments.
- Consider alternatives: `@react-pdf/renderer` generates PDFs without Chromium (pure Node.js). For ESG reports with fixed layouts, this is far more memory-efficient.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — well-documented Puppeteer-in-containers challenge

### 6.2 Font Rendering Issues in Docker/Linux Environments
**What goes wrong:** Render runs Linux containers. Chromium on Linux needs system fonts installed. Default containers often lack:
- Latin-extended characters (accented characters for Spanish: a, n, u)
- Proper font fallbacks (the PDF shows squares or question marks instead of special characters)
- Custom brand fonts referenced in CSS
The ESG report renders perfectly on the developer's Mac but produces garbled text in production.
**Warning signs:** PDFs with missing characters, squares, or mojibake. Spanish text looking correct in English but broken in accented characters. Different fonts appearing in production vs development PDFs.
**Prevention:**
- Include `fonts-liberation`, `fonts-noto`, and `fonts-noto-color-emoji` in the Docker build (or Render's `apt` packages).
- Use Google Fonts loaded via CSS `@import` — Chromium will fetch them during rendering. But add a `waitUntil: 'networkidle0'` to ensure fonts are loaded before PDF generation.
- Test PDF generation in the CI pipeline using the same Docker image as production.
- Embed fonts directly in the HTML template using base64-encoded `@font-face` declarations for guaranteed availability.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Medium
**Confidence:** HIGH — well-known Docker/Chromium issue

### 6.3 PDF Generation Timeout on Large ESG Reports
**What goes wrong:** A comprehensive ESG report with satellite imagery, charts, timelines, and compliance tables can take 30-60 seconds to render as PDF. If the API endpoint has a 30-second timeout (common default for Render and Express), the request times out before the PDF is complete. The user sees an error, retries, and now two PDF generation processes are running simultaneously.
**Warning signs:** Timeout errors on the ESG report download endpoint. Users reporting "blank" or partially downloaded PDFs. Multiple concurrent Chromium instances in Render's process list.
**Prevention:**
- Generate PDFs asynchronously: the API endpoint starts the generation, returns immediately with a job ID, and the client polls for completion (or receives a Realtime notification when done).
- Store generated PDFs in Supabase Storage. The download endpoint serves from storage, not from live generation.
- Cache generated reports: if the underlying data hasn't changed, serve the cached PDF instead of regenerating.
- Set explicit timeouts on Puppeteer operations: `page.goto(url, { timeout: 60000 })` and `page.pdf({ timeout: 60000 })`.
- Implement a report generation queue (Bull/BullMQ) so only one report generates at a time, preventing memory competition.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Medium
**Confidence:** HIGH — standard async processing pattern

---

## 7. Digital Signatures (RSA-2048 + SHA-256)

### 7.1 RSA Key Generation Blocking the Event Loop
**What goes wrong:** Generating an RSA-2048 key pair using `node-forge` or Node.js's built-in `crypto.generateKeyPair` is CPU-intensive (100-500ms). If done synchronously on the main thread, it blocks ALL incoming requests during generation. If done during a CRON job that generates multiple reports, each key generation adds latency.
Even worse: if the system generates a NEW key pair for each report (instead of using a persistent signing key), you're paying this cost hundreds of times per day unnecessarily.
**Warning signs:** API response times spiking during report generation. Event loop lag increasing (measurable with `perf_hooks`). Requests queuing during CRON runs.
**Prevention:**
- Generate key pairs ONCE during tenant onboarding, not per report. Store the key pair persistently (see 7.2).
- Use `crypto.generateKeyPairSync` ONLY during initial setup (not in request path). For any runtime generation, use the async `crypto.generateKeyPair` with a callback.
- Better yet, use `crypto.sign()` and `crypto.verify()` from Node.js built-in crypto (which is a C++ binding, much faster than pure-JS `node-forge`).
- If using `node-forge`, perform key generation in a `worker_thread` to avoid blocking the event loop.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Medium
**Confidence:** HIGH — well-documented Node.js crypto behavior

### 7.2 Private Key Storage: Where to Put It Securely
**What goes wrong:** The RSA private key used to sign ESG reports is the most sensitive credential in the system. Common mistakes:
1. **Stored in the database as plaintext** — if the database is compromised, all past and future signatures are compromised.
2. **Stored in environment variables** — works but env vars can leak through process listings, error messages, or logging.
3. **Hardcoded in source code** — committed to git, exposed to all contributors.
4. **Stored in Supabase Storage** — accessible via the API, potentially downloadable.
5. **One key pair per tenant stored in tenant schema** — if cross-tenant access occurs (see Section 1), attacker can sign forged reports for any tenant.
**Warning signs:** Private keys visible in `git log`. Keys in `.env` files that are committed or shared via Slack. Keys stored in database tables without encryption.
**Prevention:**
- Use a dedicated secrets manager: Render's environment variables (encrypted at rest) for the MASTER signing key, with per-tenant keys derived from the master using HKDF.
- Better: use Render's secret files feature or an external KMS (AWS KMS, Cloudflare Workers KMS) for the master key. The master key never leaves the KMS — signing operations are delegated to the KMS.
- If storing per-tenant keys in the database, encrypt them at rest using the master key (envelope encryption pattern). The database stores `encrypt(tenant_private_key, master_key)`.
- Rotate keys periodically. Include the key ID in the signed PDF metadata so old signatures can be verified with the correct key even after rotation.
- Audit access to private keys: log every signing operation with timestamp, report ID, and tenant.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** Critical
**Confidence:** HIGH — standard cryptographic key management

### 7.3 Report Regeneration Invalidates Previous Signatures
**What goes wrong:** An ESG report is generated, signed with RSA-2048, and the SHA-256 hash is stored. The operator later requests regeneration (e.g., updated data, corrected error). The regenerated PDF has different content, so a different SHA-256 hash and a different signature. Now:
1. The old signature/hash stored in the audit trail no longer matches any existing file.
2. If the operator sent the old report to a regulator and the regulator checks the hash against the current report, it won't match.
3. There's no way to verify the old report unless it was stored.
**Warning signs:** Audit trail showing multiple signatures for the same report. Regulators reporting hash mismatches. Operators confused about which PDF version is "official."
**Prevention:**
- NEVER delete or overwrite a signed PDF. Signed reports are immutable artifacts. Store them in Supabase Storage with versioning.
- When regenerating, create a NEW report version (v2, v3) with its own signature. The old versions remain accessible.
- Maintain a `report_versions` table: `(report_id, version, pdf_url, sha256_hash, rsa_signature, signed_at, signed_by)`.
- Show version history in the UI: "This report has 3 versions. Version 1 (original), Version 2 (corrected), Version 3 (final)."
- Include the version number and timestamp in the PDF content itself so the document is self-documenting.
**Phase to address:** Phase 3 (AI + Satellite)
**Severity:** High
**Confidence:** HIGH — fundamental document integrity requirement

---

## 8. Internationalization (i18n)

### 8.1 Hardcoded Strings That Slip Through Despite i18n Setup
**What goes wrong:** `react-i18next` is configured, translation files exist, but developers still write:
1. `<button>Save</button>` instead of `<button>{t('common.save')}</button>` — especially in a rush or for "temporary" UI.
2. Error messages in backend Express API returned as English strings: `res.status(400).json({ error: "Invalid asset coordinates" })`.
3. Validation messages from Zod schemas: `z.string().min(3, "Name must be at least 3 characters")`.
4. Toast notifications, console-facing error messages, and email templates.
5. Dynamic strings constructed with template literals: `` `Found ${count} alerts` `` instead of `t('alerts.found', { count })`.
These hardcoded strings are invisible until someone switches to Spanish and sees a mix of ES and EN in the same page.
**Warning signs:** QA testing in Spanish reveals English strings scattered in the UI. Backend error messages always in English regardless of Accept-Language header. Validation errors showing raw English text.
**Prevention:**
- Add an ESLint rule (`eslint-plugin-i18next/no-literal-string`) that flags any JSX text content not wrapped in `t()`. Enforce it in CI — no merge without passing.
- Create a backend i18n middleware that uses the `Accept-Language` header (or user's locale preference) to translate API error messages.
- Use i18n keys in Zod schemas: `z.string().min(3, { message: 'validation.name_min_length' })` and resolve the key on the frontend.
- Maintain a script that extracts all `t()` keys and compares them against translation JSON files. Flag missing keys in CI.
- Do a weekly "Spanish QA pass" — use the entire app in Spanish for 10 minutes. Hardcoded strings become immediately obvious.
**Phase to address:** Phase 1 (Demo Frontend) and ongoing
**Severity:** Medium
**Confidence:** HIGH — universal i18n challenge

### 8.2 Date, Number, and Currency Formatting Differences
**What goes wrong:** Spanish (Latin America) and English (US) have different conventions:
- Dates: ES = "12/04/2026" (DD/MM/YYYY), EN = "04/12/2026" (MM/DD/YYYY). The ambiguous date "06/04/2026" means June 4 in EN but April 6 in ES. If the backend stores/returns dates as locale-formatted strings, data corruption occurs.
- Numbers: ES = "1.234,56" (period for thousands, comma for decimal), EN = "1,234.56". Parsing "1.234" as a number gives 1.234 in EN but 1234 in ES.
- Currency: BRL, ARS, USD all have different symbols and decimal rules. ARS has no cents in practice.
- Timestamps: UTC vs local timezone. Argentina is UTC-3 (no DST), Brazil has multiple timezones, US has 4+.
**Warning signs:** Dates displayed as "04/06/2026" with no way to know if it's April 6 or June 4. Number inputs accepting "1,5" in ES but failing validation. Reports showing wrong dates when generated in a different timezone than viewed.
**Prevention:**
- Store ALL dates as ISO 8601 UTC in the database. Never store locale-formatted date strings.
- Use `date-fns` or `Intl.DateTimeFormat` for display formatting — never manually format dates.
- Use unambiguous date formats in reports: "12 Apr 2026" or ISO 8601. Avoid MM/DD or DD/MM entirely in contexts where the locale is uncertain.
- Use `Intl.NumberFormat` for all number/currency display.
- Store and transmit numbers as actual numbers (not formatted strings). Format only at the display layer.
- Include timezone in all timestamp displays: "12 Apr 2026, 14:30 UTC-3".
**Phase to address:** Phase 1 (Demo Frontend) — establish patterns early
**Severity:** Medium
**Confidence:** HIGH — universal locale formatting challenge

---

## 9. Compliance and Security

### 9.1 API Key Exposure: Supabase Anon Key in Frontend Is Expected, But...
**What goes wrong:** Developers new to Supabase panic about the `anon` key being visible in the frontend bundle, then make one of two mistakes:
1. **They proxy everything through the backend** to "hide" the anon key — defeating the purpose of Supabase's direct client access and adding unnecessary latency.
2. **They use the `service_role` key in the frontend** because "the anon key doesn't have enough permissions" — this exposes the master key that bypasses ALL RLS.
The `anon` key is DESIGNED to be public. It's like a Firebase API key — it identifies the project but doesn't grant access beyond what RLS allows. The danger is when RLS is insufficient (see Section 1.2).
**Warning signs:** `service_role` key in frontend `.env` or bundled JavaScript. API requests from the browser containing the `service_role` key in the Authorization header. RLS policies that are too permissive because the developer assumed the key would stay secret.
**Prevention:**
- Document clearly in the project's CLAUDE.md / README: "The Supabase `anon` key is PUBLIC by design. Security comes from RLS, not key secrecy."
- Store `service_role` ONLY in backend environment variables (Render's env vars). Never in the frontend `.env`.
- Add a CI check: scan the frontend bundle for the `service_role` key string. If found, fail the build.
- Set up Supabase's built-in security advisor in the dashboard to detect overly permissive RLS policies.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** HIGH — well-documented Supabase security model

### 9.2 Audit Log Entries Commonly Missed
**What goes wrong:** Compliance frameworks (ISO 27001, SOC 2 Type II) require comprehensive audit logs. Common gaps:
1. **Authentication events** — login success/failure, password changes, magic link generation. Supabase Auth logs these internally but they're not easily queryable or exportable.
2. **Authorization failures** — RLS denials are silent (query returns empty set, not an error). You never know that Tenant B tried to access Tenant A's data.
3. **Data exports** — when a user downloads a CSV or PDF, there's no record of what data left the system.
4. **Configuration changes** — who changed the notification settings? Who added a new asset? Who modified a ticket?
5. **API key usage** — which external system used the API key and what did they access?
6. **Admin actions** — schema changes, user role modifications, tenant creation.
**Warning signs:** SOC 2 auditor asking "who accessed this data on this date?" and you can't answer. Incident investigation hampered by missing logs. Compliance audit finding gaps in the audit trail.
**Prevention:**
- Create an `audit_logs` table in each tenant schema with columns: `id, timestamp, user_id, action, resource_type, resource_id, old_value, new_value, ip_address, user_agent`.
- Use Supabase database triggers (or a PostgREST hook) to automatically log all INSERT, UPDATE, DELETE operations. This catches changes even from direct database access.
- Log at the API layer too (Express middleware) for context that triggers can't capture: IP address, user agent, session ID.
- Make audit logs append-only: no UPDATE or DELETE allowed on the audit_logs table (enforce via RLS + no policy for UPDATE/DELETE).
- Include data export events: log when a user downloads any report, CSV, or image.
- Pipe authentication events from Supabase Auth to your audit log using auth hooks or by querying `auth.audit_log_entries`.
**Phase to address:** Phase 2 (Backend + Database) — design from the start, hard to retrofit
**Severity:** Critical
**Confidence:** HIGH — standard compliance requirement

### 9.3 Cross-Tenant Data Leaks Through Shared Resources
**What goes wrong:** Even with perfect RLS on database tables, data can leak through shared resources:
1. **Supabase Storage buckets** — if images/PDFs are stored in a single bucket without per-tenant path policies, one tenant can guess another's file URL and access it.
2. **Realtime channels** — subscribing to a generic channel name receives events from all tenants (see Section 5.3).
3. **Search indexes** — if you implement full-text search across a shared table, results may include other tenants' data.
4. **Error messages** — a 500 error that includes a stack trace with another tenant's data in the query parameters.
5. **Caching** — if you cache API responses (Redis, in-memory) keyed only by resource ID without tenant ID, Tenant A could receive Tenant B's cached response.
6. **Logs** — centralized logging that includes request bodies with tenant data, accessible to support staff.
**Warning signs:** Any resource access pattern that doesn't include tenant_id in the key/path/filter. Cache keys like `alert:123` instead of `tenant:abc:alert:123`. Storage paths like `/reports/report_123.pdf` instead of `/tenants/abc/reports/report_123.pdf`.
**Prevention:**
- Storage: create per-tenant storage policies in Supabase. Use paths like `{tenant_id}/images/` and `{tenant_id}/reports/`. Add RLS-style policies on the storage bucket.
- Caching: ALWAYS include tenant_id in cache keys. Use a helper function: `cacheKey(tenantId, resourceType, resourceId)`.
- Error handling: use a global error handler that sanitizes error messages before returning them to clients. Never include SQL queries, stack traces, or other tenants' data in API responses.
- Logging: redact sensitive tenant data in production logs. Use structured logging with tenant_id as a field for filtering.
- Search: ensure all search queries include a `tenant_id` filter. Test by searching from one tenant's context and verifying zero results from other tenants.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** Critical
**Confidence:** HIGH — fundamental multitenant security concern

### 9.4 Missing Security Headers and CORS Misconfiguration
**What goes wrong:** A B2B SaaS targeting ISO 27001 / SOC 2 needs proper security headers. Common misses:
1. **CORS set to `*`** in development and left that way in production — any website can make API calls.
2. **Missing `Content-Security-Policy`** — allows XSS attacks through injected scripts.
3. **Missing `X-Frame-Options`** — allows clickjacking by embedding the app in an iframe.
4. **Missing `Strict-Transport-Security`** — allows downgrade attacks from HTTPS to HTTP.
5. **Missing `X-Content-Type-Options: nosniff`** — allows MIME type sniffing attacks.
Cloudflare provides some of these, but relying on infrastructure-level headers without verifying application-level headers creates gaps.
**Warning signs:** Security scanners (OWASP ZAP, SecurityHeaders.com) reporting missing headers. Penetration test findings. CORS errors in development that are "fixed" by setting `*`.
**Prevention:**
- Use the `helmet` middleware in Express — it sets all standard security headers with sensible defaults in one line.
- Configure CORS explicitly: `origin: ['https://oilriskmonitor.com', 'https://app.oilriskmonitor.com']`. Never use `*` in production.
- Add CSP headers that restrict script sources to your own domains.
- Verify headers using SecurityHeaders.com after deployment — aim for A+ rating.
- Configure Cloudflare WAF rules as an additional layer, not the only layer.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** High
**Confidence:** HIGH — standard web security practice

---

## 10. Infrastructure and Deployment

### 10.1 Supabase Free Tier Limits Hit Before Product-Market Fit
**What goes wrong:** Supabase free tier has hard limits that a B2B SaaS will hit early:
- 500MB database storage (satellite image metadata + audit logs fill this fast)
- 1GB file storage (satellite images + signed PDFs)
- 2GB bandwidth
- 50,000 monthly active users (generous for B2B but worth noting)
- Limited database compute (shared instance, can be slow under load)
- Edge Functions: 500K invocations/month
- Realtime: ~200 concurrent connections
Once you hit ANY of these limits, the project pauses (free tier) or you need to upgrade ($25/month Pro). The problem isn't the cost — it's the surprise downtime if you're not monitoring usage.
**Warning signs:** Supabase dashboard showing >70% usage on any metric. Intermittent 500 errors from Supabase. Slow query performance during CRON runs.
**Prevention:**
- Monitor Supabase usage metrics from day 1. Set up alerts at 70% of each limit.
- Budget for Supabase Pro ($25/month) from the first paying customer. This is a $300/year operating cost that removes most limits.
- Compress satellite images before storing in Supabase Storage.
- Implement data retention policies: archive old satellite images to cheaper storage (S3/R2) after 90 days, keeping only metadata in Supabase.
- Use Supabase's database size monitoring to track growth rate and predict when you'll hit limits.
**Phase to address:** Phase 2 (Backend + Database)
**Severity:** High
**Confidence:** MEDIUM — Supabase pricing/limits evolve. Verify current limits during implementation.

### 10.2 Netlify + Render + Cloudflare + Supabase: Too Many Moving Parts
**What goes wrong:** The stack has four infrastructure providers, each with its own:
- Deployment pipeline
- Environment variables
- Domain/DNS configuration
- SSL certificates
- Monitoring/logging
- Billing
- Outage potential
When something breaks at 2 AM, you need to figure out if the issue is in Netlify (frontend), Render (backend), Supabase (database/auth), or Cloudflare (DNS/CDN). Each provider has its own status page and support channel. Debugging a 503 error requires checking four dashboards.
**Warning signs:** Deploys where the frontend updates but the backend doesn't (or vice versa). DNS propagation delays between Cloudflare and Netlify. Supabase connection issues that appear as Render errors. Inconsistent environment variables across providers.
**Prevention:**
- Centralize monitoring: use Sentry (already in your MCP stack) for error tracking across both frontend and backend. Set up uptime monitoring (UptimeRobot or similar) for all four endpoints.
- Document the infrastructure map: which domain points where, which provider handles what. Keep this in `.planning/` as a reference.
- Use infrastructure-as-code where possible: Netlify has `netlify.toml`, Render has `render.yaml`. Commit these to the repo.
- Create a runbook for common outage scenarios: "If frontend returns 502 → check Netlify status → check Cloudflare → check DNS."
- Set up a single Slack/Telegram channel for all infrastructure alerts.
**Phase to address:** Phase 2 (Backend + Database) — establish patterns during first deployment
**Severity:** Medium
**Confidence:** HIGH — standard multi-provider ops challenge

---

## Phase-Specific Warning Summary

| Phase | Topic | Likely Pitfall | Severity | Mitigation |
|-------|-------|----------------|----------|------------|
| Phase 1 | Frontend i18n | Hardcoded strings slip in early, compound later | Medium | ESLint i18n rule from day 1 |
| Phase 1 | Date formatting | Ambiguous date formats established as patterns | Medium | Use ISO 8601 / unambiguous format patterns |
| Phase 2 | Schema-per-tenant | search_path injection, RLS gaps | Critical | Strict validation + automated RLS audit in CI |
| Phase 2 | Service role key | Used in frontend or for all backend queries | Critical | Separate clients for admin vs tenant operations |
| Phase 2 | Audit logging | Not designed in from the start, impossible to retrofit | Critical | Design audit_logs table in initial schema |
| Phase 2 | Supabase Realtime | Cross-tenant event leakage | Critical | Tenant-namespaced channels + RLS verification |
| Phase 2 | Security headers | Missing headers fail compliance audits | High | Helmet middleware + SecurityHeaders.com check |
| Phase 3 | SAR look-alikes | 30-70% false positive rate without wind data | Critical | Wind cross-reference + multi-signal confidence |
| Phase 3 | Claude hallucination | Auto-created tickets from unreliable AI | Critical | Tiered workflow: AI flags, human confirms |
| Phase 3 | CRON overlap | Duplicate alerts, doubled API costs | High | Distributed locks + job queue |
| Phase 3 | Render dyno sleeping | Missed CRON triggers | Critical | Paid tier or external CRON trigger |
| Phase 3 | Token costs | Base64 satellite images = expensive | High | Resize, compress, two-tier analysis |
| Phase 3 | PDF memory | Puppeteer OOM on Render | High | Lightweight Chromium or @react-pdf/renderer |
| Phase 3 | Key storage | Private signing key exposed | Critical | Secrets manager + envelope encryption |
| Phase 3 | Copernicus quotas | Free tier exhausted in first week | High | Request queuing + paid tier architecture |
| Phase 4 | Mobile Realtime | Reconnection misses events | High | Catch-up queries on reconnect |

---

## Confidence Notes

| Category | Confidence | Basis |
|----------|------------|-------|
| Schema-per-tenant (Section 1) | HIGH | PostgreSQL/PgBouncer behavior is well-documented and stable |
| Satellite API (Section 2) | MEDIUM | Copernicus CDSE is evolving; quotas/APIs may have changed since training data |
| Claude API (Section 3) | MEDIUM | Anthropic pricing/features evolve frequently; verify current docs |
| CRON jobs (Section 4) | HIGH | Standard distributed systems patterns |
| Supabase Realtime (Section 5) | MEDIUM | Realtime features/limits have evolved across Supabase versions |
| PDF generation (Section 6) | HIGH | Puppeteer containerization is well-documented |
| Digital signatures (Section 7) | HIGH | Standard cryptographic practices |
| i18n (Section 8) | HIGH | Universal web development challenge |
| Compliance (Section 9) | HIGH | Standard security practices and compliance requirements |
| Infrastructure (Section 10) | MEDIUM-HIGH | Provider-specific limits should be verified |

**Items flagged for live verification during implementation:**
- Copernicus CDSE current quota limits and API authentication flow
- Supabase current Realtime connection limits and RLS behavior
- Supabase current free/pro tier limits
- Anthropic current vision API token pricing and image size handling
- Render current CRON job and memory limit specifications
