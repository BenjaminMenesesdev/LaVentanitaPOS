import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para añadir token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresh token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/refresh', { refresh_token: refresh });
        localStorage.setItem('access_token', response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla refresh, redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function get(path, params) {
  const res = await api.get(path, { params });
  return res.data;
}

export async function post(path, body) {
  const res = await api.post(path, body);
  return res.data;
}

export async function fetchProducts(params) {
  return get('/products', params);
}

export async function createSale(payload) {
  return post('/sales', payload);
}

export async function fetchInventoryAlerts() {
  return get('/inventory/alerts');
}

export async function fetchDashboard() {
  return get('/dashboard');
}

export async function login(credentials) {
  return post('/login', credentials);
}

export async function refreshToken(payload) {
  return post('/refresh', payload);
}

export async function logout() {
  return post('/logout');
}

export default api;
