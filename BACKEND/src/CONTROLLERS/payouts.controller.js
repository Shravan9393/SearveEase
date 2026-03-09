import Payout from "../MODELS/payouts.models.js";
import Payment from "../MODELS/payments.models.js";
import Booking from "../MODELS/booking.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

// Create a payout request (Provider only)
const createPayoutRequest = asyncHandler(async (req, res) => {
    const { amount, paymentMethod } = req.body;
    const providerId = req.user._id;

    if (!amount || !paymentMethod) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Amount and payment method are required");
    }

    if (amount <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Amount must be greater than 0");
    }

    // Check if user is a provider
    const user = await User.findById(providerId);
    if (!user || user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can request payouts");
    }

    // Check provider profile and bank details
    const providerProfile = await ProviderProfile.findOne({ userId: providerId });
    if (!providerProfile) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
    }

    if (!providerProfile.bankDetails || !providerProfile.bankDetails.accountNumber) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Bank details are required for payouts");
    }

    // Calculate available balance (completed payments - previous payouts)
    const completedPayments = await Payment.find({
        userId: providerId,
        status: "completed"
    });

    const totalEarned = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    const previousPayouts = await Payout.find({
        providerId,
        status: { $in: ["completed", "pending"] }
    });

    const totalPaidOut = previousPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    const availableBalance = totalEarned - totalPaidOut;

    if (amount > availableBalance) {
        throw new ApiError(StatusCodes.BAD_REQUEST,
            `Insufficient balance. Available: ₹${availableBalance}, Requested: ₹${amount}`);
    }

    // Create payout request
    const payout = await Payout.create({
        providerId,
        amount,
        currency: "INR",
        status: "pending",
        paymentMethod
    });

    return res.status(StatusCodes.CREATED).json(
        ApiResponse.success("Payout request created successfully", {
            payout,
            availableBalance
        }, "PAYOUT_REQUEST_CREATED")
    );
});

// Get payout requests for provider
const getPayoutRequests = asyncHandler(async (req, res) => {
    const providerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    // Check if user is a provider
    const user = await User.findById(providerId);
    if (!user || user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can view payout requests");
    }

    const query = { providerId };
    if (status) query.status = status;

    const payouts = await Payout.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPayouts = await Payout.countDocuments(query);

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Payout requests retrieved successfully", {
            payouts,
            totalPages: Math.ceil(totalPayouts / limit),
            currentPage: parseInt(page),
            totalPayouts
        }, "PAYOUT_REQUESTS_RETRIEVED")
    );
});

// Update payout status (Admin only)
const updatePayoutStatus = asyncHandler(async (req, res) => {
    const { payoutId } = req.params;
    const { status } = req.body;
    const adminId = req.user._id;

    // Check if user is admin
    const user = await User.findById(adminId);
    if (!user || user.role !== 'admin') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can update payout status");
    }

    if (!payoutId || !status) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payout ID and status are required");
    }

    if (!["pending", "completed", "failed"].includes(status)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status");
    }

    const payout = await Payout.findById(payoutId);
    if (!payout) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payout request not found");
    }

    payout.status = status;
    await payout.save();

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Payout status updated successfully", { payout }, "PAYOUT_STATUS_UPDATED")
    );
});

// Get payout statistics for provider
const getPayoutStats = asyncHandler(async (req, res) => {
    const providerId = req.user._id;

    // Check if user is a provider
    const user = await User.findById(providerId);
    if (!user || user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can view payout statistics");
    }

    // Calculate total earned
    const completedPayments = await Payment.find({
        userId: providerId,
        status: "completed"
    });
    const totalEarned = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate total paid out
    const completedPayouts = await Payout.find({
        providerId,
        status: "completed"
    });
    const totalPaidOut = completedPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    // Calculate pending payouts
    const pendingPayouts = await Payout.find({
        providerId,
        status: "pending"
    });
    const totalPending = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    // Current available balance
    const availableBalance = totalEarned - totalPaidOut - totalPending;

    // Recent payouts
    const recentPayouts = await Payout.find({ providerId })
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Payout statistics retrieved successfully", {
            totalEarned,
            totalPaidOut,
            totalPending,
            availableBalance,
            recentPayouts
        }, "PAYOUT_STATS_RETRIEVED")
    );
});

// Get all payout requests (Admin only)
const getAllPayoutRequests = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { page = 1, limit = 10, status, providerId } = req.query;

    // Check if user is admin
    const user = await User.findById(adminId);
    if (!user || user.role !== 'admin') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can view all payout requests");
    }

    const query = {};
    if (status) query.status = status;
    if (providerId) query.providerId = providerId;

    const payouts = await Payout.find(query)
        .populate('providerId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPayouts = await Payout.countDocuments(query);

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("All payout requests retrieved successfully", {
            payouts,
            totalPages: Math.ceil(totalPayouts / limit),
            currentPage: parseInt(page),
            totalPayouts
        }, "ALL_PAYOUT_REQUESTS_RETRIEVED")
    );
});

export {
    createPayoutRequest,
    getPayoutRequests,
    updatePayoutStatus,
    getPayoutStats,
    getAllPayoutRequests
};
