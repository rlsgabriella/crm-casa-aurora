import { z } from 'zod'

export const criarMensagemSchema = z.object({
  remetente: z.enum(['cliente', 'bot', 'atendente']),
  conteudo: z.string().min(1),
  tipo: z.enum(['texto', 'imagem', 'audio', 'documento']).default('texto'),
})

export const queryMensagensSchema = z.object({
  antes: z.string().datetime().optional(),
  limite: z.coerce.number().int().positive().max(100).default(50),
})
