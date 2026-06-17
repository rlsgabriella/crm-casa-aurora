'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'

export interface Mensagem {
  id: string
  conversaId: string
  remetente: 'cliente' | 'bot' | 'atendente'
  conteudo: string
  tipo: 'texto' | 'imagem' | 'audio' | 'documento'
  enviadaEm: string
}

interface ChatMessagesProps {
  mensagens: Mensagem[]
  loading: boolean
  onScrollTop?: () => void
}

export function ChatMessages({ mensagens, loading, onScrollTop }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens.length])

  function handleScroll() {
    if (containerRef.current?.scrollTop === 0) {
      onScrollTop?.()
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-5 py-4"
      style={{ background: '#0F0A0A' }}
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-10 rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 ml-auto'}`}
              style={{ background: '#1F1515' }}
            />
          ))}
        </div>
      ) : mensagens.length === 0 ? (
        <p className="text-center text-sm text-muted mt-8">Nenhuma mensagem ainda.</p>
      ) : (
        mensagens.map(m => (
          <MessageBubble
            key={m.id}
            remetente={m.remetente}
            conteudo={m.conteudo}
            enviadaEm={m.enviadaEm}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}
