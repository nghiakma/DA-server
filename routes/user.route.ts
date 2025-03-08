import express from "express";
import {
    activeUser,
    loginUser,
    registrationUser
} from "../controllers/user.controller";
import { authorizeRoles } from "../middleware/auth";

export const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activeUser);
userRouter.post("/login", loginUser);