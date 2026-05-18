import axios from 'axios';
import { toast } from 'sonner';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Auth endpoints that should not trigger redirect on 401
const AUTH_ENDPOINTS = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/sms/send'];

// Request interceptor: attach JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap { code, message, data }, handle errors
client.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body.code !== undefined && body.code !== 200) {
      const msg = body.message || '请求失败';
      toast.error(msg);
      return Promise.reject(new Error(msg));
    }
    return body.data !== undefined ? body.data : body;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Only redirect on 401 for non-auth endpoints
    if (status === 401 && !AUTH_ENDPOINTS.some((ep) => url.includes(ep))) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/welcome';
      return Promise.reject(error);
    }

    const msg =
      error.response?.data?.message ||
      (status === 401 ? '账号或密码错误' :
       status === 403 ? '没有权限' :
       status === 404 ? '请求的资源不存在' :
       status === 500 ? '服务器错误' :
       '网络异常，请稍后重试');
    toast.error(msg);
    return Promise.reject(error);
  }
);

export default client;
