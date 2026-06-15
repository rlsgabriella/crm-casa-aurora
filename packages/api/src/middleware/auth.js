import { clerkMiddleware, getAuth } from '@clerk/express'

export const requireAuth = clerkMiddleware()

export function extractUser(req, _res, next) {
  const auth = getAuth(req)
  if (!auth.userId) {
    return _res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido ou ausente' } })
  }
  req.userId = auth.userId
  req.sessionClaims = auth.sessionClaims
  req.role = auth.sessionClaims?.metadata?.role || 'atendente'
  next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permissão insuficiente' } })
    }
    next()
  }
}
