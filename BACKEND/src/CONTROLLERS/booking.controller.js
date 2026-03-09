import mongoose from "mongoose";
import Booking from "../MODELS/booking.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import Service from "../MODELS/services.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const CreateBooking = asyncHandler(async (req, res) => {
  const { providerProfileId, serviceId, date, time, totalAmount, notes } = req.body;
  if (!providerProfileId || !serviceId || !date || !time || totalAmount === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const customerProfile = await CustomerProfile.findOne({ userId: req.user._id });
  if (!customerProfile) throw new ApiError(StatusCodes.BAD_REQUEST, "Customer profile not found");

  const providerProfile = await ProviderProfile.findById(providerProfileId);
  if (!providerProfile) throw new ApiError(StatusCodes.BAD_REQUEST, "Provider profile not found");

  const service = await Service.findById(serviceId);
  if (!service || service.providerId.toString() !== providerProfileId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service does not belong to provider");
  }

  const booking = await Booking.create({
    customerProfileId: customerProfile._id,
    providerProfileId,
    serviceId,
    scheduled: { date: new Date(date), time },
    address: customerProfile.location || {},
    priceSnapshot: { totalAmount: Number(totalAmount) },
    notes,
  });

  return new ApiResponse(res).success({ booking }, "Booking created successfully");
});

const getBooking = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const user = await User.findById(req.user._id);
  const query = {};

  if (user.role === "customer") {
    const customerProfile = await CustomerProfile.findOne({ userId: req.user._id });
    if (!customerProfile) throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
    query.customerProfileId = customerProfile._id;
  } else if (user.role === "provider") {
    const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!providerProfile) throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
    query.providerProfileId = providerProfile._id;
  }

  if (status) query.status = status;

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const bookings = await Booking.find(query)
    .populate("customerProfileId", "fullName phone")
    .populate("providerProfileId", "displayName phone")
    .populate("serviceId", "title pricing")
    .sort({ createdAt: -1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit);

  const total = await Booking.countDocuments(query);

  return new ApiResponse(res).success(
    { bookings, currentPage: parsedPage, totalPages: Math.ceil(total / parsedLimit), total },
    "Bookings retrieved successfully"
  );
});

const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid booking id");
  }

  const booking = await Booking.findById(bookingId)
    .populate("customerProfileId", "fullName phone")
    .populate("providerProfileId", "displayName phone")
    .populate("serviceId", "title pricing");

  if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

  return new ApiResponse(res).success({ booking }, "Booking retrieved successfully");
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!status) throw new ApiError(StatusCodes.BAD_REQUEST, "Status is required");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

  booking.status = status;
  await booking.save();

  return new ApiResponse(res).success({ booking }, "Booking status updated successfully");
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

  booking.status = "cancelled";
  await booking.save();

  return new ApiResponse(res).success({ booking }, "Booking cancelled successfully");
});

export { CreateBooking, getBooking, getBookingById, updateBookingStatus, cancelBooking };
