# OIL RISK MONITOR AI — MASTER DOCUMENT PARA CLAUDE CODE
> Documento de arquitectura, flujos y especificaciones completas para implementación secuencial.
> Stack definitivo · Multitenant · Bilingual ES/EN · Claude AI · Satellite-powered

---

## 0. CONTEXTO Y VISIÓN DEL PRODUCTO

**Oil Risk Monitor AI** es una plataforma SaaS B2B multitenant de monitoreo satelital con IA para la industria Oil & Gas. Detecta derrames, fugas y anomalías operativas en tiempo real, genera tickets auditables, emite reportes ESG con firma digital y hash, y permite a empresas petroleras y aseguradoras gestionar su riesgo operativo y compliance desde un SOC centralizado estilo dashboard.

**Lema comercial:** "Hoy esto lo detectás tarde. Con Oil Risk Monitor AI, lo detectás antes."

### Clientes objetivo (tenants)
1. **Empresa petrolera / O&G operator** — monitorea sus propios activos (pozos, oleoductos, plantas)
2. **Aseguradora** — monitorea el portfolio de asegurados, audita resolución de incidentes
3. **Consultora ambiental** — accede como partner para análisis y reportes ESG

### Idiomas
- Interfaz completa en **Español e Inglés** (i18n desde día 1, toggle en navbar)

---

## 1. STACK TECNOLÓGICO DEFINITIVO

```
CAPA             TECNOLOGÍA                    MOTIVO
──────────────────────────────────────────────────────
Frontend         React + Vite + TailwindCSS    Stack estándar QATECH
UI Components    shadcn/ui                     Consistencia y velocidad
Deploy Frontend  Netlify                       CI/CD automático
Backend API      Node.js + Express             Stack estándar QATECH
Deploy Backend   Render                        Simple, confiable
Base de datos    Supabase (PostgreSQL)         Auth + DB + Storage + Realtime
Edge/CDN/WAF     Cloudflare                    Seguridad + performance global
IA Analysis      Claude API (Anthropic)        Análisis de imágenes + reportes
Satelital free   Sentinel-1 SAR (ESA)          Detección derrames, penetra nubes
Satelital free   Sentinel-2 Optical (ESA)      Análisis visual, NDVI, cambios
Satelital free   SAOCOM (CONAE Argentina)      Radar L-band, proyectos nacionales
Email alertas    Resend                        Simple, barato, buen DX
SMS alertas      Twilio                        SMS global confiable
Telegram alertas Telegram Bot API              Gratuito, inmediato
App Móvil        Expo (React Native)           Un codebase iOS + Android
Firma digital    node-forge + SHA-256          Hash + firma de reportes PDF
PDF Generator    Puppeteer / pdf-lib           Reportes ESG profesionales
Internacionaliz. react-i18next                 ES/EN desde día 1
Integración ext. REST API + Webhooks           Compatible SAP, Salesforce, Odoo
Autenticación    Supabase Auth                 Magic link + email/password
```

### Fase 1 — Demo con datos ficticios (Netlify primero)
- Frontend React completo con datos mock
- Todos los flujos visuales funcionando (dashboard, alertas, tickets, reportes)
- Sin backend real aún — datos hardcoded / localStorage
- Objetivo: validar UX, mostrar a clientes, conseguir el grant

### Fase 2 — Producto real (Supabase + Render)
- Backend Node.js completo
- Supabase como core de datos, auth y storage
- Integración satelital real (Copernicus APIs)
- Claude API para análisis de imágenes
- Alertas reales (email, SMS, Telegram)

---

## 2. ARQUITECTURA MULTITENANT

### Modelo de aislamiento: Schema-per-tenant en Supabase

```sql
-- Cada tenant tiene su propio schema en PostgreSQL
-- tenant_001.assets, tenant_001.alerts, etc.
-- Shared schema solo para auth y billing

public.tenants          -- directorio de tenants
public.users            -- usuarios globales
public.subscriptions    -- billing por tenant
public.integrations     -- conexiones externas por tenant

{tenant_slug}.assets           -- activos monitoreados
{tenant_slug}.zones            -- zonas geográficas
{tenant_slug}.satellite_scans  -- escaneos procesados
{tenant_slug}.anomalies        -- anomalías detectadas
{tenant_slug}.alerts           -- alertas generadas
{tenant_slug}.tickets          -- tickets de resolución
{tenant_slug}.ticket_events    -- historial de cada ticket
{tenant_slug}.reports          -- reportes ESG generados
{tenant_slug}.responsible      -- responsables configurados
{tenant_slug}.audit_log        -- log de auditoría completo
```

### Tipos de tenant
```
OPERATOR    → empresa petrolera, ve sus propios activos
INSURER     → aseguradora, ve portfolio de asegurados (readonly + audit)
CONSULTANT  → consultora, accede por invitación del operator
ADMIN       → superadmin de la plataforma (QATECH)
```

### RLS (Row Level Security) en Supabase
- Cada usuario solo puede ver datos de su tenant
- El INSURER puede ver datos de los operators que lo designaron como aseguradora
- Políticas RLS en cada tabla del tenant schema

---

## 3. MODELO DE DATOS COMPLETO

