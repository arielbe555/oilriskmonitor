import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Bell, Filter, ExternalLink, CheckCircle } from 'lucide-react'
import { SeverityBadge, StatusBadge } from '@/components/SeverityBadge'
import { mockAlerts } from '@/data/mock'
import { timeAgo, formatDate, formatArea } from '@/lib/utils'

export function Alerts() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = mockAlerts.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('nav.alerts')}</h1>
          <p className="text-sm text-text-muted mt-0.5 font-mono">{filtered.length} alertas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-text-muted" />
          {['all', 'critical', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                severityFilter === s
                  ? s === 'all' ? 'bg-surface-2 border border-brand text-brand'
                    : s === 'critical' ? 'badge-critical'
                    : s === 'medium' ? 'badge-medium'
                    : 'badge-low'
                  : 'bg-surface-2 border border-border text-text-secondary hover:border-border-2'
              }`}
            >
              {s === 'all' ? t('filters.all') : t(`severity.${s}`)}
            </button>
          ))}
          <div className="h-4 w-px bg-border" />
          {['all', 'new', 'acknowledged', 'in_review', 'resolved'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                statusFilter === s
                  ? 'bg-brand/10 border border-brand text-brand'
                  : 'bg-surface-2 border border-border text-text-secondary hover:border-border-2'
              }`}
            >
              {s === 'all' ? t('filters.all') : t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <CheckCircle className="mx-auto mb-2 text-ok" size={28} />
            <p className="text-text-secondary">{t('noData')}</p>
          </div>
        )}
        {filtered.map(alert => (
          <div key={alert.id} className={`card border-l-2 ${
            alert.severity === 'critical' ? 'border-l-critical' :
            alert.severity === 'medium' ? 'border-l-medium' : 'border-l-low'
          } space-y-3`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
                <span className="text-xs font-mono text-text-muted">
                  {t(`anomalyType.${alert.anomalyType}`, alert.anomalyType)}
                </span>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {timeAgo(alert.createdAt, i18n.language)}
              </span>
            </div>

            {/* Title + asset */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{alert.title}</h3>
              <p className="text-xs text-text-muted mt-0.5 font-mono">📍 {alert.assetName}</p>
            </div>

            {/* Message */}
            <p className="text-sm text-text-secondary leading-relaxed">{alert.message}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap">
              {alert.confidence && (
                <span className="text-xs font-mono text-text-muted">
                  {t('confidence')}: <span className="text-ok font-bold">{alert.confidence}%</span>
                </span>
              )}
              {alert.estimatedAreaM2 && (
                <span className="text-xs font-mono text-text-muted">
                  {t('area')}: <span className="text-text-primary">{formatArea(alert.estimatedAreaM2)}</span>
                </span>
              )}
              <div className="flex gap-1">
                {alert.notifiedChannels.map(ch => (
                  <span key={ch} className="badge-info">{ch}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <button className="btn-primary text-xs py-1.5">
                {t('buttons.acknowledge')}
              </button>
              {alert.ticketId && (
                <button
                  className="btn-secondary text-xs py-1.5 flex items-center gap-1"
                  onClick={() => navigate(`/tickets/${alert.ticketId}`)}
                >
                  <ExternalLink size={11} />
                  {t('buttons.viewTicket')}
                </button>
              )}
              <span className="ml-auto text-xs text-text-muted font-mono">
                {formatDate(alert.createdAt, i18n.language)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
