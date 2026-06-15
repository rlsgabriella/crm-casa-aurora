'use client'

import { Users, Calendar, Armchair, MessageSquare, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { useApi } from '../hooks/useApi.js'

function MetricCard({ icon: Icon, label, value, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function statusColor(status) {
  const map = { confirmada: 'green', pendente: 'yellow', cancelada: 'red', 'no-show': 'gray' }
  return map[status] || 'gray'
}

export default function Dashboard() {
  const { data: metricas, loading: loadingM } = useApi('/dashboard/metricas')
  const { data: grafico, loading: loadingG } = useApi('/dashboard/reservas-semana')
  const { data: hoje, loading: loadingH } = useApi('/reservas/hoje')

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Visão geral</h1>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Users} label="Total Clientes" value={loadingM ? '...' : metricas?.totalClientes} color="violet" />
        <MetricCard icon={Calendar} label="Reservas Hoje" value={loadingM ? '...' : metricas?.reservasHoje} color="blue" />
        <MetricCard icon={TrendingUp} label="Reservas na Semana" value={loadingM ? '...' : metricas?.reservasSemana} color="green" />
        <MetricCard icon={Armchair} label="Mesas Ocupadas" value={loadingM ? '...' : metricas?.mesasOcupadas} color="orange" />
        <MetricCard icon={MessageSquare} label="Conversas Abertas" value={loadingM ? '...' : metricas?.conversasAbertas} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <Card header="Reservas — últimos 7 dias" className="lg:col-span-2">
          {loadingG ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={grafico || []} barSize={32}>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Bar dataKey="total" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Próximas reservas do dia */}
        <Card header="Próximas reservas hoje">
          {loadingH ? (
            <div className="text-sm text-gray-400">Carregando...</div>
          ) : !hoje?.length ? (
            <div className="text-sm text-gray-400">Nenhuma reserva hoje.</div>
          ) : (
            <ul className="space-y-3">
              {hoje.slice(0, 5).map(r => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{r.cliente?.nome || 'Cliente'}</p>
                    <p className="text-gray-400">{r.horario} · {r.numPessoas} pessoas</p>
                  </div>
                  <Badge color={statusColor(r.status)}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
