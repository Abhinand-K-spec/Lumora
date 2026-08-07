import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            if (
                originalRequest.url === "/auth/refresh" 
                ||originalRequest.url === "/auth/login"
                ||originalRequest.url === "/auth/register") {

                return Promise.reject(error);
            }

            try {
                await api.post("/auth/refresh");

                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        if (axios.isAxiosError(error) && !error.response) {
            toast.error("Unable to connect to the server.");
        }

        return Promise.reject(error);
    }
);

export default api;