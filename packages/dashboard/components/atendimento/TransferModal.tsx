'use client'

import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

interface Atendente {
  id: string
  nome: string
  role: string
  status: 'online' | 'offline' | 'pausa'
  atendimentosAtivos: number
}

interface TransferModalProps {
  open: boolean
  onClose: () => void
  atendentes: Atendente[]
  onTransferir: (atendenteId: string) => void
}

const STATUS_COLOR: Record<string, string> = {
  online: '#10B981',
  offline: '#6B7280',
  pausa: '#F59E0B',
}

export function TransferModal({ open, onClose, atendentes, onTransferir }: TransferModalProps) {
  const online = atendentes.filter(a => a.status === 'online')
  const outros = atendentes.filter(a => a.status !== 'online')

  return (
    <Modal open={open} onClose={onClose} title="Transferir conversa" size="sm">
      <div className="space-y-4">
        {online.length === 0 && (
          <p className="text-sm text-muted">Nenhum atendente online no momento.</p>
        )}

        {online.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] mb-2">Online agora</p>
            <div className="space-y-1">
              {online.map(a => (
                <button
                  key={a.id}
                  onClick={() => { onTransferir(a.id); onClose() }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{ background: '#2A1F1F' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#3A2520')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#2A1F1F')}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: STATUS_COLOR[a.status] }}
                    />
                    <span className="text-foreground">{a.nome}</span>
                    <span className="text-[10px] text-muted capitalize">{a.role}</span>
                  </div>
                  <span className="text-[11px] text-muted">{a.atendimentosAtivos} ativas</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {outros.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] mb-2">Indisponíveis</p>
            <div className="space-y-1">
              {outros.map(a => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm opacity-50"
                  style={{ background: '#2A1F1F' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: STATUS_COLOR[a.status] }}
                    />
                    <span className="text-foreground">{a.nome}</span>
                    <span className="text-[10px] text-muted capitalize">{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