### Tabla: tenants
```sql
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- 'ypf-argentina', 'pan-american'
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('operator','insurer','consultant')),
  logo_url TEXT,
  primary_color TEXT DEFAULT '#FF6B00',
  language TEXT DEFAULT 'es',          -- idioma por defecto del tenant
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  plan TEXT DEFAULT 'starter',         -- starter, professional, enterprise
  is_active BOOLEAN DEFAULT true,
  api_key TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  webhook_url TEXT,                    -- URL para notificar eventos externos
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: assets (activos monitoreados)
```sql
CREATE TABLE {tenant}.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                  -- 'Pozo Norte 14', 'Oleoducto Km 45'
  type TEXT NOT NULL,                  -- 'well', 'pipeline', 'plant', 'tank', 'platform'
  status TEXT DEFAULT 'active',        -- active, inactive, decommissioned
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  polygon JSONB,                       -- GeoJSON polygon del área a monitorear
  radius_km DECIMAL DEFAULT 5,         -- radio de monitoreo si no hay polygon
  description TEXT,
  responsible_id UUID REFERENCES {tenant}.responsible(id),
  insurer_tenant_id UUID,              -- si tiene aseguradora asignada
  metadata JSONB DEFAULT '{}',         -- datos adicionales flexibles
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: satellite_scans
```sql
CREATE TABLE {tenant}.satellite_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES {tenant}.assets(id),
  source TEXT NOT NULL,                -- 'sentinel-1', 'sentinel-2', 'saocom'
  scan_date TIMESTAMPTZ NOT NULL,      -- fecha real de captura satelital
  processed_at TIMESTAMPTZ,
  image_url TEXT,                      -- URL en Supabase Storage
  thumbnail_url TEXT,
  band_type TEXT,                      -- 'SAR', 'RGB', 'NIR', 'SWIR'
  cloud_coverage DECIMAL,              -- % cobertura de nubes
  ai_analysis JSONB,                   -- resultado del análisis Claude
  anomaly_detected BOOLEAN DEFAULT false,
  raw_metadata JSONB DEFAULT '{}'
);
```

### Tabla: anomalies
```sql
CREATE TABLE {tenant}.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES {tenant}.assets(id),
  scan_id UUID REFERENCES {tenant}.satellite_scans(id),
  type TEXT NOT NULL,                  -- 'spill', 'leak', 'fire', 'land_change', 'unauthorized_access'
  severity TEXT NOT NULL,             -- 'critical', 'medium', 'low'
  confidence DECIMAL,                  -- 0-100% confianza del modelo
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  area_m2 DECIMAL,                    -- área afectada estimada
  description TEXT,                   -- descripción generada por Claude
  before_image_url TEXT,              -- imagen previa (comparación)
  after_image_url TEXT,               -- imagen con anomalía
  ai_recommendation TEXT,             -- recomendación de acción de Claude
  detected_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: alerts
```sql
CREATE TABLE {tenant}.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_id UUID REFERENCES {tenant}.anomalies(id),
  asset_id UUID REFERENCES {tenant}.assets(id),
  severity TEXT NOT NULL,             -- 'critical', 'medium', 'low'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',          -- 'new', 'acknowledged', 'in_review', 'resolved', 'false_positive'
  notified_channels JSONB DEFAULT '[]', -- ['email','sms','telegram']
  notified_at TIMESTAMPTZ,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  ticket_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: tickets
```sql
CREATE TABLE {tenant}.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES {tenant}.alerts(id),
  asset_id UUID REFERENCES {tenant}.assets(id),
  code TEXT UNIQUE NOT NULL,           -- 'TKT-2024-001' autogenerado
  title TEXT NOT NULL,
  status TEXT DEFAULT 'new',          -- 'new', 'in_review', 'resolved', 'audited'
  priority TEXT NOT NULL,             -- 'critical', 'high', 'medium', 'low'
  assigned_to UUID,                   -- usuario operador asignado
  assigned_by UUID,
  assigned_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  resolution_note TEXT,               -- descripción del cierre
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  audited_by UUID,                    -- usuario aseguradora que auditó
  audited_at TIMESTAMPTZ,
  audit_note TEXT,
  sla_breached BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: ticket_events (historial completo)
```sql
CREATE TABLE {tenant}.ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES {tenant}.tickets(id),
  user_id UUID,
  user_name TEXT,
  user_role TEXT,
  event_type TEXT NOT NULL,           -- 'created','assigned','status_change','comment','image_added','resolved','audited'
  previous_status TEXT,
  new_status TEXT,
  comment TEXT,
  attachment_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: responsible (responsables pre-configurados)
```sql
CREATE TABLE {tenant}.responsible (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,                  -- 'field_operator', 'supervisor', 'manager', 'environmental'
  email TEXT NOT NULL,
  phone TEXT,
  telegram_chat_id TEXT,
  assets JSONB DEFAULT '[]',          -- array de asset_ids que supervisa
  notification_channels JSONB DEFAULT '["email"]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: reports (reportes ESG)
```sql
CREATE TABLE {tenant}.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,                  -- 'esg_monthly', 'incident', 'audit', 'executive'
  period_start DATE,
  period_end DATE,
  generated_by UUID,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  language TEXT DEFAULT 'es',
  content JSONB NOT NULL,             -- datos del reporte
  pdf_url TEXT,                       -- URL en Supabase Storage
  file_hash TEXT,                     -- SHA-256 del PDF
  digital_signature TEXT,             -- firma RSA del contenido
  signed_by TEXT,                     -- nombre del responsable firmante
  signed_at TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT true       -- para verificación de integridad
);
```

---

## 4. FLUJOS PRINCIPALES DEL SISTEMA

### FLUJO A — Detección de Anomalía (Core del sistema)

```
[CRON JOB - cada 6 horas]
     │
     ▼
Consultar assets activos de todos los tenants
     │
     ▼
Para cada asset → llamar Copernicus API
(Sentinel-1 SAR para derrames + Sentinel-2 RGB para visual)
     │
     ▼
Descargar imagen del área del asset (polygon/radius)
     │
     ▼
Subir imagen a Supabase Storage → obtener URL
     │
     ▼
Llamar Claude API con:
  - imagen actual
  - imagen anterior (comparación "antes vs después")
  - tipo de asset
  - historial de anomalías previas
  - prompt especializado en O&G
     │
     ▼
Claude responde con:
  - anomaly_detected: boolean
  - type: 'spill'|'leak'|'fire'|'land_change'|'none'
  - severity: 'critical'|'medium'|'low'
  - confidence: 0-100
  - description: texto explicativo
  - recommendation: acción recomendada
  - estimated_area_m2: número
     │
     ▼
