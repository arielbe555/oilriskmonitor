import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail, Phone, MessageCircle, Bell, Key, Plus, Check } from 'lucide-react'
import { mockResponsibles, mockTenant } from '@/data/mock'

function ChannelBadge({ channel, active }) {
  const icons = { email: Mail, sms: Phone, telegram: MessageCircle }
  const Icon = icons[channel] || Bell
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono ${
      active ? 'border-ok/30 bg-ok-dim text-ok' : 'border-border bg-surface-2 text-text-muted'
    }`}>
      <Icon size={10} />
      {channel}
    </div>
  )
}

export function Settings() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('responsibles')

  const tabs = [
    { id: 'responsibles', label: 'Responsables' },
    { id: 'tenant', label: 'Tenant' },
    { id: 'api', label: 'API & Webhooks' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t('nav.settings')}</h1>
        <p className="text-sm text-text-muted mt-0.5 font-mono">{mockTenant.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-surface-2 text-text-primary border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsibles tab */}
      {activeTab === 'responsibles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-title mb-0">Responsables configurados</span>
            <button className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div className="space-y-3">
            {mockResponsibles.map(resp => (
              <div key={resp.id} className="card flex items-start gap-4 flex-wrap">
                <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="font-semibold text-text-primary">{resp.name}</p>
                    <p className="text-xs text-text-muted font-mono capitalize">{resp.role}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                    {resp.email && (
                      <div className="flex items-center gap-1"><Mail size={10} className="text-text-muted" /> {resp.email}</div>
                    )}
                    {resp.phone && (
                      <div className="flex items-center gap-1"><Phone size={10} className="text-text-muted" /> {resp.phone}</div>
                    )}
                    {resp.telegramChatId && (
                      <div className="flex items-center gap-1"><MessageCircle size={10} className="text-text-muted" /> {resp.telegramChatId}</div>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['email', 'sms', 'telegram'].map(ch => (
                      <ChannelBadge key={ch} channel={ch} active={resp.notificationChannels.includes(ch)} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-xs font-mono ${resp.isActive ? 'text-ok' : 'text-text-muted'}`}>
                    {resp.isActive && <Check size={11} />}
                    {resp.isActive ? 'Activo' : 'Inactivo'}
                  </div>
                  <button className="btn-ghost text-xs py-1">Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tenant tab */}
      {activeTab === 'tenant' && (
        <div className="space-y-4">
          <div className="card space-y-4 max-w-lg">
            <p className="section-title">Configuración del tenant</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted font-mono block mb-1">Nombre</label>
                <input className="input-field" defaultValue={mockTenant.name} />
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono block mb-1">Idioma por defecto</label>
                <select className="input-field">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono block mb-1">Zona horaria</label>
                <select className="input-field">
                  <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires (UTC-3)</option>
                  <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted font-mono block mb-1">Plan</label>
                <input className="input-field" defaultValue={mockTenant.plan} disabled />
              </div>
            </div>
            <button className="btn-primary">{t('buttons.save')}</button>
          </div>
        </div>
      )}

      {/* API tab */}
      {activeTab === 'api' && (
        <div className="space-y-4 max-w-lg">
          <div className="card space-y-3">
            <p className="section-title">API Key del tenant</p>
            <div className="flex gap-2">
              <div className="flex-1 p-2.5 bg-surface-2 rounded-lg border border-border font-mono text-xs text-text-secondary">
                sk_tenant_••••••••••••••••••••••••••••••••
              </div>
              <button className="btn-secondary text-xs py-1.5 flex-shrink-0">
                <Key size={12} />
              </button>
            </div>
            <p className="text-xs text-text-muted">
              Usá esta API key para integrar con SAP, Salesforce, Odoo u otros sistemas.
              Header: <code className="font-mono bg-surface-2 px-1 rounded">Authorization: Bearer &lt;key&gt;</code>
            </p>
          </div>

          <div className="card space-y-3">
            <p className="section-title">Webhook URL</p>
            <input
              className="input-field"
              placeholder="https://tu-sistema.com/webhooks/oilrisk"
            />
            <p className="text-xs text-text-muted">
              El sistema enviará un POST a esta URL para eventos: <span className="font-mono text-text-secondary">alert.created · ticket.status_changed · ticket.resolved · report.generated</span>
            </p>
            <button className="btn-primary text-xs">{t('buttons.save')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
