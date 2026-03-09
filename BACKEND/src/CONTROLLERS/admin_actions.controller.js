import AdminAction from "../MODELS/admin_actions.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import { StatusCodes } from "http-status-codes";

const logAdminAction = asyncHandler(async (req, res) => {
  const { action, targetUserId, details } = req.body;
  const adminId = req.user._id;

  const admin = await User.findById(adminId);
  if (admin.role !== "admin") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can log actions");
  }

  const adminAction = await AdminAction.create({
    adminId,
    action,
    targetUserId,
    details,
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        adminAction,
        "Admin action logged successfully"
      )
    );
});

const getAdminActions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetUserId, page = 1, limit = 20 } = req.query;

  const user = await User.findById(userId);
  if (user.role !== "admin") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can view actions");
  }

  const query = targetUserId ? { targetUserId } : {};

  const actions = await AdminAction.find(query)
    .populate("adminId", "fullName email")
    .populate("targetUserId", "fullName email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await AdminAction.countDocuments(query);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        actions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalActions: total,
        },
      },
      "Admin actions retrieved successfully"
    )
  );
});


const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (user.role !== "admin") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can view all users");
  }

  const { page = 1, limit = 10, role } = req.query;
  const query = role ? { role } : {};

  const users = await User.find(query)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
        },
      },
      "Users retrieved successfully"
    )
  );
});



export { logAdminAction, getAdminActions, getAllUsers };
