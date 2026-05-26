# FunFact 多端适配设计方案

## Context

FunFact 是一款面向碎片化学习场景的微信小程序，以图文卡片形式向用户推送涵盖生活、大自然、科学、数学、历史等多个类目的小知识。当前项目为纯 React Web 应用（React 18 + Vite + Tailwind CSS），需要改造为支持 H5、微信小程序、抖音小程序、安卓、iOS、鸿蒙 HarmonyOS 等平台的多端应用。

**核心问题**：现有代码大量使用 Web 特有 API（localStorage、document、window、Canvas、createPortal），以及 Motion 动画库（332 处使用），需要全面适配。

**目标**：使用 Taro 4.x 框架，实现一套代码覆盖所有平台，保持现有功能完整性。

---

## 一、项目结构

```
FunFact/
├── app/                    # 现有 React Web 项目（保留作为参考）
├── app-taro/              # 新建 Taro 4.x 多端项目
│   ├── src/
│   │   ├── pages/         # 页面（从 app 迁移）
│   │   ├── components/    # 组件（从 app 迁移）
│   │   ├── stores/        # Zustand 状态管理
│   │   ├── services/      # API 服务层（复用 app 代码）
│   │   ├── utils/         # 工具函数
│   │   ├── assets/        # 静态资源
│   │   ├── styles/        # 样式文件（Less）
│   │   └── app.tsx        # 应用入口
│   ├── config/            # Taro 配置
│   ├── types/             # TypeScript 类型
│   └── package.json
├── docs/                  # 文档
└── README.md
```

---

## 二、技术栈选型

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| **框架** | Taro 4.x + React 18 | 跨平台核心 |
| **语言** | TypeScript | 类型安全 |
| **构建** | Vite | Taro 4.x 默认 |
| **样式** | Less | 替代 Tailwind CSS |
| **状态管理** | Zustand | 替代 Context API |
| **动画** | CSS + Lottie | 混合方案 |
| **组件库** | Taro UI + 自定义 | 混合方案 |
| **HTTP** | Taro.request | 替代 axios |
| **存储** | Taro.setStorage | 替代 localStorage |
| **图标** | lucide-react-taro | 跨平台图标 |

---

## 三、支持平台

| 平台 | 编译类型 | 输出目录 | 说明 |
|------|---------|---------|------|
| **H5** | `h5` | `dist/h5/` | 替换现有 H5 版本 |
| **微信小程序** | `weapp` | `dist/weapp/` | 原生支持 |
| **抖音小程序** | `tt` | `dist/tt/` | 原生支持 |
| **Android** | `rn` | `android/` | React Native |
| **iOS** | `rn` | `ios/` | React Native |
| **鸿蒙** | `harmony_cpp` | 鸿蒙工程目录 | C-API 高性能方案 |

---

## 四、迁移策略

### 4.1 组件层迁移

**HTML 标签 → Taro 组件**：

| React Web | Taro 组件 | 说明 |
|-----------|----------|------|
| `<div>` | `<View>` | 容器 |
| `<span>`/`<p>` | `<Text>` | 文本 |
| `<img>` | `<Image>` | 图片 |
| `<input>` | `<Input>` | 输入框 |
| `<button>` | `<Button>` | 按钮 |
| `<scroll>` | `<ScrollView>` | 滚动容器 |

### 4.2 样式层迁移

**Tailwind CSS → Less**：

```less
// 现有 Tailwind CSS
<div className="flex items-center p-4 bg-white">

// 迁移后 Less
<View className="container">
<style lang="less">
.container {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #fff;
}
</style>
```

### 4.3 动画层迁移

**Motion → CSS + Lottie**：

```tsx
// 现有 Motion 动画
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// 迁移后 CSS 动画
<View className="fade-in">
<style lang="less">
.fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

// 复杂动画使用 Lottie
import Lottie from 'lottie-taro'
<Lottie animationData={animationData} />
```

### 4.4 状态管理迁移

**Context API → Zustand**：

```tsx
// 现有 Context API
const AuthContext = createContext<AuthContextType>(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // ...
}

// 迁移后 Zustand
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: async (credentials) => {
    // 登录逻辑
    set({ user, token })
  },
  logout: () => {
    set({ user: null, token: null })
  }
}))
```

### 4.5 接口请求方案

**axios → Taro.request**：

现有项目使用 axios 作为 HTTP 客户端，封装了 JWT 认证、Token 刷新、全局 Loading、错误处理等功能。迁移方案如下：

