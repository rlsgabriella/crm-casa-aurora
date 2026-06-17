'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  disabled?: boolean
  onSend: (texto: string) => Promise<void>
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleEnviar() {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return
    setEnviando(true)
    setTexto('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      await onSend(conteudo)
    } finally {
      setEnviando(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTexto(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  return (
    <div
      className="flex items-end gap-3 p-4"
      style={{ borderTop: '1px solid rgba(42,31,31,0.8)', background: '#1A1010' }}
    >
      <textarea
        ref={textareaRef}
        value={texto}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || enviando}
        placeholder={disabled ? 'Conversa encerrada ou sem atendente atribuído' : 'Digite uma mensagem... (Enter para enviar)'}
        rows={1}
        className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
        style={{
          background: '#2A1F1F',
          border: '1px solid rgba(42,31,31,0.8)',
          lineHeight: '1.5',
          maxHeight: '120px',
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        }}
      />
      <button
        onClick={handleEnviar}
        disabled={disabled || enviando || !texto.trim()}
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
        style={{
          background: '#C0603A',
          opacity: (disabled || enviando || !texto.trim()) ? 0.4 : 1,
        }}
      >
        <Send size={16} className="text-white" />
      </button>
    </div>
  )
}
