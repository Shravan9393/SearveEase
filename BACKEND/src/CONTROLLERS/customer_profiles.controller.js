import {CustomerProfile} from "../MODELS/customer_profiles.models.js";
import { User } from "../MODELS/users.models.js";
import { asyncHandler } from "../UTILS/asyncHandler.js";
import { ApiError } from "../UTILS/apiError.js";
import { ApiResponse } from "../UTILS/apiResponse.js";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";


// get Customer Profile

const getCustomerProfile = asyncHandler( async (req, res) => {

   try {
     // get userId from req.useer Id
     const { userId } = req.user?._id;
 
     // validate the userId
 
     if(!mongoose.Types.ObjectId.isValid(userId)){
         throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid userId");
     }
 
     // find customer profile by userId
 
     const customerProfile = await CustomerProfile.findOne({ userId }).populate({    
         path: "userId",
         model: User,
         select: "name email"
     });
     if(!customerProfile){
         throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
     }   
 
     return res
         .status(StatusCodes.OK).json(new ApiResponse(true, "Customer profile fetched successfully", customerProfile));
    
        }catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch customer profile");
   }
   
});



// update customer profile

const updateCustomerProfile = asyncHandler( async (req, res) => {

    try {

        const { userId } = req.user?._id;
        const { fullName, phone, address, socialMedia } = req.body;

        // vaildate userId

        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid userId");
        }

        if([fullName, phone].some((field) => field?.trim() === "")){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Fullname and phone are required");
        }
        if(phone && !/^[0-9]{10}$/.test(phone)){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide a valid 10-digit phone number");
        }
        if(!address){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Address is required");
        }

        const updatedProfile = await CustomerProfile.findOneAndUpdate(
            { userId },
            {
                fullName,
                phone,
                address,
                socialMedia,
            },
            { new: true }
        );
        if(!updatedProfile){
            throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
        }

        await updatedProfile.save();

        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(true, "Customer profile updated successfully", updatedProfile));      

        
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update customer profile");
    }
});


// delete customer profile

const deleteCustomerProfile = asyncHandler( async (req, res) => {
    try {
        
        const { userId } = req.user?._id;

        const deletedProfile = await CustomerProfile.findOne({ userId });

        if(!deletedProfile){
            throw new ApiError(StatusCodes.NOT_FOUND, "Customer profile not found");
        }
        deletedProfile.isActive = false;
        await deletedProfile.save();

        await deletedProfile.findOneAndDelete({ userId });
        
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(true, "Customer profile deleted successfully", deletedProfile));

    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete customer profile");
    }

});


export {
    getCustomerProfile,
    updateCustomerProfile,
    deleteCustomerProfile,
};