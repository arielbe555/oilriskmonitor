import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function SeverityBadge({ severity, className }) {
  const { t } = useTranslation()
  const classMap = {
    critical: 'badge-critical',
    medium: 'badge-medium',
    low: 'badge-low',
    ok: 'badge-ok',
  }
  return (
    <span className={cn(classMap[severity] ?? 'badge-info', className)}>
      {severity === 'critical' && <span className="status-dot-critical mr-1.5" />}
      {t(`severity.${severity}`, severity)}
    </span>
  )
}

export function StatusBadge({ status, className }) {
  const { t } = useTranslation()
  const classMap = {
    new: 'badge-critical',
    acknowledged: 'badge-medium',
    in_review: 'badge-low',
    resolved: 'badge-ok',
    audited: 'badge-info',
    false_positive: 'badge-info',
  }
  return (
    <span className={cn(classMap[status] ?? 'badge-info', className)}>
      {t(`status.${status}`, status)}
    </span>
  )
}
