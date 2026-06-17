import prisma from '../../lib/prisma.js'

export async function listarAtendentes(restauranteId) {
  return prisma.atendente.findMany({
    where: { deletedAt: null, ...(restauranteId ? { restauranteId } : {}) },
    include: {
      _count: { select: { conversas: true } },
    },
    orderBy: { nome: 'asc' },
  })
}

export async function buscarAtendente(id) {
  return prisma.atendente.findUniqueOrThrow({
    where: { id },
    include: {
      _count: { select: { conversas: true } },
    },
  })
}

export async function criarAtendente({ clerkUserId, nome, role, restauranteId }) {
  return prisma.atendente.create({
    data: { clerkUserId, nome, role, restauranteId },
  })
}

export async function atualizarAtendente(id, dados) {
  return prisma.atendente.update({
    where: { id },
    data: dados,
  })
}

export async function metricasAtendente(id) {
  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)

  const [atendente, conversasMes, conversasAtivas] = await Promise.all([
    prisma.atendente.findUniqueOrThrow({ where: { id } }),
    prisma.conversa.count({
      where: { atendenteId: id, iniciadaEm: { gte: inicioMes } },
    }),
    prisma.conversa.count({
      where: { atendenteId: id, status: { in: ['aberta', 'aguardando'] } },
    }),
  ])

  return {
    atendente,
    metricas: {
      conversasMesAtual: conversasMes,
      conversasAtivas,
    },
  }
}
