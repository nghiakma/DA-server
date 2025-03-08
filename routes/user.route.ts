import express from "express";
import {
    activeUser,
    getAllUsers,
    getUserInfo,
    loginUser,
    logoutUser,
    registrationUser,
    updatePassword,
    updateProfilePicture,
    updateUserInfo
} from "../controllers/user.controller";
import { isAutheticated,authorizeRoles } from "../middleware/auth";
import { upload } from "../utils/multer";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activeUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAutheticated, logoutUser);
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