import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { User } from "../MODELS/users.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  console.log("Token received in auth.middleware.js :", token);

  if (!token) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Unauthorized access, token missing"
    );
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken -__v"
    );

    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorized access, user not found"
      );
    }

    req.user = user; // ← IMPORTANT
    next();
  } catch (error) {
    console.error("JWT verification error :", error.message);

    if (error.name === "JsonWebTokenError") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Token expired");
    } else {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        error.message || "Token verification failed"
      );
    }
  }
});
