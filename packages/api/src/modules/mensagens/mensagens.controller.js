import * as service from './mensagens.service.js'

export async function listar(req, res, next) {
  try {
    const result = await service.listarMensagens({
      conversaId: req.params.conversaId,
      antes: req.query.antes,
      limite: Number(req.query.limite) || 50,
    })
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function criar(req, res, next) {
  try {
    const result = await service.registrarMensagem(req.params.conversaId, req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err) { next(err) }
}
