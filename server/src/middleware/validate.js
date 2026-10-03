export const validate = (schemasOrBodySchema) => (req, res, next) => {
  // Support both validate({ body: schema, params: schema }) and validate(schema)
  const schemas = schemasOrBodySchema?.safeParse
    ? { body: schemasOrBodySchema }
    : schemasOrBodySchema;

  for (const key of ['body', 'params', 'query']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req[key] = result.data;
  }
  next();
};
