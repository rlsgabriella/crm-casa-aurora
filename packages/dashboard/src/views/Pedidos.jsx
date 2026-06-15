import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState.jsx'

export default function Pedidos() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
      <EmptyState
        icon={ShoppingCart}
        title="Módulo disponível na Fase 3"
        description="Gestão de pedidos em tempo real, comanda digital e acompanhamento de status da cozinha."
      />
    </div>
  )
}
