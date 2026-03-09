import app from "./app.js";
import connectDB from "./DB/index.js";
import http from "http";
import dotenv from "dotenv";
import path from "path";





dotenv.config({
    path: path.resolve("./src/.env"),
});


const server = http.createServer(app);




connectDB()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB", err);
        process.exit(1);
    });