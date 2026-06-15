import * as service from './reservas.service.js'

export async function listar(req, res, next) {
  try {
    const result = await service.listarReservas(req.query)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function buscar(req, res, next) {
  try {
    const reserva = await service.buscarReserva(req.params.id)
    res.json({ success: true, data: reserva })
  } catch (err) { next(err) }
}

export async function hoje(req, res, next) {
  try {
    const reservas = await service.reservasHoje()
    res.json({ success: true, data: reservas })
  } catch (err) { next(err) }
}

export async function atualizar(req, res, next) {
  try {
    const reserva = await service.atualizarReserva(req.params.id, req.body)
    res.json({ success: true, data: reserva })
  } catch (err) { next(err) }
}
