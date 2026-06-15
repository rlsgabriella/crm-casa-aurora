'use client'

import { useAuth } from '@clerk/nextjs'

export function useIsAdmin() {
  const { sessionClaims } = useAuth()
  const role = sessionClaims?.metadata?.role
  return role === 'admin' || role === 'gerente'
}
