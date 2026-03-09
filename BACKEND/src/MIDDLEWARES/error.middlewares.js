import { ApiError } from "../UTILS/apiError.js";
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // If response already sent, let Express handle it
  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
};

export default errorHandler;
