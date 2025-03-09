import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface IComment extends Document {
  user: mongoose.Schema.Types.ObjectId | IUser;
  question: string;
  questionReplies: IComment[];
}

const commentSchema = new Schema<IComment>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {
    type: String,
  },
  questionReplies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
}, { timestamps: true });

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema);