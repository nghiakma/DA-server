import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ejs from "ejs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";



interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: IUser): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  if (!process.env.ACTIVATION_SECRET) {
    throw new Error("ACTIVATION_SECRET is not defined in environment variables");
  }

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};