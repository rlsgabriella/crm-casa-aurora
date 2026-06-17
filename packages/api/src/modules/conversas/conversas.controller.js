import * as service from './conversas.service.js'

export async function listar(req, res, next) {
  try {
    const result = await service.listarConversas(req.query)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function buscar(req, res, next) {
  try {
    const result = await service.buscarConversa(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function criar(req, res, next) {
  try {
    const result = await service.criarConversa(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function atualizar(req, res, next) {
  try {
    const result = await service.atualizarConversa(req.params.id, req.body)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function atribuirAuto(req, res, next) {
  try {
    const result = await service.atribuirConversaAuto(req.params.id)
    if (!result) return res.json({ success: true, data: null, message: 'Nenhum atendente online disponível' })
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}
