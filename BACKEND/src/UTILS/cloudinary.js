import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload image to cloudinary

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    // now uplaod the file on the cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // now file has been uploaded on cloudinary successfully

    console.log("file is uploaded on cloudinary successfully : ", response);

    // now we will delete the file from the local server
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // if the error catches , then remove the file from local as the file upload Failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// delete on cloudinary

const deleteOnCloudinary = async (public_id, resource_type = "auto") => {
  try {
    if (!public_id) {
      return null;
    }

    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: `${resource_type}`,
    });
  } catch (error) {
    return error;
    console.error("error while deleting the file on cloudinary : ", error);
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