```typescript
// src/utils/http.ts
import Taro from '@tarojs/taro'
import { storage } from './platform'
import { navigateTo } from './platform'

const BASE_URL = 'http://localhost:3000/api'

// Auth endpoints that should not trigger redirect on 401
const AUTH_ENDPOINTS = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/sms/send', '/v1/auth/refresh']

// Token refresh state
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(undefined)
    }
  })
  failedQueue = []
}

// 统一请求封装
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
}

export const request = async <T = any>(options: RequestOptions): Promise<T> => {
  const { url, method = 'GET', data, header = {}, showLoading = true } = options

  // 获取 token
  const token = await storage.get('access_token')

  // 构建请求头
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 显示加载提示
  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true })
  }

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
      timeout: 10000,
    })

    // 隐藏加载提示
    if (showLoading) {
      Taro.hideLoading()
    }

    const { statusCode, data: body } = response

    // 处理 401 错误
    if (statusCode === 401 && !AUTH_ENDPOINTS.some((ep) => url.includes(ep))) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => request<T>(options))
      }

      isRefreshing = true

      const refreshToken = await storage.get('refresh_token')
      if (!refreshToken) {
        // No refresh token, redirect to login
        await storage.remove('access_token')
        await storage.remove('refresh_token')
        await storage.remove('auth_user')
        navigateTo('/pages/auth/welcome/index')
        return Promise.reject(new Error('未登录'))
      }

      try {
        // Call refresh endpoint
        const refreshResponse = await Taro.request({
          url: `${BASE_URL}/v1/auth/refresh`,
          method: 'POST',
          data: { refresh_token: refreshToken },
          header: { 'Content-Type': 'application/json' },
        })

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data.tokens
        await storage.set('access_token', accessToken)
        if (newRefreshToken) {
          await storage.set('refresh_token', newRefreshToken)
        }

        processQueue(null)
        // Retry the original request
        return request<T>(options)
      } catch (refreshError) {
        processQueue(refreshError)
        // Refresh failed, redirect to login
        await storage.remove('access_token')
        await storage.remove('refresh_token')
        await storage.remove('auth_user')
        navigateTo('/pages/auth/welcome/index')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 处理业务错误
    if (body.code !== undefined && body.code !== 200) {
      const msg = body.message || '请求失败'
      Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
      return Promise.reject(new Error(msg))
    }

    return body.data !== undefined ? body.data : body
  } catch (error: any) {
    // 隐藏加载提示
    if (showLoading) {
      Taro.hideLoading()
    }

    // 处理网络错误
    const msg = error.message || '网络异常，请稍后重试'
    Taro.showToast({ title: msg, icon: 'none', duration: 2000 })
    return Promise.reject(error)
  }
}

// 便捷方法
export const http = {
  get: <T = any>(url: string, data?: any) => request<T>({ url, method: 'GET', data }),
  post: <T = any>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T = any>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  delete: <T = any>(url: string, data?: any) => request<T>({ url, method: 'DELETE', data }),
}

export default http
```

**API 服务层迁移示例**：

```typescript
// src/services/auth.service.ts
import { http } from '../utils/http'

export const authService = {
  // 登录
  login: (data: { phone: string; code: string }) => {
    return http.post('/v1/auth/login', data)
  },

  // 注册
  register: (data: { phone: string; code: string; nickname: string }) => {
    return http.post('/v1/auth/register', data)
  },

  // 发送短信
  sendSms: (data: { phone: string }) => {
    return http.post('/v1/auth/sms/send', data)
  },

  // 获取用户信息
  getProfile: () => {
    return http.get('/v1/user/profile')
  },

  // 更新用户信息
  updateProfile: (data: any) => {
    return http.put('/v1/user/profile', data)
  },

  // 上传头像
  uploadAvatar: async (filePath: string) => {
    const token = await storage.get('access_token')
    const response = await Taro.uploadFile({
      url: `${BASE_URL}/v1/user/avatar`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`,
      },
    })
    return JSON.parse(response.data)
  },
}
```

### 4.6 平台差异抽象

**统一 API 封装**：

```typescript
// src/utils/platform.ts
import Taro from '@tarojs/taro'

export const isWeapp = process.env.TARO_ENV === 'weapp'
export const isTT = process.env.TARO_ENV === 'tt'
export const isRN = process.env.TARO_ENV === 'rn'
export const isHarmony = process.env.TARO_ENV === 'harmony'

// 统一存储
export const storage = {
  get: async (key: string) => {
    try {
      const res = await Taro.getStorage({ key })
      return res.data
    } catch {
      return null
    }
  },
  set: async (key: string, value: any) => {
    await Taro.setStorage({ key, data: value })
  },
  remove: async (key: string) => {
    await Taro.removeStorage({ key })
  }
}

// 统一路由
export const navigateTo = (url: string) => {
  Taro.navigateTo({ url })
}

