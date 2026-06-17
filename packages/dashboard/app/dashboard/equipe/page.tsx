'use client'

import { useState } from 'react'
import { UserCog, Plus } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { createApi } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { useApi } from '@/hooks/useApi'

interface Atendente {
  id: string
  nome: string
  role: 'admin' | 'gerente' | 'garcom' | 'atendente'
  status: 'online' | 'offline' | 'pausa'
  atendimentosAtivos: number
  clerkUserId: string
  criadoEm: string
  _count: { conversas: number }
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', gerente: 'Gerente', garcom: 'Garçom', atendente: 'Atendente',
}

const STATUS_COLOR: Record<string, string> = {
  online: '#10B981', offline: '#6B7280', pausa: '#F59E0B',
}

const STATUS_BG: Record<string, string> = {
  online: 'rgba(16,185,129,0.12)', offline: 'rgba(107,114,128,0.12)', pausa: 'rgba(245,158,11,0.12)',
}

export default function EquipePage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const api = createApi(getToken)

  const { data: _atendentes, loading, refetch } = useApi<Atendente[]>('/atendentes')
  const atendentes = _atendentes ?? []

  const [modalNovoOpen, setModalNovoOpen] = useState(false)
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false)
  const [selecionado, setSelecionado] = useState<Atendente | null>(null)
  const [form, setForm] = useState({ clerkUserId: '', nome: '', role: 'atendente', restauranteId: '' })
  const [salvando, setSalvando] = useState(false)
  const [metricas, setMetricas] = useState<any>(null)

  async function abrirDetalhes(atendente: Atendente) {
    setSelecionado(atendente)
    setMetricas(null)
    setModalDetalhesOpen(true)
    const res = await api.get<any>(`/atendentes/${atendente.id}/metricas`)
    setMetricas(res.data)
  }

  async function handleNovoAtendente() {
    setSalvando(true)
    try {
      await api.post('/atendentes', form)
      setModalNovoOpen(false)
      setForm({ clerkUserId: '', nome: '', role: 'atendente', restauranteId: '' })
      refetch()
    } finally {
      setSalvando(false)
    }
  }

  async function alternarStatus(atendente: Atendente) {
    if (atendente.clerkUserId !== user?.id) return
    const novoStatus = atendente.status === 'online' ? 'offline'
      : atendente.status === 'offline' ? 'online' : 'online'
    await api.patch(`/atendentes/${atendente.id}`, { status: novoStatus })
    refetch()
  }

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (r: Record<string, any>) => <span className="font-medium text-foreground">{r.nome}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (r: Record<string, any>) => (
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
        >
          {ROLE_LABEL[r.role as string] ?? r.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r: Record<string, any>) => (
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-medium cursor-pointer"
          style={{ background: STATUS_BG[r.status as string], color: STATUS_COLOR[r.status as string] }}
          onClick={e => { e.stopPropagation(); alternarStatus(r as Atendente) }}
          title={r.clerkUserId === user?.id ? 'Clique para alternar' : ''}
        >
          ● {r.status}
        </span>
      ),
    },
    {
      key: 'ativos',
      label: 'Ativas',
      render: (r: Record<string, any>) => r.atendimentosAtivos,
    },
    {
      key: 'total',
      label: 'Total',
      render: (r: Record<string, any>) => r._count?.conversas ?? 0,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Equipe"
        subtitle="Atendentes, roles e status de disponibilidade"
        actions={
          <Button variant="primary" size="sm" onClick={() => setModalNovoOpen(true)}>
            <Plus size={14} />
            Novo Atendente
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-line rounded-lg animate-pulse" />
            ))}
          </div>
        ) : atendentes.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Nenhum atendente cadastrado"
            description="Adicione atendentes para começar a distribuir conversas."
          />
        ) : (
          <Table columns={columns} rows={atendentes as Record<string, any>[]} onRowClick={r => abrirDetalhes(r as Atendente)} />
        )}
      </Card>

      {/* Modal novo atendente */}
      <Modal open={modalNovoOpen} onClose={() => setModalNovoOpen(false)} title="Novo Atendente" size="sm">
        <div className="space-y-3">
          <Input
            label="Clerk User ID"
            placeholder="user_xxxxxxxxxx"
            value={form.clerkUserId}
            onChange={e => setForm(f => ({ ...f, clerkUserId: e.target.value }))}
          />
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          />
          <div>
            <label className="text-[10px] font-semibold text-muted uppercase tracking-[0.15em] block mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
              style={{ background: '#1A1010', border: '1px solid rgba(42,31,31,0.8)' }}
            >
              <option value="atendente">Atendente</option>
              <option value="garcom">Garçom</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Input
            label="Restaurante ID"
            placeholder="ID do restaurante"
            value={form.restauranteId}
            onChange={e => setForm(f => ({ ...f, restauranteId: e.target.value }))}
          />
          <Button variant="primary" className="w-full" onClick={handleNovoAtendente} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Cadastrar'}
          </Button>
        </div>
      </Modal>

      {/* Modal detalhes/métricas */}
      <Modal
        open={modalDetalhesOpen}
        onClose={() => { setModalDetalhesOpen(false); setSelecionado(null) }}
        title={selecionado?.nome ?? 'Atendente'}
        size="sm"
      >
        {!metricas ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-line rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Role', valor: ROLE_LABEL[selecionado?.role ?? ''] },
                { label: 'Status', valor: selecionado?.status },
                { label: 'Conversas (mês)', valor: metricas.metricas.conversasMesAtual },
                { label: 'Conversas ativas', valor: metricas.metricas.conversasAtivas },
              ].map(({ label, valor }) => (
                <div key={label} className="rounded-lg p-3" style={{ background: '#2A1F1F' }}>
                  <p className="text-[10px] text-muted uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-medium text-foreground">{valor ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
