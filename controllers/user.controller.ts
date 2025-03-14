import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { sendMail } from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/user.service";
import path from "path";
import fs from "fs";



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
  
export const logoutUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.cookie("accessToken", "", { maxAge: 1 });
        res.cookie("refreshToken", "", { maxAge: 1 });
        const userId = req.user?._id || "";
        redis.del(userId.toString());
        res.status(200).json({
          success: true,
          message: "Đăng xuất thành công",
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
);

export const updateAccessToken = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const refresh_token = req.cookies.refreshToken;
        const decoded = jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
          ) as JwtPayload;
  
        const message = "Không thể làm mới mã thông báo";
        if (!decoded) {
          return next(new ErrorHandler(message, 400));
        }
        const session = await redis.get(decoded.id as string);
  
        if (!session) {
          return next(
            new ErrorHandler("Vui lòng đăng nhập để truy cập tài nguyên này!", 400)
          );
        }
  
        const user = JSON.parse(session);
  
        req.user = user;
  
        await redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7days
  
        return next();
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

export const getUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId =  req.user?._id;
        getUserById(userId, res);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
)

export const updateUserInfo = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name } = req.body ;
  
        const userId = req.user?._id as any;
        const user = await userModel.findById(userId);
  
        if (name && user) {
          user.name = name;
        }
  
        await user?.save();
  
        await redis.set(userId, JSON.stringify(user));
  
        res.status(201).json({
          success: true,
          user,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
);

export const updatePassword = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { oldPassword, newPassword } = req.body;
  
        if (!oldPassword || !newPassword) {
          return next(new ErrorHandler("Vui lòng nhập mật khẩu cũ và mới", 400));
        }
  
        const user = await userModel.findById(req.user?._id).select("+password");
  
        if (user?.password === undefined) {
          return next(new ErrorHandler("Người dùng không hợp lệ", 400));
        }
  
        const isPasswordMatch = await user?.comparePassword(oldPassword);
  
        if (!isPasswordMatch) {
          return next(new ErrorHandler("Mật khẩu cũ không hợp lệ", 400));
        }
  
        user.password = newPassword;
  
        await user.save();
  
        await redis.set(req.user?._id as any, JSON.stringify(user));
  
        res.status(201).json({
          success: true,
          user,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
);

export const getAllUsers = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        getAllUsersService(res);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
);

export const updateProfilePicture = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
  
        const userId = req.user?._id as any;
  
        const user = await userModel.findById(userId).select("+password");
  
        const image = req.file;
  
        if (user) {
  
          if (user?.avatar?.url) {
  
            const oldImagePath = path.join(__dirname, '../uploads/images', user?.avatar?.url);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log('Đã xóa ảnh cũ:', oldImagePath);
            }
            user.avatar = {
              url: image?.filename as any,
            };
  
          } else {
            user.avatar = {
              url: image?.filename as any,
            };
          }
        }
  
        await user?.save();
  
        await redis.set(userId, JSON.stringify(user));
        console.log(user?.avatar.url);
        res.status(200).json({
          success: true,
          user,
        });
      } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

export const deleteUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
  
        const user = await userModel.findById(id);
  
        if (!user) {
          return next(new ErrorHandler("Không tìm thấy người dùng", 404));
        }
  
        await user.deleteOne({ id });
  
        await redis.del(id);
  
        res.status(200).json({
          success: true,
          message: "Người dùng đã xóa thành công",
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );

export const updateUserRole = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, role } = req.body;
        const isUserExist = await userModel.findOne({ email });
        if (isUserExist) {
          const id = isUserExist._id;
          updateUserRoleService(res, id as any, role);
        } else {
          res.status(400).json({
            success: false,
            message: "Không tìm thấy người dùng",
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );