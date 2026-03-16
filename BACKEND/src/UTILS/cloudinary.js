import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("[cloudinary] Upload successful:", response.secure_url);

    // Clean up local temp file after successful upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("[cloudinary] Upload failed:", error.message);

    // Clean up temp file even on failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteOnCloudinary = async (public_id, resource_type = "image") => {
  try {
    if (!public_id) return null;

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    return result;
  } catch (error) {
    console.error("[cloudinary] Deletion failed:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