Si anomaly_detected = true:
  → Crear registro en anomalies
  → Crear registro en alerts
  → Crear ticket automático (code: TKT-YYYY-NNN)
  → Disparar notificaciones (email + SMS + Telegram)
  → Registrar en ticket_events (event_type: 'created')
  → Actualizar alert status a 'new'
     │
     ▼
Si anomaly_detected = false:
  → Registrar scan como OK
  → No generar alerta
```

### FLUJO B — Ciclo de vida del Ticket

```
ESTADOS: new → in_review → resolved → audited

[NEW] Ticket creado automáticamente por anomalía
  │   Notificación → Operador asignado (email + SMS + Telegram)
  │   Notificación → Supervisor del asset
  │
  ▼
[ACKNOWLEDGED] Operador abre la app/web y confirma recepción
  │   Registra: acknowledged_by, acknowledged_at
  │   ticket_events: 'acknowledged'
  │
  ▼
[IN_REVIEW] Operador inicia revisión en campo
  │   Puede cargar fotos desde app móvil
  │   Puede agregar comentarios de texto
  │   ticket_events: 'image_added', 'comment'
  │   Supervisor recibe updates en tiempo real (Supabase Realtime)
  │
  ▼
[RESOLVED] Operador marca como resuelto
  │   Carga: resolution_note (obligatorio)
  │   Carga: foto de evidencia de resolución (obligatorio)
  │   resolved_by, resolved_at
  │   Notificación → Admin del tenant
  │   Notificación → Aseguradora (si está asignada)
  │   ticket_events: 'resolved'
  │
  ▼
[AUDITED] Aseguradora o Admin revisa y audita
      Puede aceptar o rechazar la resolución
      audit_note (obligatorio para rechazo)
      Si rechaza → ticket vuelve a IN_REVIEW
      Si acepta → ticket queda AUDITED (estado final)
      ticket_events: 'audited'
      → Se puede generar reporte de incidente
```

### FLUJO C — Generación de Reporte ESG

```
[TRIGGER: manual o automático mensual]
     │
     ▼
Recopilar datos del período:
  - Total scans realizados
  - Anomalías detectadas por tipo y severidad
  - Tickets: creados, resueltos, tiempo promedio de resolución
  - Activos con mayor incidencia
  - Mapa de calor de zonas críticas
     │
     ▼
Llamar Claude API con todos los datos:
  - Generar resumen ejecutivo en español e inglés
  - Análisis de tendencias
  - Comparación con período anterior
  - Recomendaciones de mejora
  - Evaluación de cumplimiento normativo
     │
     ▼
Generar PDF profesional con Puppeteer:
  - Logo del tenant
  - Datos del responsable firmante
  - Contenido generado por Claude
  - Evidencias visuales (imágenes satelitales)
  - Timeline de eventos
  - Mapa de activos afectados
     │
     ▼
Calcular integridad:
  - SHA-256 hash del PDF binario
  - Firma RSA del hash con clave privada del tenant
  - Almacenar: pdf_url, file_hash, digital_signature, signed_at
     │
     ▼
Subir PDF a Supabase Storage
Registrar en tabla reports
Notificar al responsable configurado
```

### FLUJO D — Integración Externa (API pública)

```
Autenticación: API Key del tenant (Bearer token en header)

Endpoints disponibles:
  GET  /api/v1/assets                    → listar activos
  GET  /api/v1/alerts?status=new         → alertas activas
  GET  /api/v1/tickets?status=in_review  → tickets en curso
  GET  /api/v1/tickets/{id}              → detalle de ticket con historial
  POST /api/v1/tickets/{id}/comment      → agregar comentario desde sistema externo
  GET  /api/v1/reports                   → listar reportes
  GET  /api/v1/reports/{id}/verify       → verificar hash e integridad del reporte

Webhooks (configurables por tenant):
  POST {tenant.webhook_url} con payload JSON para:
    - alert.created
    - ticket.status_changed
    - ticket.resolved
    - report.generated

Ejemplo de integración Odoo:
  1. Tenant configura webhook_url → URL de Odoo
  2. Cuando se crea alerta, Oil Risk Monitor hace POST a Odoo
  3. Odoo crea ticket en su sistema automáticamente
  4. Operador trabaja desde Odoo, ORM actualiza via API
```

---

## 5. ARQUITECTURA DE NOTIFICACIONES

```javascript
// notification-service.js
// Disparado en cada nueva alerta

async function notifyAlert(alert, ticket, asset, tenant) {
  const responsible = await getResponsibleForAsset(asset.id, tenant);
  const channels = responsible.notification_channels;

  // EMAIL (Resend)
  if (channels.includes('email')) {
    await resend.emails.send({
      from: 'alerts@oilriskmonitor.ai',
      to: responsible.email,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: buildEmailTemplate(alert, ticket, asset, tenant.language)
    });
  }

  // SMS (Twilio)
  if (channels.includes('sms') && responsible.phone) {
    await twilioClient.messages.create({
      to: responsible.phone,
      from: process.env.TWILIO_NUMBER,
      body: buildSMSText(alert, ticket, tenant.language)
    });
  }

  // TELEGRAM
  if (channels.includes('telegram') && responsible.telegram_chat_id) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      body: JSON.stringify({
        chat_id: responsible.telegram_chat_id,
        text: buildTelegramMessage(alert, ticket, asset),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Acknowledger', callback_data: `ack_${ticket.id}` },
            { text: '🔗 Ver en dashboard', url: `https://app.oilriskmonitor.ai/tickets/${ticket.id}` }
          ]]
        }
      })
    });
  }
}
```

---

## 6. INTEGRACIÓN SATELITAL

### Fuentes gratuitas (prioridad)

```javascript
// satellite-service.js

// OPCIÓN 1: Sentinel Hub (ESA) - FREE tier
const SENTINEL_HUB_API = 'https://sh.dataspace.copernicus.eu/api/v1';

