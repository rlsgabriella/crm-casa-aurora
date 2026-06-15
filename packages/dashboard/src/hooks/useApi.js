'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createApi } from '../lib/api.js'

export function useApi(path, deps = []) {
  const { getToken } = useAuth()
  const api = createApi(getToken)

  const [state, setState] = useState({ data: null, loading: true, error: null })

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const res = await api.get(path)
      setState({ data: res.data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err.message })
    }
  }, [path, ...deps])

  useEffect(() => { fetch() }, [fetch])

  return { ...state, refetch: fetch, api }
}
