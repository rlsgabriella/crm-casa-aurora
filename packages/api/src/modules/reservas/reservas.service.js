import prisma from '../../lib/prisma.js'

export async function listarReservas({ data, status, mesaId, page, limit }) {
  const skip = (page - 1) * limit
  const where = {}
  if (status) where.status = status
  if (mesaId) where.mesaId = mesaId
  if (data) {
    const inicio = new Date(data)
    const fim = new Date(data)
    fim.setDate(fim.getDate() + 1)
    where.data = { gte: inicio, lt: fim }
  }

  const [total, reservas] = await Promise.all([
    prisma.reserva.count({ where }),
    prisma.reserva.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ data: 'asc' }, { horario: 'asc' }],
      include: { cliente: true, mesa: true },
    }),
  ])

  return { total, page, limit, data: reservas }
}

export async function buscarReserva(id) {
  return prisma.reserva.findUniqueOrThrow({
    where: { id },
    include: { cliente: true, mesa: true },
  })
}

export async function reservasHoje() {
  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date()
  fim.setHours(23, 59, 59, 999)

  return prisma.reserva.findMany({
    where: { data: { gte: inicio, lte: fim } },
    orderBy: { horario: 'asc' },
    include: { cliente: true, mesa: true },
  })
}

export async function atualizarReserva(id, dados) {
  return prisma.reserva.update({
    where: { id },
    data: dados,
    include: { cliente: true, mesa: true },
  })
}
