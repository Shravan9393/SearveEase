import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type:{
            type: String,
            enum: ["message", "payment", "booking_request", "other"],
            required: true
        },

        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },

        title: {
            type: String,
            required: true
        },
        
        body:{
            type: String,
            required: true
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
