import { Package } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

export default function EstoquePage() {
  return (
    <div>
      <PageHeader title="Estoque" subtitle="Insumos e fichas técnicas" />
      <EmptyState
        icon={Package}
        title="Módulo disponível na Fase 3"
        description="Controle de insumos, fichas técnicas e baixa automática de estoque por pedido."
      />
    </div>
  )
}
