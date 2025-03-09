import express from "express";
import {
    addWishCourse,
} from "../controllers/wishlist.controller";
import {
    isAutheticated
} from "../middleware/auth";

export const wishListRouter = express.Router();

wishListRouter.post('/wishlist', isAutheticated, addWishCourse);


