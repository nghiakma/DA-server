import express from "express";
import { upload } from "../utils/multer"
import {
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAutheticated,
  authorizeRoles("admin"),
  upload.fields([{ name: 'image' }, { name: 'demo' }, { name: 'videos' }]),
  uploadCourse
);
