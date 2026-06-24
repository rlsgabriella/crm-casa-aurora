import prisma from '../../lib/prisma.js'
import { enviarMensagem } from '../../lib/waha.js'

export async function listarMensagens({ conversaId, antes, limite }) {
  const where = { conversaId }
  if (antes) where.enviadaEm = { lt: new Date(antes) }

  return prisma.mensagem.findMany({
    where,
    orderBy: { enviadaEm: 'asc' },
    take: limite,
  })
}

export async function registrarMensagem(conversaId, { remetente, conteudo, tipo }) {
  const conversa = await prisma.conversa.findUniqueOrThrow({
    where: { id: conversaId },
    include: { cliente: { select: { telefone: true } } },
  })

  const mensagem = await prisma.mensagem.create({
    data: { conversaId, remetente, conteudo, tipo },
  })

  const updateData = { atualizadoEm: new Date() }

  // Atendente respondendo a conversa "aguardando" → retomar status aberta
  if (remetente === 'atendente' && conversa.status === 'aguardando') {
    updateData.status = 'aberta'
  }

  await prisma.conversa.update({ where: { id: conversaId }, data: updateData })

  // Enviar via WhatsApp se for do atendente e cliente tiver telefone
  let wahaError = null
  if (remetente === 'atendente' && conversa.cliente?.telefone) {
    await enviarMensagem({
      telefone: conversa.cliente.telefone,
      mensagem: conteudo,
    }).catch(err => {
      console.error('[WAHA] Falha ao enviar mensagem:', err.message)
      wahaError = err.message
    })
  }

  if (wahaError) return { ...mensagem, wahaError }
  return mensagem
}
