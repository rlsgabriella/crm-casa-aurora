import { DollarSign } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

export default function FinanceiroPage() {
  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Relatórios e conciliação de pagamentos" />
      <EmptyState
        icon={DollarSign}
        title="Módulo disponível na Fase 4"
        description="Relatórios financeiros, integração com NF-e e conciliação de pagamentos."
      />
    </div>
  )
}
