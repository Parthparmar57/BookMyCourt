export const validate = (schemasOrBodySchema) => (req, res, next) => {
  // Support both validate({ body: schema, params: schema }) and validate(schema)
  const schemas = schemasOrBodySchema?.safeParse
    ? { body: schemasOrBodySchema }
    : schemasOrBodySchema;

  for (const key of ['body', 'params', 'query']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formattedErrors = Object.entries(fieldErrors)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join(' | ');

      return res.status(400).json({
        success: false,
        message: formattedErrors || 'Validation failed',
        errors: fieldErrors,
      });
    }
    req[key] = result.data;
  }
  next();
};

