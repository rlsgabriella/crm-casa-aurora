import { z } from 'zod'

export const queryReservasSchema = z.object({
  data: z.string().optional(),
  status: z.string().optional(),
  mesaId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const patchReservaSchema = z.object({
  status: z.enum(['pendente', 'confirmada', 'cancelada', 'no-show']),
  observacoes: z.string().optional(),
})
