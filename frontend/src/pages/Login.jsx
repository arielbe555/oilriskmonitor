import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Radio, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated()) navigate('/app/dashboard', { replace: true })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    login(email)
    navigate('/app/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />

      {/* Back to landing */}
      <Link to="/" className="absolute top-6 left-6 text-xs text-text-muted hover:text-text-secondary transition-colors font-mono">
        ← oilriskmonitor.com
      </Link>

      {/* Login card */}
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <Radio size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-text-primary leading-none tracking-tight">OIL RISK</p>
            <p className="text-[10px] font-mono text-brand leading-none mt-0.5 tracking-widest uppercase">Monitor AI</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-primary">Bienvenido</h1>
            <p className="text-sm text-text-secondary mt-1">Ingresá a tu cuenta de monitoreo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@empresa.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-critical bg-critical-dim border border-critical/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 font-semibold text-sm mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-[11px] text-text-muted text-center font-mono leading-relaxed">
              Demo: usá cualquier email y contraseña
            </p>
          </div>
        </div>

        {/* Request access */}
        <p className="text-center text-xs text-text-muted mt-6">
          ¿No tenés acceso?{' '}
          <Link to="/" className="text-brand hover:text-orange-400 transition-colors font-medium">
            Solicitá una demo
          </Link>
        </p>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {['ISO 27001', 'SOC 2', 'ISO 14001'].map(c => (
            <div key={c} className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
              <Shield size={9} className="text-ok" />
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
