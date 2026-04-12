import { useTranslation } from 'react-i18next'
import { SeverityBadge } from '@/components/SeverityBadge'
import { AssetMap } from '@/components/AssetMap'
import { mockAssets } from '@/data/mock'
import { assetIcon, formatDate } from '@/lib/utils'

export function Assets() {
  const { t, i18n } = useTranslation()

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t('nav.assets')}</h1>
          <p className="text-sm text-text-muted mt-0.5 font-mono">{mockAssets.length} activos monitoreados</p>
        </div>
        <button className="btn-primary">+ Nuevo activo</button>
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <div style={{ height: '260px' }}>
          <AssetMap assets={mockAssets} />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-mono uppercase tracking-wider text-text-muted">Activo</th>
              <th className="text-left p-3 text-xs font-mono uppercase tracking-wider text-text-muted hidden md:table-cell">Tipo</th>
              <th className="text-left p-3 text-xs font-mono uppercase tracking-wider text-text-muted">Estado</th>
              <th className="text-left p-3 text-xs font-mono uppercase tracking-wider text-text-muted hidden lg:table-cell">Responsable</th>
              <th className="text-left p-3 text-xs font-mono uppercase tracking-wider text-text-muted hidden lg:table-cell">Último scan</th>
            </tr>
          </thead>
          <tbody>
            {mockAssets.map(asset => (
              <tr key={asset.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{assetIcon(asset.type)}</span>
                    <div>
                      <p className="font-medium text-text-primary">{asset.name}</p>
                      <p className="text-xs text-text-muted font-mono">
                        {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="text-text-secondary">{t(`assetType.${asset.type}`)}</span>
                </td>
                <td className="p-3">
                  <SeverityBadge severity={asset.alertStatus} />
                </td>
                <td className="p-3 text-text-secondary hidden lg:table-cell">{asset.responsibleName}</td>
                <td className="p-3 text-text-muted font-mono text-xs hidden lg:table-cell">
                  {formatDate(asset.lastScan, i18n.language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
