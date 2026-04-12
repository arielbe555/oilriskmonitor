import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { severityColor } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

const SEVERITY_RADIUS = { critical: 14, medium: 10, low: 8, ok: 6 }

function RecenterMap({ assets }) {
  const map = useMap()
  useEffect(() => {
    if (assets.length > 0) {
      const bounds = assets.map(a => [a.latitude, a.longitude])
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [])
  return null
}

export function AssetMap({ assets, onAssetClick }) {
  const { t } = useTranslation()
  const center = assets.length > 0
    ? [assets.reduce((s, a) => s + a.latitude, 0) / assets.length,
       assets.reduce((s, a) => s + a.longitude, 0) / assets.length]
    : [-38.5, -68.5]

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ width: '100%', height: '100%', borderRadius: '8px' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <RecenterMap assets={assets} />
      {assets.map(asset => (
        <CircleMarker
          key={asset.id}
          center={[asset.latitude, asset.longitude]}
          radius={SEVERITY_RADIUS[asset.alertStatus] ?? 8}
          pathOptions={{
            color: severityColor(asset.alertStatus),
            fillColor: severityColor(asset.alertStatus),
            fillOpacity: 0.85,
            weight: 2,
          }}
          eventHandlers={{ click: () => onAssetClick?.(asset) }}
        >
          <Popup>
            <div className="text-text-primary text-xs font-mono p-1">
              <p className="font-bold text-sm mb-1">{asset.name}</p>
              <p className="text-text-secondary capitalize mb-1">{t(`assetType.${asset.type}`)}</p>
              <p className="text-text-muted">
                {t('nav.alerts')}: <span style={{ color: severityColor(asset.alertStatus) }}>
                  {t(`severity.${asset.alertStatus}`, asset.alertStatus)}
                </span>
              </p>
              <p className="text-text-muted mt-1">
                Scan: {formatDate(asset.lastScan)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
