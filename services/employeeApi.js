import API from "@/utils/api";

export const getEmployeeProfile = async () => {
  const response = await API.get("/employees/profile");
  return response.data;
};