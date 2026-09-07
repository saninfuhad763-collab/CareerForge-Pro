export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? (err.statusCode || err.status || 500) : res.statusCode;
  let message = err.message;

  // Handle specific known error types
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {}).map((val) => val.message).join(', ') || err.message;
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, token invalid';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token expired';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload provided';
  } else if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = 'Not allowed by CORS';
  }

  // Distinguish client-safe / operational errors (4xx) from unexpected internal errors (5xx)
  const isClientSafe = statusCode >= 400 && statusCode < 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isClientSafe) {
    console.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
    if (isProduction) {
      message = 'An unexpected internal server error occurred. Please try again later.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.requiresUpgrade && { requiresUpgrade: true }),
    ...(err.currentCount !== undefined && { currentCount: err.currentCount }),
    ...(err.limit !== undefined && { limit: err.limit }),
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
