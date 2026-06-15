'use client'

const BASE_URL = '/api'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data?.error?.message || `HTTP ${res.status}`
    throw Object.assign(new Error(message), { status: res.status, code: data?.error?.code })
  }

  return data
}

export function createApi(getToken) {
  return {
    get: (path) => getToken().then(t => request('GET', path, null, t)),
    post: (path, body) => getToken().then(t => request('POST', path, body, t)),
    patch: (path, body) => getToken().then(t => request('PATCH', path, body, t)),
    delete: (path) => getToken().then(t => request('DELETE', path, null, t)),
  }
}
