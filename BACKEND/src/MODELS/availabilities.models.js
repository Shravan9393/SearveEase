import mongoose from "mongoose";
import Booking from "./booking.models.js";

const arrayLimit = (val) => {
  return val.length <= 50;
};


const availabilitySchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
            trim: true
        }, 
        timeSlots: {
            type: [String],
            required: true,
            validate: [arrayLimit, '{PATH} exceeds the limit of 50']
        },

        isBooked: {
            type: Boolean,
            default: false
        },

        BookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null
        },

        providerProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProviderProfile",
            required: true
        }
    },{ timestamps: true}
)

availabilitySchema.index({ providerProfileId: 1 });

const Availability = mongoose.model("Availability", availabilitySchema)

export default Availability;
