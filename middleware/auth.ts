import { NextFunction, Request, Response } from "express"
import ErrorHandler from "../utils/ErrorHandler"



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
