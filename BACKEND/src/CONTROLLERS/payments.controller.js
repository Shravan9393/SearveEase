import Payment from "../MODELS/payments.models.js";
import Booking from "../MODELS/booking.models.js";
import {CustomerProfile} from "../MODELS/customer_profiles.models.js";
import {ProviderProfile} from "../MODELS/provider_profiles.models.js";
import Notification from "../MODELS/notifications.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";


// controller to process a payment for a booking

const processPayment = asyncHandler(async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentIntentId } = req.body;
    const userId = req.user._id;
  
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }
  
    // Verify customer owns the booking
    const customerProfile = await CustomerProfile.findOne({ userId });
    if (booking.customerProfileId.toString() !== customerProfile._id.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
    }
  
    if (booking.status !== "confirmed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Booking must be confirmed before payment"
      );
    }
  
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment) {
      throw new ApiError(StatusCodes.CONFLICT, "Payment already processed");
    }
  
    // Here you would integrate with payment gateway (Stripe/PayPal)
    // For now, we'll simulate payment processing
    let paymentStatus = "pending";
    if (paymentIntentId) {
      // In real implementation, verify with gateway
      paymentStatus = "completed";
    }
  
    const payment = await Payment.create({
      bookingId,
      amount: booking.totalAmount,
      currency: "USD",
      status: paymentStatus,
      paymentMethod: paymentMethod || "card",
      transactionId: paymentIntentId || `txn_${Date.now()}`,
    });
  
    if (paymentStatus === "completed") {
      booking.status = "paid";
      await booking.save();
  
      // Notify provider
      const providerProfile = await ProviderProfile.findById(
        booking.providerProfileId
      );
      await Notification.create({
        userId: providerProfile.userId,
        type: "payment_received",
        message: `Payment received for booking: $${booking.totalAmount}`,
        data: { bookingId, paymentId: payment._id },
      });
    }
  
    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          payment,
          "Payment processed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "An error occurred while processing the payment"
    );
  }
});

// controller to get payments for the logged-in user

const getPayments = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;
  
    const user = await User.findById(userId);
    let query = {};
  
    if (user.role === "customer") {
      const customerProfile = await CustomerProfile.findOne({ userId });
      const customerBookings = await Booking.find({
        customerProfileId: customerProfile._id,
      }).select("_id");
      query.bookingId = { $in: customerBookings.map((b) => b._id) };
    } else if (user.role === "provider") {
      const providerProfile = await ProviderProfile.findOne({ userId });
      const providerBookings = await Booking.find({
        providerProfileId: providerProfile._id,
      }).select("_id");
      query.bookingId = { $in: providerBookings.map((b) => b._id) };
    }
  
    if (status) {
      query.status = status;
    }
  
    const payments = await Payment.find(query)
      .populate({
        path: "bookingId",
        populate: [
          { path: "customerProfileId", select: "fullName" },
          { path: "providerProfileId", select: "businessName" },
          { path: "serviceId", select: "title" },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  
    const total = await Payment.countDocuments(query);
  
    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        {
          payments,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
          },
        },
        "Payments retrieved successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "An error occurred while retrieving payments"
    );
  }
});


//  controller to refund a payment

const refundPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
  
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
    }
  
    if (payment.status !== "completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Only completed payments can be refunded"
      );
    }
  
    // Check authorization (customer or admin)
    const user = await User.findById(userId);
    const booking = await Booking.findById(payment.bookingId);
    const customerProfile = await CustomerProfile.findById(
      booking.customerProfileId
    );
  
    if (
      user.role !== "admin" &&
      customerProfile.userId.toString() !== userId.toString()
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Not authorized to refund this payment"
      );
    }
  
    // Here you would integrate with payment gateway for refund
    // For now, simulate refund
    payment.status = "refunded";
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();
  
    // Update booking status
    booking.status = "cancelled";
    await booking.save();
  
    // Notify both parties
    const providerProfile = await ProviderProfile.findById(
      booking.providerProfileId
    );
    await Notification.create({
      userId: customerProfile.userId,
      type: "refund_processed",
      message: `Refund processed: $${payment.amount}`,
      data: { paymentId, bookingId: booking._id },
    });
    await Notification.create({
      userId: providerProfile.userId,
      type: "payment_refunded",
      message: `Payment refunded: $${payment.amount}`,
      data: { paymentId, bookingId: booking._id },
    });
  
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, payment, "Payment refunded successfully")
      );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "An error occurred while processing the refund"
    );
  }
});


// controller to update payment status 

const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
  
    // This would typically be called by webhook from payment gateway
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
    }
  
    payment.status = status;
    if (status === "completed") {
      const booking = await Booking.findById(payment.bookingId);
      booking.status = "paid";
      await booking.save();
    }
    await payment.save();
  
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          payment,
          "Payment status updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "An error occurred while updating the payment status"
    );
  }
});


export { processPayment, getPayments, refundPayment, updatePaymentStatus };
