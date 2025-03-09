import express from "express";
import {
    activeUser,
    deleteUser,
    getAllUsers,
    getUserInfo,
    loginUser,
    logoutUser,
    registrationUser,
    updateAccessToken,
    updatePassword,
    updateProfilePicture,
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
  