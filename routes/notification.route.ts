import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
export const notificationRoute = express.Router();

notificationRoute.get(
    "/get-all-notifications",
    isAutheticated,
    authorizeRoles("admin"),
    getNotifications
);

notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin"), updateNotification);
