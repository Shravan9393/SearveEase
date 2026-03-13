import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "", // lucide icon key if needed later
    },

    popular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema, "categories");

export default Category;
