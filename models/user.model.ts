require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { courseSchema, ICourse } from "./course.model";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
courseSchema
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
  notes?: Array<{
    courseId: string,
    courseDataId: string,
    note: Array<{
      subject: string,
      content: string
    }>
  }>
  progress?: Array<{
    courseId: string,
    chapters: Array<{

      chapterId: string,
      isCompleted: boolean

    }>
  }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên của bạn"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email của bạn"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Vui lòng nhập email hợp lệ",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "Mật khẩu phải chứa ít nhất 6 kí tự"],
      select: false,
    },
    avatar: {
      url: String,
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
        courseId: String,
      },
    ],
    cart: [
      {
        courseId: String,
      },
    ],
    notes: [
      {
        courseId: {
          type: String,
          required: false,
        },
        courseDataId: {
          type: String,
          required: false,
        },
        note: [
          {
            subject: {
              type: String,
              required: false
            },
            content: {
              type: String,
              required: false
            }
          }
        ]
      }
    ],
    progress: [
      {
        courseId: {
          type: String,
          required: false,
        },
        chapters: [
          {
            chapterId: {
              type: String,
              required: false,
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

/**
 * Middleware to hash mật khẩu của user trước khi lưu vào db
 * This middleware được kích hoạt khi trường mật khẩu thay đổi
 * This: đang nói đến document đang được lưu
 * @param next - The next middleware trong stack
 */
userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


/**
 * Phương thức để so sánh mật khẩu người dùng đã nhập với mật khẩu đã được lưu trữ.
 * 
 * @param enteredPassword - Mật khẩu người dùng đã nhập.
 * @returns Một Promise trả về true nếu mật khẩu khớp, ngược lại trả về false.
 */
userSchema.methods.comparePassword = async function (
    enteredPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  };

userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
      expiresIn: "5m",
    });
};
  
  
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
      expiresIn: "3d",
    });
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;