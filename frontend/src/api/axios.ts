import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use((response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 &&!originalRequest._retry) {
            originalRequest._retry = true;

            let refreshUrl = "/auth/refresh";

            if (originalRequest.url.startsWith("/admin")) {
                refreshUrl = "/admin/auth/refresh";
            } else if (originalRequest.url.startsWith("/photographer")) {
                refreshUrl = "/photographer/auth/refresh";
            }

            if (
                originalRequest.url === refreshUrl ||
                originalRequest.url.endsWith("/login") ||
                originalRequest.url.endsWith("/register")
            ) {
                return Promise.reject(error);
            }

            await api.post(refreshUrl);

            return api(originalRequest);
        }

        if (axios.isAxiosError(error) && !error.response) {
            toast.error("Unable to connect to the server.");
        }

        return Promise.reject(error);
    }
);

export default api;