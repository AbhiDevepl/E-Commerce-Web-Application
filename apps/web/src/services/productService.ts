import api from "./api";

export const fetchProducts = (params?: {
  search?: string;
  category?: string;
  sort?: string;
}) => api.get("/products", { params }).then((r) => r.data);

export const fetchProductById = (id: string) =>
  api.get(`/products/${id}`).then((r) => r.data);

export const createProduct = (data: FormData | Record<string, unknown>) =>
  api.post("/products", data).then((r) => r.data);

export const updateProduct = (
  id: string,
  data: FormData | Record<string, unknown>
) => api.put(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`).then((r) => r.data);