async function fetchSentinel1Image(polygon, dateFrom, dateTo) {
  // Sentinel-1 SAR — IDEAL para derrames de petróleo
  // Penetra nubes, detecta manchas en agua y suelo
  const response = await fetch(`${SENTINEL_HUB_API}/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getSentinelToken()}` },
    body: JSON.stringify({
      input: {
        bounds: { geometry: polygon },
        data: [{
          dataFilter: { timeRange: { from: dateFrom, to: dateTo } },
          type: 'SENTINEL-1-GRD'
        }]
      },
      output: { width: 512, height: 512, responses: [{ format: { type: 'image/png' } }] },
      evalscript: SENTINEL1_OIL_SPILL_EVALSCRIPT  // script especializado en derrames
    })
  });
  return response.buffer();
}

// OPCIÓN 2: Google Earth Engine (free para investigación)
// OPCIÓN 3: CONAE SAOCOM (radar L-band, contactar para acceso)
// OPCIÓN 4: Planet (pago, solo si el cliente requiere resolución diaria)
```

### Evalscript especializado para detección de derrames (Sentinel-1)
```javascript
const SENTINEL1_OIL_SPILL_EVALSCRIPT = `
//VERSION=3
// Detección de derrames usando backscatter SAR
// Derrames aparecen como áreas oscuras (bajo backscatter)
function setup() {
  return { input: ['VV', 'VH'], output: { bands: 3 } };
}
function evaluatePixel(sample) {
  let vv = sample.VV;
  let vh = sample.VH;
  // Umbral para detección de derrame
  if (vv < -18 && vh < -24) {
    return [1, 0, 0];  // ROJO = posible derrame
  }
  return [vv * 5, vh * 5, (vv - vh) * 3];  // Visualización normal
}
`;
```

---

## 7. INTEGRACIÓN CON CLAUDE API

```javascript
// ai-analysis-service.js

async function analyzeAnomalyWithClaude(currentImage, previousImage, asset, scanData, language) {
  const systemPrompt = language === 'es'
    ? `Eres un experto en análisis de imágenes satelitales para la industria Oil & Gas. 
       Analizás imágenes SAR (Sentinel-1) y ópticas (Sentinel-2) para detectar derrames, 
       fugas, cambios en la superficie y anomalías operativas. 
       Respondés ÚNICAMENTE con JSON válido, sin markdown.`
    : `You are an expert in satellite imagery analysis for the Oil & Gas industry...`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: previousImage }
          },
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: currentImage }
          },
          {
            type: 'text',
            text: `Comparar las dos imágenes satelitales del activo "${asset.name}" (tipo: ${asset.type}).
                   Primera imagen: estado anterior. Segunda imagen: estado actual.
                   Fecha del scan: ${scanData.scan_date}.
                   
                   Analizar y responder con este JSON exacto:
                   {
                     "anomaly_detected": boolean,
                     "type": "spill"|"leak"|"fire"|"land_change"|"unauthorized_access"|"none",
                     "severity": "critical"|"medium"|"low"|null,
                     "confidence": number (0-100),
                     "description": "descripción técnica en 2-3 oraciones",
                     "recommendation": "acción inmediata recomendada",
                     "estimated_area_m2": number|null,
                     "affected_zone": "descripción de la zona afectada"|null,
                     "regulatory_risk": "alto"|"medio"|"bajo"|null,
                     "comparison_notes": "qué cambió respecto a la imagen anterior"
                   }`
          }
        ]
      }]
    })
  });

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

// Para generación de reporte ESG
async function generateESGReport(reportData, language) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Sos un experto en compliance ambiental y reportes ESG para la industria Oil & Gas.
                  Generá un reporte ejecutivo profesional en ${language === 'es' ? 'español' : 'inglés'} 
                  basado en estos datos del período ${reportData.period_start} a ${reportData.period_end}:
                  
                  ${JSON.stringify(reportData, null, 2)}
                  
                  El reporte debe incluir:
                  1. Resumen ejecutivo (3-4 párrafos)
                  2. Análisis de anomalías detectadas
                  3. Evaluación de performance operativa
                  4. Tendencias respecto al período anterior
                  5. Nivel de cumplimiento normativo (estimado)
                  6. Recomendaciones estratégicas (3-5 puntos)
                  7. Conclusión
                  
                  Tono: profesional, técnico, orientado a directivos y auditores.
                  Respondé solo con el texto del reporte, sin JSON ni markdown.`
      }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

---

## 8. FIRMA DIGITAL Y HASH DE REPORTES

```javascript
// report-integrity.js
const forge = require('node-forge');
const crypto = require('crypto');

// Generar par de claves RSA para un tenant (una sola vez en onboarding)
function generateTenantKeyPair() {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  return {
    privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
    publicKey: forge.pki.publicKeyToPem(keyPair.publicKey)
  };
}

// Firmar un reporte PDF
function signReport(pdfBuffer, privateKeyPem, signerName) {
  // 1. Hash SHA-256 del PDF
  const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

  // 2. Firma RSA del hash
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const md = forge.md.sha256.create();
  md.update(hash, 'utf8');
  const signature = forge.util.encode64(privateKey.sign(md));

  return {
    hash,
    signature,
    signed_by: signerName,
    signed_at: new Date().toISOString(),
    algorithm: 'RSA-SHA256'
  };
}

