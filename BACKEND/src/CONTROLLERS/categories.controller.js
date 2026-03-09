import Category from "../MODELS/categories.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "admin") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only admins can create categories"
    );
  }

  const category = await Category.create({
    name,
    description,
    icon,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        category,
        "Category created successfully"
      )
    );
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  const apiResponse = new ApiResponse(res);
  return apiResponse.success(
    categories,
    "Categories retrieved successfully"
  );
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, icon } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "admin") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only admins can update categories"
    );
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  if (name) category.name = name;
  if (description) category.description = description;
  if (icon) category.icon = icon;

  await category.save();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, category, "Category updated successfully")
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "admin") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only admins can delete categories"
    );
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  category.isActive = false;
  await category.save();

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, null, "Category deleted successfully")
    );
});

export { createCategory, getCategories, updateCategory, deleteCategory };
