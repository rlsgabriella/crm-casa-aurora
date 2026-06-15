'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Armchair } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { useApi } from '../hooks/useApi.js'
import { createApi } from '../lib/api.js'

const STATUS_CONFIG = {
  disponivel: { color: 'bg-green-50 border-green-300 text-green-700', dot: 'bg-green-500', label: 'Disponível' },
  reservada:  { color: 'bg-blue-50 border-blue-300 text-blue-700',   dot: 'bg-blue-500',  label: 'Reservada' },
  ocupada:    { color: 'bg-red-50 border-red-300 text-red-700',       dot: 'bg-red-500',   label: 'Ocupada' },
  inativa:    { color: 'bg-gray-50 border-gray-300 text-gray-500',    dot: 'bg-gray-400',  label: 'Inativa' },
}

const STATUS_OPTIONS = ['disponivel', 'ocupada', 'reservada', 'inativa']

export default function Mesas() {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const { data: mesas, loading, refetch } = useApi('/mesas')
  const [mesaSelecionada, setMesaSelecionada] = useState(null)

  async function alterarStatus(id, status) {
    await api.patch(`/mesas/${id}`, { status })
    setMesaSelecionada(null)
    refetch()
  }

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Carregando mesas...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mesas</h1>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} /> {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {!mesas?.length ? (
        <EmptyState icon={Armchair} title="Nenhuma mesa cadastrada" description="Cadastre mesas no sistema Casa Aurora." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mesas.map(mesa => {
            const cfg = STATUS_CONFIG[mesa.status] || STATUS_CONFIG.inativa
            return (
              <button
                key={mesa.id}
                onClick={() => setMesaSelecionada(mesa)}
                className={`border-2 rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105 ${cfg.color}`}
              >
                <div className="text-2xl font-bold">{mesa.numero}</div>
                <div className="text-xs mt-1 opacity-80">{mesa.capacidade} lugares</div>
                <div className="mt-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      <Modal
        open={!!mesaSelecionada}
        onClose={() => setMesaSelecionada(null)}
        title={`Mesa ${mesaSelecionada?.numero}`}
        size="sm"
      >
        {mesaSelecionada && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Capacidade: <strong>{mesaSelecionada.capacidade} pessoas</strong></p>
              <p className="mt-1">Status atual: <strong>{STATUS_CONFIG[mesaSelecionada.status]?.label}</strong></p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Alterar status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(s => (
                  <Button
                    key={s}
                    variant={mesaSelecionada.status === s ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => alterarStatus(mesaSelecionada.id, s)}
                    className="justify-center"
                  >
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
