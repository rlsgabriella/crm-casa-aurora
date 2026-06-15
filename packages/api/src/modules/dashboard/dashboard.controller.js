import * as service from './dashboard.service.js'

export async function metricas(req, res, next) {
  try {
    const data = await service.getMetricas()
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function reservasSemana(req, res, next) {
  try {
    const data = await service.getReservasSemana()
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
