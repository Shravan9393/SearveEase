import jwt from "jsonwebtoken";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import { OAuth2Client } from "google-auth-library";

/* ----------------------------------
   Token Generator
---------------------------------- */
const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId).select("+refreshToken");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

/* ----------------------------------
   Google OAuth Setup
---------------------------------- */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ----------------------------------
   Google Login/Register
---------------------------------- */
const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Google token is required");
  }

  // Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Google token");
  }

  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Google account email is required");
  }

  // Check if user exists
  let user = await User.findOne({ email });

  if (user) {
    // Update Google ID if not set
    if (!user.googleId) {
      user.googleId = googleId;
      user.isGoogleAccount = true;
      if (picture) {
        user.profileImage = picture;
      }
      await user.save();
    }
  } else {
    // Create new user for Google OAuth
    const userName = email.split('@')[0] + '_' + Date.now().toString(36);
    
    user = await User.create({
      userName: userName.toLowerCase(),
      fullName: name || email.split('@')[0],
      email,
      password: Math.random().toString(36).slice(-8), // Random password for Google accounts
      role: "customer",
      googleId,
      isGoogleAccount: true,
      profileImage: picture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { user, accessToken, refreshToken },
        "User logged in successfully with Google"
      )
    );
});

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

/* ----------------------------------
   Login
---------------------------------- */
const loginUser = asyncHandler(async (req, res) => {
  const email = normalizeString(req.body.email).toLowerCase();
  const userName = normalizeString(req.body.userName).toLowerCase();
  const identifier = normalizeString(req.body.identifier).toLowerCase();
  const password = normalizeString(req.body.password);

  const loginIdentifier = identifier || email || userName;

  if (!loginIdentifier || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Credentials required");
  }

  const user = await User.findOne({
    $or: [{ email: loginIdentifier }, { userName: loginIdentifier }],
  }).select("+password +refreshToken");

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

/* ----------------------------------
   Logout
---------------------------------- */
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: "" },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(StatusCodes.OK, null, "Logged out successfully"));
});

/* ----------------------------------
   Refresh Token
---------------------------------- */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token missing");
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

export { loginUser, logoutUser, refreshAccessToken, googleAuth };
