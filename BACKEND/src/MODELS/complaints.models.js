import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },

        type: {
            type: String,
            enum: ["Service Issue", "Payment Issue", "Provider Behavior", "Other"],
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
            minlength: 10
        },

        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved", "Closed"],
            default: "Open"
        },

        attachment: {
            type: [String],
            default: []
        }        
    },{ timestamps: true }
)

complaintSchema.index({ bookingId: 1 });

const Complaint = mongoose.model("Complaint", complaintSchema)

export default Complaint;
