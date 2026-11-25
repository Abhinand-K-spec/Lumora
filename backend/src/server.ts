import { createServer } from "node:http";
import { connectDB } from "./shared/config/database.js";
import app from "./app.js";
import { connectRedis } from "./shared/config/redis.js";
import { initializeSocket } from "./shared/config/socket.js"

const PORT = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);

const startServer = async () => {
  try {
    await connectRedis();
    await connectDB();

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log("🔌 Socket.IO server initialized");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();