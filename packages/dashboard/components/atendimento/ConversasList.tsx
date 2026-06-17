'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { ConversaCard, type ConversaItem } from './ConversaCard'

interface ConversasListProps {
  conversas: ConversaItem[]
  loading: boolean
  meuId: string | null
  conversaSelecionadaId: string | null
  onSelecionar: (c: ConversaItem) => void
}

type Tab = 'minhas' | 'fila' | 'todas'

export function ConversasList({
  conversas,
  loading,
  meuId,
  conversaSelecionadaId,
  onSelecionar,
}: ConversasListProps) {
  const [tab, setTab] = useState<Tab>('todas')
  const [busca, setBusca] = useState('')

  const filtradas = useMemo(() => {
    let lista = conversas
    if (tab === 'minhas') lista = lista.filter(c => c.atendenteId === meuId)
    if (tab === 'fila') lista = lista.filter(c => !c.atendenteId && c.status !== 'fechada')
    if (busca) {
      const q = busca.toLowerCase()
      lista = lista.filter(c =>
        c.cliente.nome?.toLowerCase().includes(q) ||
        c.cliente.telefone?.includes(busca),
      )
    }
    return lista
  }, [conversas, tab, meuId, busca])

  const abertas = conversas.filter(c => c.status !== 'fechada').length

  const TAB_LABELS: Record<Tab, string> = { minhas: 'Minhas', fila: 'Fila', todas: 'Todas' }

  return (
    <div
      className="flex flex-col h-full"
      style={{ width: 340, minWidth: 300, borderRight: '1px solid rgba(42,31,31,0.8)', background: '#1A1010' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(42,31,31,0.6)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Atendimento</h2>
          {abertas > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(192,96,58,0.2)', color: '#C0603A' }}
            >
              {abertas}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg p-1" style={{ background: '#0F0A0A' }}>
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 text-xs py-1.5 rounded-md font-medium transition-colors"
              style={{
                background: tab === t ? '#2A1510' : 'transparent',
                color: tab === t ? '#C0603A' : '#8A7A72',
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Busca */}
      <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(42,31,31,0.4)' }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: '#0F0A0A', border: '1px solid rgba(42,31,31,0.6)' }}>
          <Search size={13} className="text-muted shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted outline-none"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: '#2A1F1F' }} />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <p className="text-center text-sm text-muted mt-8 px-4">
            {busca ? 'Nenhuma conversa encontrada.' : tab === 'fila' ? 'Nenhuma conversa na fila.' : 'Nenhuma conversa.'}
          </p>
        ) : (
          filtradas.map(c => (
            <ConversaCard
              key={c.id}
              conversa={c}
              selecionada={c.id === conversaSelecionadaId}
              onClick={() => onSelecionar(c)}
            />
          ))
        )}
      </div>
    </div>
  )
}
