import Review from "../MODELS/review.models.js";
import Booking from "../MODELS/booking.models.js";
import {CustomerProfile} from "../MODELS/customer_profiles.models.js";
import {ProviderProfile} from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";


const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, images } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  if (booking.status !== "completed") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Can only review completed bookings"
    );
  }

  // Verify customer owns the booking
  const customerProfile = await CustomerProfile.findOne({ userId });
  if (booking.customerProfileId.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Review already exists for this booking"
    );
  }

  const review = await Review.create({
    bookingId,
    customerProfileId: customerProfile._id,
    providerProfileId: booking.providerProfileId,
    rating,
    comment: comment || "",
    images: images || [],
  });

  // Update provider rating summary
  const providerProfile = await ProviderProfile.findById(
    booking.providerProfileId
  );
  const allReviews = await Review.find({
    providerProfileId: booking.providerProfileId,
  });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  providerProfile.ratingSummary = { avg: avgRating, count: allReviews.length };
  await providerProfile.save();

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        review,
        "Review created successfully"
      )
    );
});


const getReviews = asyncHandler(async (req, res) => {
  const { providerId, page = 1, limit = 10 } = req.query;

  const query = providerId ? { providerProfileId: providerId } : {};

  const reviews = await Review.find(query)
    .populate("customerProfileId", "fullName")
    .populate("bookingId", "date serviceId")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(query);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
      },
      "Reviews retrieved successfully"
    )
  );
});



const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment, images } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  // Verify customer owns the review
  const customerProfile = await CustomerProfile.findOne({ userId });
  if (review.customerProfileId.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (images) review.images = images;

  await review.save();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, review, "Review updated successfully")
    );
});


const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Review not found");
  }

  // Verify customer owns the review
  const customerProfile = await CustomerProfile.findOne({ userId });
  if (review.customerProfileId.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  await review.remove();

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Review deleted successfully"));
});



export { createReview, getReviews, updateReview, deleteReview };

