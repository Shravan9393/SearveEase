import app from "./app.js";
import connectDB from "./DB/index.js";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const rootEnvPath = path.resolve("./.env");
const srcEnvPath = path.resolve("./src/.env");

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config({ path: srcEnvPath });
}

const server = http.createServer(app);

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });
