# FunFact 多端适配技术规范

## 1. 项目概述

### 1.1 背景

FunFact 是一款面向碎片化学习场景的知识卡片应用，当前为纯 React Web 应用（React 18 + Vite + Tailwind CSS），需要改造为支持以下平台的多端应用：

- **H5** - 移动端网页
- **微信小程序** - weapp
- **抖音小程序** - tt
- **Android** - React Native
- **iOS** - React Native
- **鸿蒙 HarmonyOS** - harmony_cpp

### 1.2 当前技术栈

| 类别 | 当前技术 | 版本 |
|------|---------|------|
| 框架 | React | 18.3.1 |
| 构建 | Vite | 6.3.5 |
| 样式 | Tailwind CSS | 4.1.12 |
| 动画 | Motion | 12.23.24 |
| 路由 | react-router | 7.13.0 |
| HTTP | axios | 1.16.1 |
| 图标 | lucide-react | 0.487.0 |
| UI 组件 | Radix UI | 多版本 |
| 表单 | react-hook-form | 7.55.0 |
| 日期 | date-fns | 3.6.0 |

### 1.3 代码分析结果

| 指标 | 数量 | 说明 |
|------|------|------|
| Motion 导入文件 | 33 个 | 需要迁移动画 |
| motion. 使用次数 | 342 处 | 动画代码迁移重点 |
| createPortal 使用 | 6 文件/12 处 | 弹窗组件迁移 |
| localStorage 使用 | 7 文件/29 处 | 存储层迁移 |
| 页面文件 | 28 个 | 页面迁移 |
| API 服务 | 9 个 | 服务层迁移 |
| Context Provider | 3 个 | 状态管理迁移 |

---

## 2. 目标技术栈

| 类别 | 目标技术 | 说明 |
|------|---------|------|
| **框架** | Taro 4.x + React 18 | 跨平台核心框架 |
| **语言** | TypeScript | 类型安全 |
| **构建** | Vite | Taro 4.x 默认构建工具 |
| **样式** | Less | 替代 Tailwind CSS |
| **状态管理** | Zustand | 替代 Context API |
| **动画** | CSS + Lottie | 混合方案 |
| **组件库** | Taro UI + 自定义 | 混合方案 |
| **HTTP** | Taro.request | 替代 axios |
| **存储** | Taro.setStorage | 替代 localStorage |
| **图标** | lucide-react-taro | 跨平台图标 |

---

## 3. 项目结构设计

```
FunFact/
├── app/                          # 现有 React Web 项目（保留参考）
├── app-taro/                     # 新建 Taro 4.x 多端项目
│   ├── src/
│   │   ├── app.config.ts         # Taro 应用配置
│   │   ├── app.tsx               # 应用入口
│   │   ├── index.html            # H5 入口
│   │   │
│   │   ├── pages/                # 页面
│   │   │   ├── home/             # 首页模块
│   │   │   │   ├── index.tsx
│   │   │   │   ├── index.config.ts
│   │   │   │   └── index.less
│   │   │   ├── discover/         # 发现模块
│   │   │   ├── profile/          # 个人中心模块
│   │   │   ├── auth/             # 认证模块
│   │   │   ├── settings/         # 设置模块
│   │   │   └── report/           # 举报模块
│   │   │
│   │   ├── components/           # 公共组件
│   │   │   ├── KnowledgeCard/    # 知识卡片
│   │   │   ├── AIBottomSheet/    # AI 弹窗
│   │   │   ├── PageHeader/       # 页面头部
│   │   │   ├── GlobalLoading/    # 全局加载
│   │   │   └── ...
│   │   │
│   │   ├── stores/               # Zustand 状态管理
│   │   │   ├── auth.ts           # 认证状态
│   │   │   ├── user.ts           # 用户状态
│   │   │   ├── favorites.ts      # 收藏状态
│   │   │   └── settings.ts       # 设置状态
│   │   │
│   │   ├── services/             # API 服务层
│   │   │   ├── auth.service.ts
│   │   │   ├── knowledge.service.ts
│   │   │   ├── category.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── utils/                # 工具函数
│   │   │   ├── http.ts           # HTTP 封装
│   │   │   ├── platform.ts       # 平台适配
│   │   │   ├── storage.ts        # 存储封装
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── useAuth.ts
│   │   │   └── ...
│   │   │
│   │   ├── assets/               # 静态资源
│   │   │   ├── images/
│   │   │   └── animations/       # Lottie 动画文件
│   │   │
│   │   ├── styles/               # 全局样式
│   │   │   ├── variables.less    # Less 变量
│   │   │   ├── mixins.less       # Less 混入
│   │   │   ├── animations.less   # CSS 动画
│   │   │   └── app.less          # 全局样式
│   │   │
│   │   └── types/                # TypeScript 类型
│   │       └── index.ts
│   │
│   ├── config/                   # Taro 配置
│   │   ├── index.ts              # 主配置
│   │   ├── dev.ts                # 开发配置
│   │   ├── prod.ts               # 生产配置
│   │   └── platform/             # 平台特定配置
│   │       ├── weapp.ts
│   │       ├── tt.ts
│   │       ├── h5.ts
│   │       ├── rn.ts
│   │       └── harmony.ts
│   │
│   ├── package.json
│   └── project.config.json       # 小程序配置
│
└── docs/                         # 文档
```

