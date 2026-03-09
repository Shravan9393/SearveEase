import Service from '../MODELS/services.models.js';
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "../MIDDLEWARES/auth.middlewares.js";
import { upload } from '../MIDDLEWARES/multer.middleware.js';
import { uploadOnCloudinary } from '../UTILS/cloudinary.js';
import mongoose from 'mongoose';



// Handler to create a new service
const createService = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can create services");
    }

    const { title, description, pricing, categoryId, locationPolicy } = req.body;
    if ([title, description, locationPolicy].some(field => !field?.trim()) || !pricing || !categoryId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
    }
    if (isNaN(pricing) || pricing < 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid pricing");
    }
    if (title.length < 3 || title.length > 100) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Title must be 3-100 characters");
    }
    if (description.length < 10 || description.length > 2000) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Description must be 10-2000 characters");
    }

    let images = null;
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.path);
        if (!result) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Image upload failed");
        }
        images = result.secure_url;
    }

    const newService = await Service.create({
        providerId: req.user._id,
        title,
        description,
        pricing,
        categoryId,
        locationPolicy,
        images
    });

    const apiResponse = new ApiResponse(res);
    return apiResponse.success(
        { service: newService },
        "Service created successfully"
    );
});

// Handler to get all services
const getAllServices = asyncHandler(async (req, res) => {
    const { category, provider, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category; // Add if category field is added to model
    if (provider) query.providerId = provider;

    const services = await Service.find(query)
      .populate("categoryId", "name")
      .populate(
        "providerId",
        "displayName ratingSummary responseTime availability"
      );

    //   .limit(limit * 1)
    //   .skip((page - 1) * limit);


    const apiResponse = new ApiResponse(res);
    return apiResponse.success(
        { services, page: parseInt(page), limit: parseInt(limit) },
        "Services fetched successfully"
    );
});

// Handler to get service by ID
const getServicesById = asyncHandler(async (req, res) => {
    const serviceId = req.params.id;
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Valid Service ID is required");
    }

    const serviceData = await Service.findById(serviceId)
        .populate('providerId', 'fullName displayName')
        .populate('categoryId', 'name description');
    if (!serviceData || !serviceData.isActive) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
    }

    const apiResponse = new ApiResponse(res);
    return apiResponse.success(
        { service: serviceData },
        "Service fetched successfully"
    );
});

// Handler to update a service
const updateService = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can update services");
    }

    const serviceId = req.params.id;
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Valid Service ID is required");
    }

    const service = await Service.findById(serviceId);
    if (!service || service.providerId.toString() !== req.user._id.toString()) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You can only update your own services");
    }

    const { title, description, pricing, categoryId, locationPolicy } = req.body;
    if ([title, description, locationPolicy].some(field => field && field.trim() === '')) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Fields cannot be empty");
    }
    if (pricing && (isNaN(pricing) || pricing < 0)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid pricing");
    }
    if (title && (title.length < 3 || title.length > 100)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Title must be 3-100 characters");
    }
    if (description && (description.length < 10 || description.length > 2000)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Description must be 10-2000 characters");
    }

    let images = service.images;
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.path);
        if (!result) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Image upload failed");
        }
        images = result.secure_url;
    }

    const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        { title, description, pricing, categoryId, locationPolicy, images },
        { new: true }
    );

    const apiResponse = new ApiResponse(res);
    return apiResponse.success(
        { service: updatedService },
        "Service updated successfully"
    );
});

// Handler to delete a service
const deleteService = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== 'provider') {
        throw new ApiError(StatusCodes.FORBIDDEN, "Only providers can delete services");
    }

    const serviceId = req.params.id;
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Valid Service ID is required");
    }

    const service = await Service.findById(serviceId);
    if (!service || service.providerId.toString() !== req.user._id.toString()) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own services");
    }

    await Service.findByIdAndUpdate(serviceId, { isActive: false });

    const apiResponse = new ApiResponse(res);
    return apiResponse.success(
        null,
        "Service deleted successfully"
    );
});

export { createService, getAllServices, getServicesById, updateService, deleteService };
