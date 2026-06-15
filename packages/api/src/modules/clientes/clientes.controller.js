import * as service from './clientes.service.js'

export async function listar(req, res, next) {
  try {
    const result = await service.listarClientes(req.query)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

export async function buscar(req, res, next) {
  try {
    const cliente = await service.buscarCliente(req.params.id)
    res.json({ success: true, data: cliente })
  } catch (err) { next(err) }
}

export async function historico(req, res, next) {
  try {
    const hist = await service.historicoPorCliente(req.params.id)
    res.json({ success: true, data: hist })
  } catch (err) { next(err) }
}

export async function atualizar(req, res, next) {
  try {
    const cliente = await service.atualizarCliente(req.params.id, req.body)
    res.json({ success: true, data: cliente })
  } catch (err) { next(err) }
}