// Verificar integridad de un reporte
function verifyReport(pdfBuffer, storedHash, signature, publicKeyPem) {
  const currentHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  if (currentHash !== storedHash) return { valid: false, reason: 'PDF modified' };

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const md = forge.md.sha256.create();
  md.update(storedHash, 'utf8');
  const isValid = publicKey.verify(md.digest().bytes(), forge.util.decode64(signature));

  return { valid: isValid, reason: isValid ? 'OK' : 'Invalid signature' };
}
```

---

## 9. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
oil-risk-monitor/
├── frontend/                          # React + Vite
│   ├── src/
│   │   ├── i18n/
│   │   │   ├── es.json               # Traducciones español
│   │   │   └── en.json               # Traducciones inglés
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # SOC principal - mapa + widgets
│   │   │   ├── Assets.jsx            # Gestión de activos
│   │   │   ├── Alerts.jsx            # Centro de alertas
│   │   │   ├── Tickets.jsx           # Lista de tickets
│   │   │   ├── TicketDetail.jsx      # Detalle + historial + timeline
│   │   │   ├── Reports.jsx           # Generación y descarga de reportes
│   │   │   ├── Integrations.jsx      # Config API + webhooks
│   │   │   ├── Settings.jsx          # Config tenant, responsables, notif.
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   │   ├── Map.jsx               # Mapa con activos y alertas (Mapbox)
│   │   │   ├── AlertBadge.jsx        # Semáforo rojo/amarillo/verde
│   │   │   ├── TicketTimeline.jsx    # Historial visual del ticket
│   │   │   ├── SatelliteViewer.jsx   # Antes vs Después
│   │   │   ├── ESGChart.jsx          # Gráficos del reporte
│   │   │   └── LanguageToggle.jsx    # ES/EN switch
│   │   ├── hooks/
│   │   │   ├── useRealtime.js        # Supabase Realtime subscriptions
│   │   │   └── useAuth.js
│   │   └── lib/
│   │       ├── supabase.js
│   │       └── api.js
│   └── netlify.toml
│
├── backend/                           # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── alerts.js
│   │   │   ├── tickets.js
│   │   │   ├── assets.js
│   │   │   ├── reports.js
│   │   │   └── api-public.js         # API externa con API key auth
│   │   ├── services/
│   │   │   ├── satellite.service.js  # Copernicus API
│   │   │   ├── ai.service.js         # Claude API
│   │   │   ├── notification.service.js # Email + SMS + Telegram
│   │   │   ├── report.service.js     # PDF + firma
│   │   │   └── webhook.service.js    # Envío a sistemas externos
│   │   ├── jobs/
│   │   │   └── satellite-scan.job.js # CRON cada 6 horas
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # Supabase JWT verification
│   │   │   └── apikey.middleware.js  # API Key para integraciones
│   │   └── lib/
│   │       ├── supabase.js
│   │       └── constants.js
│   └── render.yaml
│
├── mobile/                            # Expo React Native
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx
│   │   │   ├── alerts.tsx
│   │   │   └── tickets.tsx
│   │   └── ticket/[id].tsx           # Detalle + carga de fotos
│   └── app.json
│
└── supabase/
    ├── migrations/
    │   ├── 001_init.sql              # Schema público
    │   ├── 002_tenant_template.sql   # Template de schema por tenant
    │   └── 003_rls_policies.sql      # Políticas de seguridad
    └── functions/
        └── create-tenant.ts          # Edge function para onboarding
```

---

## 10. DASHBOARD PRINCIPAL — ESPECIFICACIÓN UI

### Estética: Industrial SOC (Security Operations Center)
- **Fondo:** negro profundo `#0A0F1E` con grid sutil
- **Colores de severidad:**
  - Critical: `#FF2D2D` (rojo intenso, pulsante)
  - Medium: `#FF8C00` (naranja)
  - Low: `#FFD700` (amarillo)
  - OK: `#00FF87` (verde neón)
- **Tipografía:** Space Mono para datos técnicos + Inter para texto legible
- **Mapa:** Mapbox estilo `dark-v11` con marcadores de activos y zonas de alerta

### Widgets del dashboard principal
1. **KPI Row** — Activos monitoreados / Alertas activas / Tickets abiertos / Scans hoy
2. **Mapa geográfico** — Activos con color según estado, clic abre panel lateral
3. **Centro de alertas** — Lista en tiempo real, ordenada por severidad, con semáforo
4. **Tickets recientes** — Estado y responsable asignado
5. **Último scan** — Timestamp por activo + "hace X horas"
6. **Actividad reciente** — Feed de eventos del sistema

---

## 11. APP MÓVIL — ESPECIFICACIÓN

### Pantallas principales
1. **Dashboard** — KPIs resumidos + alertas críticas activas
2. **Alertas** — Lista + push notification al abrir
3. **Ticket Detail** — Timeline completo + botones de acción
4. **Cámara** — Subir fotos de evidencia directamente al ticket
5. **Perfil** — Config de notificaciones del usuario

### Funcionalidades clave móvil
- Push notifications vía Expo Notifications (FCM + APNs)
- Cámara nativa para evidencia fotográfica
- Acceso offline básico (caché de tickets asignados)
- Deep link desde Telegram (tap en botón → abre app en el ticket)

---

## 12. VARIABLES DE ENTORNO

```env
# Backend (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
SENTINEL_HUB_CLIENT_ID=xxx
SENTINEL_HUB_CLIENT_SECRET=xxx
RESEND_API_KEY=re_xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_NUMBER=+1xxx
TELEGRAM_BOT_TOKEN=xxx
MAPBOX_SECRET_TOKEN=pk.xxx
NODE_ENV=production
PORT=3000

# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_MAPBOX_TOKEN=pk.xxx
VITE_API_URL=https://api.oilriskmonitor.ai
```

---

## 13. ORDEN DE IMPLEMENTACIÓN PARA CLAUDE CODE

### FASE 1 — Demo ficticio (Netlify, sin backend) — 1 semana
```
Paso 1: Setup React + Vite + TailwindCSS + shadcn/ui + react-i18next
Paso 2: Layout base con sidebar, navbar, LanguageToggle ES/EN
Paso 3: Dashboard con datos mock (5 activos ficticios, 3 alertas, mapa Mapbox)
Paso 4: Página Alerts — lista con semáforo, filtros por severidad
Paso 5: Página Tickets — lista + TicketDetail con timeline completo
Paso 6: Vista SatelliteViewer — "Antes vs Después" con slider
Paso 7: Página Reports — tabla de reportes + botón descarga PDF mock
Paso 8: Página Settings — config responsables y canales de notificación
Paso 9: Deploy en Netlify + dominio oilriskmonitor.ai
```

### FASE 2 — Backend + DB — 2 semanas
```
Paso 10: Supabase setup — schemas, migraciones, RLS policies
Paso 11: Auth con Supabase (login, sesiones, roles)
Paso 12: Backend Express — CRUD de assets, alerts, tickets
Paso 13: API pública con API Key auth + webhook sender
Paso 14: Supabase Realtime en frontend (alerts en vivo)
Paso 15: Deploy backend en Render
```

