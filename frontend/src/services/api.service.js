import axios from "axios";

const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export default (baseURL) => {
  const api = axios.create({
    baseURL,
    ...commonConfig,
  });

  // tự gắn Authorization từ localStorage
  api.interceptors.request.use((config) => {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return api;
};
