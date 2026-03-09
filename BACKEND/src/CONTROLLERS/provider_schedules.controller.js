import ProviderSchedule from '../MODELS/provider_schedules.js';
import {ProviderProfile} from '../MODELS/provider_profiles.models.js';
import { User } from '../MODELS/users.models.js';
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const createSchedule = asyncHandler(async (req, res) => {
    const { availability } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can manage schedules");
    }

    const providerProfile = await ProviderProfile.findOne({ userId });
    if (!providerProfile) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
    }

    const existingSchedule = await ProviderSchedule.findOne({ providerProfileId: providerProfile._id });
    if (existingSchedule) {
        throw new ApiError(StatusCodes.CONFLICT, "Schedule already exists");
    }

    const schedule = await ProviderSchedule.create({
        providerProfileId: providerProfile._id,
        availability
    });

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, schedule, "Schedule created successfully")
    );
});

const getSchedule = asyncHandler(async (req, res) => {
    const { providerId } = req.params;

    const schedule = await ProviderSchedule.findOne({ providerProfileId: providerId });
    if (!schedule) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Schedule not found");
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, schedule, "Schedule retrieved successfully")
    );
});

const updateSchedule = asyncHandler(async (req, res) => {
    const { availability } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can manage schedules");
    }

    const providerProfile = await ProviderProfile.findOne({ userId });
    const schedule = await ProviderSchedule.findOne({ providerProfileId: providerProfile._id });
    if (!schedule) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Schedule not found");
    }

    schedule.availability = availability;
    await schedule.save();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, schedule, "Schedule updated successfully")
    );
});

const deleteSchedule = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can manage schedules");
    }

    const providerProfile = await ProviderProfile.findOne({ userId });
    const schedule = await ProviderSchedule.findOneAndDelete({ providerProfileId: providerProfile._id });
    if (!schedule) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Schedule not found");
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, null, "Schedule deleted successfully")
    );
});

export { createSchedule, getSchedule, updateSchedule, deleteSchedule };
