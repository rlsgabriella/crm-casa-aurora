import prisma from '../../lib/prisma.js'
import { enviarMensagem } from '../../lib/waha.js'

export async function processarMensagemWaha(payload) {
  const { from, body, session } = payload

  // Normaliza telefone (remove @c.us se vier)
  const telefone = from?.replace('@c.us', '') || ''

  // Busca ou cria cliente
  let cliente = await prisma.user.findFirst({ where: { telefone } })

  // Busca conversa aberta para esse cliente
  let conversa = cliente
    ? await prisma.conversa.findFirst({
        where: { clienteId: cliente.id, status: { in: ['aberta', 'aguardando'] } },
      })
    : null

  if (!conversa && cliente) {
    conversa = await prisma.conversa.create({
      data: {
        restauranteId: process.env.DEFAULT_RESTAURANTE_ID || 'default',
        clienteId: cliente.id,
        canal: 'whatsapp',
        status: 'aberta',
      },
    })
  }

  if (conversa) {
    await prisma.mensagem.create({
      data: {
        conversaId: conversa.id,
        remetente: 'cliente',
        conteudo: body,
        tipo: 'texto',
      },
    })
  }

  return { ok: true, conversaId: conversa?.id }
}

export async function processarRespostaN8n({ token, dados, telefone }) {
  if (token === 'RESERVA_JSON') {
    const reserva = await prisma.reserva.create({ data: dados })
    return { ok: true, acao: 'reserva_criada', reservaId: reserva.id }
  }

  if (token === 'CONSULTA_RESERVA') {
    const reservas = await prisma.reserva.findMany({
      where: { cliente: { telefone } },
      orderBy: { data: 'desc' },
      take: 3,
    })
    return { ok: true, acao: 'consulta_reserva', reservas }
  }

  if (token === 'ATENDENTE_HUMANO') {
    if (telefone) {
      const conversa = await prisma.conversa.findFirst({
        where: { cliente: { telefone }, status: { in: ['aberta', 'aguardando'] } },
      })
      if (conversa) {
        await prisma.conversa.update({ where: { id: conversa.id }, data: { status: 'aguardando' } })
      }
    }
    return { ok: true, acao: 'aguardando_humano' }
  }

  return { ok: false, erro: 'Token desconhecido' }
}

export async function processarReservaLanding(dados) {
  const reserva = await prisma.reserva.upsert({
    where: { id: dados.id || '' },
    update: dados,
    create: dados,
  })
  return { ok: true, reservaId: reserva.id }
}
