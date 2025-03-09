import mongoose, { Document, Model, Schema } from "mongoose";


export interface INotification extends Document {
  title: string;
  message: string;
  status: string;
  userId: mongoose.Schema.Types.ObjectId;
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const notificationModel: Model<INotification> = mongoose.model("Notification", notificationSchema);

export default notificationModel;