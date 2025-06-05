import { io } from "socket.io-client";

const socketUrl = process.env.REACT_APP_SOCKET_URL;
const path = process.env.REACT_APP_PATH;

const socket = io(socketUrl, {
    path: path,
    transports: ["polling", "websocket"],
    reconnection: true,
    secure: true,
    rejectUnauthorized: false,
});

export default socket;
