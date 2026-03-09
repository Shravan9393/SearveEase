import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is required");
    }

    const finalUri = mongoUri.includes("mongodb+srv://") || mongoUri.includes(`/${DB_NAME}`)
      ? mongoUri
      : `${mongoUri.replace(/\/$/, "")}/${DB_NAME}`;

    const connectInstance = await mongoose.connect(finalUri);
    console.log(`Connected to DB Successfully !! DB HOST : ${connectInstance.connection.host}`);
  } catch (error) {
    console.error("Error in connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;
