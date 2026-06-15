import { Router } from 'express'
import { requireAuth, extractUser } from '../../middleware/auth.js'
import { validate, validateQuery } from '../../middleware/validate.js'
import { queryClientesSchema, patchClienteSchema } from './clientes.validation.js'
import * as ctrl from './clientes.controller.js'

const router = Router()

router.use(requireAuth, extractUser)

router.get('/', validateQuery(queryClientesSchema), ctrl.listar)
router.get('/:id', ctrl.buscar)
router.get('/:id/historico', ctrl.historico)
router.patch('/:id', validate(patchClienteSchema), ctrl.atualizar)

export default router
