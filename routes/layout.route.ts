import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { createLayout } from "../controllers/layout.controller";
export const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isAutheticated,authorizeRoles("admin"), createLayout);