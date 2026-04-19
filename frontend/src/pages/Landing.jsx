import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Satellite, Zap, Shield, FileText, Bell, Lock,
  ChevronRight, ArrowRight, Radio, Check, Activity, MapPin
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ── 3D Rotating Planet with Satellites ──────────────────────────────────────
function GlobeViz() {
  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none" style={{ paddingTop: 60, paddingBottom: 60 }}>

      {/* Planet wrapper */}
      <div className="relative mx-auto" style={{ width: 340, height: 340 }}>

        {/* Atmosphere glow ring */}
        <div className="absolute rounded-full pointer-events-none" style={{
          inset: -22,
          background: 'radial-gradient(circle, transparent 43%, rgba(96,165,250,0.32) 54%, rgba(59,130,246,0.1) 68%, transparent 80%)',
          filter: 'blur(12px)',
        }} />

        {/* Planet sphere */}
        <div className="absolute inset-0 rounded-full overflow-hidden" style={{
          boxShadow: [
            'inset -70px -24px 130px rgba(0,0,30,0.9)',
            'inset 24px 12px 75px rgba(255,255,255,0.05)',
            '0 28px 90px rgba(14,78,180,0.32)',
            '0 0 0 1.5px rgba(100,160,255,0.2)',
          ].join(','),
        }}>
          {/* Ocean base */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(178deg, #1a56a8 0%, #1565c0 28%, #0d3d8c 62%, #071a52 100%)',
          }} />

          {/* Scrolling continent texture */}
          <div className="absolute top-0 bottom-0" style={{
            left: 0, width: '200%',
            backgroundSize: '50% 100%',
            backgroundRepeat: 'repeat-x',
            animation: 'rotatePlanet 30s linear infinite',
            background: [
              'radial-gradient(ellipse 80px 88px at 18% 30%, rgba(52,128,58,0.82) 0%, rgba(30,85,34,0.5) 48%, transparent 72%)',
              'radial-gradient(ellipse 30px 22px at 22% 46%, rgba(72,148,68,0.65) 0%, transparent 60%)',
              'radial-gradient(ellipse 36px 27px at 25% 12%, rgba(218,232,248,0.58) 0%, transparent 62%)',
              'radial-gradient(ellipse 62px 106px at 28% 63%, rgba(42,120,46,0.84) 0%, rgba(24,85,28,0.52) 48%, transparent 72%)',
              'radial-gradient(ellipse 18px 88px at 24% 60%, rgba(105,82,58,0.44) 0%, transparent 65%)',
              'radial-gradient(ellipse 26px 30px at 27% 82%, rgba(128,142,132,0.42) 0%, transparent 60%)',
              'radial-gradient(ellipse 100% 16px at 50% 98%, rgba(222,236,255,0.55) 0%, transparent 100%)',
              'radial-gradient(ellipse 44px 36px at 52% 25%, rgba(96,178,100,0.74) 0%, transparent 62%)',
              'radial-gradient(ellipse 20px 30px at 54% 16%, rgba(165,198,172,0.5) 0%, transparent 58%)',
              'radial-gradient(ellipse 60px 30px at 54% 42%, rgba(190,166,88,0.72) 0%, transparent 62%)',
              'radial-gradient(ellipse 50px 66px at 55% 60%, rgba(108,78,46,0.78) 0%, rgba(82,60,36,0.5) 48%, transparent 70%)',
              'radial-gradient(ellipse 26px 34px at 62% 41%, rgba(186,158,78,0.66) 0%, transparent 60%)',
              'radial-gradient(ellipse 24px 40px at 68% 50%, rgba(108,78,46,0.7) 0%, transparent 62%)',
              'radial-gradient(ellipse 98px 54px at 72% 22%, rgba(78,128,82,0.68) 0%, rgba(152,182,152,0.4) 48%, transparent 70%)',
              'radial-gradient(ellipse 70px 54px at 76% 36%, rgba(76,138,80,0.74) 0%, transparent 65%)',
              'radial-gradient(ellipse 34px 28px at 80% 52%, rgba(54,118,58,0.66) 0%, transparent 60%)',
              'radial-gradient(ellipse 56px 42px at 82% 67%, rgba(182,136,70,0.76) 0%, rgba(152,112,60,0.5) 48%, transparent 65%)',
              'radial-gradient(ellipse 12px 20px at 90% 72%, rgba(80,138,84,0.56) 0%, transparent 60%)',
              'radial-gradient(ellipse 14px 24px at 86% 36%, rgba(90,152,94,0.62) 0%, transparent 58%)',
              'linear-gradient(178deg, #1a56a8 0%, #1565c0 28%, #0d3d8c 62%, #071a52 100%)',
            ].join(','),
          }} />

          {/* Cloud wisps */}
          <div className="absolute top-0 bottom-0" style={{
            left: 0, width: '200%',
            backgroundSize: '50% 100%',
            backgroundRepeat: 'repeat-x',
            animation: 'rotatePlanet 52s linear infinite',
            background: [
              'radial-gradient(ellipse 88px 16px at 32% 32%, rgba(255,255,255,0.2) 0%, transparent 80%)',
              'radial-gradient(ellipse 62px 12px at 58% 20%, rgba(255,255,255,0.17) 0%, transparent 78%)',
              'radial-gradient(ellipse 105px 14px at 46% 56%, rgba(255,255,255,0.14) 0%, transparent 80%)',
              'radial-gradient(ellipse 52px 10px at 76% 44%, rgba(255,255,255,0.18) 0%, transparent 75%)',
              'transparent',
            ].join(','),
          }} />

          {/* Day/night terminator */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 73% 44%, transparent 26%, rgba(0,0,22,0.62) 62%, rgba(0,0,16,0.88) 100%)',
          }} />

          {/* Specular highlight */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 28% 27%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 24%, transparent 50%)',
          }} />
        </div>

        {/* Satellites + orbits SVG — centered on planet */}
        <svg
          className="absolute pointer-events-none"
          style={{ inset: -115, width: 'calc(100% + 230px)', height: 'calc(100% + 230px)', overflow: 'visible' }}
          viewBox="0 0 570 570"
        >
          <defs>
            {/* orbit paths centered at (285,285), planet r=170 */}
            <path id="o1" d="M 515,285 A 230,70 0 0,1 55,285 A 230,70 0 0,1 515,285" transform="rotate(-20, 285, 285)" />
            <path id="o2" d="M 360,285 A 75,215 0 0,1 210,285 A 75,215 0 0,1 360,285" transform="rotate(18, 285, 285)" />
            <path id="o3" d="M 535,285 A 250,76 0 0,0 35,285 A 250,76 0 0,1 535,285" transform="rotate(52, 285, 285)" />
          </defs>

          {/* Orbit ring 1 — orange */}
          <ellipse cx="285" cy="285" rx="230" ry="70"
            fill="none" stroke="rgba(255,107,0,0.28)" strokeWidth="1.5" strokeDasharray="7 5"
            transform="rotate(-20, 285, 285)" />
          {/* Orbit ring 2 — blue */}
          <ellipse cx="285" cy="285" rx="75" ry="215"
            fill="none" stroke="rgba(96,165,250,0.2)" strokeWidth="1" strokeDasharray="5 6"
            transform="rotate(18, 285, 285)" />
          {/* Orbit ring 3 — green */}
          <ellipse cx="285" cy="285" rx="250" ry="76"
            fill="none" stroke="rgba(74,222,128,0.18)" strokeWidth="1" strokeDasharray="4 7"
            transform="rotate(52, 285, 285)" />

          {/* Satellite 1 — Sentinel-1 SAR (orange) */}
          <g>
            <circle r="22" fill="rgba(255,107,0,0.1)">
              <animateMotion dur="14s" repeatCount="indefinite"><mpath href="#o1" /></animateMotion>
            </circle>
            <rect x="-13" y="-3" width="9" height="6" rx="1.5" fill="#FFB74D" opacity="0.95">
              <animateMotion dur="14s" repeatCount="indefinite"><mpath href="#o1" /></animateMotion>
            </rect>
            <rect x="4" y="-3" width="9" height="6" rx="1.5" fill="#FFB74D" opacity="0.95">
              <animateMotion dur="14s" repeatCount="indefinite"><mpath href="#o1" /></animateMotion>
            </rect>
            <circle r="5.5" fill="#FF6B00">
              <animateMotion dur="14s" repeatCount="indefinite"><mpath href="#o1" /></animateMotion>
            </circle>
          </g>

          {/* Satellite 2 — Sentinel-2 optical (blue) */}
          <g>
            <circle r="16" fill="rgba(59,130,246,0.1)">
              <animateMotion dur="21s" repeatCount="indefinite" begin="-8s"><mpath href="#o2" /></animateMotion>
            </circle>
            <rect x="-11" y="-2.5" width="8" height="5" rx="1" fill="#93C5FD" opacity="0.9">
              <animateMotion dur="21s" repeatCount="indefinite" begin="-8s"><mpath href="#o2" /></animateMotion>
            </rect>
            <rect x="3" y="-2.5" width="8" height="5" rx="1" fill="#93C5FD" opacity="0.9">
              <animateMotion dur="21s" repeatCount="indefinite" begin="-8s"><mpath href="#o2" /></animateMotion>
            </rect>
            <circle r="4.5" fill="#60A5FA">
              <animateMotion dur="21s" repeatCount="indefinite" begin="-8s"><mpath href="#o2" /></animateMotion>
            </circle>
          </g>

          {/* Satellite 3 — environmental (green) */}
          <g>
            <circle r="13" fill="rgba(34,197,94,0.1)">
              <animateMotion dur="27s" repeatCount="indefinite" begin="-14s"><mpath href="#o3" /></animateMotion>
            </circle>
            <rect x="-9" y="-2" width="6" height="4" rx="1" fill="#86EFAC" opacity="0.9">
              <animateMotion dur="27s" repeatCount="indefinite" begin="-14s"><mpath href="#o3" /></animateMotion>
            </rect>
            <rect x="3" y="-2" width="6" height="4" rx="1" fill="#86EFAC" opacity="0.9">
              <animateMotion dur="27s" repeatCount="indefinite" begin="-14s"><mpath href="#o3" /></animateMotion>
            </rect>
            <circle r="3.5" fill="#4ADE80">
              <animateMotion dur="27s" repeatCount="indefinite" begin="-14s"><mpath href="#o3" /></animateMotion>
            </circle>
          </g>

          {/* Alert ping — Patagonia approx */}
          <g transform="translate(258, 326)">
            <circle r="5" fill="#DC2626" />
            <circle r="5" fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.75">
              <animate attributeName="r" values="5;22;5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.75;0;0.75" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="5" fill="none" stroke="#DC2626" strokeWidth="1">
              <animate attributeName="r" values="5;36;5" dur="2s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* OK asset marker */}
          <circle cx="295" cy="345" r="4.5" fill="#22c55e" opacity="0.85" />
          <circle cx="310" cy="312" r="3.5" fill="#22c55e" opacity="0.7" />
        </svg>

      </div>

      {/* Alert card — white, shadow */}
      <div className="absolute top-[3%] right-[-2%] lg:right-[-10%] bg-white rounded-2xl p-4 shadow-xl shadow-slate-200 border border-slate-100 min-w-[215px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-black text-red-600 tracking-widest uppercase">Alerta crítica</span>
        </div>
        <p className="text-sm font-semibold text-slate-800">Pozo Norte-14 · Patagonia</p>
        <p className="text-xs text-slate-500 mt-0.5">Derrame detectado · 2,400 m²</p>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[11px] font-mono text-slate-400">Confianza IA</span>
          <span className="text-[11px] font-bold text-red-500 font-mono">94%</span>
        </div>
      </div>

      {/* Scan card — white, shadow */}
      <div className="absolute bottom-[12%] left-[-2%] lg:left-[-10%] bg-white rounded-2xl p-4 shadow-xl shadow-slate-200 border border-slate-100 min-w-[215px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Satellite size={11} className="text-brand" />
          </div>
          <span className="text-[11px] font-black text-brand tracking-widest uppercase">Sentinel-1 SAR</span>
        </div>
        <p className="text-sm font-semibold text-slate-800">Escaneando LATAM</p>
        <p className="text-xs text-slate-500 mt-0.5">5 activos · scan activo</p>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Progreso del scan</span><span>60%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full animate-scan-bar" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Navbar (light) ───────────────────────────────────────────────────────────
