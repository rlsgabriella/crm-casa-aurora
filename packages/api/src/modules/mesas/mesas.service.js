import prisma from '../../lib/prisma.js'

export async function listarMesas() {
  return prisma.mesa.findMany({ orderBy: { numero: 'asc' } })
}

export async function mesasDisponiveis({ data, numPessoas }) {
  const where = { status: 'disponivel' }
  if (numPessoas) where.capacidade = { gte: numPessoas }

  const mesas = await prisma.mesa.findMany({ where, orderBy: { numero: 'asc' } })

  if (!data) return mesas

  // Filtra mesas que já têm reserva confirmada ou pendente nessa data
  const inicio = new Date(data)
  const fim = new Date(data)
  fim.setDate(fim.getDate() + 1)

  const reservadas = await prisma.reserva.findMany({
    where: {
      data: { gte: inicio, lt: fim },
      status: { in: ['pendente', 'confirmada'] },
      mesaId: { not: null },
    },
    select: { mesaId: true },
  })

  const idsReservados = new Set(reservadas.map(r => r.mesaId))
  return mesas.filter(m => !idsReservados.has(m.id))
}

export async function atualizarMesa(id, dados) {
  return prisma.mesa.update({ where: { id }, data: dados })
}
