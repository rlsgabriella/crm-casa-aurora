export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const err = result.error
      err.status = 400
      return next(err)
    }
    req.body = result.data
    next()
  }
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      const err = result.error
      err.status = 400
      return next(err)
    }
    req.query = result.data
    next()
  }
}
