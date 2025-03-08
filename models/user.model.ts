import { isEmail } from './../node_modules/@types/validator/index.d';
import dotenv from "dotenv";
dotenv.config();
import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
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