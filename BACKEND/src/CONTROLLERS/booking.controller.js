import mongoose from "mongoose";
import Booking from "../MODELS/booking.models.js";
import Notification from "../MODELS/notifications.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import Service from "../MODELS/services.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const BOOKING_STATUS = [
  "pending",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
];
const PROVIDER_ALLOWED_STATUSES = ["confirmed", "cancelled", "completed"];

const buildBookingAddress = (address = {}) => ({
  type: address.type || "home",
  name: address.name || "",
  phone: address.phone || "",
  addressLine1: address.addressLine1 || "",
  addressLine2: address.addressLine2 || "",
  landmark: address.landmark || "",
  instructions: address.instructions || "",
  city: address.city || "",
  state: address.state || "",
  country: address.country || "",
  zipCode: address.zipCode || address.pincode || "",
  pincode: address.pincode || address.zipCode || "",
  street:
    address.street ||
    [address.addressLine1, address.addressLine2].filter(Boolean).join(", "),
});

const syncProviderNotificationStatus = async (bookingId, status) => {
  await Notification.updateMany(
    { bookingId, type: "booking_request" },
    {
      $set: {
        "metadata.bookingStatus": status,
        "metadata.providerAction":
          status === "confirmed" || status === "completed"
            ? "accepted"
            : status === "cancelled"
              ? "declined"
              : "pending",
      },
    }
  );
};

const CreateBooking = asyncHandler(async (req, res) => {
  const {
    providerProfileId,
    serviceId,
    date,
    time,
    totalAmount,
    notes,
    address,
    paymentType = "online",
  } = req.body;

  const normalizedProviderProfileId =
    typeof providerProfileId === "string"
      ? providerProfileId
      : providerProfileId?._id;
  const normalizedServiceId =
    typeof serviceId === "string" ? serviceId : serviceId?._id;

  // FIX Bug 1: Removed the duplicate if block. Keep only the one using normalized IDs.
  if (
    !normalizedProviderProfileId ||
    !normalizedServiceId ||
    !date ||
    !time ||
    totalAmount === undefined
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  if (
    !address?.name ||
    !address?.phone ||
    !address?.addressLine1 ||
    !address?.city ||
    !address?.state ||
    !address?.pincode
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Complete address details are required"
    );
  }

  if (!["cod", "online"].includes(paymentType)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid payment type");
  }

  const customerProfile = await CustomerProfile.findOne({
    userId: req.user._id,
  });
  if (!customerProfile)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Customer profile not found");

  // FIX Bug 2: Removed duplicate promises. Use only normalized IDs. Destructure all 3 variables correctly.
  const [providerProfile, service, customerUser] = await Promise.all([
    ProviderProfile.findById(normalizedProviderProfileId),
    Service.findById(normalizedServiceId),
    User.findById(req.user._id),
  ]);

  if (!providerProfile)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider profile not found");

  // FIX Bug 3: Removed the duplicate if block. Keep only the one using normalizedProviderProfileId.
  if (
    !service ||
    service.providerId.toString() !== normalizedProviderProfileId
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Service does not belong to provider"
    );
  }

  const booking = await Booking.create({
    customerProfileId: customerProfile._id,
    providerProfileId: normalizedProviderProfileId,
    serviceId: normalizedServiceId,
    scheduled: { date: new Date(date), time },
    address: buildBookingAddress(address),
    priceSnapshot: { totalAmount: Number(totalAmount) },
    paymentType,
    paymentStatus: "pending",
    notes,
  });

  await Notification.create({
    userId: providerProfile.userId,
    bookingId: booking._id,
    type: "booking_request",
    title: "New service booking request",
    body: `${customerProfile.fullName || customerUser?.fullName || "A customer"} requested ${service.title}`,
    metadata: {
      bookingStatus: booking.status,
      providerAction: "pending",
      customer: {
        name: customerProfile.fullName || customerUser?.fullName || "Customer",
        phone: address.phone || customerProfile.phone || "",
        avatar:
          customerProfile.profileImage || customerUser?.profileImage || "",
      },
      service: {
        id: service._id,
        title: service.title,
        pricing: service.pricing,
      },
      paymentType: booking.paymentType,
      paymentStatus: booking.paymentStatus,
      totalAmount: booking.priceSnapshot.totalAmount,
      addressSummary: [
        address.addressLine1,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", "),
      scheduled: booking.scheduled,
    },
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customerProfileId", "fullName phone profileImage")
    .populate("providerProfileId", "displayName phone userId")
    .populate("serviceId", "title pricing");

  return new ApiResponse(res).success(
    { booking: populatedBooking },
    "Booking created successfully",
    StatusCodes.CREATED
  );
});

const getBooking = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const user = await User.findById(req.user._id);
  const query = {};

  if (user.role === "customer") {
    const customerProfile = await CustomerProfile.findOne({
      userId: req.user._id,
    });
    if (!customerProfile)
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
    query.customerProfileId = customerProfile._id;
  } else if (user.role === "provider") {
    const providerProfile = await ProviderProfile.findOne({
      userId: req.user._id,
    });
    if (!providerProfile)
      throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
    query.providerProfileId = providerProfile._id;
  }

  if (status) query.status = status;

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const bookings = await Booking.find(query)
    .populate("customerProfileId", "fullName phone profileImage")
    .populate("providerProfileId", "displayName phone")
    .populate("serviceId", "title pricing")
    .sort({ createdAt: -1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit);

  const total = await Booking.countDocuments(query);

  return new ApiResponse(res).success(
    {
      bookings,
      currentPage: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    },
    "Bookings retrieved successfully"
  );
});

