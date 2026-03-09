import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
    {
        providerId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amout:{
            type: Number,
            required: true,
            min: 0,
        },

        currency:{
            type: String,
            required: true,
            default: "INR",
        },

        status:{
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },

        paymentMethod:{
            type: String,
            required: true,
            enum: ["bank_transfer", "paypal", "stripe"],
            required: true,
        },
    },
        {
            timestamps: true
        }
    
);


const Payout = new mongoose.model("Payout", payoutSchema);
export default Payout;

