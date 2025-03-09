import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IReview extends Document {
    user: mongoose.Schema.Types.ObjectId | IUser;
    rating?: number;
    comment: string;
    commentReplies?: IReview[];
}

const reviewSchema = new Schema<IReview>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    rating: {
        type: Number,
        default: 0,
    },
    comment: {
        type: String,
    },
    commentReplies: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
}, { timestamps: true });

export const CommentModel = mongoose.model<IReview>("Review", reviewSchema);