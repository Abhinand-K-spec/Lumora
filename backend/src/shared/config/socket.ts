
import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import * as cookie from "cookie";

import { TokenService } from "../../modules/auth/services/TokenService.js";
import Users from "../models/users.model.js";
import { accountStatus } from "../enums/accountStatus.js";

let io: Server | null = null;

const tokenService = new TokenService();

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      const cookies = cookieHeader
        ? cookie.parse(cookieHeader)
        : {};

      const accessToken =
        cookies.accessToken ||
        (socket.handshake.auth?.token as string | undefined);

      if (!accessToken) {
        return next(new Error("Unauthorized"));
      }

      const decoded = tokenService.verifyAccessToken(accessToken);

      const user = await Users.findById(decoded.id);

      if (!user || !user.refreshToken) {
        return next(new Error("Unauthorized"));
      }

      if (user.accountStatus === accountStatus.Suspended) {
        return next(new Error("Account Suspended"));
      }

      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
      };

      return next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;

    console.log(`Socket connected: ${socket.id}`);

    // Join the authenticated user's personal room
    socket.join(`user:${userId}`);

    console.log(`User ${userId} joined their personal room`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
