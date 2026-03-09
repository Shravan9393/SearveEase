import {ProviderProfile} from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const getProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await ProviderProfile.findOne({ userId }).populate(
    "userId",
    "fullName email avatar"
  );
  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, profile, "Profile retrieved successfully")
    );
});

const updateProviderProfile = asyncHandler(async (req, res) => {
  const {
    phone,
    businessName,
    description,
    yearsOfExperience,
    categories,
    services,
    pricing,
    location,
  } = req.body;

  const userId = req.user._id;

  const profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
  }

  if (phone) profile.phone = phone;
  if (businessName) profile.businessName = businessName;
  if (description) profile.description = description;
  if (yearsOfExperience !== undefined)
    profile.yearsOfExperience = yearsOfExperience;

  // ✅ REQUIRED FOR SEEDING
  if (categories) profile.categories = categories;
  if (services) profile.services = services;

  if (pricing) profile.pricing = pricing;
  if (location) profile.location = location;

  await profile.save();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, profile, "Profile updated successfully")
    );
});


const deleteProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
  }

  profile.isActive = false;
  await profile.save();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, null, "Profile deleted successfully")
    );
});

export { getProviderProfile, updateProviderProfile, deleteProviderProfile };
