import mongoose, { Document, Schema } from "mongoose";

export interface IQuizz extends Document {
  question: string;
  options: string[];
  answer: string;
}

const quizzSchema = new Schema<IQuizz>({
  question: {
    type: String,
  },
  options: [{
    type: String,
  }],
  answer: {
    type: String,
  },
}, { timestamps: true });

export const QuizzModel = mongoose.model<IQuizz>("Quizz", quizzSchema);