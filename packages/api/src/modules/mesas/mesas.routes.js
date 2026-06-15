import { Router } from 'express'
import { requireAuth, extractUser } from '../../middleware/auth.js'
import { validate, validateQuery } from '../../middleware/validate.js'
import { queryMesasDisponiveisSchema, patchMesaSchema } from './mesas.validation.js'
import * as ctrl from './mesas.controller.js'

const router = Router()

router.use(requireAuth, extractUser)

router.get('/', ctrl.listar)
router.get('/disponiveis', validateQuery(queryMesasDisponiveisSchema), ctrl.disponiveis)
router.patch('/:id', validate(patchMesaSchema), ctrl.atualizar)

export default router
