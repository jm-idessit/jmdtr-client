import { API } from "../utils/api";
import { clearEmployeeToken, setStoredEmployeeToken } from "../utils/authStorage";

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
  if (response.data?.token) {
    setStoredEmployeeToken(response.data.token);
  }
  return response.data;
};

export const getEmployeeProfile = async () => {
  const response = await API.get("/employees/profile", {
    withCredentials: true,
  });
  return response.data;
};

export const logoutEmployee = async () => {
  try {
    const response = await API.post("/employees/logout", {
      withCredentials: true,
    });
    return response.data;
  } finally {
    clearEmployeeToken();
  }
};