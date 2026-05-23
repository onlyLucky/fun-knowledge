import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { globalLoading } from './global-loading';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// Auth endpoints that should not trigger redirect on 401
const AUTH_ENDPOINTS = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/sms/send', '/v1/auth/refresh'];

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track active requests for global loading indicator
client.interceptors.request.use((config) => {
  globalLoading.start();
  return config;
});

// Response interceptor: unwrap { code, message, data }, handle errors
client.interceptors.response.use(
  (res) => {
    globalLoading.stop();
    const body = res.data;
    if (body.code !== undefined && body.code !== 200) {
      const msg = body.message || '请求失败';
      toast.error(msg);
      return Promise.reject(new Error(msg));
    }
    return body.data !== undefined ? body.data : body;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 with token refresh for non-auth endpoints
    if (status === 401 && !AUTH_ENDPOINTS.some((ep) => url.includes(ep)) && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        globalLoading.stop();
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          globalLoading.start();
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        globalLoading.stop();
        window.location.href = '/welcome';
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint directly to avoid interceptor loop
        const response = await axios.post(
          `${client.defaults.baseURL}/v1/auth/refresh`,
          { refresh_token: refreshTokenValue }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        localStorage.setItem('access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        processQueue(null);
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        globalLoading.stop();
        window.location.href = '/welcome';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const msg =
      error.response?.data?.message ||
      (status === 401 ? '账号或密码错误' :
       status === 403 ? '没有权限' :
       status === 404 ? '请求的资源不存在' :
       status === 500 ? '服务器错误' :
       '网络异常，请稍后重试');
    toast.error(msg);
    // 非重试请求才停止 loading（401 重试的 stop 在重试完成后触发）
    if (!originalRequest._retry) globalLoading.stop();
    return Promise.reject(error);
  }
);

export default client;
