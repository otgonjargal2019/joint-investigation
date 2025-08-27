import axios from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;
const contentType = "application/json; text/plain; charset=UTF-8";

const headersData = {
  "X-Requested-With": "XMLHttpRequest",
  "Content-Type": contentType,
};

export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 180000,
  headers: headersData,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const jwt = Cookies.get("access_token");
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      } else {
        config.headers.Authorization = null;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);
