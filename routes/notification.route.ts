import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { createNotification, getNotifications, updateNotification } from "../controllers/notification.controller";
export const notificationRoute = express.Router();

notificationRoute.get(
    "/get-all-notifications",
    isAutheticated,
    getNotifications
);
notificationRoute.post(
    "/create-notification",
    isAutheticated,
    authorizeRoles("admin"),
    createNotification
);

notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin"), updateNotification);
