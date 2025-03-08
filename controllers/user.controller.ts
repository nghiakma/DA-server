import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import { sendMail } from "../utils/sendMail";
import { sendToken } from "../utils/jwt";


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

export const activeUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      
        try{
            const { activation_token, activation_code } = req.body;

            const newUser: { user: IUser; activationCode: string } = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET as string
              ) as { user: IUser; activationCode: string };

            if (newUser.activationCode !== activation_code) {
                return next(new ErrorHandler("Mã kích hoạt không hợp lệ", 400));
              }

            await userModel.create(newUser.user);

            res.status(201).json({
                success:true
            })
        }catch(error: any){
            return next(new ErrorHandler(error.message, 400));
        }
})

export const loginUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body;
        console.log(email, password);
        if (!email || !password) {
          return next(new ErrorHandler("Vui lòng nhập email và password", 400));
        }
  
        const user = await userModel.findOne({ email }).select("+password");
  
        if (!user) {
          return next(new ErrorHandler("Email hoặc mật khẩu không hợp lệ", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
          return next(new ErrorHandler("Email hoặc mật khẩu không hợp lệ", 400));
        }
        sendToken(user, 200, res);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );
  