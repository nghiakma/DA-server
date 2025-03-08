import express from "express";
import {
    activeUser,
    getUserInfo,
    loginUser,
    logoutUser,
    registrationUser,
    updatePassword,
    updateUserInfo
} from "../controllers/user.controller";
import { isAutheticated,authorizeRoles } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activeUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAutheticated, logoutUser);
userRouter.get("/me", isAutheticated, getUserInfo);
userRouter.put("/update-user-info", isAutheticated, updateUserInfo);
userRouter.put("/update-user-password", isAutheticated, updatePassword);