import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerProfile", required: true },
    providerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    scheduled: {
      date: { type: Date, required: true },
      time: { type: String, required: true },
    },
    address: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      street: { type: String, default: "" },
    },
    priceSnapshot: {
      totalAmount: { type: Number, required: true, min: 0 },
    },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
