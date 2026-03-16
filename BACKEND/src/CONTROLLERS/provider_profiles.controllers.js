import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import Booking from "../MODELS/booking.models.js";
import Service from "../MODELS/services.models.js";
import Review from "../MODELS/review.models.js";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await ProviderProfile.findOne({ userId }).populate("userId", "fullName email avatar");
  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, profile, "Profile retrieved successfully"));
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
  if (yearsOfExperience !== undefined) profile.yearsOfExperience = yearsOfExperience;

  if (categories) profile.categories = categories;
  if (services) profile.services = services;

  if (pricing) profile.pricing = pricing;
  if (location) profile.location = location;

  await profile.save();

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, profile, "Profile updated successfully"));
});

const deleteProviderProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Profile not found");
  }

  profile.isActive = false;
  await profile.save();

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, null, "Profile deleted successfully"));
});

const getProviderDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const providerProfile = await ProviderProfile.findOne({ userId });

  if (!providerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  }

  const services = await Service.find({ providerId: providerProfile._id, isActive: true }).sort({ createdAt: -1 });

  const bookings = await Booking.find({ providerProfileId: providerProfile._id })
    .populate("serviceId", "title pricing")
    .populate({
      path: "customerProfileId",
      select: "fullName location",
    })
    .sort({ createdAt: -1 });

  const reviews = await Review.find({ providerProfileId: providerProfile._id }).sort({ createdAt: -1 });

  const completedBookings = bookings.filter((booking) => booking.status === "completed");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const activeBookings = bookings.filter((booking) => ["confirmed", "in-progress"].includes(booking.status));

  const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0), 0);

  const allCustomerIds = new Set(
    bookings
      .map((booking) => booking.customerProfileId?._id?.toString() || booking.customerProfileId?.toString())
      .filter(Boolean)
  );

  const uniqueCompletedCustomerIds = new Set(
    completedBookings
      .map((booking) => booking.customerProfileId?._id?.toString() || booking.customerProfileId?.toString())
      .filter(Boolean)
  );

  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : Number((providerProfile.ratingSummary?.avg || 0).toFixed(1));

  const responseRate = bookings.length ? Math.round(((bookings.length - pendingBookings.length) / bookings.length) * 100) : 0;
  const completionRate = bookings.length ? Math.round((completedBookings.length / bookings.length) * 100) : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const revenueData = Array.from({ length: 6 }).map((_, index) => {
    const monthOffset = 5 - index;
    const targetDate = new Date(currentYear, currentMonth - monthOffset, 1);

    const monthRevenue = completedBookings.reduce((sum, booking) => {
      const bookingDate = booking.scheduled?.date || booking.createdAt;
      if (!bookingDate) return sum;
      const date = new Date(bookingDate);
      if (date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear()) {
        return sum + (booking.priceSnapshot?.totalAmount || 0);
      }
      return sum;
    }, 0);

    const monthBookings = completedBookings.filter((booking) => {
      const bookingDate = booking.scheduled?.date || booking.createdAt;
      if (!bookingDate) return false;
      const date = new Date(bookingDate);
      return date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear();
    }).length;

    return {
      month: MONTH_LABELS[targetDate.getMonth()],
      revenue: monthRevenue,
      bookings: monthBookings,
    };
  });

  const previousMonthRevenue = revenueData[4]?.revenue || 0;
  const currentMonthRevenue = revenueData[5]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue ? Number((((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)) : currentMonthRevenue > 0 ? 100 : 0;

  const activityData = WEEKDAY_LABELS.map((day) => ({ day, queries: 0, bookings: 0 }));
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

  bookings.forEach((booking) => {
    const bookedDate = booking.createdAt ? new Date(booking.createdAt) : null;
    if (!bookedDate || bookedDate < oneWeekAgo) {
      return;
    }

    const dayIndex = bookedDate.getDay();
    activityData[dayIndex].queries += 1;
    if (["confirmed", "in-progress", "completed"].includes(booking.status)) {
      activityData[dayIndex].bookings += 1;
    }
  });

  const servicesWithMetrics = services.map((service) => {
    const serviceBookings = bookings.filter((booking) => booking.serviceId?._id?.toString() === service._id.toString() || booking.serviceId?.toString() === service._id.toString());
    const serviceCompleted = serviceBookings.filter((booking) => booking.status === "completed");

    return {
      id: service._id,
      service: service.title,
      price: `${providerProfile.pricing?.currency || "₹"}${service.pricing}`,
      bookings: serviceBookings.length,
      customers: new Set(
        serviceBookings
          .map((booking) => booking.customerProfileId?._id?.toString() || booking.customerProfileId?.toString())
          .filter(Boolean)
      ).size,
      revenue: serviceCompleted.reduce((sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0), 0),
      status: service.isActive ? "active" : "inactive",
      rating: service.rating || averageRating,
    };
  });

  const categoryNames = [...new Set(services.map((service) => service.categoryName))];
  const marketComparison = [];

  for (const categoryName of categoryNames) {
    const marketServices = await Service.find({ categoryName, isActive: true });
    const providerCategoryServices = services.filter((service) => service.categoryName === categoryName);

    const providerAverage = providerCategoryServices.length
      ? providerCategoryServices.reduce((sum, service) => sum + service.pricing, 0) / providerCategoryServices.length
      : 0;

    const marketPrices = marketServices.map((service) => service.pricing);
    const marketAverage = marketPrices.length
      ? marketPrices.reduce((sum, price) => sum + price, 0) / marketPrices.length
      : providerAverage;

    const lowestPrice = marketPrices.length ? Math.min(...marketPrices) : providerAverage;
    const highestPrice = marketPrices.length ? Math.max(...marketPrices) : providerAverage;

    let marketPosition = "Competitive";
    if (providerAverage < marketAverage * 0.9) {
      marketPosition = "Value";
    } else if (providerAverage > marketAverage * 1.1) {
      marketPosition = "Premium";
    }

    marketComparison.push({
      category: categoryName,
      yourPrice: Math.round(providerAverage),
      avgMarketPrice: Math.round(marketAverage),
      lowestPrice: Math.round(lowestPrice),
      highestPrice: Math.round(highestPrice),
      marketPosition,
    });
  }

  const dashboardPayload = {
    provider: {
      id: providerProfile._id,
      displayName: providerProfile.displayName,
      businessName: providerProfile.businessName,
      profileImage: providerProfile.profileImage,
      verified: providerProfile.verified,
      serviceCategory: services[0]?.categoryName || "",
      location: providerProfile.location,
    },
    stats: {
      totalRevenue,
      revenueGrowth,
      totalServicesCompleted: completedBookings.length,
      totalCustomerProfileViews: allCustomerIds.size,
      activeBookings: activeBookings.length,
      pendingBookings: pendingBookings.length,
      responseRate,
      completionRate,
      rating: averageRating,
      reviewCount: reviews.length || providerProfile.reviewCount || 0,
      uniqueCustomersServed: uniqueCompletedCustomerIds.size,
    },
    revenueData,
    activityData,
    services: servicesWithMetrics,
    marketComparison,
    recentQueries: pendingBookings.slice(0, 8).map((booking) => {
      const customer = booking.customerProfileId;
      const customerName = customer?.fullName || "Customer";
      const city = customer?.location?.city || booking.address?.city || "";
      const state = customer?.location?.state || booking.address?.state || "";
      const location = [city, state].filter(Boolean).join(", ");

      return {
        id: booking._id,
        customerName,
        customerAvatar: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        service: booking.serviceId?.title || "Service request",
        location: location || "Location unavailable",
        budget: `${providerProfile.pricing?.currency || "₹"}${booking.priceSnapshot?.totalAmount || 0}`,
        time: booking.createdAt,
        message: booking.notes || "New service request",
        status: "pending",
      };
    }),
  };

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, dashboardPayload, "Provider dashboard fetched successfully"));
});

export { getProviderProfile, updateProviderProfile, deleteProviderProfile, getProviderDashboard };
