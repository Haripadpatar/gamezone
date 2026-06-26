import axios from 'axios';

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if on an admin route or my-orders
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (phone, password) => API.post('/auth/login', { phone, password }),
  register: (name, phone, password) => API.post('/auth/register', { name, phone, password }),
};

// Category Endpoints
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getById: (id) => API.get(`/categories/${id}`),
  adminCreate: (name) => API.post('/admin/categories', { name }),
  adminUpdate: (id, name) => API.put(`/admin/categories/${id}`, { name }),
  adminDelete: (id) => API.delete(`/admin/categories/${id}`),
};

// Product Endpoints
export const productAPI = {
  getAll: () => API.get('/products'),
  getById: (id) => API.get(`/products/${id}`),
  getByCategory: (categoryId) => API.get(`/products/category/${categoryId}`),
  getByRestaurant: (restaurantId) => API.get(`/products/restaurant/${restaurantId}`),
  search: (query, categoryId) => {
    const params = {};
    if (query) params.query = query;
    if (categoryId) params.categoryId = categoryId;
    return API.get('/products/search', { params });
  },
  adminCreate: (productDTO) => API.post('/admin/products', productDTO),
  adminUpdate: (id, productDTO) => API.put(`/admin/products/${id}`, productDTO),
  adminDelete: (id) => API.delete(`/admin/products/${id}`),
  adminUploadImage: (file, productName) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', productName);
    return API.post('/admin/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Restaurant Endpoints
export const restaurantAPI = {
  getAll: () => API.get('/restaurants'),
  getById: (id) => API.get(`/restaurants/${id}`),
  search: (query) => API.get(`/restaurants/search`, { params: { query } }),
  adminGetAll: () => API.get('/admin/restaurants'),
  adminCreate: (data) => API.post('/admin/restaurants', data),
  adminUpdate: (id, data) => API.put(`/admin/restaurants/${id}`, data),
  adminDelete: (id) => API.delete(`/admin/restaurants/${id}`),
  adminGetMerchants: () => API.get('/admin/merchants'),
};

// Order Endpoints
export const orderAPI = {
  place: (orderData) => API.post('/orders/place', orderData),
  track: (orderNumber) => API.get(`/orders/track/${orderNumber}`),
  calculateDelivery: (address, latitude, longitude) => API.post('/orders/calculate-delivery', { address, latitude, longitude }),
  getMyOrders: () => API.get('/orders/my-orders'),
  adminGetAll: () => API.get('/admin/orders'),
  adminUpdateStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { status }),
  adminGetDashboardStats: () => API.get('/admin/orders/dashboard'),
};

// Settings Endpoints
export const settingsAPI = {
  getPublic: () => API.get('/settings/public'),
  adminGet: () => API.get('/admin/settings'),
  adminUpdate: (settingsData) => API.put('/admin/settings', settingsData),
};

export default API;
