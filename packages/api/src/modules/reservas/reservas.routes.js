import { Router } from 'express'
import { requireAuth, extractUser } from '../../middleware/auth.js'
import { validate, validateQuery } from '../../middleware/validate.js'
import { queryReservasSchema, patchReservaSchema } from './reservas.validation.js'
import * as ctrl from './reservas.controller.js'

const router = Router()

router.use(requireAuth, extractUser)

router.get('/hoje', ctrl.hoje)
router.get('/', validateQuery(queryReservasSchema), ctrl.listar)
router.get('/:id', ctrl.buscar)
router.patch('/:id', validate(patchReservaSchema), ctrl.atualizar)

export default router