---

## 4. 迁移策略详细规范

### 4.1 组件层迁移

#### 4.1.1 HTML 标签映射

| React Web | Taro 组件 | 说明 |
|-----------|----------|------|
| `<div>` | `<View>` | 容器组件 |
| `<span>` | `<Text>` | 行内文本 |
| `<p>` | `<Text>` | 段落文本 |
| `<h1>`-`<h6>` | `<Text>` | 标题文本 |
| `<img>` | `<Image>` | 图片组件 |
| `<input>` | `<Input>` | 输入框 |
| `<button>` | `<Button>` 或 `<View>` | 按钮 |
| `<form>` | `<Form>` | 表单 |
| `<scroll>` | `<ScrollView>` | 滚动容器 |
| `<textarea>` | `<Textarea>` | 多行输入 |

#### 4.1.2 事件处理迁移

```typescript
// React Web
<div onClick={handleClick} onTouchStart={handleTouch}>

// Taro
<View onClick={handleClick} onTouchStart={handleTouch}>
```

#### 4.1.3 样式类名迁移

```typescript
// React Web - Tailwind CSS
<div className="flex items-center p-4 bg-white rounded-lg">

// Taro - Less
<View className="container">
// container.less
.container {
  display: flex;
  align-items: center;
  padding: 32px;
  background-color: #fff;
  border-radius: 16px;
}
```

### 4.2 样式层迁移

#### 4.2.1 Tailwind CSS → Less 变量映射

```less
// variables.less - 设计令牌

// 颜色
@color-primary: #292526;
@color-bg-page: #1C1A1B;
@color-bg-card: #292526;
@color-text-main: #FDFDFD;
@color-text-sub: #DFDEDE;
@color-text-muted: #8C8A8B;
@color-border: #3a3637;

// 间距
@spacing-xs: 8px;
@spacing-sm: 16px;
@spacing-md: 24px;
@spacing-lg: 32px;
@spacing-xl: 40px;

// 圆角
@radius-sm: 8px;
@radius-md: 12px;
@radius-lg: 16px;
@radius-xl: 20px;
@radius-full: 100px;

// 字体
@font-size-xs: 20px;
@font-size-sm: 24px;
@font-size-base: 28px;
@font-size-lg: 32px;
@font-size-xl: 40px;

// 阴影
@shadow-card: 0 8px 40px rgba(41, 37, 38, 0.08);
@shadow-button: 0 8px 24px rgba(41, 37, 38, 0.25);
```

#### 4.2.2 响应式设计

```less
// mixins.less
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.no-scrollbar {
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}
```

### 4.3 动画层迁移

#### 4.3.1 简单动画 → CSS

