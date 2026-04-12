import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Filter, ChevronRight } from 'lucide-react'
import { SeverityBadge, StatusBadge } from '@/components/SeverityBadge'
import { mockTickets } from '@/data/mock'
import { timeAgo, formatDate } from '@/lib/utils'

export function Tickets() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = mockTickets.filter(tk =>
    statusFilter === 'all' || tk.status === statusFilter
  )

  const statusCounts = mockTickets.reduce((acc, tk) => {
    acc[tk.status] = (acc[tk.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('nav.tickets')}</h1>
          <p className="text-sm text-text-muted mt-0.5 font-mono">{filtered.length} tickets</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-text-muted" />
          {['all', 'new', 'in_review', 'resolved', 'audited'].map(s => (
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
              {s !== 'all' && statusCounts[s] ? (
                <span className="ml-1.5 opacity-60">({statusCounts[s]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {filtered.map(ticket => (
          <div
            key={ticket.id}
            className="card hover:border-border-2 cursor-pointer transition-all flex items-center gap-4"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-text-muted">{ticket.code}</span>
                <StatusBadge status={ticket.status} />
                <SeverityBadge severity={ticket.priority} />
              </div>
              <p className="text-sm font-medium text-text-primary truncate">{ticket.title}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-text-muted font-mono">📍 {ticket.assetName}</span>
                {ticket.assignedTo && (
                  <span className="text-xs text-text-muted">👤 {ticket.assignedTo}</span>
                )}
                <span className="text-xs text-text-muted font-mono">
                  {timeAgo(ticket.updatedAt, i18n.language)}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
