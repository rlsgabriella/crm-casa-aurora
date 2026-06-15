import { Router } from 'express'
import * as ctrl from './webhooks.controller.js'

const router = Router()

// Webhooks não usam auth Clerk — autenticados por segredo no header ou IP allowlist
router.post('/waha', ctrl.receberWaha)
router.post('/n8n/response', ctrl.receberRespostaN8n)
router.post('/reserva-landing', ctrl.receberReservaLanding)

export default router
