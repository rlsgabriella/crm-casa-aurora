import { MessageSquare } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState.jsx'

export default function Atendimento() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Atendimento</h1>
      <EmptyState
        icon={MessageSquare}
        title="Módulo disponível na Fase 2"
        description="Inbox WhatsApp unificado, distribuição automática de conversas entre atendentes e histórico de mensagens."
      />
    </div>
  )
}
