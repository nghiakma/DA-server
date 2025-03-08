import { Message } from './../node_modules/chromium-bidi/lib/cjs/protocol/generated/webdriver-bidi.d';
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ejs from "ejs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import path from "path";
import { sendMail } from "../utils/sendMail";


export const registrationUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
     try {
        const {email} = req.body;
        
        const isEmailExist = await userModel.findOne({email});
  
        if(isEmailExist){
          return next(new ErrorHandler("Email đã tồn tại",400));
        }
        
        const newUser = new userModel(req.body);

        const {token, activationCode} = createActivationToken(newUser);

   

        const data = {user: {name:newUser.name}, activationCode}

        try {
            await sendMail({
                email: newUser.email,
                subject: "Kích hoạt tài khoản của bạn",
                template: "activation-mail.ejs",
                data,
              });
      
              return res.status(201).json({
                success: true,
                message: `Vui lòng kiểm tra tài khoản của bạn: ${newUser.email} để kích hoạt tài khoản!`,
                activationToken: token,
              });
        } catch (error: any) {
            return next(new ErrorHandler(error.message,400));
        }

     } catch (error: any) {
        return next(new ErrorHandler(error.message,400));
     }
    }
);

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