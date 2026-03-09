import Booking from "../MODELS/booking.models.js";
import Availability from "../MODELS/availabilities.models.js";
import Conversation from "../MODELS/conversations.models.js";
import Payment from "../MODELS/payments.models.js";
import Notification from "../MODELS/notifications.models.js";
import { User } from "../MODELS/users.models.js";
import {CustomerProfile} from "../MODELS/customer_profiles.models.js";
import {ProviderProfile }from "../MODELS/provider_profiles.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";



// Create a booking

const CreateBooking = asyncHandler( async(req, res) => {

    try {

        const { providerProfileId, serviceId, date, time, totalAmount, notes } = req.body;
        const customerId = req.user?._id;

        if(!providerProfileId || !serviceId || !date || !time || !totalAmount){
            throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
        }

        // check if the customer profile exist or not

        const customerProfile = await CustomerProfile.findOne({userId : customerId});

        if(!customerProfile){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Customer profiles not found");
        }

        // check if the provider profile exist or not

        const providerProfile = await ProviderProfile.findOne({userId : providerProfileId});

        if(!providerProfile){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Provider Profile not found");
        }

        // check the availability

        const availability = await Availability.findOne({
            providerProfileId,
            date : new Date(date),
            timeSlots : time,
            isBooked : false
        });

        if(!availability){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Time slots not available");
        }

        // create booking

        
        const booking = await Booking.create({
          customerProfileId: customerProfile?._id,
          providerProfileId: providerProfile?._id,
          availabilityId: availability?._id,
          serviceId,
          scheduled: { date, time },
          address: customerProfile.address,
          priceSnapshot: { totalAmount },
          notes,
        });

        // update availability as booked

        availability.isBooked = true;
        availability.BookingId = booking?._id;
        await availability.save();


        // create conversation for booking

        const conversation = await Conversation.create({
            bookingId : booking?._id,
            providerProfileId : providerProfile?._id,
            customerProfileId : customerProfile?._id
        });

        // create payment record

        const payment = await Payment.create({
            bookingId : booking?._id,
            amount : totalAmount,
            status : "Pending"
        });

        // send notification to provider

        const notification = await Notification.create({
            userId : providerProfile?.userId,
            type : "booking request",
            message : `You have a new booking request from ${customerProfile?.fullName} on ${date} at ${time}.`,
            data : { bookingId : booking?._id}
        });

        return res.status(StatusCodes.CREATED).json(ApiResponse.success("Booking created successfully", {
            booking,
            conversation,
            payment,
            notification
        }, "CREATE_BOOKING successfully")
    );

        
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create booking");
    }
    
});



// get a booking

