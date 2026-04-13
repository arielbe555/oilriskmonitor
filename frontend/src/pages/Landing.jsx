import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Satellite, Zap, Shield, FileText, Bell, Lock,
  ChevronRight, ArrowRight, Radio, Globe, Check,
  Activity, MapPin, Menu, X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ── Globe SVG visualization ──────────────────────────────────────────────────
function GlobeViz() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none">
      <svg viewBox="0 0 400 400" className="w-full drop-shadow-2xl">
        <defs>
          <radialGradient id="gf" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#162238" />
            <stop offset="60%" stopColor="#0e1a2d" />
            <stop offset="100%" stopColor="#0A0F1E" />
          </radialGradient>
          <filter id="dg" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sg" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="gc"><circle cx="200" cy="200" r="168" /></clipPath>
          <path id="op"
            d="M 415 200 A 215 78 0 0 0 -15 200 A 215 78 0 0 1 415 200"
            transform="rotate(-22 200 200)" />
        </defs>

        {/* Ambient glow */}
        <circle cx="200" cy="200" r="200" fill="rgba(255,107,0,0.04)" />

        {/* Globe body */}
        <circle cx="200" cy="200" r="168" fill="url(#gf)" />

        {/* Grid lines */}
        <g clipPath="url(#gc)" fill="none" stroke="#1e3050" strokeWidth="0.6" opacity="0.55">
          <ellipse cx="200" cy="200" rx="168" ry="54" />
          <ellipse cx="200" cy="158" rx="147" ry="47" />
          <ellipse cx="200" cy="242" rx="147" ry="47" />
          <ellipse cx="200" cy="115" rx="98" ry="31" />
          <ellipse cx="200" cy="285" rx="98" ry="31" />
          <ellipse cx="200" cy="200" rx="52" ry="168" />
          <ellipse cx="200" cy="200" rx="114" ry="168" />
          <line x1="200" y1="32" x2="200" y2="368" />
        </g>

        {/* Globe border + highlight */}
        <circle cx="200" cy="200" r="168" fill="none" stroke="#1e3050" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="168" fill="none" stroke="white" strokeWidth="0.8" opacity="0.04" />

        {/* Orbital path (dashed) */}
        <ellipse cx="200" cy="200" rx="215" ry="78"
          fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.4"
          transform="rotate(-22 200 200)" />

        {/* Critical asset — Pozo Norte-14 (Patagonia) */}
        <g filter="url(#dg)">
          <circle cx="152" cy="248" r="5" fill="#FF2D2D" />
          <circle cx="152" cy="248" r="5" fill="none" stroke="#FF2D2D" strokeWidth="1.5">
            <animate attributeName="r" values="5;20;5" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="152" cy="248" r="5" fill="none" stroke="#FF2D2D" strokeWidth="0.8">
            <animate attributeName="r" values="5;33;5" dur="2.2s" begin="0.55s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2.2s" begin="0.55s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Medium alert — Oleoducto */}
        <g filter="url(#dg)">
          <circle cx="173" cy="218" r="4" fill="#FF8C00" />
          <circle cx="173" cy="218" r="4" fill="none" stroke="#FF8C00" strokeWidth="1">
            <animate attributeName="r" values="4;13;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* OK assets */}
        <circle cx="207" cy="260" r="3.5" fill="#00FF87" filter="url(#dg)" opacity="0.9" />
        <circle cx="238" cy="234" r="3.5" fill="#00FF87" filter="url(#dg)" opacity="0.9" />

        {/* Low alert */}
        <circle cx="183" cy="202" r="3.5" fill="#FFD700" filter="url(#dg)" opacity="0.9" />

        {/* Satellite — animated along orbit */}
        <g filter="url(#sg)">
          <circle r="14" fill="#FF6B00" opacity="0.12">
            <animateMotion dur="10s" repeatCount="indefinite"><mpath href="#op" /></animateMotion>
          </circle>
          <circle r="5.5" fill="#FF6B00">
            <animateMotion dur="10s" repeatCount="indefinite"><mpath href="#op" /></animateMotion>
          </circle>
        </g>
      </svg>

      {/* Floating: Alert card */}
      <div className="absolute top-[4%] right-[0%] lg:right-[-6%] bg-surface/95 backdrop-blur-md border border-critical/25 rounded-2xl p-3.5 shadow-2xl shadow-critical/10 min-w-[210px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-critical animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold text-critical tracking-wide">ALERTA CRÍTICA</span>
        </div>
        <p className="text-xs text-text-primary font-medium">Pozo Norte-14 · Patagonia</p>
        <p className="text-[11px] text-text-secondary mt-0.5">Derrame detectado · 2,400 m²</p>
        <p className="text-[10px] font-mono text-text-muted mt-1">Confianza IA: 94%</p>
      </div>

      {/* Floating: Scan card */}
      <div className="absolute bottom-[14%] left-[0%] lg:left-[-6%] bg-surface/95 backdrop-blur-md border border-brand/20 rounded-2xl p-3.5 shadow-2xl shadow-brand/10 min-w-[210px]">
        <div className="flex items-center gap-2 mb-1.5">
          <Satellite size={12} className="text-brand flex-shrink-0" />
          <span className="text-xs font-bold text-brand">SENTINEL-1 SAR · LIVE</span>
        </div>
        <p className="text-xs text-text-secondary">Escaneando 5 activos · LATAM</p>
        <div className="mt-2 h-1 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full animate-scan-bar" />
        </div>
      </div>
    </div>
  )
}

