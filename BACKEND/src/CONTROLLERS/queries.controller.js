import Query from "../MODELS/queries.models.js";
import Service from "../MODELS/services.models.js";
import Booking from "../MODELS/booking.models.js";
import Notification from "../MODELS/notifications.models.js";
import { User } from "../MODELS/users.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const createQuery = asyncHandler(async (req, res) => {
  const { serviceId, providerId, customerId, message } = req.body;

  if (!serviceId || !providerId || !customerId || !message?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "serviceId, providerId, customerId and message are required");
  }

  const user = await User.findById(req.user._id);
  if (!user || user.role !== "customer") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only customers can create queries");
  }

  const customerProfile = await CustomerProfile.findOne({ userId: req.user._id });
  if (!customerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
  }

  if (String(customerId) !== req.user._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "customerId does not match authenticated customer");
  }

  const [providerProfile, service, customerUser] = await Promise.all([
    ProviderProfile.findById(providerId),
    Service.findById(serviceId),
    User.findById(req.user._id),
  ]);

  if (!providerProfile) throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  if (!service) throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");

  if (service.providerId.toString() !== providerProfile._id.toString()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service does not belong to provider");
  }

  const query = await Query.create({
    serviceId,
    providerProfileId: providerProfile._id,
    customerProfileId: customerProfile._id,
    messages: [
      {
        senderType: "customer",
        senderId: req.user._id,
        message: message.trim(),
      },
    ],
    status: "open",
    lastMessageAt: new Date(),
  });

  await Notification.create({
    userId: providerProfile.userId,
    type: "message",
    title: "New customer query",
    body: `${customerProfile.fullName || customerUser?.fullName || "A customer"} asked about ${service.title}`,
    metadata: {
      queryId: query._id,
      service: { id: service._id, title: service.title, pricing: service.pricing },
      customer: {
        name: customerProfile.fullName || customerUser?.fullName || "Customer",
        avatar: customerProfile.profileImage || customerUser?.profileImage || "",
      },
      providerProfileId: providerProfile._id,
    },
  });

  const populated = await Query.findById(query._id)
    .populate("serviceId", "title")
    .populate("providerProfileId", "displayName userId")
    .populate("customerProfileId", "fullName profileImage userId")
    .populate("messages.senderId", "fullName profileImage role");

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, populated, "Query created successfully"));
});

const getProviderQueries = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can view provider queries");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!providerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  }

  const queries = await Query.find({ providerProfileId: providerProfile._id })
    .populate("serviceId", "title")
    .populate("customerProfileId", "fullName profileImage")
    .populate("messages.senderId", "fullName profileImage role")
    .sort({ lastMessageAt: -1 });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { queries }, "Provider queries retrieved successfully"));
});

const getCustomerQueries = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.role !== "customer") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only customers can view customer queries");
  }

  const customerProfile = await CustomerProfile.findOne({ userId: req.user._id });
  if (!customerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
  }

  const queries = await Query.find({ customerProfileId: customerProfile._id })
    .populate("serviceId", "title")
    .populate("providerProfileId", "displayName profileImage")
    .populate("messages.senderId", "fullName profileImage role")
    .sort({ lastMessageAt: -1 });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { queries }, "Customer queries retrieved successfully"));
});

const replyToQuery = asyncHandler(async (req, res) => {
  const { queryId } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Reply message is required");
  }

  const user = await User.findById(req.user._id);
  if (!user || user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can reply to queries");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!providerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
  }

  const query = await Query.findById(queryId)
    .populate("serviceId", "title")
    .populate("customerProfileId", "fullName userId profileImage")
    .populate("providerProfileId", "displayName");

  if (!query) throw new ApiError(StatusCodes.NOT_FOUND, "Query not found");
  if (query.providerProfileId._id.toString() !== providerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only reply to your own queries");
  }

  query.messages.push({
    senderType: "provider",
    senderId: req.user._id,
    message: message.trim(),
  });
  query.status = "answered";
  query.lastMessageAt = new Date();
  await query.save();

  const customerProfile = await CustomerProfile.findById(query.customerProfileId._id);
  if (customerProfile?.userId) {
    await Notification.create({
      userId: customerProfile.userId,
      type: "message",
      title: "Provider replied to your query",
      body: `${query.providerProfileId.displayName || "Provider"} replied on ${query.serviceId?.title || "your service query"}`,
      metadata: {
        queryId: query._id,
        service: query.serviceId,
        provider: {
          name: query.providerProfileId.displayName || "Provider",
        },
      },
    });
  }

  const populated = await Query.findById(query._id)
    .populate("serviceId", "title")
    .populate("providerProfileId", "displayName profileImage")
    .populate("customerProfileId", "fullName profileImage")
    .populate("messages.senderId", "fullName profileImage role");

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, populated, "Reply sent successfully"));
});

const replyToCustomerQuery = asyncHandler(async (req, res) => {
  const { queryId } = req.params;
  const { message } = req.body;

  if (!message?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Reply message is required");
  }

  const user = await User.findById(req.user._id);
  if (!user || user.role !== "customer") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only customers can send follow-up messages");
  }

  const customerProfile = await CustomerProfile.findOne({ userId: req.user._id });
  if (!customerProfile) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
  }

  const query = await Query.findById(queryId)
    .populate("serviceId", "title")
    .populate("customerProfileId", "fullName userId profileImage")
    .populate("providerProfileId", "displayName userId");

  if (!query) throw new ApiError(StatusCodes.NOT_FOUND, "Query not found");

  if (query.customerProfileId._id.toString() !== customerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only send messages in your own queries");
  }

  query.messages.push({
    senderType: "customer",
    senderId: req.user._id,
    message: message.trim(),
  });
  query.status = "open";
  query.lastMessageAt = new Date();
  await query.save();

  if (query.providerProfileId?.userId) {
    await Notification.create({
      userId: query.providerProfileId.userId,
      type: "message",
      title: "Customer sent a follow-up message",
      body: `${query.customerProfileId.fullName || "Customer"} sent a new message about ${query.serviceId?.title || "a service query"}`,
      metadata: {
        queryId: query._id,
        service: query.serviceId,
        customer: {
          name: query.customerProfileId.fullName || "Customer",
          avatar: query.customerProfileId.profileImage || "",
        },
      },
    });
  }

  const populated = await Query.findById(query._id)
    .populate("serviceId", "title")
    .populate("providerProfileId", "displayName profileImage")
    .populate("customerProfileId", "fullName profileImage")
    .populate("messages.senderId", "fullName profileImage role");

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, populated, "Message sent successfully"));
});

export { createQuery, getProviderQueries, getCustomerQueries, replyToQuery, replyToCustomerQuery };
