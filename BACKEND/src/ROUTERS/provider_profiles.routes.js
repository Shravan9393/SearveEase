import { Router } from 'express';
import { asyncHandler } from '../UTILS/asyncHandler.js';

import {
    getProviderProfile,
    updateProviderProfile,
    deleteProviderProfile
} from "../CONTROLLERS/provider_profiles.controllers.js";

const router = Router();

// Route to get provider profile
router.route("/").get(getProviderProfile);

// Route to update provider profile

router.route("/:providerId").patch(
  asyncHandler(async (req, res) => {
    const { providerId } = req.params;
    const profile = await ProviderProfile.findByIdAndUpdate(
      providerId,
      req.body,
      { new: true }
    );

    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Provider not found");
    }

    res.status(200).json(new ApiResponse(200, profile, "Provider updated"));
  })
);

// Route to delete provider profile

router.route("/").delete(deleteProviderProfile);

export default router;