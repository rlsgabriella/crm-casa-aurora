import { Router } from 'express'
import { requireAuth, extractUser } from '../../middleware/auth.js'
import { validate } from '../../middleware/validate.js'
import { criarAtendenteSchema, patchAtendenteSchema } from './equipe.validation.js'
import * as ctrl from './equipe.controller.js'

const router = Router()

router.use(requireAuth, extractUser)

router.get('/', ctrl.listar)
router.get('/:id', ctrl.buscar)
router.get('/:id/metricas', ctrl.metricas)
router.post('/', validate(criarAtendenteSchema), ctrl.criar)
router.patch('/:id', validate(patchAtendenteSchema), ctrl.atualizar)

export default router
