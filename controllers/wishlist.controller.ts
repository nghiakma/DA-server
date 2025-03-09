import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import wishlistModel from "../models/wishlist.model";
export const addWishCourse = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const { courseId } = req.body;

            const response = await wishlistModel.create({
                userId: userId,
                courseId: courseId
            });

            return res.status(200).json({
                success: true,
                data: response
            })

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
)