### FASE 3 — IA + Satelital — 2 semanas
```
Paso 16: Integración Copernicus API (Sentinel-1 + Sentinel-2)
Paso 17: Claude API — análisis de imágenes y generación de reportes
Paso 18: CRON job de escaneo cada 6 horas
Paso 19: Generación de PDF con firma digital y hash
Paso 20: Sistema completo de notificaciones (Resend + Twilio + Telegram Bot)
```

### FASE 4 — Mobile — 1 semana
```
Paso 21: Expo app — pantallas principales
Paso 22: Push notifications
Paso 23: Cámara + subida de fotos a Supabase Storage
Paso 24: Deep links desde Telegram
```

---

## 14. NOTA PARA CLAUDE CODE

Este es un sistema de producción real para la industria Oil & Gas.
- Nunca usar datos reales de empresas en el demo
- Los datos mock deben ser realistas pero ficticios (nombres de pozos inventados)
- El código debe estar listo para multitenant desde el día 1
- Todo el texto de la UI debe estar en i18n (nunca hardcoded en un solo idioma)
- Las imágenes satelitales del demo pueden ser JPGs de dominio público de NASA Earthdata
- La firma digital y el hash son requisitos de compliance, no opcionales
- Cloudflare debe estar delante del frontend y del backend para WAF y performance

**Stack de IA:** Usar siempre `claude-opus-4-5` para análisis críticos y `claude-sonnet-4-6` para reportes de menor criticidad para optimizar costos.
```

---

## 15. CLAUDE SECURITY REVIEW — ARQUITECTURA DE SEGURIDAD

### 3 capas de defensa
```
CAPA EXTERNA     Cloudflare WAF → DDoS, bot protection, rate limiting
CAPA CÓDIGO      Claude Security Review → auditoría de cada PR en GitHub
CAPA DATOS       Supabase RLS → aislamiento multitenant a nivel DB
```

### GitHub Action — Claude revisa cada Pull Request

```yaml
# .github/workflows/claude-security-review.yml
name: Claude Security Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  security-review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > pr_diff.txt
          echo "lines=$(wc -l < pr_diff.txt)" >> $GITHUB_OUTPUT

      - name: Claude Security Audit
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python3 << 'EOF'
          import anthropic, json

          with open('pr_diff.txt', 'r') as f:
              diff = f.read()[:15000]  # límite de contexto

          client = anthropic.Anthropic()
          response = client.messages.create(
              model="claude-opus-4-5",
              max_tokens=3000,
              messages=[{
                  "role": "user",
                  "content": f"""Sos un experto en seguridad para plataformas SaaS B2B multitenant
                  en industria Oil & Gas. Auditá este diff de código y detectá vulnerabilidades.

                  CONTEXTO DEL SISTEMA:
                  - Plataforma multitenant (empresas petroleras + aseguradoras)
                  - Datos críticos: imágenes satelitales, reportes ESG con firma digital
                  - Stack: Node.js + Express + Supabase (PostgreSQL + RLS) + React
                  - Compliance requerido: ISO 27001, SOC 2, ISO 14001, GDPR, OWASP

                  DIFF A AUDITAR:
                  {diff}

                  Analizá específicamente:
                  1. SQL Injection / NoSQL Injection
                  2. Tenant data leakage (mezcla de datos entre tenants)
                  3. RLS policies mal configuradas o bypaseadas
                  4. API keys o secrets hardcodeados
                  5. Endpoints sin autenticación/autorización
                  6. IDOR (Insecure Direct Object Reference)
                  7. XSS en inputs del usuario
                  8. CSRF en operaciones críticas
                  9. Rate limiting ausente en endpoints sensibles
                  10. Logging de datos sensibles (PII, coordenadas GPS, api keys)
                  11. Dependencias con vulnerabilidades conocidas (CVE)
                  12. Falta de validación de inputs en uploads de imágenes
                  13. Problemas de firma digital o hash de reportes
                  14. Headers de seguridad ausentes (CSP, HSTS, X-Frame)

                  Respondé SOLO con este JSON:
                  {{
                    "approved": boolean,
                    "risk_level": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW"|"CLEAN",
                    "vulnerabilities": [
                      {{
                        "severity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW",
                        "type": "nombre del tipo",
                        "file": "archivo donde está",
                        "line": número o null,
                        "description": "qué es el problema",
                        "fix": "cómo corregirlo"
                      }}
                    ],
                    "compliance_flags": ["ISO27001-A.9","SOC2-CC6","OWASP-A01",...],
                    "summary": "resumen ejecutivo en 2 oraciones"
                  }}"""
              }]
          )

          result = json.loads(response.content[0].text)

          with open('security_report.json', 'w') as f:
              json.dump(result, f, indent=2)

          # Salir con error si hay vulnerabilidades críticas
          if result['risk_level'] == 'CRITICAL':
              exit(1)
          EOF

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('security_report.json'));

            const icons = { CRITICAL:'🚨', HIGH:'🔴', MEDIUM:'🟡', LOW:'🔵', CLEAN:'✅' };
            const icon = icons[report.risk_level];

            let body = `## ${icon} Claude Security Review — ${report.risk_level}\n\n`;
            body += `**${report.summary}**\n\n`;

            if (report.vulnerabilities.length > 0) {
              body += `### Vulnerabilidades detectadas\n\n`;
              for (const v of report.vulnerabilities) {
                body += `#### ${icons[v.severity]} [${v.severity}] ${v.type}\n`;
                body += `- **Archivo:** \`${v.file}\`${v.line ? ` línea ${v.line}` : ''}\n`;
                body += `- **Problema:** ${v.description}\n`;
                body += `- **Fix:** ${v.fix}\n\n`;
              }
            }

            if (report.compliance_flags.length > 0) {
              body += `### Compliance flags\n`;
              body += report.compliance_flags.map(f => `\`${f}\``).join(' · ') + '\n\n';
            }

            body += report.approved
              ? `✅ **PR aprobado para merge.**`
              : `❌ **PR bloqueado. Resolver vulnerabilidades antes de mergear.**`;

            github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              body,
              event: report.approved ? 'APPROVE' : 'REQUEST_CHANGES'
            });
