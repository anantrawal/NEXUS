import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// ─── Response interceptor: handle 401 / token refresh ────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: (token) => api.post('/api/auth/refresh', { refreshToken: token }),
};

// ─── Products ────────────────────────────────────────────────────
export const productAPI = {
  getAll:      (params) => api.get('/api/products', { params }),
  getById:     (id) => api.get(`/api/products/${id}`),
  getCategory: (cat, params) => api.get(`/api/products/category/${cat}`, { params }),
  search:      (keyword, params) => api.get('/api/products/search', { params: { keyword, ...params } }),
  getFeatured: () => api.get('/api/products/featured'),
};

// ─── Cart ────────────────────────────────────────────────────────
export const cartAPI = {
  getCart:        () => api.get('/api/cart'),
  addItem:        (item) => api.post('/api/cart/items', item),
  updateQuantity: (productId, quantity) => api.put(`/api/cart/items/${productId}`, { quantity }),
  removeItem:     (productId) => api.delete(`/api/cart/items/${productId}`),
  clearCart:      () => api.delete('/api/cart'),
  applyCoupon:    (couponCode) => api.post('/api/cart/coupon', { couponCode }),
};

// ─── Orders ──────────────────────────────────────────────────────
export const orderAPI = {
  placeOrder:   (data) => api.post('/api/orders', data),
  getOrder:     (id) => api.get(`/api/orders/${id}`),
  getUserOrders:(params) => api.get('/api/orders', { params }),
  cancelOrder:  (id) => api.post(`/api/orders/${id}/cancel`),
};

export default api;
