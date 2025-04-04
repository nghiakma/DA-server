import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { createCourse, getAllCoursesService } from "../services/course.service";
import path from "path";
import CourseModel from "../models/course.model";
import fs from "fs";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import notificationModel from "../models/notification.model";
import ejs from "ejs";
import { sendMail } from "../utils/sendMail";

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

      console.log(image)
      console.log(demo)
      console.log(videos)

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

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const files = req.files as {
        imageedit?: Express.Multer.File[];
        demoedit?: Express.Multer.File[];
        videos?: Express.Multer.File[];
      };
      const courseId = req.params.id;
      let videoIndex = 0;
      const coursedb = await CourseModel.findById(courseId) as any;
      //file
      const data = req.body;
      const image = files.imageedit?.[0];
      const demo = files.demoedit?.[0];
      const videos = files.videos || [];

      // console.log('Request Body:', data);
      console.log('Uploaded Image 87:', image);
      // console.log('Uploaded demo:', demo);
      // console.log('Uploaded Video:', videos)

      const courses = JSON.parse(data.courseData);
      // Xóa ảnh cũ nếu có ảnh mới được upload
      console.log(coursedb.thumbnail.url)
      if (image && coursedb.thumbnail?.url) {
        const oldImagePath = path.join(__dirname, '../uploads/images', coursedb.thumbnail.url);// tìm ảnh đã tồn tại
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Đã xóa ảnh cũ:', oldImagePath);
        }//update thumbnail: image + url
        courses.thumbnail = {
          //public_id: image?.mimetype,
          url: image?.filename,
        };
      }

      // Xóa demo c   nếu có demo mới được upload
      console.log(coursedb.demoUrl)
      if (demo && coursedb.demoUrl) {
        const oldDemoPath = path.join(__dirname, '../uploads/videos', coursedb.demoUrl);
        if (fs.existsSync(oldDemoPath)) {
          fs.unlinkSync(oldDemoPath);
          console.log('Đã xóa demo c  :', oldDemoPath);
        }
        courses.demoUrl = demo.filename
      }

      if (videos) {
        // Tạo mảng videos mới chỉ chứa các phần tử có giá trị
        const validVideos = videos.reduce((acc: Express.Multer.File[], video, index) => {
          if (video) {
            acc.push(video);
          }
          return acc;
        }, []);
        console.log(validVideos)

        if (courses.courseData && coursedb.courseData) {
          courses.courseData.forEach((content: any, index: number) => {
            if (content.videoUrl === coursedb.courseData[index]._id.toString()) {
              // Xóa video cũ nếu tồn tại
              const oldVideoUrl = coursedb.courseData[index].videoUrl;
              if (oldVideoUrl) {
                const oldVideoPath = path.join(__dirname, '../uploads/videos', oldVideoUrl);
                if (fs.existsSync(oldVideoPath)) {
                  fs.unlinkSync(oldVideoPath);
                  console.log('Đã xóa video cũ:', oldVideoPath);
                }
              }
              content.videoUrl = validVideos[videoIndex].filename
              videoIndex++
            }
          })
        }

      }

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: courses,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCacheExist = await redis.get(courseId);
      //check xem đã tồn tại dữ liệu trong redis chưa; xoá cache để tối ưu hoá
      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {// lấy dữ liệu khoá học
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await CourseModel.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const courseId = req.params.id;
  
      const course = await CourseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const course = await CourseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("không tìm thấy khóa học", 404));
      }

      await course.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "Khóa học đã xóa thành công",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAdminAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;

      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Id nội dung không hợp lệ", 400));
      }

      const couseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );//tìm bài học theo khoá học xem có tồn tại hay chưa

      if (!couseContent) {
        return next(new ErrorHandler("Id nội dung không hợp lệ", 400));
      }

      // Tạo một đối tượng câu hỏi mới
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // Thêm câu hỏi này vào nội dung khóa học của chúng tôi
      couseContent.questions.push(newQuestion);
     
      await notificationModel.create({
        user: req.user?._id,
        title: "Câu hỏi mới nhận được",
        message: `Bạn có một câu hỏi mới trong ${couseContent.title}`,
      });

      // Lưu khóa học cập nhật
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Thêm câu trả lời trong câu hỏi khóa học
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnwser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;

      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Id nội dung không hợp lệ", 400));
      }

      const couseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!couseContent) {
        return next(new ErrorHandler("Id nội dung không hợp lệ", 400));
      }

      const question = couseContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("ID câu hỏi không hợp lệ", 400));
      }

      // Tạo đối tượng trả lời mới
      const newAnswer: any = {
        user: req.user,
        answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Thêm câu trả lời này vào nội dung khóa học của chúng tôi
      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user?._id === question.user._id) {
        // Tạo thông báo
        await notificationModel.create({
          user: req.user?._id,
          title: "Đã nhận được câu trả lời câu hỏi mới",
          message: `Bạn có câu trả lời câu hỏi mới trong ${couseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: couseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Thêm đánh giá trong khóa học
interface IAddReviewData {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;

      const courseId = req.params.id;


      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId.toString()
      );

      if (!courseExists) {
        return next(
          new ErrorHandler("Bạn không đủ điều kiện để tham gia khóa học này", 404)
        );
      }

      const course = await CourseModel.findById(courseId);

      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };

      course?.reviews.push(reviewData);
      // Tính toán rating khoá học
      let avg = 0;
      
      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();
      //Cập nhật lại redis phiên người dùng
      await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days


      await notificationModel.create({
        user: req.user?._id,
        title: "Nhận được đánh giá mới",
        message: `${req.user?.name} đã đưa ra đánh giá trong ${course?.name}`,
      });


      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Không tìm thấy khóa học", 404));
      }
      // tìm kiếm đánh giá
      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Không tìm thấy đánh giá", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await course?.save();

      await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

