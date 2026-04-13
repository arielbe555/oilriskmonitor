import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, Layers, Brain, AlertTriangle } from 'lucide-react'
import { SeverityBadge } from './SeverityBadge'
import { formatArea } from '@/lib/utils'

export function SatelliteViewer({ beforeUrl, afterUrl, analysis }) {
  const { t } = useTranslation()
  const [sliderPos, setSliderPos] = useState(50)
  const [mode, setMode] = useState('slider') // 'slider' | 'side'
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(95, Math.max(5, x)))
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(95, Math.max(5, x)))
  }, [])

  const placeholderBefore = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80'
  const placeholderAfter = 'https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=800&q=80'
  const before = beforeUrl || placeholderBefore
  const after = afterUrl || placeholderAfter

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('slider')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${mode === 'slider' ? 'bg-brand text-white' : 'btn-ghost'}`}
        >
          <SlidersHorizontal size={12} /> Slider
        </button>
        <button
          onClick={() => setMode('side')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${mode === 'side' ? 'bg-brand text-white' : 'btn-ghost'}`}
        >
          <Layers size={12} /> Side by side
        </button>
      </div>

      {mode === 'slider' ? (
        <div
          ref={containerRef}
          className="relative w-full h-64 rounded-xl overflow-hidden cursor-col-resize select-none border border-border"
          onMouseMove={handleMouseMove}
          onMouseUp={() => { dragging.current = false }}
          onMouseLeave={() => { dragging.current = false }}
          onTouchMove={handleTouchMove}
        >
          {/* After image (base) */}
          <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />

          {/* Before image (clipped) */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
            <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${10000 / sliderPos}%` }} />
          </div>

          {/* Labels */}
          <div className="absolute top-2 left-2 badge-info text-xs">ANTES</div>
          <div className="absolute top-2 right-2 badge-critical text-xs">DESPUÉS</div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white cursor-col-resize"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={() => { dragging.current = true }}
            onTouchStart={() => { dragging.current = true }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-border flex items-center justify-center shadow-lg">
              <SlidersHorizontal size={12} className="text-background" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img src={before} alt="Before" className="w-full h-48 object-cover" />
            <div className="absolute top-2 left-2 badge-info text-xs">ANTES</div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-critical/30">
            <img src={after} alt="After" className="w-full h-48 object-cover" />
            <div className="absolute top-2 right-2 badge-critical text-xs">DESPUÉS</div>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <div className="card border-l-2 border-l-brand space-y-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-brand" />
            <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">Análisis IA</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <SeverityBadge severity={analysis.severity} />
            <span className="badge-info">{analysis.anomalyType}</span>
            <span className="text-xs font-mono text-text-secondary">
              {t('confidence')}: <span className="text-ok font-bold">{analysis.confidence}%</span>
            </span>
            {analysis.estimatedAreaM2 && (
              <span className="text-xs font-mono text-text-secondary">
                {t('area')}: <span className="text-text-primary">{formatArea(analysis.estimatedAreaM2)}</span>
              </span>
            )}
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">{analysis.description}</p>

          <div className="flex items-start gap-2 p-2.5 bg-brand-dim rounded-lg border border-brand/20">
            <AlertTriangle size={13} className="text-brand flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary">{analysis.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
