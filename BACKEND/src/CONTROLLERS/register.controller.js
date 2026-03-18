// import { User } from "../MODELS/users.models.js";
// import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
// import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
// import { asyncHandler } from "../UTILS/asyncHandler.js";
// import { ApiError } from "../UTILS/apiError.js";
// import { ApiResponse } from "../UTILS/apiResponse.js";
// import { StatusCodes } from "http-status-codes";
// import mongoose from "mongoose";
// import { uploadOnCloudinary } from "../UTILS/cloudinary.js";

// /* ----------------------------------
//    Token Generator
// ---------------------------------- */
// const generateAccessAndRefreshToken = async (userId) => {
//   const user = await User.findById(userId).select("+refreshToken");

//   if (!user) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
//   }

//   const accessToken = user.generateAccessToken();
//   const refreshToken = user.generateRefreshToken();

//   user.refreshToken = refreshToken;
//   await user.save({ validateBeforeSave: false });

//   return { accessToken, refreshToken };
// };

// const normalizeString = (value) =>
//   typeof value === "string" ? value.trim() : "";

// /* ----------------------------------
//    Register Customer
// ---------------------------------- */
// const registerCustomer = asyncHandler(async (req, res) => {
//   const userName = normalizeString(req.body.userName);
//   const email = normalizeString(req.body.email).toLowerCase();
//   const password = normalizeString(req.body.password);
//   const fullName = normalizeString(req.body.fullName);
//   const phone = normalizeString(req.body.phone);

//   if ([userName, email, password, fullName, phone].some((v) => !v)) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
//   }

//   const existingUser = await User.findOne({
//     $or: [{ email }, { userName: userName.toLowerCase() }],
//   });
//   if (existingUser) {
//     throw new ApiError(StatusCodes.CONFLICT, "User already exists");
//   }

//   // req.file is set by the multer handleUpload wrapper in register.routes.js.
//   // If no image was selected by the user, req.file is undefined and
//   // profileImage is stored as null — this is intentional and non-fatal.
//   let uploadedImage = null;
//   if (req.file?.path) {
//     uploadedImage = await uploadOnCloudinary(req.file.path);
//     if (!uploadedImage) {
//       console.warn(
//         "[registerCustomer] Cloudinary upload failed — storing profileImage as null."
//       );
//     }
//   }

//   const user = await User.create({
//     userName: userName.toLowerCase(),
//     fullName,
//     email,
//     password,
//     role: "customer",
//     profileImage: uploadedImage?.secure_url || null,
//   });

//   const customerProfile = await CustomerProfile.create({
//     userId: user._id,
//     fullName,
//     phone,
//     profileImage: uploadedImage?.secure_url || null,
//   });

//   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
//     user._id
//   );

//   // Strip sensitive fields before sending response
//   const userResponse = user.toObject();
//   delete userResponse.password;
//   delete userResponse.refreshToken;

//   return res
//     .status(StatusCodes.CREATED)
//     .json(
//       new ApiResponse(
//         StatusCodes.CREATED,
//         { user: userResponse, customerProfile, accessToken, refreshToken },
//         "Customer registered successfully"
//       )
//     );
// });

// /* ----------------------------------
//    Register Provider
// ---------------------------------- */
// const registerProvider = asyncHandler(async (req, res) => {
//   const userName = normalizeString(req.body.userName);
//   const email = normalizeString(req.body.email).toLowerCase();
//   const password = normalizeString(req.body.password);
//   const fullName = normalizeString(req.body.fullName);
//   const phone = normalizeString(req.body.phone);
//   const displayName = normalizeString(req.body.displayName);
//   const businessName = normalizeString(req.body.businessName);
//   const description = normalizeString(req.body.description);

//   if (
//     [userName, email, password, fullName, phone, displayName].some((v) => !v)
//   ) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       "All required fields are mandatory"
//     );
//   }

//   const existingUser = await User.findOne({
//     $or: [{ email }, { userName: userName.toLowerCase() }],
//   });
//   if (existingUser) {
//     throw new ApiError(StatusCodes.CONFLICT, "User already exists");
//   }

