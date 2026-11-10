// Express 5: req.query is a read-only getter, so parsed data goes to req.valid
export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    req.valid = schema.parse(req[source]);
    next();
  } catch (err) {
    next(err);
  }
};
