'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { createApi } from '@/lib/api'
import { ConversasList } from '@/components/atendimento/ConversasList'
import { ChatPanel } from '@/components/atendimento/ChatPanel'
import { useRealtimeConversas } from '@/hooks/useRealtimeConversas'
import type { ConversaItem } from '@/components/atendimento/ConversaCard'

export default function AtendimentoPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const api = createApi(getToken)

  const [conversas, setConversas] = useState<ConversaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [conversaSelecionada, setConversaSelecionada] = useState<ConversaItem | null>(null)

  const { updates } = useRealtimeConversas()

  const carregarConversas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<{ data: ConversaItem[] }>('/conversas?limit=100')
      setConversas(res.data?.data ?? [])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { carregarConversas() }, [carregarConversas])

  // Aplicar atualizações em tempo real
  useEffect(() => {
    if (updates.length === 0) return
    const ultimo = updates[updates.length - 1] as any
    if (ultimo.type === 'INSERT') {
      carregarConversas()
    } else if (ultimo.type === 'UPDATE') {
      setConversas(prev =>
        prev.map(c => c.id === ultimo.id ? { ...c, ...ultimo } : c),
      )
      setConversaSelecionada(prev =>
        prev?.id === ultimo.id ? { ...prev, ...ultimo } : prev,
      )
    }
  }, [updates, carregarConversas])

  function handleConversaUpdate(id: string, patch: Partial<ConversaItem>) {
    setConversas(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    setConversaSelecionada(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  const meuClerkId = user?.id ?? null

  return (
    <div className="flex min-h-0" style={{ margin: '-24px', height: 'calc(100vh - 64px)' }}>
      <ConversasList
        conversas={conversas}
        loading={loading}
        meuId={meuClerkId}
        conversaSelecionadaId={conversaSelecionada?.id ?? null}
        onSelecionar={setConversaSelecionada}
      />

      <ChatPanel
        conversa={conversaSelecionada}
        onConversaUpdate={handleConversaUpdate}
        onFechar={() => setConversaSelecionada(null)}
      />
    </div>
  )
}