```less
// animations.less

// 淡入
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.32s ease-out;
}

// 淡出
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fade-out {
  animation: fadeOut 0.32s ease-out;
}

// 上滑进入
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.slide-up {
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

// 下滑退出
@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

.slide-down {
  animation: slideDown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

// 缩放
@keyframes scaleIn {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.scale-in {
  animation: scaleIn 0.32s ease-out;
}

// 旋转加载
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 0.8s linear infinite;
}
```

#### 4.3.2 复杂动画 → Lottie

```typescript
// 使用 Lottie 处理复杂动画
import Lottie from 'lottie-taro';
import loadingAnimation from '@/assets/animations/loading.json';

<Lottie 
  animationData={loadingAnimation}
  loop={true}
  autoplay={true}
  style={{ width: 100, height: 100 }}
/>
```

#### 4.3.3 手势动画迁移

```typescript
// React Web - Motion 手势
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.15}
  onDragStart={handleDragStart}
  onDrag={handleDrag}
  onDragEnd={handleDragEnd}
  whileDrag={{ scale: 0.985 }}
>

// Taro - 使用 Taro 事件 + CSS
<View
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className={isDragging ? 'dragging' : ''}
>
```

### 4.4 状态管理迁移

#### 4.4.1 Context API → Zustand

```typescript
// stores/auth.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  login: (user: AuthUser, token: string, refreshToken?: string) => void;
  logout: () => void;
}

// Taro 存储适配器
const taroStorage = {
  getItem: async (name: string) => {
    const { data } = await Taro.getStorage({ key: name });
    return data;
  },
  setItem: async (name: string, value: string) => {
    await Taro.setStorage({ key: name, data: value });
  },
  removeItem: async (name: string) => {
    await Taro.removeStorage({ key: name });
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      
      login: (user, token, refreshToken) => {
        set({ 
          user, 
          token, 
          refreshToken: refreshToken ?? null,
          isLoggedIn: true 
        });
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isLoggedIn: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => taroStorage),
    }
  )
);
```

### 4.5 网络请求迁移

#### 4.5.1 axios → Taro.request

```typescript
// utils/http.ts
import Taro from '@tarojs/taro';

const BASE_URL = 'http://localhost:3000/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  showLoading?: boolean;
}

export const request = async <T = any>(options: RequestOptions): Promise<T> => {
  const { url, method = 'GET', data, header = {}, showLoading = true } = options;
  
  const token = await storage.get('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true });
  }
  
  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
      timeout: 10000,
    });
    
    if (showLoading) {
      Taro.hideLoading();
    }
    
    const { statusCode, data: body } = response;
    
    // 处理 401
    if (statusCode === 401) {
      // Token 刷新逻辑
    }
    
    // 处理业务错误
    if (body.code !== undefined && body.code !== 200) {
      Taro.showToast({ title: body.message || '请求失败', icon: 'none' });
      return Promise.reject(new Error(body.message));
    }
    
    return body.data !== undefined ? body.data : body;
  } catch (error: any) {
    if (showLoading) {
      Taro.hideLoading();
    }
    Taro.showToast({ title: '网络异常', icon: 'none' });
    return Promise.reject(error);
  }
};

export const http = {
  get: <T = any>(url: string, data?: any) => request<T>({ url, method: 'GET', data }),
  post: <T = any>(url: string, data?: any) => request<T>({ url, method: 'POST', data }),
  put: <T = any>(url: string, data?: any) => request<T>({ url, method: 'PUT', data }),
  delete: <T = any>(url: string, data?: any) => request<T>({ url, method: 'DELETE', data }),
};
```

### 4.6 平台差异处理

#### 4.6.1 平台检测

```typescript
// utils/platform.ts
import Taro from '@tarojs/taro';

export const PLATFORM = {
  isWeapp: process.env.TARO_ENV === 'weapp',
  isTT: process.env.TARO_ENV === 'tt',
  isH5: process.env.TARO_ENV === 'h5',
  isRN: process.env.TARO_ENV === 'rn',
  isHarmony: process.env.TARO_ENV === 'harmony',
};

export const getPlatformName = () => {
  if (PLATFORM.isWeapp) return '微信小程序';
  if (PLATFORM.isTT) return '抖音小程序';
  if (PLATFORM.isH5) return 'H5';
  if (PLATFORM.isRN) return 'React Native';
  if (PLATFORM.isHarmony) return '鸿蒙';
  return '未知';
};
```

