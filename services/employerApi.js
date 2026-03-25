import { API } from "../utils/api";

export const registerEmployer = async (formData) => {
  const res = await API.post("/employers/register", formData);
  return res.data;
};

export const loginEmployer = async (formData) => {
  const res = await API.post("/employers/login", formData);
  return res.data;
};

export const getEmployerProfile = async () => {
  const res = await API.get("/employers/profile");
  return res.data;
};
