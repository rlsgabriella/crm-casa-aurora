import { z } from 'zod'

export const queryMesasDisponiveisSchema = z.object({
  data: z.string().optional(),
  numPessoas: z.coerce.number().int().positive().optional(),
})

export const patchMesaSchema = z.object({
  status: z.enum(['disponivel', 'ocupada', 'reservada', 'inativa']),
})