const getBooking = asyncHandler( async(req, res) => {
    try {

        const userId = req.User?._id;

        const { status, page = 1, limit = 10 } = req.query;

        const user = await User.findById(userId);

        let query = {};

        if(user.role == 'customer'){
            const customerProfile = await CustomerProfile.findOne({ userId });
            
            if(!customerProfile){
                throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
            }

            query.customerProfileId = customerProfile?._id;

        }else if(user.role == 'provider'){
            const providerProfile = await ProviderProfile.findOne({ userId });

            if(!providerProfile){
                throw new ApiError(StatusCodes.NOT_FOUND, "Provider profile not found");
            }

            query.providerProfileId = providerProfile?._id;
        }

        if(status){
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('customerProfileId', "fullName email phoneNumber")
            .populate('providerProfileId', "companyName email phoneNumber")
            .populate('availabilityId')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalBookings = await Booking.countDocuments(query);

        return res
            .status(StatusCodes.OK)
            .json(
                ApiResponse.success(
                    "Bookings retrieved successfully",
                    {
                        bookings,
                        totalPages: Math.ceil(totalBookings / limit),
                        currentPage: parseInt(page),
                    },
                    "GET_BOOKINGS_SUCCESS"
                )
            );


    } catch (error) {

        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to get bookings");
        
    }

});


// update booking status

const updateBookingStatus = asyncHandler( async(req, res) => {

    try {
        
        const { bookingId } = req.params;
        const { status } = req.body;
        const userId = req.user?._id;

        if(!bookingId || !status){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Booking ID and status are required");
        }

        const booking = await Booking.findById(bookingId);

        if(!booking){
            throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
        }

        const user = await User.findById(userId);

        if(user.role === 'provider'){
            const providerProfile = await ProviderProfile.findOne({ userId });

            if(!providerProfile || providerProfile?._id.toString() !== booking?.providerProfileId.toString()){
                throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to update this booking");
            }
        }

        if(user.role === 'customer'){
            const customerProfile = await CustomerProfile.findOne({ userId });

            if(!customerProfile || customerProfile?._id.toString() !== booking?.customerProfileId.toString()){
                throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to update this booking");
            }
        }

        booking.status = status;
        await booking.save();


        // send the notification about booking status update

        let notificationUserId, message;

        if(user.role === 'provider'){
            const customerProfile = await CustomerProfile.findById(booking?.customerProfileId);
            notificationUserId = customerProfile?.userId;
            message = `Your booking scheduled on ${booking?.scheduled?.date} at ${booking?.scheduled?.time} has been updated to ${status} by the provider.`;
        }

        if(user.role === 'customer'){
            const providerProfile = await ProviderProfile.findById(booking?.providerProfileId);
            notificationUserId = providerProfile?.userId;
            message = `The booking scheduled on ${booking?.scheduled?.date} at ${booking?.scheduled?.time} has been updated to ${status} by the customer.`;
        }

        await Notification.create({
            userId : notificationUserId,
            type : "booking status update",
            message,
            data : { bookingId : booking?._id }
        });

        return res.status(StatusCodes.OK).json(
            ApiResponse.success("Booking status updated successfully", { booking }, "UPDATE_BOOKING_STATUS_SUCCESS")
        );


    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update booking status");
    }
});



// cancel booking

const cancelBooking = asyncHandler( async(req, res) => {

    try {
        const { bookingId } = req.params;
        const { userId } = req.user?._id;
    
        if(!bookingId){
            throw new ApiError(StatusCodes.BAD_REQUEST, "booking ID required");
        }
    
        if(!userId){
            throw new ApiError(StatusCodes.BAD_REQUEST, "user Id is required");
        }
    
        // find the booking by the booking Id
    
        const booking = await Booking.findById({bookingId});
        if(!booking){
            throw new ApiError(StatusCodes.NOT_FOUND, "booking not found");
        }
    
        const user = await User.findById(userId);
    
        if(!user){
            throw new ApiError(StatusCodes.NOT_FOUND, "user not found");
        }
    
        if(user.role === 'provider'){
            const providerProfile = await ProviderProfile.findOne({ userId });
    
            if(!providerProfile || providerProfile?._id.toString() !== booking?.providerProfileId.toString()){
                throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to cancel this booking");
            }
        }
        
        if(user.role === 'customer'){
            const customerProfile = await CustomerProfile.findOne({ userId });
            if(!customerProfile || customerProfile?._id.toString() !== booking?.customerProfileId.toString()){
                throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized to cancel this booking");
            }
        }
    
        if(booking.status === 'completed' || booking.status === 'cancelled' ){
            throw new ApiError(StatusCodes.BAD_REQUEST, `You cannot cancel a ${booking.status} booking`);
        }
    
        booking.status = 'cancelled';
        await booking.save();
    
        // free up the availability
    
        const availability = await Availability.findById(booking?.availabilityId);
        if(availability){
            availability.isBooked = false;
            availability.BookingId = null;
            await availability.save();
        }
    
        // send notification about booking cancellation
    
        let notificationUserId, message;
        if(user.role === 'provider'){
            const customerProfile = await CustomerProfile.findById(booking?.customerProfileId);
            notificationUserId = customerProfile?.userId;
            message = `Your booking scheduled on ${booking?.scheduled?.date} at ${booking?.scheduled?.time} has been cancelled by the provider.`;
        }
    
        if(user.role === 'customer'){
            const providerProfile = await ProviderProfile.findById(booking?.providerProfileId);
            notificationUserId = providerProfile?.userId;
            message = `The booking scheduled on ${booking?.scheduled?.date} at ${booking?.scheduled?.time} has been cancelled by the customer.`;
        }
        await Notification.create({
            userId : notificationUserId,
            type : "booking cancellation",
            message,
            data : { bookingId : booking?._id }
        });
    
        return res.status(StatusCodes.OK).json(
            ApiResponse.success("Booking cancelled successfully", { booking }, "CANCEL_BOOKING_SUCCESS")
        );
        
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to cancel booking");
    }


});


export {
    CreateBooking,
    getBooking,
    updateBookingStatus,
    cancelBooking   
}