# FunFact 多端适配迁移实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 React Web 应用迁移为基于 Taro 4.x 的多端应用，支持 H5、微信小程序、抖音小程序、安卓、iOS、鸿蒙 HarmonyOS。

**Architecture:** 使用 Taro 4.x 框架，通过组件层、样式层、动画层、状态管理层的全面迁移，实现一套代码覆盖所有平台。采用 Zustand 替代 Context API，Less 替代 Tailwind CSS，CSS + Lottie 替代 Motion 动画。

**Tech Stack:** Taro 4.x, React 18, TypeScript, Less, Zustand, Taro UI, Lottie

---

## 文件结构

```
app-taro/
├── src/
│   ├── app.tsx                    # 应用入口
│   ├── app.config.ts              # 应用配置
│   ├── pages/
│   │   ├── index/
│   │   │   ├── index.tsx          # 首页
│   │   │   └── index.less         # 首页样式
│   │   ├── discover/
│   │   │   ├── index.tsx          # 发现页
│   │   │   └── index.less
│   │   ├── profile/
│   │   │   ├── index.tsx          # 个人中心
│   │   │   └── index.less
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── index.tsx      # 登录页
│   │   │   │   └── index.less
│   │   │   ├── register/
│   │   │   │   ├── index.tsx      # 注册页
│   │   │   │   └── index.less
│   │   │   └── welcome/
│   │   │       ├── index.tsx      # 欢迎页
│   │   │       └── index.less
│   │   ├── card/
│   │   │   └── [id]/
│   │   │       ├── index.tsx      # 卡片详情
│   │   │       └── index.less
│   │   ├── category/
│   │   │   └── [id]/
│   │   │       ├── index.tsx      # 分类详情
│   │   │       └── index.less
│   │   ├── favorites/
│   │   │   ├── index.tsx          # 收藏列表
│   │   │   └── index.less
│   │   ├── settings/
│   │   │   ├── index.tsx          # 设置页
│   │   │   └── index.less
│   │   └── calendar/
│   │       ├── index.tsx          # 签到日历
│   │       └── index.less
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── index.tsx          # 主布局
│   │   │   └── index.less
│   │   ├── PageHeader/
│   │   │   ├── index.tsx          # 页面头部
│   │   │   └── index.less
│   │   ├── KnowledgeCard/
│   │   │   ├── index.tsx          # 知识卡片
│   │   │   └── index.less
│   │   ├── AIBottomSheet/
│   │   │   ├── index.tsx          # AI 弹窗
│   │   │   └── index.less
│   │   └── GlobalLoading/
│   │       ├── index.tsx          # 全局加载
│   │       └── index.less
│   ├── stores/
│   │   ├── authStore.ts           # 认证状态
│   │   ├── userStore.ts           # 用户状态
│   │   └── favoritesStore.ts      # 收藏状态
│   ├── services/
│   │   ├── auth.service.ts        # 认证服务
│   │   ├── knowledge.service.ts   # 知识服务
│   │   ├── category.service.ts    # 分类服务
│   │   ├── favorite.service.ts    # 收藏服务
│   │   └── discover.service.ts    # 发现服务
│   ├── utils/
│   │   ├── http.ts                # HTTP 请求封装
│   │   ├── platform.ts            # 平台差异抽象
│   │   ├── storage.ts             # 存储封装
│   │   └── date.ts                # 日期工具
│   ├── styles/
│   │   ├── variables.less         # Less 变量
│   │   ├── mixins.less            # Less 混入
│   │   └── global.less            # 全局样式
│   └── types/
│       └── index.ts               # TypeScript 类型
├── config/
│   ├── index.ts                   # Taro 主配置
│   ├── dev.ts                     # 开发环境配置
│   └── prod.ts                    # 生产环境配置
├── types/
│   └── global.d.ts                # 全局类型声明
├── package.json
├── tsconfig.json
└── project.config.json            # 小程序项目配置
```

---

## Task 1: 项目初始化与环境搭建

**Files:**
- Create: `app-taro/package.json`
- Create: `app-taro/config/index.ts`
- Create: `app-taro/config/dev.ts`
- Create: `app-taro/config/prod.ts`
- Create: `app-taro/tsconfig.json`
- Create: `app-taro/src/app.tsx`
- Create: `app-taro/src/app.config.ts`
- Create: `app-taro/src/styles/variables.less`
- Create: `app-taro/src/styles/global.less`

- [ ] **Step 1: 初始化 Taro 项目**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact
taro init app-taro --template default --description "FunFact 多端应用" --typescript --css less --compiler vite
```

Expected: 项目初始化成功，生成基础目录结构

- [ ] **Step 2: 安装核心依赖**

```bash
cd app-taro
npm install @tarojs/components @tarojs/taro @tarojs/react
npm install zustand
npm install @tarojs/plugin-platform-harmony-cpp
```

Expected: 依赖安装成功

- [ ] **Step 3: 配置 Taro 主配置**

Create `config/index.ts`:
```typescript
import path from 'path'
import os from 'os'

