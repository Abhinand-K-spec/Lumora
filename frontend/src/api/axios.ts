import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url === "/auth/refresh" ||
        originalRequest.url === "/auth/login" ||
        originalRequest.url === "/auth/register"
      ) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      await api.post('/auth/refresh');

      return api(originalRequest);
    }
    if (axios.isAxiosError(error) && !error.response) {
      toast.error("Unable to connect to the server.");
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;