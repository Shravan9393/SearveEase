import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    
    providerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    images: {
        type: [String],
        default: []
    },

    comment: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ""
    }, 

    customerProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerProfile",
        required: true
    },

  },{ timestamps: true }
);

reviewSchema.index({ providerProfileId: 1 });


const Review = mongoose.model("Review", reviewSchema);

export default Review;