const config = {
  projectName: 'funfact-taro',
  date: '2026-5-26',
  designWidth: 750,
  deviceRatio: {
    750: 1,
    375: 2,
    828: 1.81,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
    ['@tarojs/plugin-platform-harmony-cpp', {}]
  ],
  harmony: {
    projectPath: path.join(os.homedir(), 'HarmonyProjects/FunFact'),
    hapName: 'entry',
  },
  rn: {
    appName: 'FunFact',
    output: {
      ios: './ios',
      android: './android'
    }
  },
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'vite',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
```

Create `config/dev.ts`:
```typescript
module.exports = {
  env: {
    NODE_ENV: '"development"',
  },
  defineConstants: {},
  mini: {},
  h5: {},
}
```

Create `config/prod.ts`:
```typescript
module.exports = {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {},
  mini: {},
  h5: {},
}
```

- [ ] **Step 4: 配置 TypeScript**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "removeComments": false,
    "preserveConstEnums": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "noImplicitAny": false,
    "allowSyntheticDefaultImports": true,
    "outDir": "lib",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strictNullChecks": true,
    "sourceMap": true,
    "rootDir": ".",
    "jsx": "react-jsx",
    "allowJs": true,
    "resolveJsonModule": true,
    "typeRoots": ["node_modules/@types"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["./src", "./types", "./config"],
  "compileOnSave": false
}
```

- [ ] **Step 5: 创建应用入口**

Create `src/app.tsx`:
```tsx
import { Component, PropsWithChildren } from 'react'
import './app.less'

class App extends Component<PropsWithChildren> {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
```

Create `src/app.config.ts`:
```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/discover/index',
    'pages/profile/index',
    'pages/auth/login/index',
    'pages/auth/register/index',
    'pages/auth/welcome/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '冷知识星球',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#333',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home-active.png',
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: 'assets/tab/discover.png',
        selectedIconPath: 'assets/tab/discover-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab/profile.png',
        selectedIconPath: 'assets/tab/profile-active.png',
      },
    ],
  },
})
```

- [ ] **Step 6: 创建全局样式**

Create `src/styles/variables.less`:
```less
// 颜色变量
@primary-color: #4A90D9;
@primary-color-light: #6AABE6;
@primary-color-dark: #3A7BC8;

@text-color: #333333;
@text-color-secondary: #666666;
@text-color-light: #999999;

@bg-color: #F5F5F5;
@bg-color-white: #FFFFFF;
@bg-color-card: #FFFFFF;

@border-color: #EEEEEE;
@border-color-dark: #DDDDDD;

@success-color: #52C41A;
@warning-color: #FAAD14;
@error-color: #FF4D4F;

// 间距
@spacing-xs: 8px;
@spacing-sm: 12px;
@spacing-md: 16px;
@spacing-lg: 24px;
@spacing-xl: 32px;

// 字体大小
@font-size-xs: 20px;
@font-size-sm: 24px;
@font-size-md: 28px;
@font-size-lg: 32px;
@font-size-xl: 36px;

// 圆角
@border-radius-sm: 8px;
@border-radius-md: 12px;
@border-radius-lg: 16px;
@border-radius-full: 999px;

// 阴影
@shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
@shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
@shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
```

Create `src/styles/global.less`:
```less
@import './variables.less';

page {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', STHeiti, 'Microsoft Yahei', Tahoma, Simsun, sans-serif;
  font-size: @font-size-md;
  color: @text-color;
  background-color: @bg-color;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// 通用工具类
.flex {
  display: flex;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: @primary-color;
}

.text-secondary {
  color: @text-color-secondary;
}

.text-light {
  color: @text-color-light;
}

.bg-white {
  background-color: @bg-color-white;
}

// 安全区域
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
```

- [ ] **Step 7: 验证项目编译**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
npm run dev:h5
```

Expected: H5 开发服务器启动成功，访问 http://localhost:10086 可以看到页面

- [ ] **Step 8: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "chore: 初始化 Taro 4.x 多端项目"
```

---

## Task 2: 平台差异抽象层

**Files:**
- Create: `src/utils/platform.ts`
- Create: `src/utils/storage.ts`
- Create: `src/utils/http.ts`
- Create: `src/utils/date.ts`

- [ ] **Step 1: 创建平台判断工具**

Create `src/utils/platform.ts`:
```typescript
import Taro from '@tarojs/taro'

// 平台判断
export const isWeapp = process.env.TARO_ENV === 'weapp'
export const isTT = process.env.TARO_ENV === 'tt'
export const isRN = process.env.TARO_ENV === 'rn'
export const isHarmony = process.env.TARO_ENV === 'harmony'
export const isH5 = process.env.TARO_ENV === 'h5'

// 统一路由
export const navigateTo = (url: string) => {
  Taro.navigateTo({ url })
}

export const redirectTo = (url: string) => {
  Taro.redirectTo({ url })
}

export const navigateBack = (delta: number = 1) => {
  Taro.navigateBack({ delta })
}

export const switchTab = (url: string) => {
  Taro.switchTab({ url })
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

// 统一提示
export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none') => {
  Taro.showToast({ title, icon, duration: 2000 })
}

export const showLoading = (title: string = '加载中...') => {
  Taro.showLoading({ title, mask: true })
}

export const hideLoading = () => {
  Taro.hideLoading()
}

// 统一确认框
export const showConfirm = (content: string, title: string = '提示'): Promise<boolean> => {
  return new Promise((resolve) => {
    Taro.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
    })
  })
}
```

- [ ] **Step 2: 创建存储封装**

Create `src/utils/storage.ts`:
```typescript
import Taro from '@tarojs/taro'

export const storage = {
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const res = await Taro.getStorage({ key })
      return res.data as T
    } catch {
      return null
    }
  },

  set: async <T = any>(key: string, value: T): Promise<void> => {
    await Taro.setStorage({ key, data: value })
  },

  remove: async (key: string): Promise<void> => {
    await Taro.removeStorage({ key })
  },

  clear: async (): Promise<void> => {
    await Taro.clearStorage()
  },
}

export default storage
```

- [ ] **Step 3: 创建 HTTP 请求封装**

Create `src/utils/http.ts`:
```typescript
import Taro from '@tarojs/taro'
import { storage } from './storage'
import { navigateTo, showToast, showLoading, hideLoading } from './platform'

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
  const { url, method = 'GET', data, header = {}, showLoading: showLoadingOption = true } = options

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
  if (showLoadingOption) {
    showLoading()
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
    if (showLoadingOption) {
      hideLoading()
    }

    const { statusCode, data: body } = response

    // 处理 401 错误
    if (statusCode === 401 && !AUTH_ENDPOINTS.some((ep) => url.includes(ep))) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => request<T>(options))
      }

      isRefreshing = true

      const refreshToken = await storage.get('refresh_token')
      if (!refreshToken) {
        await storage.remove('access_token')
        await storage.remove('refresh_token')
        await storage.remove('auth_user')
        navigateTo('/pages/auth/welcome/index')
        return Promise.reject(new Error('未登录'))
      }

      try {
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
        return request<T>(options)
      } catch (refreshError) {
        processQueue(refreshError)
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
      showToast(msg, 'error')
      return Promise.reject(new Error(msg))
    }

    return body.data !== undefined ? body.data : body
  } catch (error: any) {
    if (showLoadingOption) {
      hideLoading()
    }

    const msg = error.message || '网络异常，请稍后重试'
    showToast(msg, 'error')
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

- [ ] **Step 4: 创建日期工具**

Create `src/utils/date.ts`:
```typescript
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO } from 'date-fns'

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd') => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

export const getRelativeTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) {
    return '今天'
  }
  if (isYesterday(d)) {
    return '昨天'
  }
  if (isThisWeek(d)) {
    return '本周'
  }
  if (isThisMonth(d)) {
    return '本月'
  }
  if (isThisYear(d)) {
    return format(d, 'MM-dd')
  }
  return format(d, 'yyyy-MM-dd')
}

export const formatTimeAgo = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return '刚刚'
  }
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  if (hours < 24) {
    return `${hours}小时前`
  }
  if (days < 7) {
    return `${days}天前`
  }
  return format(d, 'yyyy-MM-dd')
}
```

- [ ] **Step 5: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 添加平台差异抽象层"
```

---

## Task 3: 状态管理层迁移

**Files:**
- Create: `src/stores/authStore.ts`
- Create: `src/stores/userStore.ts`
- Create: `src/stores/favoritesStore.ts`

- [ ] **Step 1: 创建认证状态管理**

Create `src/stores/authStore.ts`:
```typescript
import { create } from 'zustand'
import { storage } from '../utils/storage'
import { http } from '../utils/http'
import { login as platformLogin, navigateTo, showToast } from '../utils/platform'

interface User {
  id: string
  phone: string
  nickname: string
  avatar: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean

  // Actions
  login: (phone: string, code: string) => Promise<void>
  register: (phone: string, code: string, nickname: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  sendSms: (phone: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: true,

  login: async (phone: string, code: string) => {
    try {
      const data = await http.post('/v1/auth/login', { phone, code })
      const { user, tokens } = data

      await storage.set('access_token', tokens.accessToken)
      await storage.set('refresh_token', tokens.refreshToken)
      await storage.set('auth_user', user)

      set({
        user,
        token: tokens.accessToken,
        isLoggedIn: true,
      })

      showToast('登录成功', 'success')
      navigateTo('/pages/index/index')
    } catch (error) {
      throw error
    }
  },

  register: async (phone: string, code: string, nickname: string) => {
    try {
      const data = await http.post('/v1/auth/register', { phone, code, nickname })
      const { user, tokens } = data

      await storage.set('access_token', tokens.accessToken)
      await storage.set('refresh_token', tokens.refreshToken)
      await storage.set('auth_user', user)

      set({
        user,
        token: tokens.accessToken,
        isLoggedIn: true,
      })

      showToast('注册成功', 'success')
      navigateTo('/pages/index/index')
    } catch (error) {
      throw error
    }
  },

  logout: async () => {
    await storage.remove('access_token')
    await storage.remove('refresh_token')
    await storage.remove('auth_user')

    set({
      user: null,
      token: null,
      isLoggedIn: false,
    })

    navigateTo('/pages/auth/welcome/index')
  },

  checkAuth: async () => {
    try {
      const token = await storage.get('access_token')
      const user = await storage.get<User>('auth_user')

      if (token && user) {
        set({
          user,
          token,
          isLoggedIn: true,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  sendSms: async (phone: string) => {
    try {
      await http.post('/v1/auth/sms/send', { phone })
      showToast('验证码已发送', 'success')
    } catch (error) {
      throw error
    }
  },
}))
```

