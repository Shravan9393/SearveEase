import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile", // 🔥 FIXED
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },

    providerImage: {
      type: String,
      default: "",
    },

    categoryName: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    pricing: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      default: null,
    },

    images: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    duration: {
      type: String, // "2-3 hours"
      default: "1-2 hours",
    },

    features: {
      type: [String],
      default: [],
    },

    distance: {
      type: String,
      default: "Nearby",
    },

    availability: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
    },

    responseTime: {
      type: String,
      default: "30 mins",
    },

    isOnline: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 4.5,
    },

    reviews: {
      type: Number,
      default: 0,
    },

    locationPolicy: {
      type: String,
      required: true,
      minlength: 10,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ providerId: 1 });
serviceSchema.index({ categoryId: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;
