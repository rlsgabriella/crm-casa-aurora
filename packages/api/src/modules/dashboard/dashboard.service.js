import prisma from '../../lib/prisma.js'

export async function getMetricas() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const fimHoje = new Date()
  fimHoje.setHours(23, 59, 59, 999)

  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - 6)
  inicioSemana.setHours(0, 0, 0, 0)

  const [
    totalClientes,
    reservasHoje,
    reservasSemana,
    mesasOcupadas,
    conversasAbertas,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.reserva.count({ where: { data: { gte: hoje, lte: fimHoje } } }),
    prisma.reserva.count({ where: { data: { gte: inicioSemana, lte: fimHoje } } }),
    prisma.mesa.count({ where: { status: 'ocupada' } }),
    prisma.conversa.count({ where: { status: { in: ['aberta', 'aguardando'] } } }),
  ])

  return { totalClientes, reservasHoje, reservasSemana, mesasOcupadas, conversasAbertas }
}

export async function getReservasSemana() {
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const fim = new Date(d)
    fim.setHours(23, 59, 59, 999)

    const total = await prisma.reserva.count({ where: { data: { gte: d, lte: fim } } })
    dias.push({
      data: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      total,
    })
  }
  return dias
}
