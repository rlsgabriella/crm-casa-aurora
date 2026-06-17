'use client'

import { X, ArrowRightLeft, CheckCheck, UserPlus } from 'lucide-react'
import type { ConversaItem } from './ConversaCard'

interface ChatHeaderProps {
  conversa: ConversaItem
  meuId: string | null
  onFechar: () => void
  onAssumirConversa: () => void
  onAbrirTransfer: () => void
  onFecharConversa: () => void
}

const STATUS_LABEL: Record<string, string> = {
  aberta: 'Aberta',
  aguardando: 'Aguardando',
  fechada: 'Encerrada',
}

const STATUS_BG: Record<string, string> = {
  aberta: 'rgba(16,185,129,0.15)',
  aguardando: 'rgba(245,158,11,0.15)',
  fechada: 'rgba(107,114,128,0.15)',
}

const STATUS_COLOR: Record<string, string> = {
  aberta: '#10B981',
  aguardando: '#F59E0B',
  fechada: '#6B7280',
}

export function ChatHeader({ conversa, meuId, onFechar, onAssumirConversa, onAbrirTransfer, onFecharConversa }: ChatHeaderProps) {
  const semAtendente = !conversa.atendenteId
  const fechada = conversa.status === 'fechada'

  return (
    <div
      className="flex items-center justify-between px-5 py-3 shrink-0"
      style={{ borderBottom: '1px solid rgba(42,31,31,0.8)', background: '#1A1010' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ background: '#2A1510', color: '#C0603A' }}
        >
          {(conversa.cliente.nome ?? '?').charAt(0).toUpperCase()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {conversa.cliente.nome ?? 'Desconhecido'}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: STATUS_BG[conversa.status],
                color: STATUS_COLOR[conversa.status],
              }}
            >
              {STATUS_LABEL[conversa.status]}
            </span>
          </div>
          <p className="text-xs text-muted">
            {conversa.cliente.telefone ?? '—'}
            {conversa.atendente && ` · ${conversa.atendente.nome}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {semAtendente && !fechada && (
          <button
            onClick={onAssumirConversa}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(192,96,58,0.2)', color: '#C0603A' }}
          >
            <UserPlus size={13} />
            Assumir
          </button>
        )}
        {!semAtendente && !fechada && (
          <button
            onClick={onAbrirTransfer}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
          >
            <ArrowRightLeft size={13} />
            Transferir
          </button>
        )}
        {!fechada && (
          <button
            onClick={onFecharConversa}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(107,114,128,0.12)', color: '#9CA3AF' }}
          >
            <CheckCheck size={13} />
            Fechar
          </button>
        )}
        <button
          onClick={onFechar}
          className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
