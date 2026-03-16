import "./env.js";        // ← MUST be first. Loads .env before anything else.
import app from "./app.js";
import connectDB from "./DB/index.js";
import http from "http";

const server = http.createServer(app);

connectDB()
    .then(() => {
        const port = process.env.PORT || 8000;
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
        process.exit(1);
    });
