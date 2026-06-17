'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, Pagination } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApi } from '@/hooks/useApi'
import { createApi } from '@/lib/api'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function ClientesPage() {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const [busca, setBusca] = useState('')
  const [page, setPage] = useState(1)
  const [clienteSelecionado, setClienteSelecionado] = useState<Record<string, any> | null>(null)
  const [historico, setHistorico] = useState<Record<string, any> | null>(null)

  const query = new URLSearchParams({
    page: String(page),
    limit: '20',
    ...(busca ? { busca } : {}),
  }).toString()
  const { data: _data, loading } = useApi(`/clientes?${query}`, [busca, page])
  const data = _data as Record<string, any> | null

  async function abrirCliente(cliente: Record<string, any>) {
    setClienteSelecionado(cliente)
    const res = await api.get<Record<string, any>>(`/clientes/${cliente.id}/historico`)
    setHistorico(res.data)
  }

  const columns = [
    { key: 'nome',     label: 'Nome',     render: (r: any) => r.nome || '—' },
    { key: 'telefone', label: 'Telefone', render: (r: any) => r.telefone || '—' },
    { key: 'email',    label: 'Email' },
    { key: 'reservas', label: 'Reservas', render: (r: any) => r._count?.reservas ?? 0 },
    { key: 'criadoEm', label: 'Cadastro', render: (r: any) => formatDate(r.criadoEm) },
  ]

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">Clientes</h1>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={busca}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusca(e.target.value)
              setPage(1)
            }}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-line rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <EmptyState
            icon={User}
            title="Nenhum cliente encontrado"
            description="Tente ajustar os filtros de busca."
          />
        ) : (
          <>
            <Table columns={columns} rows={data.data} onRowClick={abrirCliente} />
            <Pagination page={page} total={data.total} limit={20} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={!!clienteSelecionado}
        onClose={() => {
          setClienteSelecionado(null)
          setHistorico(null)
        }}
        title={clienteSelecionado?.nome || 'Cliente'}
        size="lg"
      >
        {!historico ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-line rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] mb-3">
                Reservas ({historico.reservas.length})
              </p>
              {historico.reservas.length === 0 ? (
                <p className="text-sm text-muted">Nenhuma reserva.</p>
              ) : (
                <ul className="space-y-2">
                  {historico.reservas.map((r: any) => (
                    <li
                      key={r.id}
                      className="text-sm flex justify-between text-foreground py-1"
                      style={{ borderBottom: '1px solid rgba(42,31,31,0.5)' }}
                    >
                      <span>
                        {formatDate(r.data)} às {r.horario} · {r.numPessoas} pessoas
                      </span>
                      <span className="text-muted">{r.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] mb-3">
                Pedidos ({historico.pedidos.length})
              </p>
              {historico.pedidos.length === 0 ? (
                <p className="text-sm text-muted">Nenhum pedido.</p>
              ) : (
                <ul className="space-y-2">
                  {historico.pedidos.map((p: any) => (
                    <li
                      key={p.id}
                      className="text-sm flex justify-between text-foreground py-1"
                      style={{ borderBottom: '1px solid rgba(42,31,31,0.5)' }}
                    >
                      <span>
                        Pedido #{p.id.slice(-6)} · R$ {Number(p.total).toFixed(2)}
                      </span>
                      <span className="text-muted">{p.status}</span>
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
