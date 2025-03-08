import { Request } from "express";
import { IUser } from "../models/user.model";


/**
 * Mở rộng interface Request của Express để bao gồm thuộc tính user.
 * 
 * Điều này cho phép truy cập thuộc tính user trên đối tượng Request
 * mà không gặp lỗi TypeScript. Thuộc tính user sẽ chứa thông tin người dùng
 * đã được xác thực.
 */
declare global {
    namespace Express {
      interface Request {
        user: IUser;
      }
    }
  
}