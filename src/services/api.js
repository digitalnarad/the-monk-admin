// Update your api service file
import axios from "axios";
import storage from "./storage";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const axios_api = axios.create({
  baseURL: baseURL,
  withCredentials: false,
});

// Don't set default Content-Type, let axios handle it based on data type
axios_api.interceptors.request.use(
  (config) => {
    const token = storage.get("token");
    console.log("api - token", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set JSON content-type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

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
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const api = {
  get: (url, params = {}, config = {}) =>
    axios_api.get(url, { params, ...config }),
  post: (url, data = {}, config = {}) => axios_api.post(url, data, config),
  put: (url, data = {}, config = {}) => axios_api.put(url, data, config),
  patch: (url, data = {}, config = {}) => axios_api.patch(url, data, config), // Add patch method
  delete: (url, config = {}) => axios_api.delete(url, config),
  uploadToCloudinary: async (file, folder) => {
    try {
      if (!folder) throw new Error("folder is required");
      if (!file) throw new Error("file is required");

      const form = new FormData();
      form.append("file", file);
      form.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );
      form.append("public_id", `img-${Date.now().toString()}`);
      form.append("folder", folder); // must be allowed by the preset

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );
      if (!res.ok) throw new Error("Cloudinary upload failed");
      return await res.json();
    } catch (error) {
      throw error;
    }
  },
  deleteFromCloudinary: async (deleteToken) => {
    try {
      if (!deleteToken) throw new Error("Delete token is required");

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/delete_by_token`;

      const form = new FormData();
      form.append("token", deleteToken);

      const res = await fetch(url, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error(
          responseData?.error?.message ||
            `Delete failed with status ${res.status}`
        );
      }

      return await res.json();
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw error;
    }
  },
};

export default api;
