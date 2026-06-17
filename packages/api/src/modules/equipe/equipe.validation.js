import { z } from 'zod'

export const criarAtendenteSchema = z.object({
  clerkUserId: z.string().min(1),
  nome: z.string().min(1),
  role: z.enum(['admin', 'gerente', 'garcom', 'atendente']).default('atendente'),
  restauranteId: z.string().min(1),
})

export const patchAtendenteSchema = z.object({
  nome: z.string().min(1).optional(),
  role: z.enum(['admin', 'gerente', 'garcom', 'atendente']).optional(),
  status: z.enum(['online', 'offline', 'pausa']).optional(),
})
