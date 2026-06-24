'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseConfigured } from '@/lib/supabase'

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

export function useRealtimeMessages(
  conversaId: string | null,
  fetchFn?: () => Promise<RealtimeMensagem[]>,
): UseRealtimeMessagesReturn {
  const [newMessages, setNewMessages] = useState<RealtimeMensagem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const seenIds = useRef(new Set<string>())
  // Usar ref para o fetchFn para evitar recriação do interval a cada render
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => { fetchFnRef.current = fetchFn }, [fetchFn])

  // Resetar ao trocar de conversa
  useEffect(() => {
    seenIds.current = new Set()
    setNewMessages([])
  }, [conversaId])

  // Supabase Realtime
  useEffect(() => {
    if (!conversaId || !supabaseConfigured) return

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
          const msg = payload.new as RealtimeMensagem
          if (!seenIds.current.has(msg.id)) {
            seenIds.current.add(msg.id)
            setNewMessages(prev => [...prev, msg])
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [conversaId])

  // Polling fallback quando Supabase não está configurado
  useEffect(() => {
    if (!conversaId || supabaseConfigured) return

    async function poll() {
      if (!fetchFnRef.current) return
      try {
        const msgs = await fetchFnRef.current()
        const novas = msgs.filter(m => !seenIds.current.has(m.id))
        if (novas.length > 0) {
          novas.forEach(m => seenIds.current.add(m.id))
          setNewMessages(prev => [...prev, ...novas])
        }
      } catch {
        // falha silenciosa no polling
      }
    }

    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [conversaId]) // só muda de conversa reinicia o interval

  return { newMessages, isConnected }
}
