import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { createCourse } from "../services/course.service";

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
  //lấy file
      const files = req.files as {
        image?: Express.Multer.File[];
        demo?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };
      const image = files.image?.[0];
      const demo = files.demo?.[0];
      const videos = files.videos;

      const course = JSON.parse(data.courseData)
      course.thumbnail = {
        // public_id: image?.mimetype,
        url: image?.filename,
      };

      course.demoUrl = demo?.filename

      // Kiểm tra nếu có videos
      if (videos && videos.length > 0) {
        // Kiểm tra xem courseData có mảng không
        if (Array.isArray(course.courseData)) {
          // Duyệt qua từng phần tử trong courseData
          course.courseData.forEach((item: any, index: number) => {
            // Nếu tồn tại video tại vị trí tương ứng
            if (videos[index]) {
              // Gán filename của video vào videoUrl
              item.videoUrl = videos[index].filename;
            }
          });
        }
      }

      console.log(course.thumbnail);
      createCourse(course, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);