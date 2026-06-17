import { z } from 'zod'

export const queryConversasSchema = z.object({
  status: z.enum(['aberta', 'aguardando', 'fechada']).optional(),
  atendenteId: z.string().optional(),
  semAtendente: z.string().optional(),
  busca: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
})

export const criarConversaSchema = z.object({
  clienteId: z.string().min(1),
  canal: z.enum(['whatsapp', 'web']).default('whatsapp'),
  restauranteId: z.string().min(1),
})

export const patchConversaSchema = z.object({
  atendenteId: z.string().nullable().optional(),
  status: z.enum(['aberta', 'aguardando', 'fechada']).optional(),
  finalizadaEm: z.string().datetime().optional(),
})