#### 4.6.2 条件编译

```typescript
// 平台特定代码
if (process.env.TARO_ENV === 'weapp') {
  // 微信小程序特定逻辑
}

// 样式条件编译
/* #ifdef WEAPP */
.weapp-specific { }
/* #endif */

/* #ifdef H5 */
.h5-specific { }
/* #endif */
```

#### 4.6.3 平台适配 API

```typescript
// utils/platform.ts

// 统一存储
export const storage = {
  get: async (key: string) => {
    try {
      const res = await Taro.getStorage({ key });
      return res.data;
    } catch {
      return null;
    }
  },
  set: async (key: string, value: any) => {
    await Taro.setStorage({ key, data: value });
  },
  remove: async (key: string) => {
    await Taro.removeStorage({ key });
  },
};

// 统一路由
export const router = {
  push: (url: string) => Taro.navigateTo({ url }),
  replace: (url: string) => Taro.redirectTo({ url }),
  back: () => Taro.navigateBack(),
  switchTab: (url: string) => Taro.switchTab({ url }),
};

// 统一登录
export const login = async (): Promise<string> => {
  if (PLATFORM.isWeapp) {
    const { code } = await Taro.login();
    return code;
  }
  if (PLATFORM.isTT) {
    const { code } = await Taro.login({ force: true });
    return code;
  }
  // 其他平台
  return '';
};

// 统一分享
export const share = async (options: Taro.ShareAppMessageOption) => {
  if (PLATFORM.isWeapp || PLATFORM.isTT) {
    return options;
  }
  // H5 分享
  if (PLATFORM.isH5) {
    // Web Share API
  }
};
```

---

## 5. 核心组件迁移规范

### 5.1 KnowledgeCard 组件

**迁移要点：**
- `motion.div` → `View` + CSS 动画
- `motion.button` → `View` + CSS 动画
- 拖拽手势 → `onTouchStart/Move/End`
- 图片懒加载 → Taro Image 组件

**迁移后结构：**
```
components/KnowledgeCard/
├── index.tsx          # 主组件
├── index.less         # 样式
├── useDragGesture.ts  # 拖拽手势 Hook
└── types.ts           # 类型定义
```

### 5.2 AIBottomSheet 组件

**迁移要点：**
- `createPortal` → Taro 弹窗组件
- `AnimatePresence` → 条件渲染 + CSS 动画
- 滚动优化 → `ScrollView`

**迁移后结构：**
```
components/AIBottomSheet/
├── index.tsx
├── index.less
└── types.ts
```

### 5.3 PageHeader 组件

**迁移要点：**
- `motion.button` → `View` + CSS 动画
- 路由 → Taro 路由

---

## 6. 页面迁移规范

### 6.1 首页 (Home)

**复杂度：高**
- 卡片堆叠动画
- 下拉刷新
- 分类筛选弹窗
- AI 弹窗
- 自动播放
- 行为上报

### 6.2 发现页 (Discover)

**复杂度：中**
- 搜索功能
- 热搜列表
- 分类导航

### 6.3 个人中心 (Profile)

**复杂度：中**
- 用户信息展示
- 签到功能
- 收藏/历史列表
- 头像编辑

### 6.4 认证页面 (Auth)

**复杂度：中**
- 启动屏
- 欢迎页
- 登录/注册表单
- 短信验证

---

## 7. 平台特定配置

### 7.1 微信小程序

```typescript
// config/platform/weapp.ts
export default {
  miniCssExtractPluginOption: {
    ignoreOrder: true,
  },
  postcss: {
    pxtransform: {
      enable: true,
      config: {},
    },
  },
};
```

### 7.2 抖音小程序