// 统一登录
export const login = async (): Promise<string> => {
  if (isWeapp) {
    const { code } = await Taro.login()
    return code
  }
  if (isTT) {
    const { code } = await Taro.login({ force: true })
    return code
  }
  // RN、鸿蒙等其他平台
  return ''
}
```

---

## 五、关键文件迁移清单

### 5.1 核心页面（优先迁移）

| 页面 | 文件路径 | 复杂度 | 说明 |
|------|---------|--------|------|
| 首页 | `pages/home/Home.tsx` | 高 | 知识卡片流、动画 |
| 发现 | `pages/discover/Discover.tsx` | 中 | 搜索、热搜 |
| 个人中心 | `pages/profile/Profile.tsx` | 中 | 用户信息、签到 |
| 登录 | `pages/auth/login/LoginPage.tsx` | 中 | 表单、验证 |
| 注册 | `pages/auth/register/RegisterPage.tsx` | 中 | 表单、验证 |

### 5.2 核心组件（优先迁移）

| 组件 | 文件路径 | 依赖 | 说明 |
|------|---------|------|------|
| Layout | `components/Layout.tsx` | react-router | 主布局 |
| PageHeader | `components/PageHeader.tsx` | motion, lucide | 页面头部 |
| KnowledgeCard | `components/KnowledgeCard.tsx` | motion, lucide | 知识卡片 |
| AIBottomSheet | `components/AIBottomSheet.tsx` | motion, createPortal | AI 弹窗 |
| GlobalLoading | `components/GlobalLoading.tsx` | motion | 全局加载 |

### 5.3 工具库迁移

| 工具 | 现有方案 | 迁移方案 | 说明 |
|------|---------|---------|------|
| HTTP | axios | Taro.request | 统一请求 |
| 存储 | localStorage | Taro.setStorage | 统一存储 |
| 路由 | react-router | Taro 路由 | 统一路由 |
| 日期 | date-fns | date-fns | 可复用 |
| 图标 | lucide-react | lucide-react-taro | 跨平台图标 |
| 样式 | Tailwind CSS | Less | 样式迁移 |

---

## 六、时间线规划

| 阶段 | 周期 | 关键产出 |
|------|------|---------|
| **Phase 1** | Week 1 | Taro 项目初始化、环境搭建、五端编译验证 |
| **Phase 2** | Week 2-3 | 核心页面迁移（首页、发现、个人中心） |
| **Phase 3** | Week 4-5 | 其他页面迁移、组件库建设 |
| **Phase 4** | Week 6-7 | 平台差异处理、原生能力集成 |
| **Phase 5** | Week 8-9 | 测试、性能优化、Bug 修复 |
| **Phase 6** | Week 10 | 上线发布 |
| **总计** | **10 周** | |

---

## 七、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|---------|
| **动画迁移复杂** | 高 | 简单动画用 CSS，复杂动画用 Lottie，必要时降级 |
| **第三方库不兼容** | 中 | 优先使用 Taro 生态库，不兼容的自行封装 |
| **鸿蒙支持有限** | 中 | 使用 Taro 4.x C-API 方案，京东已验证 |
| **小程序包体积** | 中 | 启用分包、图片 CDN、懒加载 |
| **五端 UI 差异** | 中 | 建立设计规范、使用条件编译 |

---

## 八、验证标准

1. **功能验证**：所有页面在 H5、微信、抖音、安卓、iOS、鸿蒙上功能正常
2. **性能验证**：页面加载时间 < 3s，动画流畅 60fps
3. **兼容性验证**：各平台真机测试通过
4. **代码质量**：TypeScript 类型覆盖 > 90%，无严重 Bug

---

## 九、关键配置示例

### 9.1 Taro 配置

```typescript
// config/index.ts
import path from 'path'
import os from 'os'

const config = {
  projectName: 'funfact-taro',
  date: '2026-5-26',
  designWidth: 750,
  deviceRatio: { 750: 1 },

  // 多端编译配置
  plugins: [
    ['@tarojs/plugin-platform-harmony-cpp', {}]
  ],

  // 鸿蒙工程输出路径
  harmony: {
    projectPath: path.join(os.homedir(), 'HarmonyProjects/FunFact'),
    hapName: 'entry',
  },

  // RN 配置
  rn: {
    appName: 'FunFact',
    output: {
      ios: './ios',
      android: './android'
    }
  }
}

export default config
```

### 9.2 构建脚本

```json
{
  "scripts": {
    "dev:h5": "taro build --type h5 --watch",
    "dev:weapp": "taro build --type weapp --watch",
    "dev:tt": "taro build --type tt --watch",
    "dev:rn": "taro build --type rn --watch",
    "dev:harmony": "taro build --type harmony_cpp --watch",

    "build:h5": "taro build --type h5",
    "build:weapp": "taro build --type weapp",
    "build:tt": "taro build --type tt",
    "build:rn": "taro build --type rn",
    "build:harmony": "taro build --type harmony_cpp",

    "build:all": "npm run build:h5 && npm run build:weapp && npm run build:tt && npm run build:rn && npm run build:harmony"
  }
}
```

---

## 十、总结

本方案采用 Taro 4.x 框架，通过以下策略实现多端适配：

1. **组件层**：HTML 标签替换为 Taro 组件（View、Text、Image 等）
2. **样式层**：Tailwind CSS 迁移为 Less
3. **动画层**：Motion 迁移为 CSS + Lottie 混合方案
4. **状态管理**：Context API 迁移为 Zustand
5. **平台差异**：通过条件编译和统一 API 封装抹平差异

预计 10 周完成全量迁移，实现一套代码覆盖 H5、微信小程序、抖音小程序、安卓、iOS、鸿蒙六端。
