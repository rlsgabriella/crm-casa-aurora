'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Table, Pagination } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApi } from '@/hooks/useApi'
import { createApi } from '@/lib/api'

const STATUS_OPTIONS = ['pendente', 'confirmada', 'cancelada', 'no-show']

function statusColor(s: string) {
  const map: Record<string, string> = {
    confirmada: 'green', pendente: 'yellow', cancelada: 'red', 'no-show': 'gray',
  }
  return map[s] || 'gray'
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function ReservasPage() {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const [filtroData, setFiltroData] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (filtroData) params.set('data', filtroData)
  if (filtroStatus) params.set('status', filtroStatus)

  const { data: _data, loading, refetch } = useApi(`/reservas?${params}`, [filtroData, filtroStatus, page])
  const data = _data as Record<string, any> | null

  async function atualizarStatus(id: string, status: string) {
    await api.patch(`/reservas/${id}`, { status })
    refetch()
  }

  const columns = [
    { key: 'cliente',    label: 'Cliente',  render: (r: any) => r.cliente?.nome || '—' },
    { key: 'data',       label: 'Data',     render: (r: any) => `${formatDate(r.data)} ${r.horario}` },
    { key: 'numPessoas', label: 'Pessoas' },
    { key: 'mesa',       label: 'Mesa',     render: (r: any) => r.mesa ? `Mesa ${r.mesa.numero}` : '—' },
    {
      key: 'status',
      label: 'Status',
      render: (r: any) => <Badge color={statusColor(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'acoes',
      label: '',
      render: (r: any) => (
        <div className="flex gap-2">
          {r.status === 'pendente' && (
            <Button size="sm" variant="secondary"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); atualizarStatus(r.id, 'confirmada') }}>
              Confirmar
            </Button>
          )}
          {['pendente', 'confirmada'].includes(r.status) && (
            <Button size="sm" variant="danger"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); atualizarStatus(r.id, 'cancelada') }}>
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Reservas</h1>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="date"
            value={filtroData}
            onChange={(e) => { setFiltroData(e.target.value); setPage(1) }}
            className="border border-line rounded-lg px-3 py-2 text-sm text-foreground bg-sidebar outline-none focus:border-accent"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setFiltroStatus(''); setPage(1) }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !filtroStatus ? 'bg-accent text-white border-accent' : 'text-muted border-line hover:bg-card hover:text-foreground'
              }`}
            >
              Todos
            </button>
            {STATUS_OPTIONS.map(s => (
              <button key={s}
                onClick={() => { setFiltroStatus(s); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filtroStatus === s ? 'bg-accent text-white border-accent' : 'text-muted border-line hover:bg-card hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-line rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <EmptyState icon={Calendar} title="Nenhuma reserva encontrada" description="Tente ajustar os filtros." />
        ) : (
          <>
            <Table columns={columns} rows={data.data} />
            <Pagination page={page} total={data.total} limit={20} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
