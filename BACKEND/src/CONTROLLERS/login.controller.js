import jwt from "jsonwebtoken";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import { OAuth2Client } from "google-auth-library";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";


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

/* ----------------------------------
   Google OAuth Setup
---------------------------------- */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ----------------------------------
   Google Login/Register
---------------------------------- */
const googleAuth = asyncHandler(async (req, res) => {

  const { token, role } = req.body;

  const { token } = req.body;
  const requestedRole = ["customer", "provider"].includes(req.body.role)
    ? req.body.role
    : "customer";

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

  let isFirstGoogleLogin = false;
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
      role: role === "provider" ? "provider" : "customer",
      googleId,
      isGoogleAccount: true,
      profileImage: picture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });
    isFirstGoogleLogin = true;
  }

  let needsProviderProfileCompletion = false;
  if (user.role === "provider") {
    const providerProfile = await ProviderProfile.findOne({ userId: user._id });
    needsProviderProfileCompletion = !providerProfile;
  }


  if (requestedRole === "provider" && user.role !== "provider") {
    user.role = "provider";
    await user.save();
  }

  const providerProfile = user.role === "provider" ? await ProviderProfile.findOne({ userId: user._id }) : null;
  const requiresProviderProfileCompletion = user.role === "provider" && !providerProfile;

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
        {
          user: {
            ...user.toJSON(),
            needsProviderProfileCompletion,
          },
          accessToken,
          refreshToken,

          user,
          accessToken,
          refreshToken,
          isFirstGoogleLogin,
          requiresProviderProfileCompletion,

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
  const phone = normalizeString(req.body.phone);
  const password = normalizeString(req.body.password);

  const loginIdentifier = identifier || email || userName || phone;

  if (!loginIdentifier || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Credentials required");
  }

  let user = await User.findOne({
    $or: [{ email: loginIdentifier }, { userName: loginIdentifier }],
  }).select("+password +refreshToken");


  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  if (user.isGoogleAccount && !user.password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "This account uses Google Sign-In. Please continue with Google."
    );
  }

  if (!(await user.isPasswordCorrect(password))) {

  if (!user && phone) {
    const providerProfile = await ProviderProfile.findOne({ phone });
    const customerProfile = providerProfile ? null : await CustomerProfile.findOne({ phone });
    const phoneUserId = providerProfile?.userId || customerProfile?.userId;
    if (phoneUserId) {
      user = await User.findById(phoneUserId).select("+password +refreshToken");
    }
  }

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

  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  let userId = req.user?._id;
  if (!userId && accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      userId = decoded?._id;
    } catch {
      userId = null;
    }
  }

  if (userId) {
    await User.findByIdAndUpdate(userId, {

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {

      $unset: { refreshToken: "" },
    });
  } else if (incomingRefreshToken) {
    await User.findOneAndUpdate(
      { refreshToken: incomingRefreshToken },
      { $unset: { refreshToken: "" } }
    );
  }

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

const completeProviderProfile = asyncHandler(async (req, res) => {
  const displayName = normalizeString(req.body.displayName);
  const phone = normalizeString(req.body.phone);
  const businessName = normalizeString(req.body.businessName);
  const description = normalizeString(req.body.description);

  if (!displayName || !phone) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Display name and phone are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (user.role !== "provider") {
    user.role = "provider";
    await user.save({ validateBeforeSave: false });
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        displayName,
        phone,
        businessName,
        description: description || "Service provider",
        pricing: { starting: 0 },
      },
    },
    { new: true, upsert: true }
  );

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { profile }, "Provider profile completed successfully"));
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
        { accessToken, refreshToken },
        "Access token refreshed"
      )
    );
});


const completeProviderProfile = asyncHandler(async (req, res) => {
  const { displayName, phone, businessName, description } = req.body;

  if (!displayName?.trim() || !phone?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Display name and phone are required");
  }

  if (req.user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only provider accounts can complete provider profile");
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
      $set: {
        userId: req.user._id,
        displayName: displayName.trim(),
        phone: phone.trim(),
        businessName: businessName?.trim() || "",
        description: description?.trim() || "Service provider",
      },
      $setOnInsert: {
        pricing: { starting: 0 },
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { profile }, "Provider profile completed successfully"));
});


export { loginUser, logoutUser, refreshAccessToken, googleAuth, completeProviderProfile };
