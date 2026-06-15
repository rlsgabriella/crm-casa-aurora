import * as service from './webhooks.service.js'

export async function receberWaha(req, res, next) {
  try {
    const result = await service.processarMensagemWaha(req.body)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function receberRespostaN8n(req, res, next) {
  try {
    const result = await service.processarRespostaN8n(req.body)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function receberReservaLanding(req, res, next) {
  try {
    const result = await service.processarReservaLanding(req.body)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
