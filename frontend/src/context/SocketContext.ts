import { createContext } from "react";
import type { Socket } from "socket.io-client";

export interface SocketContextType {
  socket: Socket;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | null>(null);
