import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Bell, Ticket, MapPin, Scan, TrendingUp, Clock, Activity } from 'lucide-react'
import { KPICard } from '@/components/KPICard'
import { AssetMap } from '@/components/AssetMap'
import { SeverityBadge, StatusBadge } from '@/components/SeverityBadge'
import { mockKPIs, mockAlerts, mockTickets, mockAssets, mockActivityFeed } from '@/data/mock'
import { timeAgo, formatDate, assetIcon } from '@/lib/utils'

function AlertRow({ alert, onClick }) {
  const { t, i18n } = useTranslation()
  return (
    <div
      className="flex items-start gap-3 p-3 hover:bg-surface-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border"
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {alert.severity === 'critical' && <span className="status-dot-critical" />}
        {alert.severity === 'medium' && <span className="status-dot-medium" />}
        {alert.severity === 'low' && <span className="status-dot-low" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={alert.severity} />
          <span className="text-xs font-mono text-text-muted">
            {t(`anomalyType.${alert.anomalyType}`, alert.anomalyType)}
          </span>
        </div>
        <p className="text-sm text-text-primary mt-1 truncate">{alert.title}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {alert.assetName} · {timeAgo(alert.createdAt, i18n.language)}
        </p>
      </div>
      <StatusBadge status={alert.status} className="flex-shrink-0 text-[10px]" />
    </div>
  )
}

function TicketRow({ ticket }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-surface-2 rounded-lg transition-colors">
      <StatusBadge status={ticket.status} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-text-muted">{ticket.code}</p>
        <p className="text-sm text-text-primary truncate">{ticket.title}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-text-secondary">{ticket.assignedTo || '—'}</p>
        <SeverityBadge severity={ticket.priority} className="text-[10px]" />
      </div>
    </div>
  )
}

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [selectedAsset, setSelectedAsset] = useState(null)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          {t('nav.dashboard')} <span className="text-brand">SOC</span>
        </h1>
        <p className="text-sm text-text-muted mt-1 font-mono">
          Oil & Gas Environmental Monitoring · {new Date().toLocaleDateString(i18n.language)}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label={t('nav.assets')}
          value={mockKPIs.assetsMonitored}
          sub="monitoreados"
          icon={MapPin}
        />
        <KPICard
          label={t('nav.alerts')}
          value={mockKPIs.activeAlerts}
          sub={`${mockKPIs.criticalAlerts} crítica`}
          icon={Bell}
          pulse={mockKPIs.criticalAlerts > 0}
        />
        <KPICard
          label={t('nav.tickets')}
          value={mockKPIs.openTickets}
          sub="en curso"
          icon={Ticket}
        />
        <KPICard
          label="Scans hoy"
          value={mockKPIs.scansToday}
          sub="satelitales"
          icon={Scan}
        />
      </div>

      {/* Map + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="section-title mb-0">Mapa de activos</span>
            <span className="text-xs font-mono text-text-muted">{mockAssets.length} activos</span>
          </div>
          <div style={{ height: '320px' }}>
            <AssetMap assets={mockAssets} onAssetClick={setSelectedAsset} />
          </div>
          {selectedAsset && (
            <div className="p-3 border-t border-border bg-surface-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{assetIcon(selectedAsset.type)}</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{selectedAsset.name}</p>
                  <p className="text-xs text-text-muted">{selectedAsset.responsibleName}</p>
                </div>
              </div>
              <button
                className="btn-secondary text-xs"
                onClick={() => navigate('/alerts')}
              >
                Ver alertas
              </button>
            </div>
          )}
        </div>

        {/* Alert feed */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title mb-0">Centro de alertas</span>
            <button className="text-xs text-brand hover:underline" onClick={() => navigate('/alerts')}>
              Ver todas
            </button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {mockAlerts.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">{t('noData')}</p>
            ) : (
              mockAlerts.map(alert => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onClick={() => navigate(`/tickets/${alert.ticketId}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tickets + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent tickets */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title mb-0">Tickets recientes</span>
            <button className="text-xs text-brand hover:underline" onClick={() => navigate('/tickets')}>
              Ver todos
            </button>
          </div>
          <div className="space-y-1">
            {mockTickets.slice(0, 4).map(t => (
              <TicketRow key={t.id} ticket={t} />
            ))}
          </div>
        </div>

        {/* Stats + Activity */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="font-mono text-2xl font-bold text-ok">{mockKPIs.complianceScore}%</p>
              <p className="text-xs text-text-muted mt-1">Compliance ISO 14001</p>
            </div>
            <div className="card text-center">
              <p className="font-mono text-2xl font-bold text-text-primary">{mockKPIs.avgResolutionHours}h</p>
              <p className="text-xs text-text-muted mt-1">Tiempo resolución medio</p>
            </div>
          </div>

          {/* Activity feed */}
          <div className="card">
            <span className="section-title">Actividad reciente</span>
            <div className="space-y-2">
              {mockActivityFeed.map(item => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <span className={`flex-shrink-0 mt-1 ${
                    item.severity === 'critical' ? 'status-dot-critical' :
                    item.severity === 'medium' ? 'status-dot-medium' :
                    item.severity === 'low' ? 'status-dot-low' : 'status-dot-ok'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary">{item.message}</p>
                  </div>
                  <span className="text-xs font-mono text-text-muted flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
