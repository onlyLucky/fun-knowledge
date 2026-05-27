import Taro from '@tarojs/taro'
import { storage, router } from './platform'

// ============================================
// HTTP 请求封装
// ============================================

const BASE_URL = 'http://localhost:3000/api'

const AUTH_ENDPOINTS = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/sms/send',
  '/v1/auth/refresh'
]

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(undefined)
    }
  })
  failedQueue = []
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

function buildQueryString(params: Record<string, any>): string {
  const parts: string[] = []
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    }
  })
  return parts.join('&')
}

async function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = true,
    showError = true
  } = options

  const token = await storage.get<string>('access_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true })
  }

  let requestUrl = `${BASE_URL}${url}`
  let requestData = data

  if (method === 'GET' && data && Object.keys(data).length > 0) {
    const queryString = buildQueryString(data)
    if (queryString) {
      requestUrl = `${requestUrl}?${queryString}`
    }
    requestData = undefined
  }

  try {
    const response = await Taro.request({
      url: requestUrl,
      method,
      data: requestData,
      header: headers,
      timeout: 10000
    })

    if (showLoading) {
      Taro.hideLoading()
    }

    const { statusCode, data: body } = response

    // 处理 401
    if (statusCode === 401 && !AUTH_ENDPOINTS.some((ep) => url.includes(ep))) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => request<T>(options))
      }

      isRefreshing = true

      const refreshToken = await storage.get<string>('refresh_token')
      if (!refreshToken) {
        await clearAuth()
        router.replace('/pages/auth/welcome/index')
        return Promise.reject(new Error('未登录'))
      }

      try {
        const refreshResponse = await Taro.request({
          url: `${BASE_URL}/v1/auth/refresh`,
          method: 'POST',
          data: { refresh_token: refreshToken },
          header: { 'Content-Type': 'application/json' }
        })

        const tokens = refreshResponse.data?.data?.tokens
        if (tokens) {
          await storage.set('access_token', tokens.accessToken)
          if (tokens.refreshToken) {
            await storage.set('refresh_token', tokens.refreshToken)
          }
        }

        processQueue(null)
        return request<T>(options)
      } catch (refreshError) {
        processQueue(refreshError)
        await clearAuth()
        router.replace('/pages/auth/welcome/index')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 处理业务错误
    if (body.code !== undefined && body.code !== 200) {
      const msg = body.message || '请求失败'
      if (showError) {
        Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
      }
      return Promise.reject(new Error(msg))
    }

    return body.data !== undefined ? body.data : body
  } catch (error: any) {
    if (showLoading) {
      Taro.hideLoading()
    }

    const msg = error.message || '网络异常，请稍后重试'
    if (showError) {
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
    }
    return Promise.reject(error)
  }
}

async function clearAuth() {
  await storage.remove('access_token')
  await storage.remove('refresh_token')
  await storage.remove('auth_user')
}

// ============================================
// HTTP 方法
// ============================================

export const http = {
  get: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'GET', data, ...options }),

  post: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'POST', data, ...options }),

  put: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'PUT', data, ...options }),

  delete: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) =>
    request<T>({ url, method: 'DELETE', data, ...options })
}

export default http
