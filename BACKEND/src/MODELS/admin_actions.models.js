import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: ["ban_user", "unban_user", "resolve_complaint", "update_service", "other"]
        },
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        details: {
            type: String,
            trim: true,
            maxlength: 1000
        }
    },
    { timestamps: true }
);

adminActionSchema.index({ adminId: 1 });
adminActionSchema.index({ targetUserId: 1 });

const AdminAction = mongoose.model("AdminAction", adminActionSchema);

export default AdminAction;
