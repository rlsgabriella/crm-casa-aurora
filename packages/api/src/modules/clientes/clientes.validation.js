import { z } from 'zod'

export const queryClientesSchema = z.object({
  busca: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const patchClienteSchema = z.object({
  observacoes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
