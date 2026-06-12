export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Server error';

  if (error.name === 'ZodError') {
    status = 400;
    message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map(e => e.message).join(', ');
  }

  res.status(status).json({
    message,
    details: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
}
