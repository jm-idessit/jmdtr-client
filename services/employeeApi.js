import { API } from "../utils/api";

export const registerEmployee = async (formData) => {
  const response = await API.post("/employees/register", formData);
  return response.data;
};

export const loginEmployee = async (formData) => {
  const response = await API.post("/employees/login", formData);
  return response.data;
};

export const getEmployeeProfile = async () => {
  const response = await API.get("/employees/profile");
  return response.data;
};
