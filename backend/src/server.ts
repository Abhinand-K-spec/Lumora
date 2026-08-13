import { connectDB } from './shared/config/database.js';
import app from './app.js';
import { connectRedis } from './shared/config/redis.js';


const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
    try {
        await connectRedis();
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};


startServer();
