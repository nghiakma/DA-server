import { isEmail } from './../node_modules/@types/validator/index.d';
import dotenv from "dotenv";
dotenv.config();
import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  cart: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Vui lòng nhập tên"],
            trim: true,
            maxLength: [100, "Tên không được vượt quá 100 ký tự"],
        },
        email: {
            type: String,
            required: [true, "Vui lòng nhập email"],
            unique: true,
            validate: [isEmail, "Vui lòng nhập email hợp lệ"],
        },
        password: {
            type: String,
            required: [true, "Vui lòng nhập mật khẩu"],
            minLength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
            select: false,
        },
        avatar: {
            url: String
        },
        role: {
            type: String,
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        courses: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                },
            },
        ],
        cart: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});