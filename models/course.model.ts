import mongoose, { Document, Model, Schema } from "mongoose";
import { ICourseData } from "./courseData.mode";
import { IReview } from "./review.model";


export interface ICourse extends Document {
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseData[];
  ratings?: number;
  purchased: number;
}


export const courseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  thumbnail: {
    url: {
      type: String,
    },
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }
  ],
  courseData: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseData",
    }
  ],
  ratings: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });


const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);

export default CourseModel;
