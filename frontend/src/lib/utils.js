import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function severityClass(severity) {
  const map = {
    critical: 'badge-critical',
    medium: 'badge-medium',
    low: 'badge-low',
    ok: 'badge-ok',
  }
  return map[severity] ?? 'badge-info'
}

export function severityColor(severity) {
  const map = {
    critical: '#FF2D2D',
    medium: '#FF8C00',
    low: '#FFD700',
    ok: '#00FF87',
  }
  return map[severity] ?? '#8899AA'
}

export function statusClass(status) {
  const map = {
    new: 'badge-critical',
    acknowledged: 'badge-medium',
    in_review: 'badge-low',
    resolved: 'badge-ok',
    audited: 'badge-info',
    false_positive: 'badge-info',
  }
  return map[status] ?? 'badge-info'
}

export function assetIcon(type) {
  const map = {
    well: '🛢️',
    pipeline: '📏',
    plant: '🏭',
    tank: '⬡',
    platform: '⚙️',
  }
  return map[type] ?? '📍'
}

export function timeAgo(dateStr, lang = 'es') {
  if (!dateStr) return '—'
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: lang === 'es' ? es : enUS,
  })
}

export function formatDate(dateStr, lang = 'es') {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', {
    locale: lang === 'es' ? es : enUS,
  })
}

export function truncateHash(hash) {
  if (!hash) return '—'
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

export function formatArea(m2) {
  if (!m2) return '—'
  if (m2 >= 1000000) return `${(m2 / 1000000).toFixed(2)} km²`
  if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`
  return `${m2.toLocaleString()} m²`
}
