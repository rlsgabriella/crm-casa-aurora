const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3000'
const WAHA_KEY = process.env.WAHA_API_KEY || ''

export async function enviarMensagem({ chatId, telefone, mensagem, texto, session = 'default' }) {
  // Aceita chatId direto ou constrói a partir do telefone (remove prefixo +)
  const resolvedChatId = chatId || `${(telefone || '').replace(/^\+/, '')}@c.us`
  const text = texto || mensagem

  const headers = { 'Content-Type': 'application/json' }
  if (WAHA_KEY) headers['apikey'] = WAHA_KEY

  const response = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ chatId: resolvedChatId, text, session }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`WAHA error ${response.status}: ${err}`)
  }

  return response.json()
}
