import jwt from "jsonwebtoken";
import { User } from "../MODELS/users.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
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

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

/* ----------------------------------
   Google OAuth Setup
---------------------------------- */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ----------------------------------
   Google Login/Register
---------------------------------- */
const googleAuth = asyncHandler(async (req, res) => {
  const { token, role } = req.body;

  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Google token is required");
  }

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

  let user = await User.findOne({ email }).select("+refreshToken");

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    user.isGoogleAccount = true;
    if (picture) {
      user.profileImage = picture;
    }
    if (role && ["customer", "provider"].includes(role) && user.role !== role) {
      user.role = role;
    }
    await user.save({ validateBeforeSave: false });
  } else {
    const userName = `${email.split("@")[0]}_${Date.now().toString(36)}`;

    user = await User.create({
      userName: userName.toLowerCase(),
      fullName: name || email.split("@")[0],
      email,
      password: Math.random().toString(36).slice(-10),
      role: role === "provider" ? "provider" : "customer",
      googleId,
      isGoogleAccount: true,
      profileImage:
        picture ||
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });
  }

  const providerProfile =
    user.role === "provider"
      ? await ProviderProfile.findOne({ userId: user._id })
      : null;

  const profileCompletionRequired = user.role === "provider" && !providerProfile;

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        {
          user,
          accessToken,
          refreshToken,
          profileCompletionRequired,
          onboardingRole: user.role,
        },
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

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  if (user.isGoogleAccount && !user.password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Use Google Sign-In for this account"
    );
  }

  if (!(await user.isPasswordCorrect(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const providerProfile =
    user.role === "provider"
      ? await ProviderProfile.findOne({ userId: user._id })
      : null;

  const profileCompletionRequired = user.role === "provider" && !providerProfile;

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { user, accessToken, refreshToken, profileCompletionRequired },
        "User logged in successfully"
      )
    );
});

/* ----------------------------------
   Logout
---------------------------------- */
const logoutUser = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.refreshToken;
  const tokenFromBody = normalizeString(req.body.refreshToken);
  const incomingRefreshToken = tokenFromCookie || tokenFromBody;

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    });
  } else if (incomingRefreshToken) {
    const tokenOwner = await User.findOne({ refreshToken: incomingRefreshToken }).select("_id");
    if (tokenOwner) {
      await User.findByIdAndUpdate(tokenOwner._id, {
        $unset: { refreshToken: 1 },
      });
    }
  }

  return res
    .status(StatusCodes.OK)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(StatusCodes.OK, null, "Logged out successfully"));
});

/* ----------------------------------
   Refresh Token
---------------------------------- */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

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
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});

export { loginUser, logoutUser, refreshAccessToken, googleAuth };
