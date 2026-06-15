import { UserCog } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState.jsx'

export default function Equipe() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Equipe</h1>
      <EmptyState
        icon={UserCog}
        title="Módulo disponível na Fase 2"
        description="Gestão de atendentes, definição de roles (admin, gerente, garçom) e métricas individuais."
      />
    </div>
  )
}
