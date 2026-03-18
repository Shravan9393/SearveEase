import mongoose from "mongoose";
import Service from "../MODELS/services.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import Category from "../MODELS/categories.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import { uploadOnCloudinary } from "../UTILS/cloudinary.js";

const createService = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can create services");
  }

  const { title, description, pricing, categoryId, locationPolicy } = req.body;
  if ([title, description, locationPolicy].some((field) => !field?.trim()) || pricing === undefined || !categoryId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!providerProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider profile not found");
  }

  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category");
  }

  let imageUrl;
  if (req.file) {
    const result = await uploadOnCloudinary(req.file.path);
    imageUrl = result?.secure_url || result?.url;
  }

  const service = await Service.create({
    providerId: providerProfile._id,
    providerName: providerProfile.displayName,
    providerImage: providerProfile.profileImage,
    categoryId,
    categoryName: category.name,
    title,
    description,
    pricing: Number(pricing),
    locationPolicy,
    images: imageUrl,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, { service }, "Service created successfully"));
});

const getMyServices = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can access their services");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  if (!providerProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider profile not found");
  }

  const services = await Service.find({ providerId: providerProfile._id, isActive: true }).sort({ createdAt: -1 });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { services }, "Provider services fetched successfully"));
});

const getAllServices = asyncHandler(async (req, res) => {
  const { category, provider, page = 1, limit = 20, search, minPrice, maxPrice } = req.query;
  const query = { isActive: true };

  if (provider && mongoose.Types.ObjectId.isValid(provider)) {
    query.providerId = provider;
  }

  if (category) {
    query.$or = [
      { categoryName: { $regex: category, $options: "i" } },
      ...(mongoose.Types.ObjectId.isValid(category) ? [{ categoryId: category }] : []),
    ];
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { providerName: { $regex: search, $options: "i" } },
      { categoryName: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    query.pricing = {};
    if (minPrice) query.pricing.$gte = Number(minPrice);
    if (maxPrice) query.pricing.$lte = Number(maxPrice);
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const services = await Service.find(query)
    .populate("categoryId", "name")
    .populate({ path: "providerId", populate: { path: "userId", select: "fullName email" } })
    .sort({ createdAt: -1 })
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit);

  const total = await Service.countDocuments(query);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      { services, page: parsedPage, limit: parsedLimit, total },
      "Services fetched successfully"
    )
  );
});

const getServicesById = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Valid service id is required");
  }

  const serviceData = await Service.findOne({ _id: serviceId, isActive: true })
    .populate("categoryId", "name description")
    .populate({ path: "providerId", populate: { path: "userId", select: "fullName email profileImage" } });

  if (!serviceData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { service: serviceData }, "Service fetched successfully"));
});

const updateService = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can update services");
  }

  const { serviceId } = req.params;
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Valid service id is required");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  const service = await Service.findById(serviceId);

  if (!providerProfile || !service || service.providerId.toString() !== providerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only update your own services");
  }

  const updates = { ...req.body };
  if (updates.pricing !== undefined) updates.pricing = Number(updates.pricing);

  if (updates.categoryId) {
    const category = await Category.findById(updates.categoryId);
    if (!category || !category.isActive) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category");
    }
    updates.categoryName = category.name;
  }

  if (req.file) {
    const result = await uploadOnCloudinary(req.file.path);
    updates.images = result?.secure_url || result?.url;
  }

  const updatedService = await Service.findByIdAndUpdate(serviceId, { $set: updates }, { new: true });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { service: updatedService }, "Service updated successfully"));
});

const deleteService = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "provider") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can delete services");
  }

  const { serviceId } = req.params;
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Valid service id is required");
  }

  const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
  const service = await Service.findById(serviceId);

  if (!providerProfile || !service || service.providerId.toString() !== providerProfile._id.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own services");
  }

  await Service.findByIdAndUpdate(serviceId, { isActive: false });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Service deleted successfully"));
});

export { createService, getMyServices, getAllServices, getServicesById, updateService, deleteService };