import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is required");
    }

    const connectInstance = await mongoose.connect(mongoUri);
    console.log(
      `Connected to DB Successfully !! HOST: ${connectInstance.connection.host} | DB: ${connectInstance.connection.name}`
    );
  } catch (error) {
    console.error("Error in connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;
