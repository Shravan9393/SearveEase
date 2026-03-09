import Complaint from '../MODELS/complaints.models.js';
import Booking from '../MODELS/booking.models.js';
import {CustomerProfile} from '../MODELS/customer_profiles.models.js';
import {ProviderProfile} from '../MODELS/provider_profiles.models.js';
import Notification from '../MODELS/notifications.models.js';
import { User } from '../MODELS/users.models.js';
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const createComplaint = asyncHandler(async (req, res) => {
    const { bookingId, type, message, attachment } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    // Verify user is part of the booking
    const user = await User.findById(userId);
    let isAuthorized = false;
    if (user.role === 'customer') {
        const customerProfile = await CustomerProfile.findOne({ userId });
        isAuthorized = booking.customerProfileId.toString() === customerProfile._id.toString();
    } else if (user.role === 'provider') {
        const providerProfile = await ProviderProfile.findOne({ userId });
        isAuthorized = booking.providerProfileId.toString() === providerProfile._id.toString();
    }

    if (!isAuthorized) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
    }

    const complaint = await Complaint.create({
        bookingId,
        type,
        message,
        attachment: attachment || []
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
        await Notification.create({
            userId: admin._id,
            type: 'new_complaint',
            message: `New complaint filed: ${type}`,
            data: { complaintId: complaint._id, bookingId }
        });
    }

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, complaint, "Complaint filed successfully")
    );
});

const getComplaints = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    let query = {};

    if (user.role === 'admin') {
        // Admins see all
    } else {
        // Users see only their complaints
        const userBookings = await Booking.find({
            $or: [
                { customerProfileId: user.role === 'customer' ? (await CustomerProfile.findOne({ userId }))._id : null },
                { providerProfileId: user.role === 'provider' ? (await ProviderProfile.findOne({ userId }))._id : null }
            ]
        }).select('_id');
        query.bookingId = { $in: userBookings.map(b => b._id) };
    }

    if (status) {
        query.status = status;
    }

    const complaints = await Complaint.find(query)
        .populate('bookingId', 'date totalAmount')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, {
            complaints,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalComplaints: total
            }
        }, "Complaints retrieved successfully")
    );
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { complaintId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (user.role !== 'admin') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can update complaint status");
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Complaint not found");
    }

    complaint.status = status;
    await complaint.save();

    // Notify the complainant
    const booking = await Booking.findById(complaint.bookingId);
    let complainantId;
    if (booking.customerProfileId) {
        const customerProfile = await CustomerProfile.findById(booking.customerProfileId);
        complainantId = customerProfile.userId;
    } else {
        const providerProfile = await ProviderProfile.findById(booking.providerProfileId);
        complainantId = providerProfile.userId;
    }

    await Notification.create({
        userId: complainantId,
        type: 'complaint_update',
        message: `Your complaint status has been updated to: ${status}`,
        data: { complaintId }
    });

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, complaint, "Complaint status updated successfully")
    );
});

export { createComplaint, getComplaints, updateComplaintStatus };
