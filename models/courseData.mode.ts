import mongoose, { Document, Schema } from "mongoose";
import { ILink } from "./link.model";
import { IQuizz } from "./quizz.model";
import { IComment } from "./comment.model";

export interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  iquizz: IQuizz[];
  questions: IComment[];
}

const courseDataSchema = new Schema<ICourseData>({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  videoThumbnail: {
    type: Object,
  },
  videoSection: {
    type: String,
  },
  videoLength: {
    type: Number,
  },
  videoPlayer: {
    type: String,
  },
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Link",
  }],
  suggestion: {
    type: String,
  },
  iquizz: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quizz",
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
}, { timestamps: true });

export const CourseDataModel = mongoose.model<ICourseData>("CourseData", courseDataSchema);