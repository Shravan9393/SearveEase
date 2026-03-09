import Category from "../MODELS/categories.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  if (!name?.trim()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category name is required");
  }

  const slug = slugify(name);
  const exists = await Category.findOne({ $or: [{ name }, { slug }] });
  if (exists) {
    throw new ApiError(StatusCodes.CONFLICT, "Category already exists");
  }

  const category = await Category.create({ name, slug, description, icon });
  return new ApiResponse(res).success(category, "Category created successfully");
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return new ApiResponse(res).success(categories, "Categories retrieved successfully");
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category || !category.isActive) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }
  return new ApiResponse(res).success(category, "Category retrieved successfully");
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, icon } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  await category.save();

  return new ApiResponse(res).success(category, "Category updated successfully");
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  category.isActive = false;
  await category.save();

  return new ApiResponse(res).success(null, "Category deleted successfully");
});

export { createCategory, getCategories, updateCategory, deleteCategory, getCategoryById };
