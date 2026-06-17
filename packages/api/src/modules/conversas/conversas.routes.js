import { Router } from 'express'
import { requireAuth, extractUser } from '../../middleware/auth.js'
import { validate, validateQuery } from '../../middleware/validate.js'
import { queryConversasSchema, criarConversaSchema, patchConversaSchema } from './conversas.validation.js'
import mensagensRoutes from '../mensagens/mensagens.routes.js'
import * as ctrl from './conversas.controller.js'

const router = Router()

router.use(requireAuth, extractUser)

// Rotas de conversas
router.get('/', validateQuery(queryConversasSchema), ctrl.listar)
router.get('/:id', ctrl.buscar)
router.post('/', validate(criarConversaSchema), ctrl.criar)
router.patch('/:id', validate(patchConversaSchema), ctrl.atualizar)
router.post('/:id/atribuir-auto', ctrl.atribuirAuto)

// Mensagens aninhadas sob conversa
router.use('/:conversaId/mensagens', mensagensRoutes)

export default router
