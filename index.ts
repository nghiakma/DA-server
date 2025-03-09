import http from "http";
import { app } from "./app";
import connectDB from "./utils/db";
import dotenv from "dotenv";
import { initSocketServer } from "./socketServer";
dotenv.config();

const server = http.createServer(app);

initSocketServer(server);
server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
});