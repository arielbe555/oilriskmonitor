import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, User, Clock, Shield, AlertTriangle, Satellite } from 'lucide-react'
import { SeverityBadge, StatusBadge } from '@/components/SeverityBadge'
import { TicketTimeline } from '@/components/TicketTimeline'
import { SatelliteViewer } from '@/components/SatelliteViewer'
import { mockTickets, mockSatelliteImages } from '@/data/mock'
import { formatDate, timeAgo } from '@/lib/utils'

export function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const ticket = mockTickets.find(tk => tk.id === id)
  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Ticket no encontrado</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/tickets')}>
          Volver a Tickets
        </button>
      </div>
    )
  }

  const satelliteData = mockSatelliteImages[ticket.assetId]

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* Back */}
      <button
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        onClick={() => navigate('/tickets')}
      >
        <ArrowLeft size={15} /> Volver a Tickets
      </button>

      {/* Header card */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-text-muted">{ticket.code}</span>
              <StatusBadge status={ticket.status} />
              <SeverityBadge severity={ticket.priority} />
            </div>
            <h1 className="text-lg font-bold text-text-primary">{ticket.title}</h1>
          </div>
          {ticket.status === 'new' && (
            <button className="btn-primary">
              {t('buttons.acknowledge')}
            </button>
          )}
          {ticket.status === 'in_review' && (
            <button className="btn-primary">
              {t('buttons.markResolved')}
            </button>
          )}
          {ticket.status === 'resolved' && (
            <button className="btn-primary">
              {t('buttons.audit')}
            </button>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <p className="section-title mb-0">Activo</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-text-muted" />
              <span className="text-sm text-text-primary">{ticket.assetName}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="section-title mb-0">Asignado a</p>
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-text-muted" />
              <span className="text-sm text-text-primary">{ticket.assignedTo || '—'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="section-title mb-0">Vencimiento</p>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className={ticket.slaBreached ? 'text-critical' : 'text-text-muted'} />
              <span className={`text-sm ${ticket.slaBreached ? 'text-critical' : 'text-text-primary'}`}>
                {formatDate(ticket.dueDate, i18n.language)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="section-title mb-0">Creado</p>
            <span className="text-sm text-text-primary">
              {timeAgo(ticket.createdAt, i18n.language)}
            </span>
          </div>
        </div>

        {/* Resolution note */}
        {ticket.resolutionNote && (
          <div className="p-3 bg-ok-dim border border-ok/20 rounded-lg">
            <p className="text-xs font-mono text-ok uppercase tracking-wider mb-1">Nota de resolución</p>
            <p className="text-sm text-text-secondary">{ticket.resolutionNote}</p>
          </div>
        )}

        {/* Audit note */}
        {ticket.auditNote && (
          <div className="p-3 bg-surface-2 border border-border rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={12} className="text-text-muted" />
              <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Nota de auditoría · {ticket.auditedBy}</p>
            </div>
            <p className="text-sm text-text-secondary">{ticket.auditNote}</p>
          </div>
        )}
      </div>

      {/* Satellite viewer */}
      {satelliteData && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Satellite size={14} className="text-brand" />
            <span className="section-title mb-0">Imágenes satelitales — Antes vs Después</span>
          </div>
          <SatelliteViewer
            beforeUrl={satelliteData.before}
            afterUrl={satelliteData.after}
            analysis={satelliteData.aiAnalysis}
          />
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-text-muted" />
          <span className="section-title mb-0">Historial del ticket</span>
        </div>
        <TicketTimeline events={ticket.events} />

        {/* Add comment (mock) */}
        <div className="mt-4 pt-4 border-t border-border">
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Agregar comentario..."
          />
          <div className="flex justify-end mt-2">
            <button className="btn-primary text-xs">
              {t('buttons.addComment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