```

### Agente Claude Code — security-auditor

```markdown
<!-- ~/.claude/agents/security-auditor-oilrisk.md -->
---
name: security-auditor-oilrisk
description: Auditor de seguridad especializado en Oil Risk Monitor. Invocar con: "audita el módulo X"
---

Sos un experto en seguridad ofensiva y defensiva para plataformas SaaS multitenant
en industria Oil & Gas con compliance ISO 27001, SOC 2 Type II e ISO 14001.

Cuando auditás código de Oil Risk Monitor, revisás:

SEGURIDAD MULTITENANT:
- Cada query debe filtrar por tenant_id o usar schema propio
- RLS activo en todas las tablas de Supabase
- JWT claims verificados en cada request del backend
- API keys de tenants hasheadas en DB (nunca plaintext)

SEGURIDAD DE DATOS:
- Coordenadas GPS de activos = datos sensibles → encriptar en reposo
- Imágenes satelitales = assets de cliente → URLs firmadas con expiración
- Reportes ESG = documentos legales → hash + firma siempre
- PII de responsables → enmascarar en logs

SEGURIDAD DE API:
- Rate limiting en todos los endpoints (express-rate-limit)
- Validación de inputs con Zod en backend y frontend
- Headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- CORS restrictivo (solo dominios del tenant)

OWASP API Security Top 10 (2023):
- API1: Broken Object Level Authorization → siempre verificar ownership
- API2: Broken Authentication → JWT + refresh tokens rotativos
- API3: Broken Object Property Level → whitelist de campos en responses
- API4: Unrestricted Resource Consumption → rate limit + max payload
- API5: Function Level Authorization → verificar rol en cada endpoint
- API8: Security Misconfiguration → headers, CORS, error messages
```

---

## 16. COMPLIANCE COMPLETO — FRAMEWORKS APLICABLES

### Matriz de compliance para Oil Risk Monitor AI

```
FRAMEWORK          APLICACIÓN EN EL SISTEMA              PRIORIDAD
────────────────────────────────────────────────────────────────────
ISO 27001          Seguridad de la información SaaS        CRÍTICA
SOC 2 Type II      Confianza para clientes enterprise      CRÍTICA
ISO 14001          Gestión ambiental (core del producto)   CRÍTICA
GDPR / LGPD        Datos personales de usuarios LATAM      ALTA
OWASP Top 10       Seguridad de aplicación web             ALTA
OWASP API Sec.     Seguridad de API REST pública           ALTA
ISO 31000          Gestión de riesgos (O&G context)        ALTA
API 754 (AmPetInst)Estándares industria Oil & Gas          MEDIA
NIST CSF           Ciberseguridad (clientes enterprise US) MEDIA
PCI DSS            Si se procesan pagos con tarjeta        MEDIA
ISO 9001           Calidad del proceso de desarrollo       MEDIA
```

### ISO 27001 — Controles clave a implementar

```
DOMINIO A.5 — Políticas de seguridad
  ✅ CLAUDE.md documenta política de seguridad del proyecto
  ✅ GitHub Action bloquea código inseguro automáticamente

DOMINIO A.8 — Gestión de activos
  ✅ Inventario de activos en Supabase (tabla tenants + assets)
  ✅ Clasificación de datos: PÚBLICO / INTERNO / CONFIDENCIAL / RESTRINGIDO
  → Implementar: etiqueta de clasificación en cada tabla de DB

DOMINIO A.9 — Control de acceso
  ✅ Supabase Auth con JWT
  ✅ RLS por tenant en PostgreSQL
  ✅ Roles: operator / supervisor / admin / insurer
  → Implementar: MFA obligatorio para roles admin e insurer
  → Implementar: Session timeout configurable por tenant

DOMINIO A.10 — Criptografía
  ✅ HTTPS/TLS everywhere (Cloudflare)
  ✅ Firma RSA-2048 + SHA-256 en reportes ESG
  → Implementar: encriptación AES-256 de coordenadas GPS en DB
  → Implementar: rotación de API keys cada 90 días

DOMINIO A.12 — Seguridad en operaciones
  ✅ Supabase backups automáticos diarios
  → Implementar: backup adicional en Cloudflare R2 (cold storage)
  → Implementar: prueba de restore mensual documentada

DOMINIO A.13 — Seguridad en comunicaciones
  ✅ Cloudflare WAF + DDoS protection
  ✅ Rate limiting en Express
  → Implementar: IP allowlist configurable por tenant enterprise

DOMINIO A.16 — Gestión de incidentes
  ✅ El sistema ticket es en sí mismo un gestor de incidentes
  → Implementar: categorización de incidentes por tipo ISO
  → Implementar: notificación automática a DPA en <72hs si hay data breach

DOMINIO A.17 — Continuidad del negocio
  → Implementar: RTO < 4hs, RPO < 1hs documentado
  → Implementar: failover automático Render → Railway como backup
```

### SOC 2 Type II — Trust Services Criteria

```
CC1 — Control Environment
  → Definir política de acceso mínimo privilegio
  → Documentar proceso de onboarding/offboarding de usuarios

CC6 — Logical and Physical Access Controls
  ✅ Supabase RLS (control lógico a nivel DB)
  ✅ JWT con expiración corta (1 hora + refresh)
  → MFA para admins
  → Logs de acceso inmutables (append-only audit_log)

CC7 — System Operations
  ✅ GitHub Actions para CI/CD controlado
  ✅ Claude Security Review bloquea código vulnerble
  → Alertas de anomalías en producción (Cloudflare + Render logs)

CC8 — Change Management
  ✅ PRs obligatorios (no push directo a main)
  ✅ Claude revisa cada PR
  → Branch protection rules en GitHub (require review + CI pass)

