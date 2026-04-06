import mongoose from "mongoose";

const queryMessageSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ["customer", "provider"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const querySchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    providerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    customerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerProfile",
      required: true,
    },
    messages: {
      type: [queryMessageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "answered", "closed"],
      default: "open",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

querySchema.index({ providerProfileId: 1, lastMessageAt: -1 });
querySchema.index({ customerProfileId: 1, lastMessageAt: -1 });
querySchema.index({ serviceId: 1 });

const Query = mongoose.model("Query", querySchema);

export default Query;
