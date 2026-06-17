import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

export default function PedidosPage() {
  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Gestão de pedidos em tempo real" />
      <EmptyState
        icon={ShoppingCart}
        title="Módulo disponível na Fase 3"
        description="Gestão de pedidos em tempo real, comanda digital e acompanhamento de status da cozinha."
      />
    </div>
  )
}