- [ ] **Step 2: 创建用户状态管理**

Create `src/stores/userStore.ts`:
```typescript
import { create } from 'zustand'
import { http } from '../utils/http'
import { storage } from '../utils/storage'

interface UserProfile {
  id: string
  nickname: string
  avatar: string
  signature: string
  phone: string
  email: string
  checkinDays: number
  totalCheckinDays: number
  lastCheckinDate: string | null
}

interface UserState {
  profile: UserProfile | null
  isLoading: boolean

  // Actions
  initProfile: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  checkin: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: true,

  initProfile: async () => {
    try {
      const profile = await storage.get<UserProfile>('userProfile')
      if (profile) {
        set({ profile, isLoading: false })
      } else {
        await get().refreshProfile()
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  refreshProfile: async () => {
    try {
      const profile = await http.get('/v1/user/profile')
      await storage.set('userProfile', profile)
      set({ profile, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    try {
      await http.put('/v1/user/profile', data)
      await get().refreshProfile()
    } catch (error) {
      throw error
    }
  },

  checkin: async () => {
    try {
      await http.post('/v1/user/checkin')
      await get().refreshProfile()
    } catch (error) {
      throw error
    }
  },
}))
```

- [ ] **Step 3: 创建收藏状态管理**

Create `src/stores/favoritesStore.ts`:
```typescript
import { create } from 'zustand'
import { http } from '../utils/http'

interface FavoritesState {
  favorites: Set<string>
  isLoading: boolean

  // Actions
  initFavorites: () => Promise<void>
  toggleFavorite: (cardId: string) => Promise<void>
  isFavorite: (cardId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: new Set(),
  isLoading: true,

  initFavorites: async () => {
    try {
      const data = await http.get('/v1/favorites')
      const favorites = new Set(data.map((item: any) => item.cardId))
      set({ favorites, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  toggleFavorite: async (cardId: string) => {
    const { favorites } = get()
    const isFavorite = favorites.has(cardId)

    try {
      if (isFavorite) {
        await http.delete(`/v1/favorites/${cardId}`)
        favorites.delete(cardId)
      } else {
        await http.post('/v1/favorites', { cardId })
        favorites.add(cardId)
      }

      set({ favorites: new Set(favorites) })
    } catch (error) {
      throw error
    }
  },

  isFavorite: (cardId: string) => {
    return get().favorites.has(cardId)
  },
}))
```

- [ ] **Step 4: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 添加 Zustand 状态管理"
```

---

## Task 4: API 服务层迁移

**Files:**
- Create: `src/services/auth.service.ts`
- Create: `src/services/knowledge.service.ts`
- Create: `src/services/category.service.ts`
- Create: `src/services/favorite.service.ts`
- Create: `src/services/discover.service.ts`

- [ ] **Step 1: 创建认证服务**

Create `src/services/auth.service.ts`:
```typescript
import { http } from '../utils/http'
import Taro from '@tarojs/taro'
import { storage } from '../utils/storage'

