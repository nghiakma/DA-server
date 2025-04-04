import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.Model";
import { generateLast12MothsData } from "../utils/analytics.generator";

// Cung cấp cho người dùng --- Analytics chỉ dành cho quản trị viên
export const getUsersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MothsData(userModel);

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Nhận phân tích khóa học --- chỉ dành cho quản trị viên
export const getCoursesAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const courses = await generateLast12MothsData(CourseModel);
  
        res.status(200).json({
          success: true,
          courses,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
  
  
// Nhận phân tích đơn hàng --- chỉ dành cho quản trị viên
export const getOrderAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const orders = await generateLast12MothsData(OrderModel);
  
        res.status(200).json({
          success: true,
          orders,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
  