import express from "express";
import { upload } from "../utils/multer"
import {
  editCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
export const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAutheticated,
  authorizeRoles("admin"),
  upload.fields([{ name: 'image' }, { name: 'demo' }, { name: 'videos' }]),
  uploadCourse
);

courseRouter.put(
  "/edit-course/:id",
  isAutheticated,
  authorizeRoles("admin"),
  upload.fields([{ name: 'imageedit' }, { name: 'demoedit' }, { name: 'videos' }]),
  editCourse
);