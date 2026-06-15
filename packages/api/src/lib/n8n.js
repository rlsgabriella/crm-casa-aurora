const N8N_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook'

export async function dispararWebhook(path, payload) {
  const url = `${N8N_URL}/${path}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`n8n webhook error ${response.status}: ${err}`)
  }

  return response.json().catch(() => ({ ok: true }))
}
