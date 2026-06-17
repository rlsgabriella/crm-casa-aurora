import * as service from './equipe.service.js'

export async function listar(req, res, next) {
  try {
    const result = await service.listarAtendentes(req.query.restauranteId)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function buscar(req, res, next) {
  try {
    const result = await service.buscarAtendente(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function criar(req, res, next) {
  try {
    const result = await service.criarAtendente(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function atualizar(req, res, next) {
  try {
    const result = await service.atualizarAtendente(req.params.id, req.body)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function metricas(req, res, next) {
  try {
    const result = await service.metricasAtendente(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
