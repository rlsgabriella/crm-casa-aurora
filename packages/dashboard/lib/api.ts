export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

type GetTokenFn = () => Promise<string | null>

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  const data = (await res.json().catch(() => ({}))) as ApiResponse<T>

  if (!res.ok) {
    const message = data?.error?.message || `HTTP ${res.status}`
    throw Object.assign(new Error(message), {
      status: res.status,
      code: data?.error?.code,
    })
  }

  return data
}

export function createApi(getToken: GetTokenFn) {
  return {
    get:    <T = unknown>(path: string)               => getToken().then(t => request<T>('GET',    path, null, t)),
    post:   <T = unknown>(path: string, body: unknown) => getToken().then(t => request<T>('POST',   path, body, t)),
    patch:  <T = unknown>(path: string, body: unknown) => getToken().then(t => request<T>('PATCH',  path, body, t)),
    delete: <T = unknown>(path: string)               => getToken().then(t => request<T>('DELETE', path, null, t)),
  }
}
