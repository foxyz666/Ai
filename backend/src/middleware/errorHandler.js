export function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.originalUrl} not found` } });
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  if (status >= 500) {
    console.error(`[backend] ${status} ${req.method} ${req.originalUrl}:`, err);
  }
  res.status(status).json({ error: { message, code: err.code } });
}
