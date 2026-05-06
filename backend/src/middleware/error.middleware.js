export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const retryAfter = err.retryAfter;

  if (statusCode === 429 && retryAfter) {
    res.set('Retry-After', retryAfter);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(statusCode === 429 && retryAfter && { retryAfter }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
