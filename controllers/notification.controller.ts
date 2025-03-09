import notificationModel from "../models/notification.model";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";

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