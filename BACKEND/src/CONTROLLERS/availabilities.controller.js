import Availability from "../MODELS/availabilities.models.js";
import {ProviderProfile }from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const createAvailability = asyncHandler(async (req, res) => {
  const { date, timeSlots } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "provider") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only providers can manage availability"
    );
  }

  const providerProfile = await ProviderProfile.findOne({ userId });
  if (!providerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  }

  if (!timeSlots || timeSlots.length === 0 || timeSlots.length > 50) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Time slots must be between 1 and 50"
    );
  }

  const availability = await Availability.create({
    providerProfileId: providerProfile._id,
    date: new Date(date),
    timeSlots,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        availability,
        "Availability created successfully"
      )
    );
});

const getAvailabilities = asyncHandler(async (req, res) => {
  const { providerId, date } = req.query;

  const query = {};
  if (providerId) {
    query.providerProfileId = providerId;
  }
  if (date) {
    query.date = new Date(date);
  }

  const availabilities = await Availability.find(query)
    .populate("providerProfileId", "businessName")
    .sort({ date: 1 });

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        availabilities,
        "Availabilities retrieved successfully"
      )
    );
});

const updateAvailability = asyncHandler(async (req, res) => {
  const { availabilityId } = req.params;
  const { timeSlots } = req.body;
  const userId = req.user._id;

  const availability = await Availability.findById(availabilityId);
  if (!availability) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Availability not found");
  }

  const providerProfile = await ProviderProfile.findOne({ userId });
  if (
    availability.providerProfileId.toString() !== providerProfile._id.toString()
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  if (timeSlots) {
    if (timeSlots.length === 0 || timeSlots.length > 50) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Time slots must be between 1 and 50"
      );
    }
    availability.timeSlots = timeSlots;
  }

  await availability.save();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        availability,
        "Availability updated successfully"
      )
    );
});

const deleteAvailability = asyncHandler(async (req, res) => {
  const { availabilityId } = req.params;
  const userId = req.user._id;

  const availability = await Availability.findById(availabilityId);
  if (!availability) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Availability not found");
  }

  const providerProfile = await ProviderProfile.findOne({ userId });
  if (
    availability.providerProfileId.toString() !== providerProfile._id.toString()
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  if (availability.isBooked) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cannot delete booked availability"
    );
  }

  await availability.remove();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, null, "Availability deleted successfully")
    );
});

export {
  createAvailability,
  getAvailabilities,
  updateAvailability,
  deleteAvailability,
};
