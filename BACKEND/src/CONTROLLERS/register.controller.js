import { User } from "../MODELS/users.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

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

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

/* ----------------------------------
   Register Customer
---------------------------------- */
const registerCustomer = asyncHandler(async (req, res) => {
  const userName = normalizeString(req.body.userName);
  const email = normalizeString(req.body.email).toLowerCase();
  const password = normalizeString(req.body.password);
  const fullName = normalizeString(req.body.fullName);
  const phone = normalizeString(req.body.phone);

  if ([userName, email, password, fullName, phone].some((value) => !value)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName: userName.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "User already exists");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    role: "customer",
  });

  const customerProfile = await CustomerProfile.create({
    userId: user._id,
    fullName,
    phone,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(
      StatusCodes.CREATED,
      { user, customerProfile, accessToken, refreshToken },
      "Customer registered successfully"
    )
  );
});

/* ----------------------------------
   Register Provider
---------------------------------- */
const registerProvider = asyncHandler(async (req, res) => {
  const userName = normalizeString(req.body.userName);
  const email = normalizeString(req.body.email).toLowerCase();
  const password = normalizeString(req.body.password);
  const fullName = normalizeString(req.body.fullName);
  const phone = normalizeString(req.body.phone);
  const displayName = normalizeString(req.body.displayName);
  const businessName = normalizeString(req.body.businessName);
  const description = normalizeString(req.body.description);

  if ([userName, email, password, fullName, phone, displayName].some((value) => !value)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All required fields are mandatory");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName: userName.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "User already exists");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    role: "provider",
  });

  const providerProfile = await ProviderProfile.create({
    userId: user._id,
    businessName,
    displayName,
    phone,
    description: description || "Service provider",
    pricing: { starting: 0 },
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(
      StatusCodes.CREATED,
      { user, providerProfile, accessToken, refreshToken },
      "Provider registered successfully"
    )
  );
});

export { registerCustomer, registerProvider };
