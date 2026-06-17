'use client'

import { Badge } from '@/components/ui/Badge'

export interface ConversaItem {
  id: string
  status: 'aberta' | 'aguardando' | 'fechada'
  canal: 'whatsapp' | 'web'
  atendenteId: string | null
  atualizadoEm: string
  cliente: { id: string; nome: string | null; telefone: string | null }
  atendente: { id: string; nome: string } | null
  mensagens: Array<{ conteudo: string; remetente: string; enviadaEm: string }>
}

interface ConversaCardProps {
  conversa: ConversaItem
  selecionada: boolean
  onClick: () => void
}

const STATUS_COLOR: Record<string, string> = {
  aberta: '#10B981',
  aguardando: '#F59E0B',
  fechada: '#6B7280',
}

function formatarTempo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ontem'
  return `há ${d}d`
}

export function ConversaCard({ conversa, selecionada, onClick }: ConversaCardProps) {
  const ultimaMensagem = conversa.mensagens[0]
  const inicialNome = (conversa.cliente.nome ?? '?').charAt(0).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex gap-3 items-start transition-colors"
      style={{
        background: selecionada ? 'rgba(192,96,58,0.12)' : 'transparent',
        borderLeft: selecionada ? '3px solid #C0603A' : '3px solid transparent',
        borderBottom: '1px solid rgba(42,31,31,0.6)',
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
        style={{ background: '#2A1510', color: '#C0603A' }}
      >
        {inicialNome}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">
            {conversa.cliente.nome ?? conversa.cliente.telefone ?? 'Desconhecido'}
          </span>
          {ultimaMensagem && (
            <span className="text-[10px] text-muted shrink-0">
              {formatarTempo(ultimaMensagem.enviadaEm)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted truncate">
            {ultimaMensagem?.conteudo ?? 'Sem mensagens'}
          </p>
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: STATUS_COLOR[conversa.status] }}
          />
        </div>
      </div>
    </button>
  )
}
