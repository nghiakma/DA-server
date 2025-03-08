import { NextFunction, Request, Response } from "express";

/**
 * Hàm middleware để bắt lỗi bất đồng bộ trong các controller func.
 * 
 * @param theFunc - Hàm điều khiển bất đồng bộ.
 * @returns Hàm middleware xử lý lỗi.
 */
export const CatchAsyncError = 
(theFunc: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res,next)).catch(next);
}