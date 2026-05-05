import axios from "axios";
import { API_BASE_URL } from "./api";

export const DEFAULT_USER_ID = "guest";

export async function fetchUserProfile(userId = DEFAULT_USER_ID) {
  const res = await axios.get(`${API_BASE_URL}/user/profile`, { params: { user_id: userId } });
  return res.data;
}

export async function updateUserProfile(userId: string, payload: Record<string, any>) {
  const res = await axios.put(`${API_BASE_URL}/user/profile`, payload, { params: { user_id: userId } });
  return res.data;
}

export async function fetchFavorites(userId = DEFAULT_USER_ID) {
  const res = await axios.get(`${API_BASE_URL}/favorites`, { params: { user_id: userId } });
  return res.data.favorites || [];
}

export async function addFavorite(userId: string, itemId: string) {
  const res = await axios.post(`${API_BASE_URL}/favorites`, { userId, itemId });
  return res.data.favorites || [];
}

export async function fetchPromos() {
  const res = await axios.get(`${API_BASE_URL}/promos/active`);
  return res.data || [];
}

export async function createOrder(payload: Record<string, any>) {
  const res = await axios.post(`${API_BASE_URL}/orders`, payload);
  return res.data;
}

export async function getOrder(orderId: string) {
  const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
  return res.data;
}

export async function updateOrderStatus(orderId: string, status: "received" | "preparing" | "ready") {
  const res = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status });
  return res.data;
}

export async function getOrderHistory(userId = DEFAULT_USER_ID) {
  const res = await axios.get(`${API_BASE_URL}/orders/history`, { params: { user_id: userId } });
  return res.data?.orders || [];
}

export async function reorderOrder(userId: string, orderId: string) {
  const res = await axios.post(`${API_BASE_URL}/orders/reorder`, { userId, orderId });
  return res.data;
}

export async function createReservation(payload: Record<string, any>) {
  const res = await axios.post(`${API_BASE_URL}/reservations`, payload);
  return res.data;
}

export async function setUsualOrder(userId: string, usualOrderPreset: Array<{ itemId: string; quantity: number }>) {
  const res = await axios.post(`${API_BASE_URL}/user/usual-order`, { userId, usualOrderPreset });
  return res.data;
}
