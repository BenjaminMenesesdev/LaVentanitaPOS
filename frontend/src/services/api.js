import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/refresh`, { refresh_token: refresh });
        localStorage.setItem("access_token", response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

async function get(path, params) {
  const res = await api.get(path, { params });
  return res.data;
}

async function post(path, body) {
  const res = await api.post(path, body);
  return res.data;
}

async function put(path, body) {
  const res = await api.put(path, body);
  return res.data;
}

async function del(path) {
  const res = await api.delete(path);
  return res.data;
}

export async function login(credentials) {
  return post("/login", credentials);
}

export async function logout() {
  return post("/logout");
}

export async function refreshToken(payload) {
  return post("/refresh", payload);
}

export async function fetchMe() {
  return get("/me");
}

export async function fetchProducts(params) {
  return get("/products", params);
}

export async function createSale(payload) {
  return post("/sales", payload);
}

export async function voidSale(saleId, payload) {
  return post(`/sales/${saleId}/void`, payload);
}

export async function fetchInventoryAlerts() {
  return get("/inventory/alerts");
}

export async function fetchStock() {
  return get("/inventory/stock");
}

export async function registerPurchase(itemId, payload) {
  return post(`/inventory/${itemId}/purchase`, payload);
}

export async function registerTransfer(itemId, payload) {
  return post(`/inventory/${itemId}/transfer`, payload);
}

export async function registerWaste(itemId, payload) {
  return post(`/inventory/${itemId}/waste`, payload);
}

export async function notifyLowStock(itemId) {
  return post(`/inventory/${itemId}/notify-low-stock`);
}

export async function fetchDashboard() {
  return get("/dashboard");
}

export async function fetchUsers() {
  return get("/users");
}

export async function createUser(payload) {
  return post("/users", payload);
}

export async function updateUser(userId, payload) {
  return put(`/users/${userId}`, payload);
}

export async function deleteUser(userId) {
  return del(`/users/${userId}`);
}

export async function fetchSuppliers() {
  return get("/suppliers");
}

export async function createSupplier(payload) {
  return post("/suppliers", payload);
}

export async function updateSupplier(supplierId, payload) {
  return put(`/suppliers/${supplierId}`, payload);
}

export async function deleteSupplier(supplierId) {
  return del(`/suppliers/${supplierId}`);
}

export default api;
