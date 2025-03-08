import http from "http";
import { app } from "./app";
import dotenv from "dotenv";
import connectDB from "./utils/db";
dotenv.config();

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
});