const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3000'
const WAHA_KEY = process.env.WAHA_API_KEY || ''

export async function enviarMensagem({ telefone, mensagem, session = 'default' }) {
  const response = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: WAHA_KEY,
    },
    body: JSON.stringify({
      chatId: `${telefone}@c.us`,
      text: mensagem,
      session,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`WAHA error ${response.status}: ${err}`)
  }

  return response.json()
}
