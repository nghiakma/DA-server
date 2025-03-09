import notificationModel from "../models/notification.model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";


export const createNotification = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { title, message, userId } = req.body;
  
        // Kiểm tra các trường bắt buộc
        if (!title || !message || !userId) {
          return next(new ErrorHandler("Vui lòng cung cấp đầy đủ thông tin (title, message, userId)", 400));
        }
  
        // Tạo thông báo mới
        const notification = await notificationModel.create({
          title,
          message,
          userId,
          status: "unread", // Mặc định là "unread"
        });
  
        // Trả về kết quả
        res.status(201).json({
          success: true,
          notification,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );

export const getNotifications = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const notifications = await notificationModel.find().sort({
          createdAt: -1,
        });
  
        res.status(201).json({
          success: true,
          notifications,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
);

export const updateNotification = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const notification = await notificationModel.findById(req.params.id);
        if (!notification) {
          return next(new ErrorHandler("Không tìm thấy thông báo", 404));
        } else {
          notification.status
            ? (notification.status = "read")
            : notification?.status;
        }
  
        await notification.save();
  
        const notifications = await notificationModel.find().sort({
          createdAt: -1,
        });
  
        res.status(201).json({
          success: true,
          notifications,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );

  /**
 * Lịch trình cron để xóa các thông báo đã đọc sau 30 ngày.
 * 
 * Lịch trình này sẽ chạy vào lúc 0 giờ 0 phút 0 giây mỗi ngày.
 * Nó sẽ xóa tất cả các thông báo có trạng thái "read" và được tạo ra trước 30 ngày.
 */
cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notificationModel.deleteMany({status:"read",createdAt: {$lt: thirtyDaysAgo}});
    console.log('Đã xóa thông báo đã đọc');
});