'use client'

import { useUser } from '@clerk/nextjs'

interface UseIsAdminReturn {
  isAdmin: boolean
  isLoaded: boolean
}

export function useIsAdmin(): UseIsAdminReturn {
  const { user, isLoaded } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  return {
    isAdmin: role === 'admin' || role === 'gerente',
    isLoaded,
  }
}
