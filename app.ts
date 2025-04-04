import express, { NextFunction,Request,Response } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import {userRouter} from "./routes/user.route";
import { notificationRoute } from "./routes/notification.route"
import { courseRouter } from "./routes/course.route";
import dotenv from "dotenv";
import { layoutRouter } from "./routes/layout.route";
import { wishListRouter } from "./routes/wishlist.route";
import quizzRouter from "./routes/quizz.route";
import cartRouter from "./routes/cart.route";
import orderRouter from "./routes/order.route";
dotenv.config();

export const app = express();
const limiter = rateLimit(
  {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }
);

// Cấu hình CORS
const corsOptions = {
  origin: "http://localhost:3000", // Chỉ định nguồn gốc được phép
  credentials: true, // Cho phép gửi cookie
};
app.use(cors(corsOptions));
app.use(express.json({limit: "100mb"}));
app.use(express.static('uploads'));
app.use(cookieParser());
app.use(limiter);

app.use("/api/v1", 
    userRouter,
    notificationRoute,
    layoutRouter, 
    courseRouter,
    wishListRouter,
    quizzRouter,
    cartRouter,
    orderRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Đường dẫn ${req.originalUrl} không tìm thấy`) as any;
    err.statusCode = 404;
    next(err);
  });
  
function morgan(arg0: string): any {
  throw new Error("Function not implemented.");
}

