import prisma from '../../lib/prisma.js'
import { atribuirConversaAuto } from '../conversas/conversas.service.js'

const DEFAULT_RESTAURANTE_ID = process.env.DEFAULT_RESTAURANTE_ID || ''

function normalizarTelefone(chatId) {
  // Remove sufixos do WhatsApp (@c.us, @lid, @g.us)
  let tel = chatId.replace(/@[\w.]+$/, '').trim()
  // Normaliza para formato +55XXXXXXXX
  if (!tel.startsWith('+')) tel = `+${tel}`
  return tel
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

async function buscarOuCriarConversa(clienteId) {
  let conversa = await prisma.conversa.findFirst({
    where: { clienteId, status: { in: ['aberta', 'aguardando'] } },
  })
  if (!conversa) {
    conversa = await prisma.conversa.create({
      data: {
        restauranteId: DEFAULT_RESTAURANTE_ID,
        clienteId,
        canal: 'whatsapp',
        status: 'aberta',
      },
    })
  }
  return conversa
}

export async function processarMensagemWaha(payload) {
  const { from, body, session } = payload
  if (!from || !body) return { ok: false, erro: 'Payload inválido' }

  const telefone = normalizarTelefone(from)
  const cliente = await buscarOuCriarCliente(telefone)
  const conversa = await buscarOuCriarConversa(cliente.id)

  const mensagem = await prisma.mensagem.create({
    data: {
      conversaId: conversa.id,
      remetente: 'cliente',
      conteudo: body,
      tipo: 'texto',
    },
  })

  // Atribuição automática se não tem atendente
  if (!conversa.atendenteId) {
    await atribuirConversaAuto(conversa.id).catch(err => {
      console.error('[WAHA webhook] Falha na atribuição automática:', err.message)
    })
  }

  // Atualizar timestamp da conversa
  await prisma.conversa.update({
    where: { id: conversa.id },
    data: { atualizadoEm: new Date() },
  })

  return { ok: true, conversaId: conversa.id, mensagemId: mensagem.id }
}

export async function processarRespostaN8n(payload) {
  const { conteudo, telefone, conversaId } = payload

  // Resolve a conversa pelo conversaId ou pelo telefone do cliente
  let conversa
  if (conversaId) {
    conversa = await prisma.conversa.findUnique({ where: { id: conversaId } })
  } else if (telefone) {
    const tel = normalizarTelefone(telefone)
    conversa = await prisma.conversa.findFirst({
      where: { cliente: { telefone: tel }, status: { in: ['aberta', 'aguardando'] } },
    })
  }

  if (!conversa) return { ok: false, erro: 'Conversa não encontrada' }

  // Verifica tokens especiais no conteúdo
  if (conteudo?.includes('ATENDENTE_HUMANO')) {
    await prisma.conversa.update({
      where: { id: conversa.id },
      data: { status: 'aguardando' },
    })

    await prisma.mensagem.create({
      data: {
        conversaId: conversa.id,
        remetente: 'bot',
        conteudo: 'Transferindo para atendente humano...',
        tipo: 'texto',
      },
    })

    const resultado = await atribuirConversaAuto(conversa.id)
    return { ok: true, acao: 'aguardando_humano', atendente: resultado?.atendente ?? null }
  }

  if (conteudo?.includes('RESERVA_JSON')) {
    const match = conteudo.match(/RESERVA_JSON:(\{.*?\})/s)
    if (match) {
      try {
        const dados = JSON.parse(match[1])
        const reserva = await prisma.reserva.create({ data: dados })
        await prisma.mensagem.create({
          data: {
            conversaId: conversa.id,
            remetente: 'bot',
            conteudo: `Reserva confirmada para ${dados.data ?? '—'}!`,
            tipo: 'texto',
          },
        })
        return { ok: true, acao: 'reserva_criada', reservaId: reserva.id }
      } catch (e) {
        console.error('[n8n] Falha ao criar reserva do JSON:', e.message)
      }
    }
  }

  // Resposta normal da Sofia
  await prisma.mensagem.create({
    data: {
      conversaId: conversa.id,
      remetente: 'bot',
      conteudo: conteudo ?? '',
      tipo: 'texto',
    },
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
