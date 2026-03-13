import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const appendDbNameIfMissing = (uri, dbName) => {
  if (!uri) return uri;

  const hasExplicitDbName = /mongodb(?:\+srv)?:\/\/[^/]+\/[^?]+/.test(uri);
  if (hasExplicitDbName) {
    return uri;
  }

  const separator = uri.includes("?") ? "&" : "?";
  if (uri.startsWith("mongodb+srv://")) {
    return `${uri}${separator}retryWrites=true&w=majority&dbName=${encodeURIComponent(dbName)}`;
  }

  return `${uri.replace(/\/$/, "")}/${dbName}`;
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is required");
    }

    const finalUri = appendDbNameIfMissing(mongoUri, DB_NAME);

    const connectInstance = await mongoose.connect(finalUri);
    console.log(
      `Connected to DB Successfully !! HOST: ${connectInstance.connection.host}, DB: ${connectInstance.connection.name}`
    );
  } catch (error) {
    console.error("Error in connecting to DB", error);
    process.exit(1);
  }
};

export default connectDB;
