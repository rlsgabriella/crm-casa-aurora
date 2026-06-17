'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createApi } from '../lib/api'
import type { ApiResponse } from '../lib/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void
  api: ReturnType<typeof createApi>
}

export function useApi<T = unknown>(path: string, deps: unknown[] = []): UseApiReturn<T> {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.get<T>(path)
      setState({ data: (res as ApiResponse<T>).data, loading: false, error: null })
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps])

  useEffect(() => { refetch() }, [refetch])

  return { ...state, refetch, api }
}
