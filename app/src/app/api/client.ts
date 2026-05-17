import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Request interceptor: attach JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap { code, message, data }, handle 401
client.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code !== undefined && body.code !== 200) {
      return Promise.reject(new Error(body.message || 'Request failed'));
    }
    return body.data !== undefined ? body.data : body;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/welcome';
    }
    return Promise.reject(error);
  }
);

export default client;
