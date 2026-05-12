export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = new Error(
        "Invalid request body: " + result.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")
      );
      err.status = 400;
      return next(err);
    }
    req.body = result.data;
    next();
  };
}
