import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { errorHandler } from './middleware/errorHandler.js'
import clientesRoutes from './modules/clientes/clientes.routes.js'
import reservasRoutes from './modules/reservas/reservas.routes.js'
import mesasRoutes from './modules/mesas/mesas.routes.js'
import conversasRoutes from './modules/conversas/conversas.routes.js'
import equipeRoutes from './modules/equipe/equipe.routes.js'
import webhooksRoutes from './modules/webhooks/webhooks.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'

const app = express()
const PORT = process.env.PORT || 3334

app.use(helmet())
app.use(cors({ origin: ['http://localhost:5174', 'http://127.0.0.1:5174'] }))
app.use(morgan('dev'))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true, service: 'crm-api', port: PORT }))

app.use('/api/clientes', clientesRoutes)
app.use('/api/reservas', reservasRoutes)
app.use('/api/mesas', mesasRoutes)
app.use('/api/conversas', conversasRoutes)
app.use('/api/atendentes', equipeRoutes)
app.use('/api/webhooks', webhooksRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`CRM API rodando na porta ${PORT}`)
})
