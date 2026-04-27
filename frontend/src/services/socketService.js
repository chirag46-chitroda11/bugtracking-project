import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        const socketUrl = import.meta.env.PROD 
            ? "https://fixify-backend-1wfo.onrender.com" 
            : "http://localhost:5000";
            
        socket = io(socketUrl, { 
            transports: ["websocket", "polling"],
            withCredentials: true 
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
