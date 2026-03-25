import axios from "axios";

const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://jm-api-r73i.onrender.com/api";
  }
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  credentials: "include",
});

export { API, getBaseURL };