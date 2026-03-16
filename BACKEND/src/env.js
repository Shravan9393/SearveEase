
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try src/.env first (your actual location), then fall back to root .env
const srcEnvPath = path.resolve(__dirname, ".env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(srcEnvPath)) {
  dotenv.config({ path: srcEnvPath });
  console.log("[env] Loaded environment from:", srcEnvPath);
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  console.log("[env] Loaded environment from:", rootEnvPath);
} else {
  console.warn(
    "[env] WARNING: No .env file found at",
    srcEnvPath,
    "or",
    rootEnvPath
  );
}
