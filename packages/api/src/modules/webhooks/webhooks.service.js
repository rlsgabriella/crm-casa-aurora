import prisma from '../../lib/prisma.js'
import { enviarMensagem } from '../../lib/waha.js'
import { atribuirConversaAuto } from '../conversas/conversas.service.js'

const DEFAULT_RESTAURANTE_ID = process.env.DEFAULT_RESTAURANTE_ID || ''

function normalizarTelefone(chatId) {
  let tel = chatId.replace(/@[\w.]+$/, '').trim()
  if (!tel.startsWith('+')) tel = `+${tel}`
  return tel
}

function telefoneToChatId(telefone) {
  return `${telefone.replace(/^\+/, '')}@c.us`
}

async function buscarOuCriarCliente(telefone) {
  let cliente = await prisma.user.findFirst({ where: { telefone } })
  if (!cliente) {
    cliente = await prisma.user.create({
      data: {
        clerkId: `whatsapp_${telefone}_${Date.now()}`,
        email: `${telefone.replace(/\D/g, '')}@whatsapp.temp`,
        telefone,
        nome: `WhatsApp ${telefone}`,
      },
    })
  }
  return cliente
}

export async function processarMensagemWaha(payload) {
  const { from, body, session } = payload
  if (!from || !body) return { ok: false, erro: 'Payload inválido' }

  // Ignorar mensagens de grupo
  if (from.includes('@g.us')) return { ok: false, erro: 'Mensagem de grupo ignorada' }

  const telefone = normalizarTelefone(from)
  const cliente = await buscarOuCriarCliente(telefone)

  // Verificar se já existe conversa aberta antes de criar
  const conversaExistente = await prisma.conversa.findFirst({
    where: { clienteId: cliente.id, status: { in: ['aberta', 'aguardando'] } },
  })
  const isNovaConversa = !conversaExistente

  const conversa = conversaExistente || await prisma.conversa.create({
    data: {
      restauranteId: DEFAULT_RESTAURANTE_ID,
      clienteId: cliente.id,
      canal: 'whatsapp',
      status: 'aberta',
    },
  })

  const mensagem = await prisma.mensagem.create({
    data: {
      conversaId: conversa.id,
      remetente: 'cliente',
      conteudo: body,
      tipo: 'texto',
    },
  })

  // Atribuição automática se sem atendente
  if (!conversa.atendenteId) {
    await atribuirConversaAuto(conversa.id).catch(err => {
      console.error('[WAHA webhook] Falha na atribuição automática:', err.message)
    })
  }

  await prisma.conversa.update({
    where: { id: conversa.id },
    data: { atualizadoEm: new Date() },
  })

  return {
    ok: true,
    conversaId: conversa.id,
    mensagemId: mensagem.id,
    clienteId: cliente.id,
    isNovaConversa,
    temAtendente: !!conversa.atendenteId,
  }
}

export async function processarRespostaN8n(payload) {
  const { conteudo = '', telefone, conversaId, chatId } = payload

  // Resolver conversa
  let conversa
  if (conversaId) {
    conversa = await prisma.conversa.findUnique({
      where: { id: conversaId },
      include: { cliente: { select: { telefone: true } } },
    })
  } else if (telefone) {
    const tel = normalizarTelefone(telefone)
    conversa = await prisma.conversa.findFirst({
      where: { cliente: { telefone: tel }, status: { in: ['aberta', 'aguardando'] } },
      include: { cliente: { select: { telefone: true } } },
    })
  }

  if (!conversa) return { ok: false, erro: 'Conversa não encontrada' }

  // Determinar chatId para envio WAHA (prioriza o payload, depois constrói do telefone)
  const wahaChatId = chatId ||
    (conversa.cliente?.telefone ? telefoneToChatId(conversa.cliente.telefone) : null)

  // --- Token: ATENDENTE_HUMANO ---
  if (conteudo.includes('ATENDENTE_HUMANO')) {
    // Remove o token e qualquer metadado JSON opcional (ex: ATENDENTE_HUMANO:{"acao":"..."})
    const conteudoLimpo = conteudo.replace(/ATENDENTE_HUMANO(?::\{[^}]*\})?/g, '').trim()

    // Salvar mensagem da Sofia (sem o token) se tiver conteúdo real
    if (conteudoLimpo) {
      await prisma.mensagem.create({
        data: { conversaId: conversa.id, remetente: 'bot', conteudo: conteudoLimpo, tipo: 'texto' },
      })
    }

    await prisma.conversa.update({
      where: { id: conversa.id },
      data: { status: 'aguardando' },
    })

    const msgTransfer = 'Conversa transferida para atendente humano. Aguarde um momento.'
    await prisma.mensagem.create({
      data: { conversaId: conversa.id, remetente: 'bot', conteudo: msgTransfer, tipo: 'texto' },
    })

    // Enviar notificação de transferência ao cliente via WAHA
    if (wahaChatId) {
      await enviarMensagem({ chatId: wahaChatId, texto: msgTransfer }).catch(err =>
        console.error('[webhook n8n] WAHA transfer falhou:', err.message)
      )
    }

    const resultado = await atribuirConversaAuto(conversa.id)
    await prisma.conversa.update({
      where: { id: conversa.id },
      data: { atualizadoEm: new Date() },
    })
    return { ok: true, acao: 'aguardando_humano', atendente: resultado?.atendente ?? null }
  }

  // --- Token: RESERVA_JSON ---
  if (conteudo.includes('RESERVA_JSON')) {
    const match = conteudo.match(/RESERVA_JSON:(\{.*?\})/s)
    if (match) {
      try {
        const dados = JSON.parse(match[1])
        const reserva = await prisma.reserva.create({
          data: { ...dados, clienteId: conversa.clienteId },
        })
        const msgConfirm = `Reserva confirmada para ${dados.data ?? '—'}!`
        await prisma.mensagem.create({
          data: { conversaId: conversa.id, remetente: 'bot', conteudo: msgConfirm, tipo: 'texto' },
        })
        await prisma.conversa.update({
          where: { id: conversa.id },
          data: { atualizadoEm: new Date() },
        })
        return { ok: true, acao: 'reserva_criada', reservaId: reserva.id }
      } catch (e) {
        console.error('[n8n] Falha ao criar reserva do JSON:', e.message)
      }
    }
  }

  // --- Resposta normal da Sofia ---
  await prisma.mensagem.create({
    data: { conversaId: conversa.id, remetente: 'bot', conteudo, tipo: 'texto' },
  })
  await prisma.conversa.update({
    where: { id: conversa.id },
    data: { atualizadoEm: new Date() },
  })
  return { ok: true, acao: 'mensagem_bot_salva' }
}

export async function processarReservaLanding(dados) {
  const reserva = await prisma.reserva.upsert({
    where: { id: dados.id || '' },
    update: dados,
    create: dados,
  })
  return { ok: true, reservaId: reserva.id }
}
