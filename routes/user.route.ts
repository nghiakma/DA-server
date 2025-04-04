import express from "express";
import {
    activeUser,
    createNoteByCourseDataIdOfUser,
    deleteSingleNoteInNoteByCourseDataIdOfUser,
    deleteUser,
    getAllUsers,
    getNotesByCourseDataIdOfUser,
    getProgessOfUser,
    getUserInfo,
    loginUser,
    logoutUser,
    markChapterAsCompletedOfUser,
    registrationUser,
    sendCertificateAfterCourse,
    updateAccessToken,
    updatePassword,
    updateProfilePicture,
    updateSingleNoteInNoteByCourseDataIdOfUser,
    updateUserInfo,
    updateUserRole
} from "../controllers/user.controller";
import { isAutheticated,authorizeRoles } from "../middleware/auth";
import { upload } from "../utils/multer";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activeUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAutheticated, logoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAutheticated, getUserInfo);
userRouter.put("/update-user-info", isAutheticated, updateUserInfo);
userRouter.put("/update-user-password", isAutheticated, updatePassword);
userRouter.put("/update-user-avatar", isAutheticated, upload.single('avatar'), updateProfilePicture);
userRouter.get(
    "/get-users",
    isAutheticated,
    authorizeRoles("admin"),
    getAllUsers
  );
userRouter.delete(
    "/delete-user/:id",
    isAutheticated,
    authorizeRoles("admin"),
    deleteUser
  );
userRouter.put(
    "/update-user",
    isAutheticated,
    authorizeRoles("admin"),
    updateUserRole
);

userRouter.get(
  "/user/progress",
  isAutheticated,
  getProgessOfUser
)

userRouter.put(
  "/user/mark-chapter",
  isAutheticated,
  markChapterAsCompletedOfUser
)

userRouter.post(
  "/user/get-certificate",
  isAutheticated,
  sendCertificateAfterCourse
)

// NOTES
userRouter.get(
  "/user/get-list-notes",
  isAutheticated,
  getNotesByCourseDataIdOfUser
)

userRouter.post(
  "/user/create-note-by-courseDataId",
  isAutheticated,
  createNoteByCourseDataIdOfUser
)

userRouter.delete(
  "/user/delete-single-note-id-in-note",
  isAutheticated,
  deleteSingleNoteInNoteByCourseDataIdOfUser
)

userRouter.put(
  "/user/update-single-note-id-in-note",
  isAutheticated,
  updateSingleNoteInNoteByCourseDataIdOfUser
)
  