import api from "./api";

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/auth/register", data).then((r) => r.data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post("/auth/login", data).then((r) => r.data);

export const getProfile = () => api.get("/auth/profile").then((r) => r.data);
