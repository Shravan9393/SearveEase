import Conversation from "../MODELS/conversations.models.js";
import Booking from "../MODELS/booking.models.js";
import {CustomerProfile} from "../MODELS/customer_profiles.models.js";
import {ProviderProfile} from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import {ApiError} from "../UTILS/apiError.js";



// Controller to create a conversation when a booking is created

const createConversationForBooking = asyncHandler(async (bookingId) => {

    // Fetch the booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    // Fetch customer and provider profiles
    const customerProfile = await CustomerProfile.findOne({ userId: booking.customerId });
    const providerProfile = await ProviderProfile.findOne({ userId: booking.providerId });

    if (!customerProfile || !providerProfile) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Customer or Provider profile not found");
    }

    // Create a new conversation
    const conversation = new Conversation({
        bookingId: booking._id,
        providerProfileId: providerProfile._id,
        customerProfileId: customerProfile._id,
    });
    await conversation.save();

    return conversation; 


});


// get conversation

const getConversation = asyncHandler(async (req, res) => {

    try {
        const { userId } = req.user?._id;
    
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
    
        let conversations;
    
        if (user.role === "customer") {
            const customerProfile = await CustomerProfile.findOne({ userId: user._id });
            if (!customerProfile) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
            }
    
            conversations = await Conversation.find({ customerProfileId: customerProfile._id })
                .populate("bookingId", "status Date Time")
                .populate("providerProfileId", "companyName  Phone")
                .sort({ lastMessageTime: -1 });
        }else if (user.role === "provider") {
            const providerProfile = await ProviderProfile.findOne({ userId: user._id });
            if (!providerProfile) {
                throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
            }
            conversations = await Conversation.find({ providerProfileId: providerProfile._id })
                .populate("bookingId", "status Date Time")
                .populate("customerProfileId", "fullName Phone")
                .sort({ lastMessageTime: -1 });
        }
    
        res.status(StatusCodes.OK).json(new ApiResponse(true, "Conversations fetched successfully", conversations));
        
    } catch (error) {
        
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch conversations");

    }

});


// get conversation by booking id

const getConversationByBookingId = asyncHandler(async (req, res) => {
    
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;

        const conversation = await Conversation.findOne({ bookingId: conversationId })
            .populate("bookingId", "status Date Time")
            .populate("providerProfileId", "companyName  Phone")
            .populate("customerProfileId", "fullName Phone");
        
        if(!conversation){
            throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
        }

        // check if the user is part of the conversation

        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }

        let isAuthorized = false;

        if(user.role === "customer"){
            const customerProfile = await CustomerProfile.findOne({ userId: user._id });
            if(conversation.customerProfileId.toString() === customerProfile._id.toString()){
                isAuthorized = true;
            }

        }else if(user.role === "provider"){
            const providerProfile = await ProviderProfile.findOne({ userId: user._id });
            if(conversation.providerProfileId.toString() === providerProfile._id.toString()){
                isAuthorized = true;
            }
        }

        if(!isAuthorized){
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to view this conversation");
        }

        res.status(StatusCodes.OK).json(new ApiResponse(true, "Conversation fetched successfully", conversation));

        
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch conversation by booking ID");
    }
});


// lock conversation


const lockConversation = asyncHandler(async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;
        
        const conversation = await Conversation.findById(conversationId);
        if(!conversation){
            throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
        }

        // only provider can lock the conversation

        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        if(user.role !== "provider"){
            throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can lock the conversation");
        }

        const providerProfile = await ProviderProfile.findOne({ userId: user._id });
        if(conversation.providerProfileId.toString() !== providerProfile._id.toString()){
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not authorized to lock this conversation");
        }


        conversation.isLocked = true;
        await conversation.save();

        res.status(StatusCodes.OK).json(new ApiResponse(true, "Conversation locked successfully", conversation));

        
    }
    catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to lock conversation");
    }
});

export {
    createConversationForBooking,
    getConversation,
    getConversationByBookingId,
    lockConversation
}

