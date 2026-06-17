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

  // Atualizar timestamp da conversa para ordenação por última mensagem
  await prisma.conversa.update({
    where: { id: conversaId },
    data: { atualizadoEm: new Date() },
  })

  // Enviar via WhatsApp se for do atendente e cliente tiver telefone
  if (remetente === 'atendente' && conversa.cliente?.telefone) {
    await enviarMensagem({
      telefone: conversa.cliente.telefone,
      mensagem: conteudo,
    }).catch(err => {
      console.error('[WAHA] Falha ao enviar mensagem:', err.message)
    })
  }

  return mensagem
}
