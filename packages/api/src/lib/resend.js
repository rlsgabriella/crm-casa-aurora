import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmail({ para, assunto, html }) {
  const { data, error } = await resend.emails.send({
    from: 'CRM Restaurante <noreply@restaurante.com.br>',
    to: Array.isArray(para) ? para : [para],
    subject: assunto,
    html,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}
