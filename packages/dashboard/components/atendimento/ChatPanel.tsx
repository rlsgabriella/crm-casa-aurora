'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { createApi } from '@/lib/api'
import { ChatHeader } from './ChatHeader'
import { ChatMessages, type Mensagem } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { TransferModal } from './TransferModal'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import type { ConversaItem } from './ConversaCard'

interface ChatPanelProps {
  conversa: ConversaItem | null
  onConversaUpdate: (id: string, patch: Partial<ConversaItem>) => void
  onFechar: () => void
}

export function ChatPanel({ conversa, onConversaUpdate, onFechar }: ChatPanelProps) {
  const { getToken } = useAuth()
  const { user } = useUser()
  const api = createApi(getToken)

  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [loadingMsg, setLoadingMsg] = useState(false)
  const [atendentes, setAtendentes] = useState<any[]>([])
  const [transferOpen, setTransferOpen] = useState(false)

  const { newMessages } = useRealtimeMessages(conversa?.id ?? null)

  // Carregar mensagens ao trocar de conversa
  useEffect(() => {
    if (!conversa) { setMensagens([]); return }
    setLoadingMsg(true)
    api.get<Mensagem[]>(`/conversas/${conversa.id}/mensagens`)
      .then(res => setMensagens(res.data ?? []))
      .catch(() => setMensagens([]))
      .finally(() => setLoadingMsg(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversa?.id])

  // Mensagens em tempo real
  useEffect(() => {
    if (newMessages.length === 0) return
    setMensagens(prev => {
      const ids = new Set(prev.map(m => m.id))
      const novas = newMessages.filter(m => !ids.has(m.id)) as Mensagem[]
      return [...prev, ...novas]
    })
  }, [newMessages])

  // Carregar atendentes para modal de transferência
  useEffect(() => {
    api.get<any[]>('/atendentes').then(res => setAtendentes(res.data ?? [])).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleEnviar(texto: string) {
    if (!conversa) return
    const res = await api.post<Mensagem>(`/conversas/${conversa.id}/mensagens`, {
      remetente: 'atendente',
      conteudo: texto,
      tipo: 'texto',
    })
    setMensagens(prev => {
      if (prev.find(m => m.id === res.data.id)) return prev
      return [...prev, res.data]
    })
  }

  async function handleAssumirConversa() {
    if (!conversa) return
    const res = await api.post<any>(`/conversas/${conversa.id}/atribuir-auto`, {})
    if (res.data?.conversa) {
      onConversaUpdate(conversa.id, { atendenteId: res.data.conversa.atendenteId, atendente: res.data.atendente })
    }
  }

  async function handleTransferir(atendenteId: string) {
    if (!conversa) return
    const res = await api.patch<ConversaItem>(`/conversas/${conversa.id}`, { atendenteId })
    if (res.data) onConversaUpdate(conversa.id, { atendenteId, atendente: res.data.atendente })
  }

  async function handleFecharConversa() {
    if (!conversa) return
    await api.patch(`/conversas/${conversa.id}`, { status: 'fechada' })
    onConversaUpdate(conversa.id, { status: 'fechada' })
  }

  if (!conversa) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ background: '#0F0A0A' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(192,96,58,0.1)' }}>
          <MessageSquare size={28} style={{ color: '#C0603A' }} />
        </div>
        <p className="text-sm text-muted">Selecione uma conversa para começar</p>
      </div>
    )
  }

  const fechada = conversa.status === 'fechada'
  const semAtendente = !conversa.atendenteId
  const inputDesabilitado = fechada || semAtendente

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ChatHeader
        conversa={conversa}
        meuId={user?.id ?? null}
        onFechar={onFechar}
        onAssumirConversa={handleAssumirConversa}
        onAbrirTransfer={() => setTransferOpen(true)}
        onFecharConversa={handleFecharConversa}
      />

      <ChatMessages mensagens={mensagens} loading={loadingMsg} />

      <ChatInput disabled={inputDesabilitado} onSend={handleEnviar} />

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        atendentes={atendentes}
        onTransferir={handleTransferir}
      />
    </div>
  )
}
