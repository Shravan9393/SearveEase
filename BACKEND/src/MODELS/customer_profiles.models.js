import mongoose from "mongoose";

const customerProfileSchema = new mongoose.Schema(
  {
    // 1️⃣ Relation to core user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },

    // 2️⃣ Optional profile image (used in AuthFlow)
    profileImage: {
      type: String,
      default: "",
    },

    // 3️⃣ Location (from AuthFlow → customer profile setup)
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
    },

    // 4️⃣ Preferred services (frontend uses strings → backend uses Category refs)
    preferredCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // 5️⃣ Phone kept here only if you want fast access (optional)
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
  },
  { timestamps: true, collection: "customerprofiles" }
);

export const CustomerProfile = mongoose.model(
  "CustomerProfile",
  customerProfileSchema,
  "customerprofiles"
);
