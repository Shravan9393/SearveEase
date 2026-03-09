import Message from "../MODELS/messages.models.js";
import Conversation from "../MODELS/conversations.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

// Send a message in a conversation
const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, content, messageType = "text" } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !content?.trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Conversation ID and content are required");
    }

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
    }

    // Check if user is authorized to send message in this conversation
    const isAuthorized = conversation.providerProfileId.toString() === senderId.toString() ||
                        conversation.customerProfileId.toString() === senderId.toString();

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to send messages in this conversation");
    }

    // Create the message
    const message = await Message.create({
        conversationId,
        senderId,
        content: content.trim(),
        messageType,
        isRead: false
    });

    // Update conversation's last message timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(StatusCodes.CREATED).json(
        ApiResponse.success("Message sent successfully", { message }, "MESSAGE_SENT")
    );
});

// Get messages for a conversation
const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    if (!conversationId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Conversation ID is required");
    }

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
    }

    // Check if user is authorized to view this conversation
    const isAuthorized = conversation.providerProfileId.toString() === userId.toString() ||
                        conversation.customerProfileId.toString() === userId.toString();

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to view this conversation");
    }

    // Get messages with pagination
    const messages = await Message.find({ conversationId })
        .populate('senderId', 'fullName avatar role')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalMessages = await Message.countDocuments({ conversationId });

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Messages retrieved successfully", {
            messages: messages.reverse(), // Reverse to show oldest first
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: parseInt(page),
            totalMessages
        }, "MESSAGES_RETRIEVED")
    );
});

// Mark messages as read
const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user._id;

    if (!conversationId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Conversation ID is required");
    }

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
    }

    // Check if user is authorized
    const isAuthorized = conversation.providerProfileId.toString() === userId.toString() ||
                        conversation.customerProfileId.toString() === userId.toString();

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to access this conversation");
    }

    // Mark messages as read (messages not sent by the current user)
    await Message.updateMany(
        {
            conversationId,
            senderId: { $ne: userId },
            isRead: false
        },
        { isRead: true }
    );

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Messages marked as read", {}, "MESSAGES_READ")
    );
});

// Delete a message (only sender can delete)
const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user._id;

    if (!messageId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Message ID is required");
    }

    const message = await Message.findById(messageId);
    if (!message) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    // Only sender can delete their message
    if (message.senderId.toString() !== userId.toString()) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own messages");
    }

    await Message.findByIdAndDelete(messageId);

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Message deleted successfully", {}, "MESSAGE_DELETED")
    );
});

// Get unread message count for user
const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
        $or: [
            { providerProfileId: userId },
            { customerProfileId: userId }
        ]
    });

    const conversationIds = conversations.map(conv => conv._id);

    // Count unread messages in these conversations (not sent by user)
    const unreadCount = await Message.countDocuments({
        conversationId: { $in: conversationIds },
        senderId: { $ne: userId },
        isRead: false
    });

    return res.status(StatusCodes.OK).json(
        ApiResponse.success("Unread count retrieved", { unreadCount }, "UNREAD_COUNT")
    );
});

export {
    sendMessage,
    getMessages,
    markMessagesAsRead,
    deleteMessage,
    getUnreadCount
};
