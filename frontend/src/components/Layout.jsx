import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Bell, Ticket, MapPin, FileText,
  Settings, Radio, Globe, ChevronRight, Activity, LogOut
} from 'lucide-react'
import { mockKPIs } from '@/data/mock'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('en') ? 'en' : 'es'
  const next = current === 'es' ? 'en' : 'es'
  return (
    <button
      onClick={() => i18n.changeLanguage(next)}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-2 border border-border hover:border-border-2 transition-colors"
      title={`Switch to ${next.toUpperCase()}`}
    >
      <Globe size={12} className="text-text-secondary" />
      <span className="text-xs font-mono font-bold text-text-secondary uppercase">{current}</span>
    </button>
  )
}

function NavItem({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
        isActive
          ? 'bg-brand/10 text-brand border border-brand/20'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
      )}
    >
      {({ isActive }) => (
        <>
          <Icon size={16} className={isActive ? 'text-brand' : 'text-text-muted group-hover:text-text-secondary'} />
          <span className="text-sm font-medium">{label}</span>
          {badge > 0 && (
            <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-critical text-white text-[10px] font-bold flex items-center justify-center px-1">
              {badge}
            </span>
          )}
          {isActive && <ChevronRight size={12} className="ml-auto text-brand" />}
        </>
      )}
    </NavLink>
  )
}

export function Layout() {
  const { t } = useTranslation()
  const { logout, getSession } = useAuth()
  const navigate = useNavigate()
  const session = getSession()
  const activeAlerts = mockKPIs.activeAlerts
  const openTickets = mockKPIs.openTickets

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Radio size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-text-primary leading-tight">OIL RISK</p>
              <p className="text-[10px] font-mono text-text-muted leading-tight">MONITOR AI</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div className="section-title px-1 mt-1">Operaciones</div>
          <NavItem to="/app/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <NavItem to="/app/alerts" icon={Bell} label={t('nav.alerts')} badge={activeAlerts} />
          <NavItem to="/app/tickets" icon={Ticket} label={t('nav.tickets')} badge={openTickets} />
          <NavItem to="/app/assets" icon={MapPin} label={t('nav.assets')} />

          <div className="section-title px-1 mt-3">Compliance</div>
          <NavItem to="/app/reports" icon={FileText} label={t('nav.reports')} />

          <div className="section-title px-1 mt-3">Sistema</div>
          <NavItem to="/app/settings" icon={Settings} label={t('nav.settings')} />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <LanguageToggle />
            <button onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors px-1.5 py-1 rounded hover:bg-surface-2"
              title="Cerrar sesión">
              <LogOut size={11} />
            </button>
          </div>
          {session?.email && (
            <p className="text-[10px] font-mono text-text-muted truncate px-1">{session.email}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ok flex-shrink-0" />
            <span className="text-xs font-mono text-text-muted">5 activos · 10 scans/día</span>
          </div>
          <div className="text-[10px] font-mono text-text-muted px-1 py-0.5 bg-brand-dim rounded border border-brand/20 text-center">
            DEMO MODE
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={14} className="text-ok" />
            <span className="text-xs font-mono text-text-muted">
              YPF Demo S.A. · {new Date().toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {mockKPIs.criticalAlerts > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-critical-dim border border-critical/30 rounded-lg">
                <span className="status-dot-critical" />
                <span className="text-xs font-mono text-critical font-bold">
                  {mockKPIs.criticalAlerts} crítica{mockKPIs.criticalAlerts > 1 ? 's' : ''}
                </span>
              </div>
            )}
            <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center">
              <span className="text-xs font-mono text-text-secondary">RD</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
