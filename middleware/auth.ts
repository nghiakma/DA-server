import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/ErrorHandler"
import { CatchAsyncError } from "./catchAsyncErrors";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { updateAccessToken } from "../controllers/user.controller";
import { redis } from "../utils/redis";

export const isAutheticated = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const access_token = req.cookies.accessToken;
        console.log(`Access token: ${access_token}`);
        if(!access_token){
            return next(new ErrorHandler("Vui lòng đăng nhập để truy cập tài nguyên này",401));
        }
        const decoded = jwt.decode(access_token) as JwtPayload;
        if (!decoded) {
            return next(new ErrorHandler("access token không hợp lệ", 400));
          }
        
        if (decoded.exp && decoded.exp <= Date.now() / 1000) {
            try {
              updateAccessToken(req, res, next);
            } catch (error) {
              return next(error);
            }
        } else {
            const user = await redis.get(decoded.id);
      
            if (!user) {
              return next(
                new ErrorHandler("Vui lòng đăng nhập để truy cập tài nguyên này", 400)
              );
            }
      
            req.user = JSON.parse(user);
      
            next();
        }
        
    }
)

/**
 * Middleware để ủy quyền vai trò người dùng.
 * 
 * @param roles - Các vai trò được phép truy cập vào tài nguyên.
 * @returns Middleware kiểm tra vai trò người dùng.
 */
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user?.role || "")) {
        return next(
          new ErrorHandler(
            `Vai trò: ${req.user?.role} không có quyền truy cập vào tài nguyên này`,
            403
          )
        );
      }
      next();
    };
  };
