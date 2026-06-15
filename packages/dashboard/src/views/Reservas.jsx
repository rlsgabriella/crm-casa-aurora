'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Calendar } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Table, Pagination } from '../components/ui/Table.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { useApi } from '../hooks/useApi.js'
import { createApi } from '../lib/api.js'

const STATUS_OPTIONS = ['pendente', 'confirmada', 'cancelada', 'no-show']

function statusColor(s) {
  return { confirmada: 'green', pendente: 'yellow', cancelada: 'red', 'no-show': 'gray' }[s] || 'gray'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function Reservas() {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const [filtroData, setFiltroData] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page, limit: 20 })
  if (filtroData) params.set('data', filtroData)
  if (filtroStatus) params.set('status', filtroStatus)

  const { data, loading, refetch } = useApi(`/reservas?${params}`, [filtroData, filtroStatus, page])

  async function atualizarStatus(id, status) {
    await api.patch(`/reservas/${id}`, { status })
    refetch()
  }

  const columns = [
    { key: 'cliente', label: 'Cliente', render: r => r.cliente?.nome || '—' },
    { key: 'data', label: 'Data', render: r => `${formatDate(r.data)} ${r.horario}` },
    { key: 'numPessoas', label: 'Pessoas' },
    { key: 'mesa', label: 'Mesa', render: r => r.mesa ? `Mesa ${r.mesa.numero}` : '—' },
    {
      key: 'status',
      label: 'Status',
      render: r => <Badge color={statusColor(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'acoes',
      label: '',
      render: r => (
        <div className="flex gap-2">
          {r.status === 'pendente' && (
            <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); atualizarStatus(r.id, 'confirmada') }}>
              Confirmar
            </Button>
          )}
          {['pendente', 'confirmada'].includes(r.status) && (
            <Button size="sm" variant="danger" onClick={e => { e.stopPropagation(); atualizarStatus(r.id, 'cancelada') }}>
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Reservas</h1>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="date"
            value={filtroData}
            onChange={e => { setFiltroData(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setFiltroStatus(''); setPage(1) }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!filtroStatus ? 'bg-violet-600 text-white border-violet-600' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Todos
            </button>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setFiltroStatus(s); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${filtroStatus === s ? 'bg-violet-600 text-white border-violet-600' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando...</div>
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
