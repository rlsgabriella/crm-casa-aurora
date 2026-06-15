import { DollarSign } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState.jsx'

export default function Financeiro() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Financeiro</h1>
      <EmptyState
        icon={DollarSign}
        title="Módulo disponível na Fase 4"
        description="Relatórios financeiros, integração com NF-e e conciliação de pagamentos."
      />
    </div>
  )
}
