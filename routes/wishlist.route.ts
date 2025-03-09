import express from "express";
import {
    addWishCourse,
    fetchWishListOfUser,
} from "../controllers/wishlist.controller";
import {
    isAutheticated
} from "../middleware/auth";

export const wishListRouter = express.Router();

wishListRouter.post('/wishlist', isAutheticated, addWishCourse);

wishListRouter.get('/wishlist', isAutheticated, fetchWishListOfUser);