// ── Navigation ───────────────────────────────────────────────────────────────
function LandingNav() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Cómo funciona', href: '#how-it-works' },
    { label: 'Compliance', href: '#compliance' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-surface/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <Radio size={15} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black text-text-primary leading-none tracking-tight">OIL RISK</p>
            <p className="text-[9px] font-mono text-brand leading-none mt-0.5 tracking-widest">MONITOR AI</p>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-2">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated() ? (
            <button onClick={() => navigate('/app/dashboard')}
              className="btn-primary flex items-center gap-1.5 text-sm">
              Ir al dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                className="hidden sm:block btn-ghost text-sm px-4 py-2">
                Iniciar sesión
              </button>
              <button onClick={() => navigate('/login')}
                className="btn-primary flex items-center gap-1.5 text-sm">
                Solicitar demo <ChevronRight size={14} />
              </button>
            </>
          )}
          {/* Mobile menu */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl border-b border-border px-5 pb-4 space-y-1">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2 transition-colors">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full animate-float-delay"
          style={{ background: 'radial-gradient(circle, rgba(0,160,255,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 py-20 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 items-center w-full">
        {/* Copy */}
        <div className="space-y-7 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold text-brand tracking-wide">
              Sentinel-1 SAR + Claude AI · Detección en &lt; 24h
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.0] tracking-tight">
            <span className="text-text-primary">Detecta derrames</span>
            <br />
            <span className="text-text-primary">antes que</span>
            <br />
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #E8F0FE 0%, #FF6B00 55%, #FF2D2D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              impacten.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
            Monitoreo satelital con inteligencia artificial para la industria Oil &amp; Gas.
            Alertas en menos de 24 horas. Reportes ESG con firma digital RSA-2048.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/login')}
              className="btn-primary px-7 py-3 text-base font-semibold flex items-center gap-2 shadow-lg shadow-brand/25">
              Solicitar demo <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/login')}
              className="btn-secondary px-7 py-3 text-base font-semibold flex items-center gap-2">
              Ver dashboard
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-7 border-t border-border">
            {[
              { value: '< 24h', label: 'Detección' },
              { value: '94%', label: 'Precisión IA' },
              { value: 'ISO 14001', label: 'Certificado' },
              { value: 'SOC 2', label: 'Type II' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-black text-text-primary leading-none">{s.value}</p>
                <p className="text-xs text-text-muted font-mono mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Globe */}
        <div className="relative animate-fade-in">
          <GlobeViz />
        </div>
      </div>
    </section>
  )
}

// ── Trust / Compliance bar ───────────────────────────────────────────────────
function TrustBar() {
  const certs = ['ISO 27001', 'SOC 2 Type II', 'ISO 14001', 'GDPR', 'LGPD', 'OWASP Top 10']
  return (
    <div id="compliance" className="border-y border-border py-6 bg-surface/30">
      <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-center gap-4">
        <p className="text-xs font-mono text-text-muted uppercase tracking-widest flex-shrink-0">
          Certificado bajo:
        </p>
        <div className="flex flex-wrap gap-2">
          {certs.map(c => (
            <div key={c} className="flex items-center gap-1.5 text-xs font-mono text-text-secondary border border-border rounded-lg px-3 py-1.5 bg-surface hover:border-ok/40 transition-colors">
              <Shield size={10} className="text-ok" />
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Satellite,
      title: 'Imágenes Sentinel-1 SAR',
      description: 'Radar de apertura sintética de ESA Copernicus. Detecta hidrocarburos en superficie independientemente de la nubosidad, lluvia o condición de luz.',
      accent: 'brand',
    },
    {
      icon: Zap,
      title: 'Análisis con Claude AI',
      description: 'claude-opus-4-5 procesa cada imagen satelital en segundos. Identifica derrames, anomalías térmicas y cambios de cobertura con 94% de precisión.',
      accent: 'ok',
    },
    {
      icon: Bell,
      title: 'Alertas multicanal',
      description: 'Notificaciones instantáneas por email, SMS y Telegram a los responsables correctos según jerarquía configurada y nivel de severidad.',
      accent: 'medium',
    },
    {
      icon: FileText,
      title: 'Tickets auditables',
      description: 'Workflow completo: detección → asignación → campo → resolución → auditoría. Trazabilidad total con timeline inmutable para compliance regulatorio.',
      accent: 'critical',
    },
    {
      icon: Shield,
      title: 'Reportes ESG firmados',
      description: 'PDFs con firma digital RSA-2048 y hash SHA-256. Admisibles como evidencia en auditorías ISO 14001, SOC 2 Type II y regulaciones ambientales.',
      accent: 'ok',
    },
    {
      icon: Lock,
      title: 'Arquitectura multitenant',
      description: 'Schema-per-tenant en PostgreSQL con RLS. Datos completamente aislados entre clientes. Cumple ISO 27001, GDPR y LGPD desde el día 1.',
      accent: 'brand',
    },
  ]

  const accentColors = {
    brand: { bg: 'bg-brand/10', border: 'border-brand/20', text: 'text-brand', glow: 'via-brand/30' },
    ok: { bg: 'bg-ok/10', border: 'border-ok/20', text: 'text-ok', glow: 'via-ok/30' },
    medium: { bg: 'bg-medium/10', border: 'border-medium/20', text: 'text-medium', glow: 'via-medium/30' },
    critical: { bg: 'bg-critical/10', border: 'border-critical/20', text: 'text-critical', glow: 'via-critical/30' },
  }

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1 mb-5">
            <Activity size={12} className="text-brand" />
            <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">Funcionalidades</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-text-primary leading-tight">
            Todo lo que necesitás para
            <span className="text-brand"> proteger tus activos</span>
          </h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            Desde la imagen satelital hasta el reporte ESG firmado — un sistema integrado, auditable y conforme a normativas internacionales.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const colors = accentColors[f.accent]
            return (
              <div key={i} className="rounded-2xl border border-border p-6 relative overflow-hidden group hover:border-border-2 transition-all duration-300"
                style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(8px)' }}>
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.glow} to-transparent`} />

                <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                  <f.icon size={19} className={colors.text} />
                </div>

                <h3 className="text-base font-bold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── How it works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      icon: Satellite,
      num: '01',
      title: 'Scan satelital',
      desc: 'Sentinel-1 SAR y Sentinel-2 escanean cada activo Oil & Gas automáticamente cada 6 horas, los 365 días del año.',
    },
    {
      icon: Zap,
      num: '02',
      title: 'IA detecta anomalías',
      desc: 'Claude AI analiza las imágenes satelitales e identifica derrames, fugas y cambios ambientales con coordenadas precisas.',
    },
    {
      icon: Bell,
      num: '03',
      title: 'Alerta + ticket automático',
      desc: 'Notificación inmediata al responsable correcto + ticket de gestión creado con todos los datos para iniciar la respuesta.',
    },
    {
      icon: Shield,
      num: '04',
      title: 'Reporte ESG firmado',
      desc: 'PDF periódico con firma RSA-2048 y hash SHA-256. Listo para auditorías ISO 14001 y reguladores ambientales.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-surface/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1 mb-5">
            <MapPin size={12} className="text-brand" />
            <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">Proceso</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-text-primary leading-tight">
            Cómo funciona
          </h2>
          <p className="text-text-secondary mt-4">
            De la imagen satelital al reporte ESG en un proceso completamente automatizado y auditable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[13%] right-[13%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              {/* Icon circle */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-surface border border-border group-hover:border-brand/30 flex items-center justify-center transition-colors shadow-xl">
                  <s.icon size={26} className="text-brand" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand text-white text-xs font-black flex items-center justify-center shadow-lg shadow-brand/30">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">{s.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Metrics ──────────────────────────────────────────────────────────────────
function MetricsSection() {
  const metrics = [
    { value: '< 24h', label: 'Tiempo de detección', sub: 'vs 48–72h industria' },
    { value: '94%', label: 'Precisión del modelo', sub: 'Sentinel-1 SAR + Claude AI' },
    { value: '200+', label: 'Activos monitoreados', sub: 'En 5 países LATAM' },
    { value: '50M+', label: 'm² analizados', sub: 'Superficie cubierta' },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,0,0.05) 0%, transparent 70%)' }} />
      <div className="relative max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl md:text-5xl font-black leading-none mb-3"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #FF6B00, #FF8C00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                {m.value}
              </p>
              <p className="text-sm font-semibold text-text-primary mb-1">{m.label}</p>
              <p className="text-xs text-text-muted font-mono">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,107,0,0.07) 0%, transparent 70%)' }} />

      <div className="relative max-w-3xl mx-auto px-5 text-center">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 mb-7">
          <Globe size={12} className="text-brand" />
          <span className="text-xs font-semibold text-brand tracking-wide">Disponible en toda LATAM</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-5">
          Protegé tus activos y tu
          <span className="text-brand"> licencia para operar</span>
        </h2>

        <p className="text-lg text-text-secondary leading-relaxed mb-9 max-w-xl mx-auto">
          Una demo de 30 minutos es suficiente para ver tu operación real en el sistema. Sin contrato, sin tarjeta de crédito.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/login')}
            className="btn-primary px-8 py-3.5 text-base font-semibold flex items-center gap-2 shadow-xl shadow-brand/25">
            Solicitar demo gratuita <ArrowRight size={17} />
          </button>
          <button onClick={() => navigate('/login')}
            className="btn-secondary px-8 py-3.5 text-base font-semibold flex items-center gap-2">
            Ver dashboard de demo
          </button>
        </div>

        {/* Compliance row */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-10">
          {['Sin contrato', 'Setup en 48h', 'Datos aislados', 'Soporte 24/7'].map(item => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Check size={13} className="text-ok" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <Radio size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-text-primary leading-none">OIL RISK</p>
                <p className="text-[9px] font-mono text-brand leading-none mt-0.5 tracking-widest">MONITOR AI</p>
              </div>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-[220px]">
              Monitoreo satelital con IA para la industria Oil & Gas. Detectá derrames antes de que impacten.
            </p>
          </div>

          {/* Links */}
          {[
            { title: 'Producto', items: ['Dashboard', 'Alertas', 'Reportes ESG', 'API & Webhooks'] },
            { title: 'Empresa', items: ['Sobre nosotros', 'Casos de uso', 'Documentación', 'Contacto'] },
            { title: 'Legal', items: ['Términos de uso', 'Privacidad', 'Seguridad', 'Compliance'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-text-muted font-mono">
            © 2026 Oil Risk Monitor AI. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap gap-3">
            {['ISO 27001', 'SOC 2', 'ISO 14001', 'GDPR'].map(c => (
              <div key={c} className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
                <Shield size={9} className="text-ok" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Landing export ───────────────────────────────────────────────────────────
export function Landing() {
  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