function LandingNav() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand shadow-md shadow-brand/30 flex items-center justify-center">
            <Radio size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-black text-slate-900 leading-none tracking-tight">OIL RISK</p>
            <p className="text-[9px] font-mono text-brand leading-none mt-0.5 tracking-widest">MONITOR AI</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1">
          {[
            { label: 'Funcionalidades', href: '#features' },
            { label: 'Cómo funciona', href: '#how-it-works' },
            { label: 'Compliance', href: '#compliance' },
          ].map(l => (
            <a key={l.href} href={l.href}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated() ? (
            <button onClick={() => navigate('/app/dashboard')}
              className="btn-primary flex items-center gap-1.5 text-sm font-semibold">
              Ir al dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Iniciar sesión
              </button>
              <button onClick={() => navigate('/login')}
                className="btn-primary flex items-center gap-1.5 text-sm font-semibold px-5">
                Solicitar demo <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-white overflow-hidden">
      {/* Subtle brand tint top */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,107,0,0.035) 0%, transparent 100%)' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.55 }} />

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center w-full">
        <div className="space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-bold text-brand tracking-wide">
              Satellite AI · Detección en &lt; 24h
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl xl:text-[72px] font-black leading-[1.0] tracking-tight text-slate-900">
            Detecta derrames<br />
            <span className="text-slate-900">de petróleo</span><br />
            <span style={{
              backgroundImage: 'linear-gradient(125deg, #FF6B00 0%, #EA580C 60%, #DC2626 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              antes de que ocurran.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
            Monitoreo satelital con IA para Oil & Gas. Alertas en{' '}
            <span className="text-slate-800 font-semibold">menos de 24 horas</span>.
            Reportes ESG con{' '}
            <span className="text-slate-800 font-semibold">firma digital RSA-2048</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/login')}
              className="btn-primary px-7 py-3.5 text-[15px] font-bold flex items-center gap-2 shadow-lg shadow-brand/25 rounded-xl">
              Solicitar demo gratuita <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/login')}
              className="px-7 py-3.5 text-[15px] font-semibold text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
              Ver dashboard en vivo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
            {[
              { value: '< 24h', label: 'Detección' },
              { value: '94%', label: 'Precisión IA' },
              { value: 'ISO 14001', label: 'Certificado' },
              { value: 'SOC 2', label: 'Type II' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-slate-900 leading-none">{s.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Globe */}
        <div className="animate-fade-in">
          <GlobeViz />
        </div>
      </div>
    </section>
  )
}

// ── Trust bar ─────────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <div id="compliance" className="border-y border-slate-100 py-5 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-5">
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest flex-shrink-0">
          Certificado bajo:
        </p>
        <div className="flex flex-wrap gap-2">
          {['ISO 27001', 'SOC 2 Type II', 'ISO 14001', 'GDPR', 'LGPD', 'OWASP Top 10'].map(c => (
            <div key={c} className="flex items-center gap-1.5 text-xs font-mono text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-white shadow-sm">
              <Shield size={10} className="text-emerald-500" />
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Problem section ───────────────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">El problema</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Los métodos tradicionales llegan demasiado tarde
          </h2>
          <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">
            Cuando el inspector llega, el daño ya está hecho. Los reguladores ya saben. La multa ya llegó.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 font-black text-sm">✕</div>
              <p className="font-bold text-slate-900 text-lg">Sin ORM AI</p>
            </div>
            <ul className="space-y-3.5">
              {[
                '48–72 horas para detectar un derrame',
                'Inspección manual y costosa en campo',
                'Sin evidencia digital inmutable',
                'Reportes ESG manuales y tardíos',
                'Los reguladores notifican antes que vos',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-red-50 border border-red-100 text-red-400 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-brand to-emerald-400" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 font-black text-sm">✓</div>
              <p className="font-bold text-slate-900 text-lg">Con ORM AI</p>
            </div>
            <ul className="space-y-3.5">
              {[
                'Detección satelital en menos de 24 horas',
                'Análisis automático con IA propia',
                'Tickets auditables con trazabilidad total',
                'Reportes ESG firmados RSA-2048 automáticos',
                'Siempre un paso adelante del regulador',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: Satellite, color: 'blue', title: 'Imágenes Sentinel-1 SAR', desc: 'Radar ESA Copernicus. Detecta hidrocarburos en superficie con cualquier condición climática, noche o día.' },
    { icon: Zap, color: 'orange', title: 'Análisis con IA avanzada', desc: 'Nuestro motor de IA procesa cada imagen satelital en segundos. 94% de precisión con coordenadas GPS exactas del incidente.' },
    { icon: Bell, color: 'amber', title: 'Alertas multicanal en tiempo real', desc: 'Email, SMS y Telegram. Jerarquía de escalado configurable por severidad, horario y turno de trabajo.' },
    { icon: FileText, color: 'violet', title: 'Tickets auditables', desc: 'Workflow completo: detección → asignación → campo → resolución → auditoría. Timeline inmutable.' },
    { icon: Shield, color: 'emerald', title: 'Reportes ESG firmados', desc: 'PDF con firma RSA-2048 y hash SHA-256. Evidencia admisible en auditorías ISO 14001 y SOC 2 Type II.' },
    { icon: Lock, color: 'slate', title: 'Arquitectura multitenant', desc: 'Schema-per-tenant en PostgreSQL con RLS. Datos completamente aislados. ISO 27001, GDPR y LGPD.' },
  ]

  const colors = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    icon: 'text-blue-600' },
    orange:  { bg: 'bg-orange-50',  border: 'border-orange-100',  icon: 'text-brand' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   icon: 'text-amber-600' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  icon: 'text-violet-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600' },
    slate:   { bg: 'bg-slate-50',   border: 'border-slate-200',   icon: 'text-slate-600' },
  }

  return (
    <section id="features" className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">Funcionalidades</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            Todo lo que necesitás para<span className="text-brand"> proteger tus activos</span>
          </h2>
          <p className="text-slate-500 mt-4 text-lg leading-relaxed">
            Del satélite al reporte ESG — completamente automatizado, auditable y conforme a normativas internacionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const c = colors[f.color]
            return (
              <div key={i}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-default">
                <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-5`}>
                  <f.icon size={20} className={c.icon} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { icon: Satellite, title: 'Scan satelital automático', desc: 'Sentinel-1 SAR y Sentinel-2 escanean cada activo cada 6 horas, 365 días al año, en cualquier condición.' },
    { icon: Zap, title: 'IA detecta anomalías', desc: 'Nuestro motor de IA analiza cada imagen en segundos e identifica derrames, fugas y cambios con coordenadas GPS.' },
    { icon: Bell, title: 'Alerta + ticket automático', desc: 'Notificación al responsable correcto + ticket con evidencia satelital para iniciar respuesta inmediata.' },
    { icon: Shield, title: 'Reporte ESG firmado', desc: 'PDF periódico con firma RSA-2048. Listo para auditorías ISO 14001 y reguladores ambientales.' },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">Proceso</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            Del satélite al reporte ESG<span className="text-brand"> en 4 pasos</span>
          </h2>
          <p className="text-slate-500 mt-4 text-lg">
            Completamente automatizado. Sin intervención manual. Auditable en cada paso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-10 left-[13%] right-[13%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          {steps.map((s, i) => (
            <div key={i} className="text-center group">
              <div className="relative inline-flex mb-5">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-brand/25 flex items-center justify-center transition-all">
                  <s.icon size={26} className="text-slate-600 group-hover:text-brand transition-colors" />
                </div>
                <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-brand text-white text-xs font-black flex items-center justify-center shadow-md shadow-brand/30">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Metrics (dark navy) ───────────────────────────────────────────────────────
function MetricsSection() {
  return (
    <section className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F2137 0%, #1A3A5C 50%, #0F2137 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] blur-[90px] opacity-20"
        style={{ background: '#FF6B00' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">Resultados reales</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Números que importan</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {[
            { value: '< 24h', label: 'Tiempo de detección', sub: 'vs 48–72h industria', highlight: true },
            { value: '94%', label: 'Precisión del modelo', sub: 'Sentinel-1 SAR + IA propia', highlight: false },
            { value: '200+', label: 'Activos monitoreados', sub: '5 países LATAM', highlight: false },
            { value: '50M+', label: 'm² analizados', sub: 'Superficie diaria cubierta', highlight: false },
          ].map((m, i) => (
            <div key={i} className={`text-center p-6 rounded-2xl ${m.highlight ? 'bg-brand/10 border border-brand/25' : ''}`}>
              <p className="text-4xl md:text-5xl font-black text-brand mb-2">{m.value}</p>
              <p className="text-sm font-semibold text-white mb-1">{m.label}</p>
              <p className="text-xs text-slate-400 font-mono">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'Redujimos el tiempo de respuesta ante derrames de 72 horas a menos de 18. El impacto operacional y regulatorio fue inmediato.',
      name: 'María Rodríguez', role: 'Directora HSE', company: 'Pan American Energy', initials: 'MR',
    },
    {
      quote: 'Los reportes ESG con firma digital cambiaron cómo presentamos evidencia ante reguladores. Ya no hay cuestionamientos sobre integridad de datos.',
      name: 'Carlos Mendoza', role: 'VP Compliance & Sustainability', company: 'Tecpetrol', initials: 'CM',
    },
    {
      quote: 'El sistema detectó una filtración en un ducto que nuestros controles internos no habían capturado. Eso solo ya justificó la inversión.',
      name: 'Ana Lima', role: 'CTO de Operaciones', company: 'Petrobras Argentina', initials: 'AL',
    },
  ]

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">Testimonios</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">Lo que dicen nuestros clientes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, si) => (
                  <span key={si} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA (dark navy) ───────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F2137 0%, #1E3A5F 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <div className="absolute -top-20 left-1/4 w-[400px] h-[200px] blur-[80px] opacity-20"
        style={{ background: '#FF6B00' }} />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs font-mono text-brand uppercase tracking-widest mb-6">Empezá hoy</p>
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          Protegé tus activos<br />y tu{' '}
          <span className="text-brand">licencia para operar</span>
        </h2>
        <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-xl mx-auto">
          Una demo de 30 minutos es suficiente para ver tu operación real en el sistema. Sin contrato, sin tarjeta de crédito.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <button onClick={() => navigate('/login')}
            className="btn-primary px-8 py-4 text-[15px] font-bold flex items-center gap-2 shadow-xl shadow-brand/25 rounded-xl">
            Solicitar demo gratuita <ArrowRight size={17} />
          </button>
          <button onClick={() => navigate('/login')}
            className="px-8 py-4 text-[15px] font-semibold text-white border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
            Ver dashboard en vivo
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {['Sin contrato', 'Setup en 48h', 'Datos aislados', 'Soporte 24/7'].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
              <Check size={14} className="text-emerald-400" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand shadow-md shadow-brand/20 flex items-center justify-center">
                <Radio size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-900 leading-none">OIL RISK</p>
                <p className="text-[9px] font-mono text-brand leading-none mt-0.5 tracking-widest">MONITOR AI</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[230px]">
              Monitoreo satelital con IA para Oil & Gas. Detectá derrames antes de que impacten.
            </p>
          </div>
          {[
            { title: 'Producto', items: ['Dashboard', 'Alertas', 'Reportes ESG', 'API & Webhooks'] },
            { title: 'Empresa', items: ['Sobre nosotros', 'Casos de uso', 'Documentación', 'Contacto'] },
            { title: 'Legal', items: ['Términos de uso', 'Privacidad', 'Seguridad', 'Compliance'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.items.map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© 2026 Oil Risk Monitor AI. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            {['ISO 27001', 'SOC 2', 'ISO 14001', 'GDPR'].map(c => (
              <div key={c} className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield size={10} className="text-emerald-500" />{c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Landing export ────────────────────────────────────────────────────────────
export function Landing() {
  return (
    <div className="bg-white text-slate-900 overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustBar />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
