import mongoose, { Document, Schema } from "mongoose";

export interface ILink extends Document {
  url: string;
  description: string;
}

const linkSchema = new Schema<ILink>({
  url: {
    type: String,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

export const LinkModel = mongoose.model<ILink>("Link", linkSchema);