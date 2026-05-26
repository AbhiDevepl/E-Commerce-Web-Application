import api from "./api";

export const placeOrder = (data: {
  orderItems: {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
}) => api.post("/orders", data).then((r) => r.data);

export const fetchMyOrders = () =>
  api.get("/orders/my-orders").then((r) => r.data);

export const fetchOrderById = (id: string) =>
  api.get(`/orders/${id}`).then((r) => r.data);

export const fetchAllOrders = () =>
  api.get("/orders").then((r) => r.data);

export const updateOrderStatus = (id: string, status: string) =>
  api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
