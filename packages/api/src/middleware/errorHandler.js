export function errorHandler(err, _req, res, _next) {
  console.error(err)

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: err.errors },
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Registro não encontrado' },
    })
  }

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    },
  })
}
