import { Server as SocketIOServer } from "socket.io";
import http from "http";

/**
 * Khởi tạo máy chủ Socket.IO và thiết lập các sự kiện kết nối.
 * 
 * @param server - Máy chủ HTTP để tích hợp với Socket.IO.
 */
export const initSocketServer = (server: http.Server) => {
    const io = new SocketIOServer(server);
  
    io.on("connection", (socket) => {
      console.log("Người dùng đã kết nối ");
       /**
         * Lắng nghe sự kiện "notification" từ client và phát lại sự kiện "newNotification" cho tất cả các client.
         * 
         * @param data - Dữ liệu thông báo từ client.
         */
  
        socket.on("notification", (data) => {

        io.emit("newNotification", data);
      });
  
      socket.on("disconnect", () => {
        console.log("Người dùng đã ngắt kết nối");
      });
    });
  };