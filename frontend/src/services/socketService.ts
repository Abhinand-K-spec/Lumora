import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL;


export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  transports: ["websocket", "polling"],
});