//   // Upload image BEFORE the transaction so the DB session stays short and
//   // isn't held open during a potentially slow Cloudinary network call.
//   let uploadedImage = null;
//   if (req.file?.path) {
//     uploadedImage = await uploadOnCloudinary(req.file.path);
//     if (!uploadedImage) {
//       console.warn(
//         "[registerProvider] Cloudinary upload failed — storing profileImage as null."
//       );
//     }
//   }

//   const session = await mongoose.startSession();
//   let user;
//   let providerProfile;

//   try {
//     await session.withTransaction(async () => {
//       user = await User.create(
//         [
//           {
//             userName: userName.toLowerCase(),
//             fullName,
//             email,
//             password,
//             role: "provider",
//             profileImage: uploadedImage?.secure_url || null,
//           },
//         ],
//         { session }
//       ).then((docs) => docs[0]);

//       providerProfile = await ProviderProfile.create(
//         [
//           {
//             userId: user._id,
//             businessName,
//             displayName,
//             phone,
//             description: description || "Service provider",
//             pricing: { starting: 0 },
//             profileImage: uploadedImage?.secure_url || null,
//           },
//         ],
//         { session }
//       ).then((docs) => docs[0]);
//     });
//   } finally {
//     // Always end the session whether the transaction succeeded or failed
//     await session.endSession();
//   }

//   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
//     user._id
//   );

//   // Strip sensitive fields before sending response
//   const userResponse = user.toObject();
//   delete userResponse.password;
//   delete userResponse.refreshToken;

//   return res
//     .status(StatusCodes.CREATED)
//     .json(
//       new ApiResponse(
//         StatusCodes.CREATED,
//         { user: userResponse, providerProfile, accessToken, refreshToken },
//         "Provider registered successfully"
//       )
//     );
// });

// export { registerCustomer, registerProvider };




import { User } from "../MODELS/users.models.js";
import { CustomerProfile } from "../MODELS/customer_profiles.models.js";
import { ProviderProfile } from "../MODELS/provider_profiles.models.js";
import Service from "../MODELS/services.models.js";
import Category from "../MODELS/categories.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../UTILS/cloudinary.js";

/* ----------------------------------
   Token Generator
---------------------------------- */
const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : "";

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const extractFirstNumber = (value) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value !== "string") return 0;
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const mapAvailabilityToServiceAvailability = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (["available", "busy", "unavailable"].includes(normalized)) {
    return normalized;
  }
  return "available";
};

/* ----------------------------------
   Register Customer
---------------------------------- */
const registerCustomer = asyncHandler(async (req, res) => {
  const userName = normalizeString(req.body.userName);
  const email = normalizeString(req.body.email).toLowerCase();
  const password = normalizeString(req.body.password);
  const fullName = normalizeString(req.body.fullName);
  const phone = normalizeString(req.body.phone);

  if ([userName, email, password, fullName, phone].some((v) => !v)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName: userName.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "User already exists");
  }

  // req.file is set by the multer handleUpload wrapper in register.routes.js.
  // If no image was selected by the user, req.file is undefined and
  // profileImage is stored as null — this is intentional and non-fatal.
  let uploadedImage = null;
  if (req.file?.path) {
    uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      console.warn(
        "[registerCustomer] Cloudinary upload failed — storing profileImage as null."
      );
    }
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    role: "customer",
    profileImage: uploadedImage?.secure_url || null,
  });

  const customerProfile = await CustomerProfile.create({
    userId: user._id,
    fullName,
    phone,
    profileImage: uploadedImage?.secure_url || null,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // Strip sensitive fields before sending response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        { user: userResponse, customerProfile, accessToken, refreshToken },
        "Customer registered successfully"
      )
    );
});

