import Review from "../MODELS/review.models.js";
import Booking from "../MODELS/booking.models.js";
import Service from "../MODELS/services.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const refreshProviderAndServiceRatings = async (providerProfileId, serviceId) => {
  const [providerReviews, serviceReviews] = await Promise.all([
    Review.find({ providerProfileId }),
    serviceId ? Review.find({ bookingId: { $in: (await Booking.find({ serviceId }).select("_id")).map((b) => b._id) } }) : [],
  ]);

  const providerAvg = providerReviews.length
    ? providerReviews.reduce((sum, review) => sum + review.rating, 0) / providerReviews.length
    : 0;

  await ProviderProfile.findByIdAndUpdate(providerProfileId, {
    $set: {
      ratingSummary: {
        avg: Number(providerAvg.toFixed(1)),
        count: providerReviews.length,
      },
      reviewCount: providerReviews.length,
    },
  });

  if (serviceId) {
    const serviceAvg = serviceReviews.length
      ? serviceReviews.reduce((sum, review) => sum + review.rating, 0) / serviceReviews.length
      : 0;

    await Service.findByIdAndUpdate(serviceId, {
      $set: {
        rating: Number(serviceAvg.toFixed(1)),
        reviews: serviceReviews.length,
      },
    });
  }
};

const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, images } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  if (booking.status !== "completed") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Can only review completed bookings");
  }

  const customerProfile = await CustomerProfile.findOne({ userId });
  if (!customerProfile || booking.customerProfileId.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new ApiError(StatusCodes.CONFLICT, "Review already exists for this booking");
  }

  const review = await Review.create({
    bookingId,
    customerProfileId: customerProfile._id,
    providerProfileId: booking.providerProfileId,
    rating,
    comment: comment || "",
    images: images || [],
  });

  await refreshProviderAndServiceRatings(booking.providerProfileId, booking.serviceId);

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, review, "Review created successfully"));
});

const getReviews = asyncHandler(async (req, res) => {
  const { providerId, serviceId, page = 1, limit = 10 } = req.query;

  const bookingFilter = {};
  if (serviceId) {
    bookingFilter.serviceId = serviceId;
  }

  let bookingIds = null;
  if (serviceId) {
    const bookings = await Booking.find(bookingFilter).select("_id");
    bookingIds = bookings.map((booking) => booking._id);
  }

  const query = {
    ...(providerId ? { providerProfileId: providerId } : {}),
    ...(bookingIds ? { bookingId: { $in: bookingIds } } : {}),
  };

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const reviews = await Review.find(query)
    .populate("customerProfileId", "fullName profileImage")
    .populate({ path: "bookingId", select: "serviceId", populate: { path: "serviceId", select: "title" } })
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .skip((parsedPage - 1) * parsedLimit);

  const total = await Review.countDocuments(query);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        reviews,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(total / parsedLimit),
          totalReviews: total,
        },
      },
      "Reviews retrieved successfully"
    )
  );
});

const getProviderReviews = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can view provider reviews");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!providerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  }

  req.query.providerId = providerProfile._id.toString();
  return getReviews(req, res);
});

const getServiceReviews = asyncHandler(async (req, res) => {
  req.query.serviceId = req.params.serviceId;
  return getReviews(req, res);
});

const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment, images } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  const customerProfile = await CustomerProfile.findOne({ userId });
  if (!customerProfile || review.customerProfileId.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (images) review.images = images;

  await review.save();

  const booking = await Booking.findById(review.bookingId);
  await refreshProviderAndServiceRatings(review.providerProfileId, booking?.serviceId);

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, review, "Review updated successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  const customerProfile = await CustomerProfile.findOne({ userId });
  if (!customerProfile || review.customerProfileId.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  const booking = await Booking.findById(review.bookingId);
  await Review.findByIdAndDelete(reviewId);
  await refreshProviderAndServiceRatings(review.providerProfileId, booking?.serviceId);

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, null, "Review deleted successfully"));
});

export {
  createReview,
  getReviews,
  getProviderReviews,
  getServiceReviews,
  updateReview,
  deleteReview,
};
