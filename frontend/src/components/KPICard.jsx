import { cn } from '@/lib/utils'

export function KPICard({ label, value, sub, accent, icon: Icon, pulse }) {
  return (
    <div className={cn('card flex flex-col gap-2 min-w-0', accent && `border-l-2 border-l-[${accent}]`)}>
      <div className="flex items-center justify-between gap-2">
        <span className="section-title mb-0">{label}</span>
        {Icon && <Icon size={14} className="text-text-muted flex-shrink-0" />}
      </div>
      <div className="flex items-end gap-2">
        <span className={cn('font-mono text-3xl font-bold leading-none', pulse && 'text-critical')}>
          {pulse && <span className="status-dot-critical mr-2" />}
          {value}
        </span>
      </div>
      {sub && <span className="text-xs text-text-muted">{sub}</span>}
    </div>
  )
}
