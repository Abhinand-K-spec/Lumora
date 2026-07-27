import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === "/admin/auth/refresh" || originalRequest.url === "/admin/auth/login") {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      await adminApi.post('/admin/auth/refresh');

      return adminApi(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default adminApi;
