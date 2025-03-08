import express from "express";
import {
    activeUser,
    loginUser,
    logoutUser,
    registrationUser
} from "../controllers/user.controller";
import { isAutheticated,authorizeRoles } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activeUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAutheticated, logoutUser);