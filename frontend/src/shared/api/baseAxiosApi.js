import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 180000,
  withCredentials: true, // important: sends HTTP-only cookies automatically
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  },
});
