import { useTranslation } from 'react-i18next'
import { FileText, Download, Shield, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { mockReports } from '@/data/mock'
import { formatDate, truncateHash } from '@/lib/utils'

function ReportCard({ report }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{report.title}</h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {report.periodStart} → {report.periodEnd}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.isValid === true && (
            <div className="flex items-center gap-1.5 badge-ok">
              <Shield size={11} /> Firmado
            </div>
          )}
          {report.isValid === null && (
            <div className="flex items-center gap-1.5 badge-low">
              <Clock size={11} /> Pendiente firma
            </div>
          )}
        </div>
      </div>

      {report.summary && (
        <p className="text-xs text-text-secondary leading-relaxed">{report.summary}</p>
      )}

      {report.fileHash && (
        <div className="p-2.5 bg-surface-2 rounded-lg border border-border">
          <p className="text-xs font-mono text-text-muted mb-1 uppercase tracking-wider">SHA-256</p>
          <p className="text-xs font-mono text-text-secondary break-all">{truncateHash(report.fileHash)}</p>
          {report.signedBy && (
            <p className="text-xs text-text-muted mt-1.5">
              Firmado por: <span className="text-text-secondary">{report.signedBy}</span>
              {report.signedAt && ` · ${formatDate(report.signedAt, i18n.language)}`}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <button className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
          <Download size={12} /> {t('buttons.download')} PDF
        </button>
        {report.fileHash && (
          <button className="btn-ghost text-xs py-1.5 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {t('buttons.verify')}
          </button>
        )}
        <span className="ml-auto text-xs text-text-muted font-mono">
          {formatDate(report.generatedAt, i18n.language)}
        </span>
      </div>
    </div>
  )
}

export function Reports() {
  const { t } = useTranslation()

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('nav.reports')}</h1>
          <p className="text-sm text-text-muted mt-0.5 font-mono">Reportes ESG con firma digital RSA-2048</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FileText size={14} /> {t('buttons.generate')} Reporte ESG
        </button>
      </div>

      {/* Info banner */}
      <div className="p-3 bg-brand-dim border border-brand/20 rounded-xl flex items-start gap-2.5">
        <Shield size={14} className="text-brand flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary">
          Todos los reportes incluyen hash SHA-256 y firma digital RSA-2048 para verificación de integridad.
          Los reportes firmados son admisibles como evidencia en auditorías ISO 14001 y SOC 2.
        </p>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {mockReports.map(report => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  )
}
