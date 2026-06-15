import { Package } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState.jsx'

export default function Estoque() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Estoque</h1>
      <EmptyState
        icon={Package}
        title="Módulo disponível na Fase 3"
        description="Controle de insumos, fichas técnicas e baixa automática de estoque por pedido."
      />
    </div>
  )
}
