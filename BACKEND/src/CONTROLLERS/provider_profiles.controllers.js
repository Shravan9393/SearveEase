import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import Booking from "../MODELS/booking.models.js";
import Service from "../MODELS/services.models.js";
import Review from "../MODELS/review.models.js";
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

const getProviderDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profile = await ProviderProfile.findOne({ userId }).populate(
    "userId",
    "fullName email profileImage"
  );

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  }

  const [services, bookings, reviews] = await Promise.all([
    Service.find({ providerId: profile._id, isActive: true }).sort({
      createdAt: -1,
    }),
    Booking.find({ providerProfileId: profile._id })
      .populate("customerProfileId", "fullName")
      .populate("serviceId", "title pricing")
      .sort({ createdAt: -1 }),
    Review.find({ providerProfileId: profile._id }),
  ]);

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );
  const activeBookings = bookings.filter((booking) =>
    ["confirmed", "in-progress"].includes(booking.status)
  );
  const respondedBookings = bookings.filter(
    (booking) => booking.status !== "pending"
  );

  const totalRevenue = completedBookings.reduce(
    (sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0),
    0
  );

  const serviceReviews = reviews.length;
  const averageRating =
    serviceReviews > 0
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            serviceReviews
          ).toFixed(1)
        )
      : Number((profile.ratingSummary?.avg || 0).toFixed(1));

  const profileViews = services.reduce(
    (sum, service) => sum + (service.reviews || 0),
    0
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

  const currentMonthBookings = bookings.filter((booking) => {
    const date = new Date(booking.createdAt);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const previousMonthBookings = bookings.filter((booking) => {
    const date = new Date(booking.createdAt);
    return (
      date.getMonth() === previousMonthDate.getMonth() &&
      date.getFullYear() === previousMonthDate.getFullYear()
    );
  });

  const currentRevenue = currentMonthBookings
    .filter((booking) => booking.status === "completed")
    .reduce(
      (sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0),
      0
    );
  const previousRevenue = previousMonthBookings
    .filter((booking) => booking.status === "completed")
    .reduce(
      (sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0),
      0
    );

  const revenueGrowth =
    previousRevenue > 0
      ? Number(
          (
            ((currentRevenue - previousRevenue) / previousRevenue) *
            100
          ).toFixed(1)
        )
      : currentRevenue > 0
        ? 100
        : 0;

  const servicesGrowth =
    previousMonthBookings.filter((booking) => booking.status === "completed")
      .length > 0
      ? Number(
          (
            ((currentMonthBookings.filter(
              (booking) => booking.status === "completed"
            ).length -
              previousMonthBookings.filter(
                (booking) => booking.status === "completed"
              ).length) /
              previousMonthBookings.filter(
                (booking) => booking.status === "completed"
              ).length) *
            100
          ).toFixed(1)
        )
      : currentMonthBookings.filter((booking) => booking.status === "completed")
            .length > 0
        ? 100
        : 0;

  const viewsGrowth =
    previousMonthBookings.length > 0
      ? Number(
          (
            ((currentMonthBookings.length - previousMonthBookings.length) /
              previousMonthBookings.length) *
            100
          ).toFixed(1)
        )
      : currentMonthBookings.length > 0
        ? 100
        : 0;

  const stats = {
    totalRevenue,
    revenueGrowth,
    profileViews,
    viewsGrowth,
    completedServices: completedBookings.length,
    servicesGrowth,
    activeBookings: activeBookings.length,
    pendingBookings: pendingBookings.length,
    rating: averageRating,
    responseRate: bookings.length
      ? Math.round((respondedBookings.length / bookings.length) * 100)
      : 0,
    completionRate: bookings.length
      ? Math.round((completedBookings.length / bookings.length) * 100)
      : 0,
  };

  const revenueData = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(currentYear, currentMonth - (5 - index), 1);
    const monthLabel = date.toLocaleString("en-US", { month: "short" });

    const monthBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt);
      return (
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });

    return {
      month: monthLabel,
      revenue: monthBookings
        .filter((booking) => booking.status === "completed")
        .reduce(
          (sum, booking) => sum + (booking.priceSnapshot?.totalAmount || 0),
          0
        ),
      bookings: monthBookings.length,
    };
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const activityData = weekDays.map((day) => ({
    day,
    queries: 0,
    bookings: 0,
  }));

  bookings.forEach((booking) => {
    const bookingDate = new Date(booking.createdAt);
    const dayIndex = bookingDate.getDay();
    if (booking.status === "pending") {
      activityData[dayIndex].queries += 1;
    } else {
      activityData[dayIndex].bookings += 1;
    }
  });

  const bookingsByService = bookings.reduce((acc, booking) => {
    const key = booking.serviceId?._id?.toString();
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = { totalBookings: 0, totalRevenue: 0, completedRevenue: 0 };
    }
    acc[key].totalBookings += 1;
    acc[key].totalRevenue += booking.priceSnapshot?.totalAmount || 0;
    if (booking.status === "completed") {
      acc[key].completedRevenue += booking.priceSnapshot?.totalAmount || 0;
    }
    return acc;
  }, {});

  const servicesData = services.map((service) => {
    const summary = bookingsByService[service._id.toString()] || {
      totalBookings: 0,
      totalRevenue: 0,
      completedRevenue: 0,
    };
    return {
      id: service._id,
      service: service.title,
      price: `${profile.pricing?.currency || "₹"}${service.pricing}`,
      bookings: summary.totalBookings,
      revenue: `${profile.pricing?.currency || "₹"}${summary.completedRevenue.toLocaleString()}`,
      status: service.availability === "unavailable" ? "inactive" : "active",
      views: service.reviews || 0,
      rating: service.rating || 0,
      categoryName: service.categoryName,
      pricing: service.pricing,
    };
  });

  const priceComparison = await Promise.all(
    Array.from(new Set(services.map((service) => service.categoryName))).map(
      async (categoryName) => {
        const marketServices = await Service.find({
          categoryName,
          isActive: true,
        });
        if (!marketServices.length) return null;

        const marketPrices = marketServices.map((service) => service.pricing);
        const yourServices = services.filter(
          (service) => service.categoryName === categoryName
        );
        const yourAvgPrice = Math.round(
          yourServices.reduce((sum, service) => sum + service.pricing, 0) /
            yourServices.length
        );
        const avgMarketPrice = Math.round(
          marketPrices.reduce((sum, price) => sum + price, 0) /
            marketPrices.length
        );

        let marketPosition = "Competitive";
        if (yourAvgPrice < avgMarketPrice * 0.9) {
          marketPosition = "Budget";
        } else if (yourAvgPrice > avgMarketPrice * 1.1) {
          marketPosition = "Premium";
        }

        return {
          category: categoryName,
          yourPrice: `${profile.pricing?.currency || "₹"}${yourAvgPrice}`,
          avgMarketPrice: `${profile.pricing?.currency || "₹"}${avgMarketPrice}`,
          lowestPrice: `${profile.pricing?.currency || "₹"}${Math.min(...marketPrices)}`,
          highestPrice: `${profile.pricing?.currency || "₹"}${Math.max(...marketPrices)}`,
          marketPosition,
        };
      }
    )
  );

  const responseData = {
    provider: {
      displayName: profile.displayName,
      businessName: profile.businessName,
      profileImage: profile.profileImage,
      verified: profile.verified,
      category: services[0]?.categoryName || "",
      userName: profile.userId?.fullName,
      currency: profile.pricing?.currency || "₹",
    },
    stats,
    revenueData,
    activityData,
    services: servicesData,
    priceComparison: priceComparison.filter(Boolean),
  };

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        responseData,
        "Dashboard retrieved successfully"
      )
    );
});

export {
  getProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  getProviderDashboard,
};