import express, { NextFunction,Request,Response } from "express";
export const app = express();
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const limiter = rateLimit(
  {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }
);

app.use(express.json({limit: "100mb"}));
app.use(express.static('uploads'));
app.use(cookieParser());
app.use(limiter);
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: '*'
}));
app.options('*', cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new AppError(`Đường dẫn ${req.originalUrl} không tìm thấy`, 404);
    next(err);
})
