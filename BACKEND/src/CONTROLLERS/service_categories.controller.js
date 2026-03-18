import Service from "../MODELS/services.models.js";
import Category from "../MODELS/categories.models.js";
import {ProviderProfile} from "../MODELS/provider_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const addServiceToCategory = asyncHandler(async (req, res) => {
  const { serviceId, categoryId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "provider") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only providers can manage service categories"
    );
  }

  const providerProfile = await ProviderProfile.findOne({ userId });
  const service = await Service.findById(serviceId);
  if (
    !service ||
    service.providerId.toString() !== providerProfile._id.toString()
  ) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Service not found or not owned by you"
    );
  }

  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }

  const existingLink = await ServiceCategory.findOne({ serviceId, categoryId });
  if (existingLink) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Service already in this category"
    );
  }

  const serviceCategory = await ServiceCategory.create({
    serviceId,
    categoryId,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        serviceCategory,
        "Service added to category successfully"
      )
    );
});

const getServicesByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const serviceCategories = await ServiceCategory.find({ categoryId })
    .populate("serviceId", "title description price images")
    .populate("categoryId", "name");

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        serviceCategories,
        "Services retrieved successfully"
      )
    );
});

const removeServiceFromCategory = asyncHandler(async (req, res) => {
  const { serviceId, categoryId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "provider") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only providers can manage service categories"
    );
  }

  const providerProfile = await ProviderProfile.findOne({ userId });
  const service = await Service.findById(serviceId);
  if (
    !service ||
    service.providerId.toString() !== providerProfile._id.toString()
  ) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Service not found or not owned by you"
    );
  }

  const serviceCategory = await ServiceCategory.findOneAndDelete({
    serviceId,
    categoryId,
  });
  if (!serviceCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not in this category");
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        null,
        "Service removed from category successfully"
      )
    );
});

export {
  addServiceToCategory,
  getServicesByCategory,
  removeServiceFromCategory,
};
