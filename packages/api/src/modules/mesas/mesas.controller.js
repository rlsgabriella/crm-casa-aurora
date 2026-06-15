import * as service from './mesas.service.js'

export async function listar(req, res, next) {
  try {
    const mesas = await service.listarMesas()
    res.json({ success: true, data: mesas })
  } catch (err) { next(err) }
}

export async function disponiveis(req, res, next) {
  try {
    const mesas = await service.mesasDisponiveis(req.query)
    res.json({ success: true, data: mesas })
  } catch (err) { next(err) }
}

export async function atualizar(req, res, next) {
  try {
    const mesa = await service.atualizarMesa(req.params.id, req.body)
    res.json({ success: true, data: mesa })
  } catch (err) { next(err) }
}
