
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import useAuth from "../hooks/useAuth";
import { socket } from "../services/socketService";
import { SocketContext } from "./SocketContext";

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  const userId = user?._id;

  useEffect(() => {
    if (!userId) {
      socket.disconnect();
      setIsConnected(false);
      return;
    }

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error.message);
      setIsConnected(false);
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("Account Suspended")
      ) {
        socket.disconnect();
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
