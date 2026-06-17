'use client'

import { Calendar, Armchair, DollarSign, Users, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { useApi } from '@/hooks/useApi'

function statusColor(status: string) {
  const map: Record<string, string> = {
    confirmada: 'green',
    pendente: 'yellow',
    cancelada: 'red',
    'no-show': 'gray',
  }
  return map[status] || 'gray'
}

function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const { data: _metricas, loading: loadingM } = useApi('/dashboard/metricas')
  const { data: _hoje, loading: loadingH } = useApi('/reservas/hoje')
  const { data: _conversas, loading: loadingC } = useApi('/conversas?status=aguardando&limit=3')
  const metricas = _metricas as Record<string, any> | null
  const hoje = _hoje as Record<string, any>[] | null
  const conversasAguardando = (_conversas as Record<string, any> | null)?.data ?? []

  return (
    <div>
      <PageHeader title="Visão Geral" subtitle={todayLabel()} />

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Reservas Hoje"
          value={metricas?.reservasHoje ?? 0}
          icon={Calendar}
          loading={loadingM}
          accentColor="#C0603A"
        />
        <StatCard
          title="Mesas Ocupadas"
          value={metricas?.mesasOcupadas ?? 0}
          icon={Armchair}
          loading={loadingM}
          accentColor="#C9A84C"
        />
        <StatCard
          title="Receita do Dia"
          value={`R$ ${Number(metricas?.receitaDia ?? 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          loading={loadingM}
          accentColor="#C9A84C"
        />
        <StatCard
          title="Total de Clientes"
          value={metricas?.totalClientes ?? 0}
          icon={Users}
          loading={loadingM}
          accentColor="#C0603A"
        />
        <StatCard
          title="Conversas Abertas"
          value={metricas?.conversasAbertas ?? 0}
          icon={MessageSquare}
          loading={loadingM}
          accentColor="#C0603A"
        />
      </div>

      {/* Conversas aguardando atendente */}
      {conversasAguardando.length > 0 && (
        <div className="bg-card border border-line rounded-xl overflow-hidden mb-4">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #2A1F1F' }}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">
              Aguardando Atendente
            </p>
            <Link href="/dashboard/atendimento" className="text-xs text-accent hover:opacity-80 transition-opacity">
              Ver todas →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {conversasAguardando.map((c: any) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">
                    {c.cliente?.nome ?? c.cliente?.telefone ?? 'Desconhecido'}
                  </p>
                  <p className="text-xs text-muted truncate max-w-xs">
                    {c.mensagens?.[0]?.conteudo ?? 'Sem mensagens'}
                  </p>
                </div>
                <Badge color="yellow">aguardando</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximas reservas do dia */}
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #2A1F1F' }}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">
            Próximas Reservas Hoje
          </p>
        </div>

        {loadingH ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-line rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !hoje?.length ? (
          <div className="px-5 py-12 text-center text-muted text-sm">
            Nenhuma reserva para hoje.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #2A1F1F' }}>
                  {['Cliente', 'Horário', 'Pessoas', 'Mesa', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] uppercase tracking-widest text-muted font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(hoje ?? []).map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-sidebar transition-colors"
                    style={{ borderBottom: '1px solid rgba(42,31,31,0.5)' }}
                  >
                    <td className="px-5 py-3.5 text-foreground font-medium">
                      {r.cliente?.nome || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{r.horario}</td>
                    <td className="px-5 py-3.5 text-muted">{r.numPessoas}</td>
                    <td className="px-5 py-3.5 text-muted">
                      {r.mesa ? `Mesa ${r.mesa.numero}` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color={statusColor(r.status)}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
