'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Armchair } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApi } from '@/hooks/useApi'
import { createApi } from '@/lib/api'

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  disponivel: { color: 'border-emerald-700/50 text-emerald-300', bg: 'rgba(16,185,129,0.08)',  dot: 'bg-emerald-500', label: 'Disponível' },
  reservada:  { color: 'border-blue-700/50 text-blue-300',       bg: 'rgba(59,130,246,0.08)',  dot: 'bg-blue-500',    label: 'Reservada'  },
  ocupada:    { color: 'border-red-700/50 text-red-300',         bg: 'rgba(239,68,68,0.08)',   dot: 'bg-red-500',     label: 'Ocupada'    },
  inativa:    { color: 'border-white/10 text-muted',             bg: 'rgba(255,255,255,0.03)', dot: 'bg-muted',       label: 'Inativa'    },
}

const STATUS_OPTIONS = ['disponivel', 'ocupada', 'reservada', 'inativa']

export default function MesasPage() {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const { data: _mesas, loading, refetch } = useApi('/mesas')
  const [mesaSelecionada, setMesaSelecionada] = useState<Record<string, any> | null>(null)

  async function alterarStatus(id: string, status: string) {
    await api.patch(`/mesas/${id}`, { status })
    setMesaSelecionada(null)
    refetch()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 bg-card border border-line rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const mesas = (_mesas as Record<string, any>[] | null) ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Mesas</h1>
        <div className="flex items-center gap-4 text-xs text-muted">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} /> {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {!mesas.length ? (
        <EmptyState icon={Armchair} title="Nenhuma mesa cadastrada" description="Cadastre mesas no sistema Casa Aurora." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mesas.map((mesa) => {
            const cfg = STATUS_CONFIG[mesa.status] || STATUS_CONFIG.inativa
            return (
              <button key={mesa.id} onClick={() => setMesaSelecionada(mesa)}
                className={`border-2 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 ${cfg.color}`}
                style={{ background: cfg.bg }}
              >
                <div className="font-display text-2xl font-semibold">{mesa.numero}</div>
                <div className="text-xs mt-1 opacity-70">{mesa.capacidade} lugares</div>
                <div className="mt-2"><span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} /></div>
              </button>
            )
          })}
        </div>
      )}

      <Modal open={!!mesaSelecionada} onClose={() => setMesaSelecionada(null)} title={`Mesa ${mesaSelecionada?.numero}`} size="sm">
        {mesaSelecionada && (
          <div className="space-y-5">
            <div className="text-sm text-muted space-y-1">
              <p>Capacidade: <span className="text-foreground font-medium">{mesaSelecionada.capacidade} pessoas</span></p>
              <p>Status atual: <span className="text-foreground font-medium">{STATUS_CONFIG[mesaSelecionada.status]?.label}</span></p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] mb-3">Alterar status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <Button key={s} variant={mesaSelecionada.status === s ? 'primary' : 'secondary'} size="sm"
                    onClick={() => alterarStatus(mesaSelecionada.id, s)} className="justify-center">
                    {STATUS_CONFIG[s].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
