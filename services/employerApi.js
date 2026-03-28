import { API } from "../utils/api";
import { setStoredEmployerToken } from "../utils/authStorage";

export const registerEmployer = async (formData) => {
  const res = await API.post("/employers/register", formData, {
    withCredentials: true,
  });
  return res.data;
};

export const loginEmployer = async (formData) => {
  const res = await API.post("/employers/login", formData, {
    withCredentials: true,
  });
  if (res.data?.token) {
    setStoredEmployerToken(res.data.token);
  }
  return res.data;
};

export const getEmployerProfile = async () => {
  const res = await API.get("/employers/profile", {
    withCredentials: true,
  });
  return res.data;
};