const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid booking id");
  }

  const booking = await Booking.findById(bookingId)
    .populate("customerProfileId", "fullName phone profileImage")
    .populate("providerProfileId", "displayName phone userId")
    .populate("serviceId", "title pricing");

  if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

  return new ApiResponse(res).success(
    { booking },
    "Booking retrieved successfully"
  );
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid booking id");
  }

  if (!status)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Status is required");
  if (!BOOKING_STATUS.includes(status))
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status");

  const [booking, user] = await Promise.all([
    Booking.findById(bookingId),
    User.findById(req.user._id),
  ]);

  if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  if (user.role !== "provider") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only providers can update booking status"
    );
  }

  const providerProfile = await ProviderProfile.findOne({
    userId: req.user._id,
  });
  if (
    !providerProfile ||
    providerProfile._id.toString() !== booking.providerProfileId.toString()
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You can only manage your own booking requests"
    );
  }

  if (!PROVIDER_ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Providers can only confirm, cancel, or complete their own bookings"
    );
  }

  if (
    status === "completed" &&
    !["confirmed", "in-progress"].includes(booking.status)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Only active bookings can be marked as completed"
    );
  }

  booking.status = status;
  await booking.save();
  await syncProviderNotificationStatus(booking._id, status);

  // FIX Bug 4: Removed duplicate const populatedBooking declaration. Keep only one.
  const populatedBooking = await Booking.findById(booking._id)
    .populate("customerProfileId", "fullName phone profileImage")
    .populate("providerProfileId", "displayName phone")
    .populate("serviceId", "title pricing");

  return new ApiResponse(res).success(
    { booking: populatedBooking },
    "Booking status updated successfully"
  );
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid booking id");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");

  const customerProfile = await CustomerProfile.findOne({
    userId: req.user._id,
  });
  if (
    !customerProfile ||
    booking.customerProfileId.toString() !== customerProfile._id.toString()
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You can only cancel your own bookings"
    );
  }

  booking.status = "cancelled";
  await booking.save();
  await syncProviderNotificationStatus(booking._id, "cancelled");

  return new ApiResponse(res).success(
    { booking },
    "Booking cancelled successfully"
  );
});

export {
  CreateBooking,
  getBooking,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};