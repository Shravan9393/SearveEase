import mongoose from "mongoose";

const providerProfileSchema = new mongoose.Schema(
  {
    // 1️⃣ Core relation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // 2️⃣ Business identity (AuthFlow)
    businessName: {
      type: String,
      trim: true,
      default: "",
    },

    displayName: {
      type: String,
      required: true,
    },

    distance: {
      type: String,
      default: "Nearby",
    },

    badges: {
      type: [String],
      default: [],
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },

    // 3️⃣ Service relationships
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // 4️⃣ Provider description & expertise
    description: {
      type: String,
      default: "",
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    certifications: {
      type: [String],
      default: [],
    },

    // 5️⃣ Location & service area
    location: {
      city: { type: String },
      state: { type: String },
    },

    serviceArea: {
      type: String, // e.g. "10km radius"
    },

    // 6️⃣ Pricing (used in UI)
    pricing: {
      starting: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "₹",
      },
    },

    // 7️⃣ Availability & trust
    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    responseTime: {
      type: String,
      default: "30 mins",
    },

    ratingSummary: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: "providerprofiles" }
);

export const ProviderProfile = mongoose.model(
  "ProviderProfile",
  providerProfileSchema
);
