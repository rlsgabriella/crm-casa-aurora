import prisma from '../../lib/prisma.js'

export async function listarClientes({ busca, page, limit }) {
  const skip = (page - 1) * limit
  const where = busca
    ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { email: { contains: busca, mode: 'insensitive' } },
          { telefone: { contains: busca } },
        ],
      }
    : {}

  const [total, clientes] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: { select: { reservas: true, pedidos: true } },
      },
    }),
  ])

  return { total, page, limit, data: clientes }
}

export async function buscarCliente(id) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      _count: { select: { reservas: true, pedidos: true, conversas: true } },
    },
  })
}

export async function historicoPorCliente(id) {
  const [reservas, pedidos, conversas] = await Promise.all([
    prisma.reserva.findMany({ where: { clienteId: id }, orderBy: { data: 'desc' }, take: 20 }),
    prisma.pedido.findMany({ where: { clienteId: id }, orderBy: { criadoEm: 'desc' }, take: 20 }),
    prisma.conversa.findMany({ where: { clienteId: id }, orderBy: { iniciadaEm: 'desc' }, take: 20 }),
  ])
  return { reservas, pedidos, conversas }
}

export async function atualizarCliente(id, dados) {
  return prisma.user.update({ where: { id }, data: dados })
}
