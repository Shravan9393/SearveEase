import { ApiError } from "../UTILS/apiError.js";
import { StatusCodes } from "http-status-codes";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not allowed to perform this action"
      );
    }

    next();
  };
};
