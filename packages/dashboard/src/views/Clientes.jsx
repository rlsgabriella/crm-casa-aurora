'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Search, User } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Table, Pagination } from '../components/ui/Table.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { useApi } from '../hooks/useApi.js'
import { createApi } from '../lib/api.js'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function Clientes() {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const [busca, setBusca] = useState('')
  const [page, setPage] = useState(1)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [historico, setHistorico] = useState(null)

  const query = new URLSearchParams({ page, limit: 20, ...(busca ? { busca } : {}) }).toString()
  const { data, loading } = useApi(`/clientes?${query}`, [busca, page])

  async function abrirCliente(cliente) {
    setClienteSelecionado(cliente)
    const res = await api.get(`/clientes/${cliente.id}/historico`)
    setHistorico(res.data)
  }

  const columns = [
    { key: 'nome', label: 'Nome', render: r => r.nome || '—' },
    { key: 'telefone', label: 'Telefone', render: r => r.telefone || '—' },
    { key: 'email', label: 'Email' },
    { key: 'reservas', label: 'Reservas', render: r => r._count?.reservas ?? 0 },
    { key: 'criadoEm', label: 'Cadastro', render: r => formatDate(r.criadoEm) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={busca}
            onChange={e => { setBusca(e.target.value); setPage(1) }}
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : !data?.data?.length ? (
          <EmptyState icon={User} title="Nenhum cliente encontrado" description="Tente ajustar os filtros de busca." />
        ) : (
          <>
            <Table columns={columns} rows={data.data} onRowClick={abrirCliente} />
            <Pagination page={page} total={data.total} limit={20} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={!!clienteSelecionado} onClose={() => { setClienteSelecionado(null); setHistorico(null) }} title={clienteSelecionado?.nome || 'Cliente'} size="lg">
        {!historico ? (
          <div className="text-sm text-gray-400">Carregando histórico...</div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reservas ({historico.reservas.length})</p>
              {historico.reservas.length === 0 ? <p className="text-sm text-gray-400">Nenhuma reserva.</p> : (
                <ul className="space-y-1.5">
                  {historico.reservas.map(r => (
                    <li key={r.id} className="text-sm flex justify-between text-gray-700">
                      <span>{formatDate(r.data)} às {r.horario} · {r.numPessoas} pessoas</span>
                      <span className="text-gray-400">{r.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pedidos ({historico.pedidos.length})</p>
              {historico.pedidos.length === 0 ? <p className="text-sm text-gray-400">Nenhum pedido.</p> : (
                <ul className="space-y-1.5">
                  {historico.pedidos.map(p => (
                    <li key={p.id} className="text-sm flex justify-between text-gray-700">
                      <span>Pedido #{p.id.slice(-6)} · R$ {Number(p.total).toFixed(2)}</span>
                      <span className="text-gray-400">{p.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
