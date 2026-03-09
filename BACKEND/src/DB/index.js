import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("FINAL MONGO URI:", `${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(
      `Connected to DB Successfully !! DB HOST : ${connectInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error in connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;
