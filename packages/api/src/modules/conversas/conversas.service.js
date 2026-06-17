import prisma from '../../lib/prisma.js'

const INCLUDE_PREVIEW = {
  cliente: { select: { id: true, nome: true, telefone: true, email: true } },
  atendente: { select: { id: true, nome: true, role: true, status: true } },
  mensagens: {
    orderBy: { enviadaEm: 'desc' },
    take: 1,
    select: { conteudo: true, remetente: true, enviadaEm: true },
  },
}

export async function listarConversas({ status, atendenteId, semAtendente, busca, page, limit }) {
  const skip = (page - 1) * limit
  const where = { deletedAt: null }

  if (status) where.status = status
  if (atendenteId) where.atendenteId = atendenteId
  if (semAtendente === 'true') where.atendenteId = null

  if (busca) {
    where.cliente = {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' } },
        { telefone: { contains: busca } },
      ],
    }
  }

  const [total, conversas] = await Promise.all([
    prisma.conversa.count({ where }),
    prisma.conversa.findMany({
      where,
      skip,
      take: limit,
      include: INCLUDE_PREVIEW,
      orderBy: { atualizadoEm: 'desc' },
    }),
  ])

  return { total, page, limit, data: conversas }
}

export async function buscarConversa(id) {
  return prisma.conversa.findUniqueOrThrow({
    where: { id },
    include: {
      cliente: { select: { id: true, nome: true, telefone: true, email: true } },
      atendente: { select: { id: true, nome: true, role: true, status: true } },
      _count: { select: { mensagens: true } },
    },
  })
}

export async function criarConversa({ clienteId, canal, restauranteId }) {
  return prisma.conversa.create({
    data: { clienteId, canal, restauranteId, status: 'aberta' },
    include: INCLUDE_PREVIEW,
  })
}

export async function atualizarConversa(id, dados) {
  const data = {}
  if (dados.atendenteId !== undefined) data.atendenteId = dados.atendenteId
  if (dados.status) {
    data.status = dados.status
    if (dados.status === 'fechada') data.finalizadaEm = dados.finalizadaEm ? new Date(dados.finalizadaEm) : new Date()
  }
  return prisma.conversa.update({ where: { id }, data, include: INCLUDE_PREVIEW })
}

export async function atribuirConversaAuto(conversaId) {
  const conversa = await prisma.conversa.findUniqueOrThrow({ where: { id: conversaId } })

  const atendente = await prisma.atendente.findFirst({
    where: {
      restauranteId: conversa.restauranteId,
      status: 'online',
      deletedAt: null,
    },
    orderBy: { atendimentosAtivos: 'asc' },
  })

  if (!atendente) return null

  const [conversaAtualizada] = await prisma.$transaction([
    prisma.conversa.update({
      where: { id: conversaId },
      data: { atendenteId: atendente.id },
      include: INCLUDE_PREVIEW,
    }),
    prisma.atendente.update({
      where: { id: atendente.id },
      data: { atendimentosAtivos: { increment: 1 } },
    }),
  ])

  return { conversa: conversaAtualizada, atendente }
}