CC9 — Risk Mitigation
  ✅ Análisis satelital = detección proactiva de riesgos
  → Penetration testing anual documentado
```

### ISO 14001 — Gestión Ambiental (core del negocio)

```
Este es el framework más relevante para el PRODUCTO en sí:

4.1 — Comprensión del contexto
  ✅ El sistema monitorea impacto ambiental de activos O&G
  ✅ Detecta derrames < 24hs (cumple estándar internacional)

6.1 — Acciones para riesgos ambientales
  ✅ Motor de alertas tempranas
  ✅ Clasificación por severidad (crítica/media/baja)

9.1 — Seguimiento y medición
  ✅ KPIs ambientales en dashboard: anomalías/mes, tiempo de resolución
  ✅ Comparación período a período en reportes ESG

9.3 — Reporte ESG automatizado
  ✅ Reporte mensual con firma digital
  ✅ Evidencia técnica para auditorías regulatorias

CERTIFICACIÓN: Los clientes que usan Oil Risk Monitor
pueden usarlo como evidencia de monitoreo activo en
sus propias certificaciones ISO 14001. Esto es el
principal argumento de venta enterprise.
```

### GDPR / LGPD — Datos Personales

```javascript
// Datos personales que maneja el sistema:
// - Nombre y email de responsables (operadores, supervisores)
// - Número de teléfono (para SMS)
// - Telegram chat ID
// - Logs de acceso con timestamp + IP

// Implementaciones requeridas:

// 1. Tabla de consentimientos
CREATE TABLE {tenant}.consents (
  user_id UUID NOT NULL,
  type TEXT NOT NULL,         -- 'marketing', 'analytics', 'third_party'
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);

// 2. Derecho al olvido (right to erasure)
async function deleteUserData(userId, tenantId) {
  // Anonimizar en audit_log (no borrar — requerido por compliance)
  await supabase.from('audit_log')
    .update({ user_name: '[DELETED]', user_email: null })
    .eq('user_id', userId);
  // Eliminar datos personales de responsible
  await supabase.from('responsible').delete().eq('id', userId);
}

// 3. Data residency — datos de LATAM en región us-east-1 o sa-east-1 (Brasil)
// Configurar Supabase en región São Paulo para clientes Argentina/Brasil

// 4. Data breach notification < 72 horas
// Implementar webhook a DPA (autoridad de protección de datos) automático
```

### Implementación técnica de compliance en el código

```javascript
// compliance-middleware.js
// Middleware que agrega headers de seguridad en todas las respuestas

module.exports = function complianceHeaders(req, res, next) {
  // ISO 27001 A.13 — Headers de seguridad
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://*.supabase.co https://*.mapbox.com; " +
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com"
  );

  // Audit log de cada request (ISO 27001 A.12)
  if (req.user) {
    logAuditEvent({
      tenant_id: req.user.tenant_id,
      user_id: req.user.id,
      action: `${req.method} ${req.path}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  }

  next();
};
```

```javascript
// audit-log.service.js
// Log inmutable requerido por ISO 27001 A.12 y SOC 2 CC7

async function logAuditEvent(event) {
  // INSERT ONLY — nunca UPDATE ni DELETE en audit_log
  await supabase.from('audit_log').insert({
    ...event,
    hash: crypto.createHash('sha256')
      .update(JSON.stringify(event))
      .digest('hex')  // Integridad de cada entrada del log
  });
}

// La tabla audit_log tiene RLS que permite solo INSERT, nunca UPDATE/DELETE
// Incluso el service role no puede modificar entradas existentes
```

### Checklist de compliance antes del primer cliente enterprise

```
PRE-LAUNCH COMPLIANCE CHECKLIST

ISO 27001:
[ ] Política de seguridad de la información documentada
[ ] Inventario de activos de información completo
[ ] Análisis de riesgos completado y documentado
[ ] MFA habilitado para todos los roles admin
[ ] Penetration test realizado y remediaciones aplicadas
[ ] Proceso de backup y restore documentado y probado
[ ] Plan de respuesta a incidentes documentado
[ ] Acuerdos de confidencialidad (NDA) con todos los empleados

SOC 2:
[ ] Controles de acceso documentados y auditables
[ ] Logs de acceso inmutables activos
[ ] Branch protection + PR review obligatorio en GitHub
[ ] Monitoreo de disponibilidad (uptime > 99.9%)
[ ] Proceso de change management documentado

ISO 14001:
[ ] Metodología de detección de derrames documentada
[ ] Precisión del sistema validada (% false positives)
[ ] Tiempo de detección < 24hs demostrable con métricas
[ ] Reporte ESG cumple con GRI Standards o TCFD

GDPR/LGPD:
[ ] Política de privacidad publicada en el sitio
[ ] Mecanismo de consentimiento activo
[ ] Proceso de derecho al olvido implementado
[ ] DPA (Data Processing Agreement) preparado para clientes
[ ] Datos en región correcta (sa-east-1 para LATAM)

OWASP:
[ ] OWASP Top 10 auditado con Claude Security Review
[ ] OWASP API Security Top 10 auditado
[ ] Dependencias sin CVE conocidos (npm audit clean)
[ ] DAST (Dynamic Application Security Testing) realizado
```

---

## 17. DOCUMENTACIÓN DE COMPLIANCE PARA EL GRANT

El compliance ISO/SOC2 también es argumento ante la Agencia I+D+i:

```
En la sección A.i (Innovación) del Anexo I mencionar:

"La plataforma incorpora desde su arquitectura base los controles
requeridos por ISO 27001 (seguridad de la información), ISO 14001
(gestión ambiental) y SOC 2 Type II (confianza para clientes enterprise),
siendo el primer SaaS de monitoreo satelital O&G de origen argentino
diseñado con compliance multinivel desde el día uno del desarrollo."

Esto diferencia Oil Risk Monitor de cualquier competidor y justifica
el presupuesto de I+D ante los evaluadores.
```
