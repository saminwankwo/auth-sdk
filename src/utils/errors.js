class AppError extends Error {
    constructor(message, status = 500) {
      super(message);
      this.status = status;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
      super(message, 401);
    }
  }
  
  class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
      super(message, 403);
    }
  }
  
  module.exports = { AppError, UnauthorizedError, ForbiddenError };
  