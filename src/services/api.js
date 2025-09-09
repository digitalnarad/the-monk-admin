import axios from "axios";
import storage from "./storage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const axios_api = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // flip to true if you need cookies
});

axios_api.interceptors.request.use(
  (config) => {
    const token = storage.get("token"); // or Context, Redux, etc.
    console.log("api - token", token);
    if (token) config.headers.Authorization = `Bearer ${token ? token : ""}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axios_api.interceptors.response.use(
  (res) => {
    return {
      status: res.status,
      data: res.data,
    };
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api = {
  get: (url, params = {}, config = {}) =>
    axios_api.get(url, { params, ...config }),
  post: (url, data = {}, config = {}) => axios_api.post(url, data, config),
  put: (url, data = {}, config = {}) => axios_api.put(url, data, config),
  delete: (url, config = {}) => axios_api.delete(url, config),
};
export default api;