/* ----------------------------------
   Register Provider
---------------------------------- */
const registerProvider = asyncHandler(async (req, res) => {
  const userName = normalizeString(req.body.userName);
  const email = normalizeString(req.body.email).toLowerCase();
  const password = normalizeString(req.body.password);
  const fullName = normalizeString(req.body.fullName);
  const phone = normalizeString(req.body.phone);
  const displayName = normalizeString(req.body.displayName);
  const businessName = normalizeString(req.body.businessName);
  const description = normalizeString(req.body.description);
  const serviceCategory = normalizeString(req.body.serviceCategory);
  const experience = normalizeString(req.body.experience);
  const location = normalizeString(req.body.location);
  const serviceArea = normalizeString(req.body.serviceArea);
  const pricingInput = normalizeString(req.body.pricing);
  const availabilityInput = normalizeString(req.body.availability);
  const certificationsInput = normalizeString(req.body.certifications);

  if (
    [userName, email, password, fullName, phone, displayName].some((v) => !v)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "All required fields are mandatory"
    );
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName: userName.toLowerCase() }],
  });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "User already exists");
  }

  // Upload image BEFORE the transaction so the DB session stays short and
  // isn't held open during a potentially slow Cloudinary network call.
  let uploadedImage = null;
  if (req.file?.path) {
    uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      console.warn(
        "[registerProvider] Cloudinary upload failed — storing profileImage as null."
      );
    }
  }

  const session = await mongoose.startSession();
  let user;
  let providerProfile;
  let service;

  try {
    await session.withTransaction(async () => {
      user = await User.create(
        [
          {
            userName: userName.toLowerCase(),
            fullName,
            email,
            password,
            role: "provider",
            profileImage: uploadedImage?.secure_url || null,
          },
        ],
        { session }
      ).then((docs) => docs[0]);

      providerProfile = await ProviderProfile.create(
        [
          {
            userId: user._id,
            businessName,
            displayName,
            phone,
            description: description || "Service provider",
            pricing: { starting: 0 },
            profileImage: uploadedImage?.secure_url || null,
          },
        ],
        { session }
      ).then((docs) => docs[0]);

      const resolvedCategoryName = serviceCategory || "Other Services";
      const resolvedCategorySlug = buildSlug(resolvedCategoryName);

      let category = await Category.findOne({ slug: resolvedCategorySlug }).session(
        session
      );

      if (!category) {
        category = await Category.create(
          [
            {
              name: resolvedCategoryName,
              slug: resolvedCategorySlug,
              description: `${resolvedCategoryName} services`,
              isActive: true,
            },
          ],
          { session }
        ).then((docs) => docs[0]);
      }

      const parsedPricing = extractFirstNumber(pricingInput);
      const normalizedDescription =
        description.length >= 10
          ? description
          : `${description || "Service provider"} offerings and support`;
      const locationPolicy =
        (serviceArea && `Provider serves ${serviceArea}`) ||
        (location && `Provider serves ${location} and nearby locations`) ||
        "Provider serves nearby locations in customer area";

      service = await Service.create(
        [
          {
            providerId: providerProfile._id,
            providerName: providerProfile.displayName,
            providerImage: providerProfile.profileImage || uploadedImage?.secure_url || "",
            categoryId: category._id,
            categoryName: category.name,
            title: businessName || `${resolvedCategoryName} Service`,
            description: normalizedDescription,
            pricing: parsedPricing,
            locationPolicy,
            availability: mapAvailabilityToServiceAvailability(availabilityInput),
            features: certificationsInput
              ? certificationsInput
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],
            duration: experience ? `${experience} years experience` : "1-2 hours",
            distance: location || "Nearby",
          },
        ],
        { session }
      ).then((docs) => docs[0]);

      providerProfile.services = [...(providerProfile.services || []), service._id];
      providerProfile.categories = [...(providerProfile.categories || []), category._id];
      await providerProfile.save({ session, validateBeforeSave: false });
    });
  } finally {
    // Always end the session whether the transaction succeeded or failed
    await session.endSession();
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // Strip sensitive fields before sending response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        { user: userResponse, providerProfile, service, accessToken, refreshToken },
        "Provider registered successfully"
      )
    );
});

export { registerCustomer, registerProvider };