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

/* ----------------------------------
   Register Customer
---------------------------------- */
const registerCustomer = asyncHandler(async (req, res) => {
  console.log("REGISTER CUSTOMER CONTROLLER HIT");

  const { userName, email, password, fullName, phone } = req.body;

  if ([userName, email, password, fullName, phone].some((v) => !v?.trim())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
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


  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(StatusCodes.CREATED)
    .json(
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
  const {
    userName,
    email,
    password,
    fullName,
    phone,
    displayName,
    businessName,
    description,
  } = req.body;

  if (
    [
      userName,
      email,
      password,
      fullName,
      phone,
      displayName,
      businessName,
      description,
    ].some((v) => !v?.trim())
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "All required fields are mandatory"
    );
  }

  const existingUser = await User.findOne({ email });
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
    description,
    pricing: { starting: 0 }, // default safe value
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        { user, providerProfile, accessToken, refreshToken },
        "Provider registered successfully"
      )
    );
});


export { registerCustomer, registerProvider };
