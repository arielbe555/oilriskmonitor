import { useTranslation } from 'react-i18next'
import { formatDate } from '@/lib/utils'
import {
  AlertTriangle, CheckCircle2, MessageSquare, Eye, Shield,
  Image, User, Zap, Clock
} from 'lucide-react'

const EVENT_ICONS = {
  created: Zap,
  acknowledged: Eye,
  status_change: Clock,
  comment: MessageSquare,
  image_added: Image,
  resolved: CheckCircle2,
  audited: Shield,
  assigned: User,
}

const EVENT_COLORS = {
  created: '#FF8C00',
  acknowledged: '#FFD700',
  status_change: '#8899AA',
  comment: '#64748b',
  image_added: '#3b82f6',
  resolved: '#00FF87',
  audited: '#a78bfa',
  assigned: '#64748b',
}

export function TicketTimeline({ events }) {
  const { t } = useTranslation()

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, idx) => {
          const Icon = EVENT_ICONS[event.eventType] ?? MessageSquare
          const color = EVENT_COLORS[event.eventType] ?? '#8899AA'

          return (
            <div key={event.id} className="flex gap-4 relative animate-fade-in">
              {/* Icon node */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-surface z-10"
                style={{ borderColor: color }}
              >
                <Icon size={13} style={{ color }} />
              </div>

              {/* Content */}
              <div className="flex-1 card py-2.5 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span className="font-semibold text-sm text-text-primary">
                      {event.userName}
                    </span>
                    {event.userRole && (
                      <span className="text-xs text-text-muted ml-2 font-mono uppercase">
                        {event.userRole}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted font-mono flex-shrink-0">
                    {formatDate(event.createdAt)}
                  </span>
                </div>

                {(event.previousStatus && event.newStatus) && (
                  <div className="mt-1 flex items-center gap-2 text-xs font-mono">
                    <span className="badge-info">{t(`status.${event.previousStatus}`, event.previousStatus)}</span>
                    <span className="text-text-muted">→</span>
                    <span className="badge-ok">{t(`status.${event.newStatus}`, event.newStatus)}</span>
                  </div>
                )}

                {event.comment && (
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                    {event.comment}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
