'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

export function useRealtimeConversas(): UseRealtimeConversasReturn {
  const [updates, setUpdates] = useState<RealtimeConversa[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
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

  return { updates, isConnected }
}
