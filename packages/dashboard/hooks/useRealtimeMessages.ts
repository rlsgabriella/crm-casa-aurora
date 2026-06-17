'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface RealtimeMensagem {
  id: string
  conversaId: string
  remetente: 'cliente' | 'bot' | 'atendente'
  conteudo: string
  tipo: 'texto' | 'imagem' | 'audio' | 'documento'
  enviadaEm: string
}

interface UseRealtimeMessagesReturn {
  newMessages: RealtimeMensagem[]
  isConnected: boolean
}

export function useRealtimeMessages(conversaId: string | null): UseRealtimeMessagesReturn {
  const [newMessages, setNewMessages] = useState<RealtimeMensagem[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!conversaId) return

    setNewMessages([])

    const channel = supabase
      .channel(`mensagens:${conversaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Mensagem',
          filter: `conversaId=eq.${conversaId}`,
        },
        (payload) => {
          setNewMessages(prev => [...prev, payload.new as RealtimeMensagem])
        },
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [conversaId])

  return { newMessages, isConnected }
}
