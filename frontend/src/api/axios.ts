import axios from "axios";

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

    if(error.response?.status===401 && !originalRequest._retry){
      originalRequest._retry = true;

      await api.post('/auth/refresh');

      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;