export const authService = {
  login: (data: { phone: string; code: string }) => {
    return http.post('/v1/auth/login', data)
  },

  register: (data: { phone: string; code: string; nickname: string }) => {
    return http.post('/v1/auth/register', data)
  },

  sendSms: (data: { phone: string }) => {
    return http.post('/v1/auth/sms/send', data)
  },

  refreshToken: async (refreshToken: string) => {
    const response = await Taro.request({
      url: `${process.env.TARO_APP_API_BASE_URL}/v1/auth/refresh`,
      method: 'POST',
      data: { refresh_token: refreshToken },
      header: { 'Content-Type': 'application/json' },
    })
    return response.data
  },

  getProfile: () => {
    return http.get('/v1/user/profile')
  },

  updateProfile: (data: any) => {
    return http.put('/v1/user/profile', data)
  },

  uploadAvatar: async (filePath: string) => {
    const token = await storage.get('access_token')
    const response = await Taro.uploadFile({
      url: `${process.env.TARO_APP_API_BASE_URL}/v1/user/avatar`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${token}`,
      },
    })
    return JSON.parse(response.data)
  },

  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return http.post('/v1/user/change-password', data)
  },
}
```

- [ ] **Step 2: 创建知识服务**

Create `src/services/knowledge.service.ts`:
```typescript
import { http } from '../utils/http'

export const knowledgeService = {
  getList: (params?: { page?: number; pageSize?: number; categoryId?: string }) => {
    return http.get('/v1/knowledge', params)
  },

  getDetail: (id: string) => {
    return http.get(`/v1/knowledge/${id}`)
  },

  getRecommend: () => {
    return http.get('/v1/knowledge/recommend')
  },

  reportBehavior: (data: { cardId: string; action: string }) => {
    return http.post('/v1/knowledge/behavior', data)
  },
}
```

- [ ] **Step 3: 创建分类服务**

Create `src/services/category.service.ts`:
```typescript
import { http } from '../utils/http'

export const categoryService = {
  getList: () => {
    return http.get('/v1/categories')
  },

  getDetail: (id: string) => {
    return http.get(`/v1/categories/${id}`)
  },

  getKnowledgeList: (categoryId: string, params?: { page?: number; pageSize?: number }) => {
    return http.get(`/v1/categories/${categoryId}/knowledge`, params)
  },
}
```

- [ ] **Step 4: 创建收藏服务**

Create `src/services/favorite.service.ts`:
```typescript
import { http } from '../utils/http'

export const favoriteService = {
  getList: (params?: { page?: number; pageSize?: number }) => {
    return http.get('/v1/favorites', params)
  },

  add: (cardId: string) => {
    return http.post('/v1/favorites', { cardId })
  },

  remove: (cardId: string) => {
    return http.delete(`/v1/favorites/${cardId}`)
  },

  check: (cardId: string) => {
    return http.get(`/v1/favorites/check/${cardId}`)
  },
}
```

- [ ] **Step 5: 创建发现服务**

Create `src/services/discover.service.ts`:
```typescript
import { http } from '../utils/http'

export const discoverService = {
  getHotSearches: () => {
    return http.get('/v1/discover/hot-searches')
  },

  search: (keyword: string, params?: { page?: number; pageSize?: number }) => {
    return http.get('/v1/discover/search', { keyword, ...params })
  },

  getRecentSearches: () => {
    return http.get('/v1/discover/recent-searches')
  },

  clearRecentSearches: () => {
    return http.delete('/v1/discover/recent-searches')
  },
}
```

- [ ] **Step 6: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 添加 API 服务层"
```

---

## Task 5: 公共组件迁移

**Files:**
- Create: `src/components/Layout/index.tsx`
- Create: `src/components/Layout/index.less`
- Create: `src/components/PageHeader/index.tsx`
- Create: `src/components/PageHeader/index.less`
- Create: `src/components/KnowledgeCard/index.tsx`
- Create: `src/components/KnowledgeCard/index.less`
- Create: `src/components/GlobalLoading/index.tsx`
- Create: `src/components/GlobalLoading/index.less`

- [ ] **Step 1: 创建 Layout 组件**

Create `src/components/Layout/index.tsx`:
```tsx
import { Component, PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import './index.less'

interface LayoutProps {
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

export default class Layout extends Component<PropsWithChildren<LayoutProps>> {
  static defaultProps = {
    showHeader: true,
    showFooter: false,
  }

  render() {
    const { children, className, showHeader } = this.props

    return (
      <View className={`layout ${className || ''}`}>
        {showHeader && <View className='layout-header' />}
        <View className='layout-content'>
          {children}
        </View>
      </View>
    )
  }
}
```

Create `src/components/Layout/index.less`:
```less
@import '../../styles/variables.less';

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color;
}

.layout-header {
  height: 88px;
  background-color: @bg-color-white;
}

.layout-content {
  flex: 1;
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 2: 创建 PageHeader 组件**

Create `src/components/PageHeader/index.tsx`:
```tsx
import { Component, PropsWithChildren } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.less'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  rightContent?: React.ReactNode
  onBack?: () => void
}

export default class PageHeader extends Component<PropsWithChildren<PageHeaderProps>> {
  static defaultProps = {
    showBack: true,
  }

  handleBack = () => {
    const { onBack } = this.props
    if (onBack) {
      onBack()
    } else {
      Taro.navigateBack()
    }
  }

  render() {
    const { title, showBack, rightContent } = this.props

    return (
      <View className='page-header'>
        <View className='page-header-left'>
          {showBack && (
            <View className='page-header-back' onClick={this.handleBack}>
              <Text className='back-icon'>←</Text>
            </View>
          )}
        </View>
        <View className='page-header-center'>
          <Text className='page-header-title'>{title}</Text>
        </View>
        <View className='page-header-right'>
          {rightContent}
        </View>
      </View>
    )
  }
}
```

Create `src/components/PageHeader/index.less`:
```less
@import '../../styles/variables.less';

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88px;
  padding: 0 @spacing-md;
  background-color: @bg-color-white;
  border-bottom: 1px solid @border-color;
}

.page-header-left,
.page-header-right {
  width: 120px;
}

.page-header-right {
  display: flex;
  justify-content: flex-end;
}

.page-header-center {
  flex: 1;
  text-align: center;
}

.page-header-title {
  font-size: @font-size-lg;
  font-weight: 600;
  color: @text-color;
}

.page-header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}

.back-icon {
  font-size: @font-size-xl;
  color: @text-color;
}
```

- [ ] **Step 3: 创建 KnowledgeCard 组件**

Create `src/components/KnowledgeCard/index.tsx`:
```tsx
import { Component, PropsWithChildren } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { navigateTo } from '../../utils/platform'
import './index.less'

interface KnowledgeCardProps {
  id: string
  title: string
  image: string
  category: string
  isFavorite?: boolean
  onFavorite?: (id: string) => void
}

export default class KnowledgeCard extends Component<PropsWithChildren<KnowledgeCardProps>> {
  handleClick = () => {
    const { id } = this.props
    navigateTo(`/pages/card/${id}/index`)
  }

  handleFavorite = (e: any) => {
    e.stopPropagation()
    const { id, onFavorite } = this.props
    if (onFavorite) {
      onFavorite(id)
    }
  }

  render() {
    const { title, image, category, isFavorite } = this.props

    return (
      <View className='knowledge-card' onClick={this.handleClick}>
        <Image className='knowledge-card-image' src={image} mode='aspectFill' />
        <View className='knowledge-card-content'>
          <Text className='knowledge-card-title'>{title}</Text>
          <View className='knowledge-card-footer'>
            <Text className='knowledge-card-category'>{category}</Text>
            <View
              className={`knowledge-card-favorite ${isFavorite ? 'active' : ''}`}
              onClick={this.handleFavorite}
            >
              <Text>{isFavorite ? '★' : '☆'}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
```

Create `src/components/KnowledgeCard/index.less`:
```less
@import '../../styles/variables.less';

.knowledge-card {
  display: flex;
  flex-direction: column;
  background-color: @bg-color-white;
  border-radius: @border-radius-md;
  overflow: hidden;
  box-shadow: @shadow-sm;
  margin-bottom: @spacing-md;
}

.knowledge-card-image {
  width: 100%;
  height: 300px;
}

.knowledge-card-content {
  padding: @spacing-md;
}

.knowledge-card-title {
  font-size: @font-size-md;
  font-weight: 500;
  color: @text-color;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.knowledge-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: @spacing-sm;
}

.knowledge-card-category {
  font-size: @font-size-sm;
  color: @text-color-light;
  background-color: @bg-color;
  padding: 4px 12px;
  border-radius: @border-radius-full;
}

.knowledge-card-favorite {
  font-size: @font-size-lg;
  color: @text-color-light;

  &.active {
    color: @warning-color;
  }
}
```

- [ ] **Step 4: 创建 GlobalLoading 组件**

Create `src/components/GlobalLoading/index.tsx`:
```tsx
import { Component, PropsWithChildren } from 'react'
import { View, Text } from '@tarojs/components'
import './index.less'

interface GlobalLoadingProps {
  loading: boolean
}

export default class GlobalLoading extends Component<PropsWithChildren<GlobalLoadingProps>> {
  render() {
    const { loading, children } = this.props

    return (
      <View className='global-loading'>
        {loading && (
          <View className='global-loading-mask'>
            <View className='global-loading-spinner'>
              <View className='spinner' />
              <Text className='loading-text'>加载中...</Text>
            </View>
          </View>
        )}
        {children}
      </View>
    )
  }
}
```

Create `src/components/GlobalLoading/index.less`:
```less
@import '../../styles/variables.less';

.global-loading {
  position: relative;
  min-height: 100vh;
}

.global-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.global-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: @bg-color-white;
  padding: @spacing-lg;
  border-radius: @border-radius-md;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid @border-color;
  border-top-color: @primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: @spacing-sm;
  font-size: @font-size-sm;
  color: @text-color-secondary;
}
```

- [ ] **Step 5: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 添加公共组件"
```

---

## Task 6: 核心页面迁移 - 首页

**Files:**
- Create: `src/pages/index/index.tsx`
- Create: `src/pages/index/index.less`
- Create: `src/pages/index/index.config.ts`

- [ ] **Step 1: 创建首页配置**

Create `src/pages/index/index.config.ts`:
```typescript
export default definePageConfig({
  navigationStyle: 'custom',
  navigationBarTitleText: '首页',
})
```

- [ ] **Step 2: 创建首页组件**

Create `src/pages/index/index.tsx`:
```tsx
import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { KnowledgeCard } from '../../components/KnowledgeCard'
import { useAuthStore } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import { knowledgeService } from '../../services/knowledge.service'
import './index.less'

interface Knowledge {
  id: string
  title: string
  image: string
  category: string
  isFavorite: boolean
}

interface IndexState {
  knowledgeList: Knowledge[]
  currentCardIndex: number
  isLoading: boolean
  isRefreshing: boolean
}

export default class Index extends Component<{}, IndexState> {
  state: IndexState = {
    knowledgeList: [],
    currentCardIndex: 0,
    isLoading: true,
    isRefreshing: false,
  }

  componentDidMount() {
    this.initData()
  }

  componentDidShow() {
    // 检查登录状态
    const { isLoggedIn, checkAuth } = useAuthStore.getState()
    if (!isLoggedIn) {
      checkAuth()
    }
  }

  initData = async () => {
    try {
      await this.loadKnowledgeList()
      await useUserStore.getState().initProfile()
    } catch (error) {
      console.error('初始化数据失败:', error)
    }
  }

  loadKnowledgeList = async () => {
    try {
      const data = await knowledgeService.getList({ page: 1, pageSize: 10 })
      this.setState({
        knowledgeList: data.list,
        isLoading: false,
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }
  }

  handleRefresh = async () => {
    this.setState({ isRefreshing: true })
    await this.loadKnowledgeList()
    this.setState({ isRefreshing: false })
  }

  handleCardChange = (e: any) => {
    this.setState({ currentCardIndex: e.detail.current })
  }

  handleFavorite = async (cardId: string) => {
    try {
      const { toggleFavorite } = useFavoritesStore.getState()
      await toggleFavorite(cardId)

      // 更新列表中的收藏状态
      const { knowledgeList } = this.state
      const newList = knowledgeList.map((item) =>
        item.id === cardId ? { ...item, isFavorite: !item.isFavorite } : item
      )
      this.setState({ knowledgeList: newList })
    } catch (error) {
      console.error('收藏失败:', error)
    }
  }

  render() {
    const { knowledgeList, currentCardIndex, isLoading, isRefreshing } = this.state

    if (isLoading) {
      return (
        <View className='index-loading'>
          <Text>加载中...</Text>
        </View>
      )
    }

    return (
      <View className='index'>
        <View className='index-header'>
          <Text className='index-title'>冷知识星球</Text>
          <Text className='index-subtitle'>每天学点新知识</Text>
        </View>

        <ScrollView
          className='index-content'
          scrollY
          refresherEnabled
          refresherTriggered={isRefreshing}
          onRefresherRefresh={this.handleRefresh}
        >
          <View className='index-cards'>
            {knowledgeList.map((item, index) => (
              <KnowledgeCard
                key={item.id}
                id={item.id}
                title={item.title}
                image={item.image}
                category={item.category}
                isFavorite={item.isFavorite}
                onFavorite={this.handleFavorite}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }
}
```

Create `src/pages/index/index.less`:
```less
@import '../../styles/variables.less';

.index {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color;
}

.index-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.index-header {
  padding: @spacing-lg @spacing-md;
  background-color: @primary-color;
  color: #fff;
}

.index-title {
  font-size: @font-size-xl;
  font-weight: 600;
}

.index-subtitle {
  font-size: @font-size-sm;
  opacity: 0.8;
  margin-top: 8px;
}

.index-content {
  flex: 1;
  padding: @spacing-md;
}

.index-cards {
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **Step 3: 验证首页编译**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
npm run dev:h5
```

Expected: 首页正常显示，知识卡片列表加载成功

- [ ] **Step 4: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 迁移首页"
```

---

## Task 7: 核心页面迁移 - 发现页

**Files:**
- Create: `src/pages/discover/index.tsx`
- Create: `src/pages/discover/index.less`
- Create: `src/pages/discover/index.config.ts`

- [ ] **Step 1: 创建发现页配置**

Create `src/pages/discover/index.config.ts`:
```typescript
export default definePageConfig({
  navigationStyle: 'custom',
  navigationBarTitleText: '发现',
})
```

- [ ] **Step 2: 创建发现页组件**

Create `src/pages/discover/index.tsx`:
```tsx
import { Component } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import { discoverService } from '../../services/discover.service'
import { navigateTo } from '../../utils/platform'
import './index.less'

interface HotSearch {
  id: string
  keyword: string
  count: number
}

interface DiscoverState {
  hotSearches: HotSearch[]
  recentSearches: string[]
  searchKeyword: string
  isLoading: boolean
}

export default class Discover extends Component<{}, DiscoverState> {
  state: DiscoverState = {
    hotSearches: [],
    recentSearches: [],
    searchKeyword: '',
    isLoading: true,
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = async () => {
    try {
      const [hotSearches, recentSearches] = await Promise.all([
        discoverService.getHotSearches(),
        discoverService.getRecentSearches(),
      ])
      this.setState({
        hotSearches,
        recentSearches,
        isLoading: false,
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }
  }

  handleSearchInput = (e: any) => {
    this.setState({ searchKeyword: e.detail.value })
  }

  handleSearch = async () => {
    const { searchKeyword } = this.state
    if (!searchKeyword.trim()) return

    navigateTo(`/pages/search/index?keyword=${encodeURIComponent(searchKeyword)}`)
  }

  handleHotSearchClick = (keyword: string) => {
    this.setState({ searchKeyword: keyword }, () => {
      this.handleSearch()
    })
  }

  handleClearRecent = async () => {
    try {
      await discoverService.clearRecentSearches()
      this.setState({ recentSearches: [] })
    } catch (error) {
      console.error('清除搜索记录失败:', error)
    }
  }

  render() {
    const { hotSearches, recentSearches, searchKeyword, isLoading } = this.state

    return (
      <View className='discover'>
        <View className='discover-header'>
          <View className='search-bar'>
            <Input
              className='search-input'
              placeholder='搜索知识'
              value={searchKeyword}
              onInput={this.handleSearchInput}
              onConfirm={this.handleSearch}
            />
          </View>
        </View>

        <ScrollView className='discover-content' scrollY>
          {/* 热搜榜 */}
          <View className='section'>
            <Text className='section-title'>热搜榜</Text>
            <View className='hot-search-list'>
              {hotSearches.map((item, index) => (
                <View
                  key={item.id}
                  className='hot-search-item'
                  onClick={() => this.handleHotSearchClick(item.keyword)}
                >
                  <Text className={`hot-search-index ${index < 3 ? 'top' : ''}`}>
                    {index + 1}
                  </Text>
                  <Text className='hot-search-keyword'>{item.keyword}</Text>
                  <Text className='hot-search-count'>{item.count}次</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 最近搜索 */}
          {recentSearches.length > 0 && (
            <View className='section'>
              <View className='section-header'>
                <Text className='section-title'>最近搜索</Text>
                <Text className='section-clear' onClick={this.handleClearRecent}>
                  清除
                </Text>
              </View>
              <View className='recent-search-list'>
                {recentSearches.map((keyword, index) => (
                  <View
                    key={index}
                    className='recent-search-item'
                    onClick={() => this.handleHotSearchClick(keyword)}
                  >
                    <Text>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
```

Create `src/pages/discover/index.less`:
```less
@import '../../styles/variables.less';

.discover {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color;
}

.discover-header {
  padding: @spacing-md;
  background-color: @bg-color-white;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: @bg-color;
  border-radius: @border-radius-full;
  padding: @spacing-sm @spacing-md;
}

.search-input {
  flex: 1;
  font-size: @font-size-md;
}

.discover-content {
  flex: 1;
  padding: @spacing-md;
}

.section {
  background-color: @bg-color-white;
  border-radius: @border-radius-md;
  padding: @spacing-md;
  margin-bottom: @spacing-md;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: @spacing-md;
}

.section-title {
  font-size: @font-size-lg;
  font-weight: 600;
  color: @text-color;
}

.section-clear {
  font-size: @font-size-sm;
  color: @text-color-light;
}

.hot-search-list {
  display: flex;
  flex-direction: column;
}

.hot-search-item {
  display: flex;
  align-items: center;
  padding: @spacing-sm 0;
  border-bottom: 1px solid @border-color;

  &:last-child {
    border-bottom: none;
  }
}

.hot-search-index {
  width: 40px;
  font-size: @font-size-md;
  font-weight: 600;
  color: @text-color-light;

  &.top {
    color: @error-color;
  }
}

.hot-search-keyword {
  flex: 1;
  font-size: @font-size-md;
  color: @text-color;
  margin-left: @spacing-sm;
}

.hot-search-count {
  font-size: @font-size-sm;
  color: @text-color-light;
}

.recent-search-list {
  display: flex;
  flex-wrap: wrap;
  gap: @spacing-sm;
}

.recent-search-item {
  background-color: @bg-color;
  padding: @spacing-xs @spacing-md;
  border-radius: @border-radius-full;
  font-size: @font-size-sm;
  color: @text-color-secondary;
}
```

- [ ] **Step 3: 验证发现页编译**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
npm run dev:h5
```

Expected: 发现页正常显示，热搜榜和最近搜索加载成功

- [ ] **Step 4: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 迁移发现页"
```

---

## Task 8: 核心页面迁移 - 个人中心

**Files:**
- Create: `src/pages/profile/index.tsx`
- Create: `src/pages/profile/index.less`
- Create: `src/pages/profile/index.config.ts`

- [ ] **Step 1: 创建个人中心配置**

Create `src/pages/profile/index.config.ts`:
```typescript
export default definePageConfig({
  navigationStyle: 'custom',
  navigationBarTitleText: '我的',
})
```

- [ ] **Step 2: 创建个人中心组件**

Create `src/pages/profile/index.tsx`:
```tsx
import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useAuthStore } from '../../stores/authStore'
import { useUserStore } from '../../stores/userStore'
import { navigateTo, showConfirm } from '../../utils/platform'
import './index.less'

interface ProfileState {
  isLoading: boolean
}

export default class Profile extends Component<{}, ProfileState> {
  state: ProfileState = {
    isLoading: true,
  }

  componentDidMount() {
    this.initData()
  }

  componentDidShow() {
    this.initData()
  }

  initData = async () => {
    const { isLoggedIn } = useAuthStore.getState()
    if (!isLoggedIn) {
      navigateTo('/pages/auth/welcome/index')
      return
    }

    await useUserStore.getState().initProfile()
    this.setState({ isLoading: false })
  }

  handleEditProfile = () => {
    navigateTo('/pages/profile/edit/index')
  }

  handleFavorites = () => {
    navigateTo('/pages/favorites/index')
  }

  handleCalendar = () => {
    navigateTo('/pages/calendar/index')
  }

  handleSettings = () => {
    navigateTo('/pages/settings/index')
  }

  handleLogout = async () => {
    const confirmed = await showConfirm('确定要退出登录吗？')
    if (confirmed) {
      await useAuthStore.getState().logout()
    }
  }

  handleCheckin = async () => {
    try {
      await useUserStore.getState().checkin()
    } catch (error) {
      console.error('签到失败:', error)
    }
  }

  render() {
    const { isLoading } = this.state
    const { user } = useAuthStore.getState()
    const { profile } = useUserStore.getState()

    if (isLoading || !user || !profile) {
      return (
        <View className='profile-loading'>
          <Text>加载中...</Text>
        </View>
      )
    }

    return (
      <View className='profile'>
        <View className='profile-header'>
          <View className='profile-avatar-section' onClick={this.handleEditProfile}>
            <Image
              className='profile-avatar'
              src={profile.avatar || '/assets/images/default-avatar.png'}
              mode='aspectFill'
            />
            <View className='profile-info'>
              <Text className='profile-nickname'>{profile.nickname}</Text>
              <Text className='profile-signature'>{profile.signature || '这个人很懒，什么都没写'}</Text>
            </View>
            <Text className='profile-edit-arrow'>→</Text>
          </View>

          <View className='profile-stats'>
            <View className='stat-item'>
              <Text className='stat-value'>{profile.checkinDays}</Text>
              <Text className='stat-label'>连续签到</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-value'>{profile.totalCheckinDays}</Text>
              <Text className='stat-label'>累计签到</Text>
            </View>
          </View>
        </View>

        <View className='profile-actions'>
          <View className='action-item' onClick={this.handleCheckin}>
            <Text className='action-icon'>📅</Text>
            <Text className='action-text'>签到</Text>
          </View>
          <View className='action-item' onClick={this.handleFavorites}>
            <Text className='action-icon'>⭐</Text>
            <Text className='action-text'>收藏</Text>
          </View>
          <View className='action-item' onClick={this.handleCalendar}>
            <Text className='action-icon'>📆</Text>
            <Text className='action-text'>日历</Text>
          </View>
        </View>

        <View className='profile-menu'>
          <View className='menu-item' onClick={this.handleSettings}>
            <Text className='menu-icon'>⚙️</Text>
            <Text className='menu-text'>设置</Text>
            <Text className='menu-arrow'>→</Text>
          </View>
          <View className='menu-item' onClick={this.handleLogout}>
            <Text className='menu-icon'>🚪</Text>
            <Text className='menu-text'>退出登录</Text>
            <Text className='menu-arrow'>→</Text>
          </View>
        </View>
      </View>
    )
  }
}
```

Create `src/pages/profile/index.less`:
```less
@import '../../styles/variables.less';

.profile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color;
}

.profile-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.profile-header {
  background-color: @primary-color;
  padding: @spacing-lg;
  padding-top: calc(@spacing-lg + env(safe-area-inset-top));
  color: #fff;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.profile-info {
  flex: 1;
  margin-left: @spacing-md;
}

.profile-nickname {
  font-size: @font-size-xl;
  font-weight: 600;
}

.profile-signature {
  font-size: @font-size-sm;
  opacity: 0.8;
  margin-top: 8px;
}

.profile-edit-arrow {
  font-size: @font-size-xl;
  opacity: 0.8;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin-top: @spacing-lg;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: @font-size-xl;
  font-weight: 600;
}

.stat-label {
  font-size: @font-size-sm;
  opacity: 0.8;
  margin-top: 4px;
}

.profile-actions {
  display: flex;
  justify-content: space-around;
  background-color: @bg-color-white;
  padding: @spacing-lg;
  margin-top: @spacing-md;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  font-size: 48px;
}

.action-text {
  font-size: @font-size-sm;
  color: @text-color-secondary;
  margin-top: 8px;
}

.profile-menu {
  background-color: @bg-color-white;
  margin-top: @spacing-md;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: @spacing-md;
  border-bottom: 1px solid @border-color;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: @font-size-lg;
  margin-right: @spacing-md;
}

.menu-text {
  flex: 1;
  font-size: @font-size-md;
  color: @text-color;
}

.menu-arrow {
  font-size: @font-size-md;
  color: @text-color-light;
}
```

- [ ] **Step 3: 验证个人中心编译**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
npm run dev:h5
```

Expected: 个人中心正常显示，用户信息加载成功

- [ ] **Step 4: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 迁移个人中心"
```

---

## Task 9: 认证页面迁移

**Files:**
- Create: `src/pages/auth/welcome/index.tsx`
- Create: `src/pages/auth/welcome/index.less`
- Create: `src/pages/auth/login/index.tsx`
- Create: `src/pages/auth/login/index.less`
- Create: `src/pages/auth/register/index.tsx`
- Create: `src/pages/auth/register/index.less`

- [ ] **Step 1: 创建欢迎页**

Create `src/pages/auth/welcome/index.tsx`:
```tsx
import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { navigateTo } from '../../../utils/platform'
import './index.less'

export default class Welcome extends Component {
  handleLogin = () => {
    navigateTo('/pages/auth/login/index')
  }

  handleRegister = () => {
    navigateTo('/pages/auth/register/index')
  }

  render() {
    return (
      <View className='welcome'>
        <View className='welcome-content'>
          <Image
            className='welcome-logo'
            src='/assets/images/logo.png'
            mode='aspectFit'
          />
          <Text className='welcome-title'>冷知识星球</Text>
          <Text className='welcome-subtitle'>每天学点新知识</Text>
        </View>

        <View className='welcome-actions'>
          <View className='welcome-btn primary' onClick={this.handleLogin}>
            <Text>登录</Text>
          </View>
          <View className='welcome-btn secondary' onClick={this.handleRegister}>
            <Text>注册</Text>
          </View>
        </View>
      </View>
    )
  }
}
```

Create `src/pages/auth/welcome/index.less`:
```less
@import '../../../styles/variables.less';

.welcome {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color-white;
}

.welcome-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-logo {
  width: 200px;
  height: 200px;
}

.welcome-title {
  font-size: @font-size-xl;
  font-weight: 600;
  color: @text-color;
  margin-top: @spacing-lg;
}

.welcome-subtitle {
  font-size: @font-size-md;
  color: @text-color-secondary;
  margin-top: @spacing-sm;
}

.welcome-actions {
  padding: @spacing-lg;
  padding-bottom: calc(@spacing-lg + env(safe-area-inset-bottom));
}

.welcome-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
  border-radius: @border-radius-full;
  font-size: @font-size-lg;
  margin-bottom: @spacing-md;

  &.primary {
    background-color: @primary-color;
    color: #fff;
  }

  &.secondary {
    background-color: @bg-color;
    color: @text-color;
  }
}
```

- [ ] **Step 2: 创建登录页**

Create `src/pages/auth/login/index.tsx`:
```tsx
import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import { useAuthStore } from '../../../stores/authStore'
import { navigateTo, showToast } from '../../../utils/platform'
import './index.less'

interface LoginState {
  phone: string
  code: string
  countdown: number
  isSending: boolean
  isLogging: boolean
}

export default class Login extends Component<{}, LoginState> {
  state: LoginState = {
    phone: '',
    code: '',
    countdown: 0,
    isSending: false,
    isLogging: false,
  }

  timer: any = null

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  handlePhoneInput = (e: any) => {
    this.setState({ phone: e.detail.value })
  }

  handleCodeInput = (e: any) => {
    this.setState({ code: e.detail.value })
  }

  handleSendCode = async () => {
    const { phone } = this.state
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的手机号')
      return
    }

    this.setState({ isSending: true })
    try {
      await useAuthStore.getState().sendSms(phone)
      this.setState({ countdown: 60 })
      this.timer = setInterval(() => {
        const { countdown } = this.state
        if (countdown <= 0) {
          clearInterval(this.timer)
          this.setState({ isSending: false })
        } else {
          this.setState({ countdown: countdown - 1 })
        }
      }, 1000)
    } catch (error) {
      this.setState({ isSending: false })
    }
  }

  handleLogin = async () => {
    const { phone, code } = this.state
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的手机号')
      return
    }
    if (!code || code.length !== 6) {
      showToast('请输入验证码')
      return
    }

    this.setState({ isLogging: true })
    try {
      await useAuthStore.getState().login(phone, code)
    } catch (error) {
      this.setState({ isLogging: false })
    }
  }

  handleRegister = () => {
    navigateTo('/pages/auth/register/index')
  }

  render() {
    const { phone, code, countdown, isSending, isLogging } = this.state

    return (
      <View className='login'>
        <View className='login-header'>
          <Text className='login-title'>登录</Text>
          <Text className='login-subtitle'>欢迎回来</Text>
        </View>

        <View className='login-form'>
          <View className='form-item'>
            <Text className='form-label'>手机号</Text>
            <Input
              className='form-input'
              placeholder='请输入手机号'
              type='number'
              maxlength={11}
              value={phone}
              onInput={this.handlePhoneInput}
            />
          </View>

          <View className='form-item'>
            <Text className='form-label'>验证码</Text>
            <View className='code-input-wrapper'>
              <Input
                className='form-input code-input'
                placeholder='请输入验证码'
                type='number'
                maxlength={6}
                value={code}
                onInput={this.handleCodeInput}
              />
              <View
                className={`send-code-btn ${isSending ? 'disabled' : ''}`}
                onClick={!isSending ? this.handleSendCode : undefined}
              >
                <Text>{countdown > 0 ? `${countdown}s` : '发送验证码'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className='login-actions'>
          <View
            className={`login-btn ${isLogging ? 'disabled' : ''}`}
            onClick={!isLogging ? this.handleLogin : undefined}
          >
            <Text>{isLogging ? '登录中...' : '登录'}</Text>
          </View>
          <View className='register-link' onClick={this.handleRegister}>
            <Text>还没有账号？去注册</Text>
          </View>
        </View>
      </View>
    )
  }
}
```

Create `src/pages/auth/login/index.less`:
```less
@import '../../../styles/variables.less';

.login {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color-white;
}

.login-header {
  padding: @spacing-xl @spacing-lg;
  padding-top: calc(@spacing-xl + env(safe-area-inset-top));
}

.login-title {
  font-size: 48px;
  font-weight: 600;
  color: @text-color;
}

.login-subtitle {
  font-size: @font-size-md;
  color: @text-color-secondary;
  margin-top: 8px;
}

.login-form {
  padding: @spacing-lg;
}

.form-item {
  margin-bottom: @spacing-lg;
}

.form-label {
  font-size: @font-size-md;
  color: @text-color;
  margin-bottom: @spacing-sm;
}

.form-input {
  width: 100%;
  height: 88px;
  padding: 0 @spacing-md;
  background-color: @bg-color;
  border-radius: @border-radius-md;
  font-size: @font-size-md;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: @spacing-md;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  padding: 0 @spacing-md;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: @primary-color;
  color: #fff;
  border-radius: @border-radius-md;
  font-size: @font-size-sm;
  white-space: nowrap;

  &.disabled {
    opacity: 0.5;
  }
}

.login-actions {
  padding: @spacing-lg;
  margin-top: auto;
  padding-bottom: calc(@spacing-lg + env(safe-area-inset-bottom));
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
  background-color: @primary-color;
  color: #fff;
  border-radius: @border-radius-full;
  font-size: @font-size-lg;

  &.disabled {
    opacity: 0.5;
  }
}

.register-link {
  text-align: center;
  margin-top: @spacing-md;
  font-size: @font-size-md;
  color: @primary-color;
}
```

- [ ] **Step 3: 创建注册页**

Create `src/pages/auth/register/index.tsx`:
```tsx
import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import { useAuthStore } from '../../../stores/authStore'
import { navigateTo, showToast } from '../../../utils/platform'
import './index.less'

interface RegisterState {
  phone: string
  code: string
  nickname: string
  countdown: number
  isSending: boolean
  isRegistering: boolean
}

export default class Register extends Component<{}, RegisterState> {
  state: RegisterState = {
    phone: '',
    code: '',
    nickname: '',
    countdown: 0,
    isSending: false,
    isRegistering: false,
  }

  timer: any = null

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  handlePhoneInput = (e: any) => {
    this.setState({ phone: e.detail.value })
  }

  handleCodeInput = (e: any) => {
    this.setState({ code: e.detail.value })
  }

  handleNicknameInput = (e: any) => {
    this.setState({ nickname: e.detail.value })
  }

  handleSendCode = async () => {
    const { phone } = this.state
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的手机号')
      return
    }

    this.setState({ isSending: true })
    try {
      await useAuthStore.getState().sendSms(phone)
      this.setState({ countdown: 60 })
      this.timer = setInterval(() => {
        const { countdown } = this.state
        if (countdown <= 0) {
          clearInterval(this.timer)
          this.setState({ isSending: false })
        } else {
          this.setState({ countdown: countdown - 1 })
        }
      }, 1000)
    } catch (error) {
      this.setState({ isSending: false })
    }
  }

  handleRegister = async () => {
    const { phone, code, nickname } = this.state
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的手机号')
      return
    }
    if (!code || code.length !== 6) {
      showToast('请输入验证码')
      return
    }
    if (!nickname || nickname.length < 2) {
      showToast('请输入昵称')
      return
    }

    this.setState({ isRegistering: true })
    try {
      await useAuthStore.getState().register(phone, code, nickname)
    } catch (error) {
      this.setState({ isRegistering: false })
    }
  }

  handleLogin = () => {
    navigateTo('/pages/auth/login/index')
  }

  render() {
    const { phone, code, nickname, countdown, isSending, isRegistering } = this.state

    return (
      <View className='register'>
        <View className='register-header'>
          <Text className='register-title'>注册</Text>
          <Text className='register-subtitle'>创建新账号</Text>
        </View>

        <View className='register-form'>
          <View className='form-item'>
            <Text className='form-label'>手机号</Text>
            <Input
              className='form-input'
              placeholder='请输入手机号'
              type='number'
              maxlength={11}
              value={phone}
              onInput={this.handlePhoneInput}
            />
          </View>

          <View className='form-item'>
            <Text className='form-label'>验证码</Text>
            <View className='code-input-wrapper'>
              <Input
                className='form-input code-input'
                placeholder='请输入验证码'
                type='number'
                maxlength={6}
                value={code}
                onInput={this.handleCodeInput}
              />
              <View
                className={`send-code-btn ${isSending ? 'disabled' : ''}`}
                onClick={!isSending ? this.handleSendCode : undefined}
              >
                <Text>{countdown > 0 ? `${countdown}s` : '发送验证码'}</Text>
              </View>
            </View>
          </View>

          <View className='form-item'>
            <Text className='form-label'>昵称</Text>
            <Input
              className='form-input'
              placeholder='请输入昵称'
              maxlength={20}
              value={nickname}
              onInput={this.handleNicknameInput}
            />
          </View>
        </View>

        <View className='register-actions'>
          <View
            className={`register-btn ${isRegistering ? 'disabled' : ''}`}
            onClick={!isRegistering ? this.handleRegister : undefined}
          >
            <Text>{isRegistering ? '注册中...' : '注册'}</Text>
          </View>
          <View className='login-link' onClick={this.handleLogin}>
            <Text>已有账号？去登录</Text>
          </View>
        </View>
      </View>
    )
  }
}
```

Create `src/pages/auth/register/index.less`:
```less
@import '../../../styles/variables.less';

.register {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: @bg-color-white;
}

.register-header {
  padding: @spacing-xl @spacing-lg;
  padding-top: calc(@spacing-xl + env(safe-area-inset-top));
}

.register-title {
  font-size: 48px;
  font-weight: 600;
  color: @text-color;
}

.register-subtitle {
  font-size: @font-size-md;
  color: @text-color-secondary;
  margin-top: 8px;
}

.register-form {
  padding: @spacing-lg;
}

.form-item {
  margin-bottom: @spacing-lg;
}

.form-label {
  font-size: @font-size-md;
  color: @text-color;
  margin-bottom: @spacing-sm;
}

.form-input {
  width: 100%;
  height: 88px;
  padding: 0 @spacing-md;
  background-color: @bg-color;
  border-radius: @border-radius-md;
  font-size: @font-size-md;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: @spacing-md;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  padding: 0 @spacing-md;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: @primary-color;
  color: #fff;
  border-radius: @border-radius-md;
  font-size: @font-size-sm;
  white-space: nowrap;

  &.disabled {
    opacity: 0.5;
  }
}

.register-actions {
  padding: @spacing-lg;
  margin-top: auto;
  padding-bottom: calc(@spacing-lg + env(safe-area-inset-bottom));
}

.register-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88px;
  background-color: @primary-color;
  color: #fff;
  border-radius: @border-radius-full;
  font-size: @font-size-lg;

  &.disabled {
    opacity: 0.5;
  }
}

.login-link {
  text-align: center;
  margin-top: @spacing-md;
  font-size: @font-size-md;
  color: @primary-color;
}
```

- [ ] **Step 4: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "feat: 迁移认证页面"
```

---

## Task 10: 构建与发布配置

**Files:**
- Modify: `package.json`
- Create: `project.config.json`
- Create: `src/app.config.ts`

- [ ] **Step 1: 更新 package.json 脚本**

Modify `package.json`:
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

- [ ] **Step 2: 创建小程序项目配置**

Create `project.config.json`:
```json
{
  "miniprogramRoot": "dist/weapp/",
  "projectname": "funfact-taro",
  "description": "冷知识星球 - 多端应用",
  "appid": "your-appid",
  "setting": {
    "urlCheck": true,
    "es6": false,
    "enhance": false,
    "compileHotReLoad": false,
    "postcss": false,
    "minified": false
  },
  "compileType": "miniprogram",
  "condition": {}
}
```

- [ ] **Step 3: 更新应用配置**

Modify `src/app.config.ts`:
```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/discover/index',
    'pages/profile/index',
    'pages/auth/login/index',
    'pages/auth/register/index',
    'pages/auth/welcome/index',
    'pages/card/[id]/index',
    'pages/category/[id]/index',
    'pages/favorites/index',
    'pages/calendar/index',
    'pages/settings/index',
    'pages/profile/edit/index',
    'pages/search/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '冷知识星球',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#333',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home-active.png',
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现',
        iconPath: 'assets/tab/discover.png',
        selectedIconPath: 'assets/tab/discover-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab/profile.png',
        selectedIconPath: 'assets/tab/profile-active.png',
      },
    ],
  },
})
```

- [ ] **Step 4: 验证 H5 构建**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
npm run build:h5
```

Expected: H5 构建成功，生成 `dist/h5/` 目录

- [ ] **Step 5: 验证小程序构建**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
npm run build:weapp
```

Expected: 微信小程序构建成功，生成 `dist/weapp/` 目录

- [ ] **Step 6: 提交代码**

```bash
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/app-taro
git add .
git commit -m "chore: 配置构建与发布"
```

---

## 验证标准

1. **功能验证**：所有页面在 H5、微信、抖音、安卓、iOS、鸿蒙上功能正常
2. **性能验证**：页面加载时间 < 3s，动画流畅 60fps
3. **兼容性验证**：各平台真机测试通过
4. **代码质量**：TypeScript 类型覆盖 > 90%，无严重 Bug

---

## 执行选项

计划完成并保存到 `docs/superpowers/plans/2026-05-26-multi-platform-migration.md`。

两种执行方式：

**1. Subagent-Driven（推荐）** - 每个任务派遣一个独立子代理执行，任务间进行审查，快速迭代

**2. Inline Execution** - 在当前会话中执行任务，批量执行并设置检查点

选择哪种方式？
