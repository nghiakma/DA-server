import express from "express";
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
