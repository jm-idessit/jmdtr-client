import axios from "axios";
import {
  DTR_EMPLOYEE_TOKEN_KEY,
  DTR_EMPLOYER_TOKEN_KEY,
} from "./authStorage.js";

const getBaseURL = () => {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    const u = fromEnv.trim().replace(/\/$/, "");
    return u.endsWith("/api") ? u : `${u}/api`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://jm-api-r73i.onrender.com/api";
  }
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const path = window.location.pathname || "";
  if (path.startsWith("/employee")) {
    const t = localStorage.getItem(DTR_EMPLOYEE_TOKEN_KEY);
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
  } else if (path.startsWith("/employer")) {
    const t = localStorage.getItem(DTR_EMPLOYER_TOKEN_KEY);
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
  }
  return config;
});

export { API, getBaseURL };
