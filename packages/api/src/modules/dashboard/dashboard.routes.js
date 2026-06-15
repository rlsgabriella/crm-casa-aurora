import { Router } from 'express'
import { requireAuth, extractUser } from '../../middleware/auth.js'
import * as ctrl from './dashboard.controller.js'

const router = Router()

router.use(requireAuth, extractUser)

router.get('/metricas', ctrl.metricas)
router.get('/reservas-semana', ctrl.reservasSemana)

export default router
