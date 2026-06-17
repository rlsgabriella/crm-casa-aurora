import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed da Fase 2...')

  // Restaurante base
  const restaurante = await prisma.restaurante.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: {},
    create: {
      nome: 'Casa Aurora',
      endereco: 'Rua das Flores, 123 - São Paulo, SP',
      telefone: '+5511999999999',
      cnpj: '12.345.678/0001-99',
    },
  })
  console.log(`Restaurante: ${restaurante.id}`)

  // Clientes de teste
  const clientes = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ana@teste.com' },
      update: {},
      create: { clerkId: 'test_ana', email: 'ana@teste.com', nome: 'Ana Souza', telefone: '+5511912345678' },
    }),
    prisma.user.upsert({
      where: { email: 'carlos@teste.com' },
      update: {},
      create: { clerkId: 'test_carlos', email: 'carlos@teste.com', nome: 'Carlos Lima', telefone: '+5511987654321' },
    }),
    prisma.user.upsert({
      where: { email: 'maria@teste.com' },
      update: {},
      create: { clerkId: 'test_maria', email: 'maria@teste.com', nome: 'Maria Santos', telefone: '+5511955557777' },
    }),
  ])
  console.log(`Clientes: ${clientes.length}`)

  // Atendentes
  const atendentes = await Promise.all([
    prisma.atendente.upsert({
      where: { clerkUserId: 'clerk_admin_1' },
      update: {},
      create: {
        restauranteId: restaurante.id,
        clerkUserId: 'clerk_admin_1',
        nome: 'Gabriella (Admin)',
        role: 'admin',
        status: 'online',
        atendimentosAtivos: 1,
      },
    }),
    prisma.atendente.upsert({
      where: { clerkUserId: 'clerk_gerente_1' },
      update: {},
      create: {
        restauranteId: restaurante.id,
        clerkUserId: 'clerk_gerente_1',
        nome: 'Rafael (Gerente)',
        role: 'gerente',
        status: 'online',
        atendimentosAtivos: 2,
      },
    }),
    prisma.atendente.upsert({
      where: { clerkUserId: 'clerk_garcom_1' },
      update: {},
      create: {
        restauranteId: restaurante.id,
        clerkUserId: 'clerk_garcom_1',
        nome: 'Luciana (Garçom)',
        role: 'garcom',
        status: 'pausa',
        atendimentosAtivos: 0,
      },
    }),
    prisma.atendente.upsert({
      where: { clerkUserId: 'clerk_atendente_1' },
      update: {},
      create: {
        restauranteId: restaurante.id,
        clerkUserId: 'clerk_atendente_1',
        nome: 'Pedro (Atendente)',
        role: 'atendente',
        status: 'offline',
        atendimentosAtivos: 0,
      },
    }),
  ])
  console.log(`Atendentes: ${atendentes.length}`)

  // Conversas em estados variados
  const agora = new Date()
  const conv1 = await prisma.conversa.create({
    data: {
      restauranteId: restaurante.id,
      clienteId: clientes[0].id,
      atendenteId: atendentes[0].id,
      canal: 'whatsapp',
      status: 'aberta',
    },
  })

  const conv2 = await prisma.conversa.create({
    data: {
      restauranteId: restaurante.id,
      clienteId: clientes[1].id,
      canal: 'whatsapp',
      status: 'aguardando',
    },
  })

  const conv3 = await prisma.conversa.create({
    data: {
      restauranteId: restaurante.id,
      clienteId: clientes[2].id,
      canal: 'whatsapp',
      status: 'aberta',
    },
  })

  const conv4 = await prisma.conversa.create({
    data: {
      restauranteId: restaurante.id,
      clienteId: clientes[0].id,
      atendenteId: atendentes[1].id,
      canal: 'whatsapp',
      status: 'fechada',
      finalizadaEm: new Date(agora.getTime() - 2 * 60 * 60 * 1000),
    },
  })

  const conv5 = await prisma.conversa.create({
    data: {
      restauranteId: restaurante.id,
      clienteId: clientes[1].id,
      atendenteId: atendentes[0].id,
      canal: 'whatsapp',
      status: 'fechada',
      finalizadaEm: new Date(agora.getTime() - 24 * 60 * 60 * 1000),
    },
  })

  console.log('Conversas criadas: 5')

  // Mensagens para conv1 (aberta com atendente)
  await prisma.mensagem.createMany({
    data: [
      { conversaId: conv1.id, remetente: 'cliente', conteudo: 'Olá! Gostaria de fazer uma reserva para sábado.', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 30 * 60 * 1000) },
      { conversaId: conv1.id, remetente: 'bot', conteudo: 'Olá Ana! Sou a Sofia, assistente do Casa Aurora. Para sábado temos disponibilidade às 19h e 21h. Qual horário prefere?', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 29 * 60 * 1000) },
      { conversaId: conv1.id, remetente: 'cliente', conteudo: 'Às 19h, para 4 pessoas.', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 25 * 60 * 1000) },
      { conversaId: conv1.id, remetente: 'atendente', conteudo: 'Perfeito, Ana! Confirmei sua reserva para sábado às 19h para 4 pessoas. Até lá! 🍷', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 20 * 60 * 1000) },
      { conversaId: conv1.id, remetente: 'cliente', conteudo: 'Obrigada! 😊', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 18 * 60 * 1000) },
    ],
  })

  // Mensagens para conv2 (aguardando — sem atendente)
  await prisma.mensagem.createMany({
    data: [
      { conversaId: conv2.id, remetente: 'cliente', conteudo: 'Preciso cancelar minha reserva de amanhã.', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 15 * 60 * 1000) },
      { conversaId: conv2.id, remetente: 'bot', conteudo: 'Entendido, Carlos. Vou transferir para um atendente que pode ajudá-lo com o cancelamento.', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 14 * 60 * 1000) },
      { conversaId: conv2.id, remetente: 'bot', conteudo: 'Transferindo para atendente humano...', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 14 * 60 * 1000) },
    ],
  })

  // Mensagens para conv3 (aberta sem atendente — fila)
  await prisma.mensagem.createMany({
    data: [
      { conversaId: conv3.id, remetente: 'cliente', conteudo: 'Boa tarde! Qual o cardápio do dia?', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 5 * 60 * 1000) },
      { conversaId: conv3.id, remetente: 'bot', conteudo: 'Boa tarde, Maria! Hoje temos filé ao molho madeira, risoto de cogumelos e salmão grelhado. Gostaria de saber mais sobre algum prato?', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 4 * 60 * 1000) },
      { conversaId: conv3.id, remetente: 'cliente', conteudo: 'O salmão tem alguma acompanhamento?', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 2 * 60 * 1000) },
    ],
  })

  // Mensagens para conv4 (fechada)
  await prisma.mensagem.createMany({
    data: [
      { conversaId: conv4.id, remetente: 'cliente', conteudo: 'Oi, quero reservar para hoje à noite!', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 4 * 60 * 60 * 1000) },
      { conversaId: conv4.id, remetente: 'atendente', conteudo: 'Olá Ana! Que ótimo! Temos mesa disponível às 20h. Posso confirmar?', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 3.5 * 60 * 60 * 1000) },
      { conversaId: conv4.id, remetente: 'cliente', conteudo: 'Sim! Para 2 pessoas.', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 3.4 * 60 * 60 * 1000) },
      { conversaId: conv4.id, remetente: 'atendente', conteudo: 'Confirmado! Te esperamos às 20h. 🍽️', tipo: 'texto', enviadaEm: new Date(agora.getTime() - 3.3 * 60 * 60 * 1000) },
    ],
  })

  // Mensagens para conv5 (fechada — ontem)
  const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
  await prisma.mensagem.createMany({
    data: [
      { conversaId: conv5.id, remetente: 'cliente', conteudo: 'Vocês têm opções veganas?', tipo: 'texto', enviadaEm: new Date(ontem.getTime() + 60 * 60 * 1000) },
      { conversaId: conv5.id, remetente: 'bot', conteudo: 'Sim, Carlos! Temos um menu vegano especial com 3 entradas e 2 pratos principais.', tipo: 'texto', enviadaEm: new Date(ontem.getTime() + 60 * 60 * 1000 + 30000) },
      { conversaId: conv5.id, remetente: 'atendente', conteudo: 'Posso te enviar o menu completo por e-mail se preferir!', tipo: 'texto', enviadaEm: new Date(ontem.getTime() + 2 * 60 * 60 * 1000) },
      { conversaId: conv5.id, remetente: 'cliente', conteudo: 'Seria ótimo, obrigado!', tipo: 'texto', enviadaEm: new Date(ontem.getTime() + 2.1 * 60 * 60 * 1000) },
    ],
  })

  console.log('Mensagens criadas: 18')
  console.log('\nSeed Fase 2 concluído com sucesso!')
  console.log(`\nRestaurante ID: ${restaurante.id}`)
  console.log('Adicione ao .env: DEFAULT_RESTAURANTE_ID=' + restaurante.id)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
