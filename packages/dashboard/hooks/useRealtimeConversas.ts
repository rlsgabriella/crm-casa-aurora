'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseConfigured } from '@/lib/supabase'

export interface RealtimeConversa {
  id: string
  status: 'aberta' | 'aguardando' | 'fechada'
  atendenteId: string | null
  atualizadoEm: string
}

interface UseRealtimeConversasReturn {
  updates: RealtimeConversa[]
  isConnected: boolean
}

export function useRealtimeConversas(onPoll?: () => void): UseRealtimeConversasReturn {
  const [updates, setUpdates] = useState<RealtimeConversa[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const onPollRef = useRef(onPoll)
  useEffect(() => { onPollRef.current = onPoll }, [onPoll])

  // Supabase Realtime
  useEffect(() => {
    if (!supabaseConfigured) return

    const channel = supabase
      .channel('conversas:all')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Conversa' },
        (payload) => {
          setUpdates(prev => [...prev, { type: 'INSERT', ...payload.new } as unknown as RealtimeConversa])
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Conversa' },
        (payload) => {
          setUpdates(prev => [...prev, { type: 'UPDATE', ...payload.new } as unknown as RealtimeConversa])
        },
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Polling fallback quando Supabase não está configurado
  useEffect(() => {
    if (supabaseConfigured) return
    const interval = setInterval(() => onPollRef.current?.(), 5000)
    return () => clearInterval(interval)
  }, []) // roda uma vez; usa ref para callback sempre atualizado

  return { updates, isConnected }
}
