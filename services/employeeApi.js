import { API } from "../utils/api";

export const registerEmployee = async (formData) => {
  const response = await API.post("/employees/register", formData, {
    withCredentials: true,
  });
  return response.data;
};

export const loginEmployee = async (formData) => {
  const response = await API.post("/employees/login", formData, {
    withCredentials: true,
  });
  return response.data;
};

export const getEmployeeProfile = async () => {
  const response = await API.get("/employees/profile", {
    withCredentials: true,
  });
  return response.data;
};

export const logoutEmployee = async () => {
  const response = await API.post("/employees/logout", {
    withCredentials: true,
  });
  return response.data;
};