```typescript
// config/platform/tt.ts
export default {
  miniCssExtractPluginOption: {
    ignoreOrder: true,
  },
};
```

### 7.3 H5

```typescript
// config/platform/h5.ts
export default {
  devServer: {
    port: 10086,
  },
  router: {
    mode: 'browser',
  },
};
```

### 7.4 React Native

```typescript
// config/platform/rn.ts
export default {
  rn: {
    appName: 'FunFact',
    output: {
      ios: './ios',
      android: './android',
    },
  },
};
```

### 7.5 鸿蒙

```typescript
// config/platform/harmony.ts
import path from 'path';
import os from 'os';

export default {
  harmony: {
    projectPath: path.join(os.homedir(), 'HarmonyProjects/FunFact'),
    hapName: 'entry',
  },
};
```

---

## 8. 构建脚本

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

## 9. 常用命令

### 9.1 清除端口占用

当端口被占用时，可使用以下命令清理：

```bash
# 查看端口占用情况
lsof -i :10086 -i :10088 -i :3000 | grep LISTEN

# 清除单个端口 (例如 10086)
kill -9 $(lsof -t -i:10086)

# 清除多个端口
kill -9 $(lsof -t -i:10086) $(lsof -t -i:10088) $(lsof -t -i:3000)

# 清除所有 node 进程 (谨慎使用)
pkill -9 node
```

### 9.2 开发命令

```bash
# 安装依赖
pnpm install

# 启动 H5 开发服务器
pnpm run dev:h5

# 启动微信小程序开发
pnpm run dev:weapp

# 启动抖音小程序开发
pnpm run dev:tt

# 构建生产版本
pnpm run build:h5
pnpm run build:weapp
pnpm run build:tt
```

---

## 10. 测试策略

### 10.1 单元测试

- 组件渲染测试
- Hook 测试
- 工具函数测试

### 10.2 集成测试

- API 接口测试
- 页面流程测试

### 10.3 平台测试

| 平台 | 测试环境 | 测试重点 |
|------|---------|---------|
| H5 | Chrome/Safari | 响应式、动画 |
| 微信小程序 | 微信开发者工具 | API 兼容、包体积 |
| 抖音小程序 | 抖音开发者工具 | API 兼容 |
| Android | Android 模拟器/真机 | 性能、手势 |
| iOS | iOS 模拟器/真机 | 性能、手势 |
| 鸿蒙 | DevEco Studio | API 兼容 |

---

## 11. 性能优化

### 11.1 包体积优化

- 分包加载
- 图片 CDN
- 代码分割
- Tree Shaking

### 11.2 渲染优化

- 虚拟列表
- 图片懒加载
- 防抖节流
- Memo 优化

### 11.3 网络优化

- 请求缓存
- 数据预加载
- 并发控制

---

## 12. 风险评估

| 风险 | 等级 | 应对策略 |
|------|------|---------|
| 动画迁移复杂 | 高 | CSS + Lottie 混合方案 |
| 第三方库不兼容 | 中 | 使用 Taro 生态库或自行封装 |
| 鸿蒙支持有限 | 中 | Taro 4.x C-API 方案 |
| 小程序包体积 | 中 | 分包、CDN、懒加载 |
| 多端 UI 差异 | 中 | 设计规范、条件编译 |
| 手势交互差异 | 中 | 平台适配层 |

---

## 13. 验收标准

### 13.1 功能验收

- [ ] 所有页面在 6 个平台功能正常
- [ ] 核心交互流程完整
- [ ] API 调用正常

### 13.2 性能验收

- [ ] 页面加载时间 < 3s
- [ ] 动画帧率 ≥ 60fps
- [ ] 小程序包体积 < 2MB（主包）

### 13.3 兼容性验收

- [ ] 微信小程序真机测试通过
- [ ] 抖音小程序真机测试通过
- [ ] Android 真机测试通过
- [ ] iOS 真机测试通过
- [ ] 鸿蒙真机测试通过

### 13.4 代码质量

- [ ] TypeScript 类型覆盖 > 90%
- [ ] 无严重 Bug
- [ ] 代码规范检查通过
