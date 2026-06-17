import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { criarMensagemSchema } from './mensagens.validation.js'
import * as ctrl from './mensagens.controller.js'

// mergeParams: true para acessar :conversaId do router pai
const router = Router({ mergeParams: true })

router.get('/', ctrl.listar)
router.post('/', validate(criarMensagemSchema), ctrl.criar)

export default router
