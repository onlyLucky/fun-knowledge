# app-taro 样式还原设计文档

## 概述

本文档描述了将 `app-taro` 项目的样式还原到与 `app` 项目一致的设计方案。`app` 是基于 React 18 + Vite + Tailwind CSS v4 的移动端 Web 应用，`app-taro` 是基于 Taro 4.0.7 + React 18 + LESS 的微信小程序项目。

## 背景

### 项目差异

| 方面 | app (Web/Vite) | app-taro (Taro/小程序) |
|------|----------------|------------------------|
| CSS 预处理器 | Tailwind CSS v4 (原子化 CSS) | LESS (传统 CSS 预处理器) |
| 样式位置 | JSX 内联 className | 独立 .less 文件 |
| 设计令牌 | CSS 自定义属性 (--color-primary) | LESS 变量 (@color-primary) |
| 像素值 | 标准 CSS 像素 | 2x 像素值 (Taro rpx 约定) |
| 暗色模式 | 支持 (.dark 类切换) | 不支持 |
| 动画 | Framer Motion | CSS 关键帧动画 |

### 核心目标

1. **样式还原**：确保 app-taro 的视觉效果与 app 一致
2. **暗色模式**：为 app-taro 添加暗色模式支持
3. **页面补全**：添加 app 中存在但 app-taro 缺失的页面
4. **架构保持**：保持 app-taro 现有的 LESS 架构

---

## 设计方案

### 1. 设计系统同步

#### 1.1 颜色变量同步

**改动文件**：`app-taro/src/styles/variables.less`

**变更内容**：
- 保持现有 LESS 变量定义
- 添加 CSS 自定义属性映射
- 添加暗色模式变量覆盖

```less
// 现有变量（保持不变）
@color-primary: #292526;
@color-primary-soft: #433f40;
@color-text-main: #121111;
@color-text-sub: #787676;
@color-text-muted: #878787;
@color-bg-page: #F2F2F2;
@color-bg-card: #FDFDFD;
@color-border: #DFDEDE;
@color-accent: #347EFB;

// CSS 自定义属性映射（新增）
:root {
  --color-primary: @color-primary;
  --color-primary-soft: @color-primary-soft;
  --color-text-main: @color-text-main;
  --color-text-sub: @color-text-sub;
  --color-text-muted: @color-text-muted;
  --color-bg-page: @color-bg-page;
  --color-bg-card: @color-bg-card;
  --color-border: @color-border;
  --color-accent: @color-accent;
}

// 暗色模式（新增）
.dark {
  --color-primary: #484848;
  --color-primary-soft: #5a5a5a;
  --color-text-main: #EDEDED;
  --color-text-sub: #A0A0A0;
  --color-text-muted: #707070;
  --color-bg-page: #1A1A1A;
  --color-bg-card: #252525;
  --color-border: #3A3A3A;
  --color-accent: #347EFB;
}
```

#### 1.2 暗色模式切换机制

**新增文件**：`app-taro/src/utils/theme.ts`

**功能**：
- 读取/保存暗色模式偏好（Taro.getStorageSync/setStorageSync）
- 切换 `document.documentElement.classList` 的 `dark` 类
- 提供 `useDarkMode` hook

```typescript
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';

const DARK_MODE_KEY = 'app_dark_mode';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return Taro.getStorageSync(DARK_MODE_KEY) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      Taro.setStorageSync(DARK_MODE_KEY, isDark);
    } catch (e) {
      console.error('Failed to save dark mode preference', e);
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  return { isDark, toggleDark };
}
```

#### 1.3 Mixins 补全

**改动文件**：`app-taro/src/styles/mixins.less`

**补全内容**：
- 确保 `.safe-area-top()` / `.safe-area-bottom()` 使用 `env()` + `constant()` 兼容
- 补充 app 中常用的样式模式（毛玻璃效果、卡片样式等）
- 添加暗色模式相关的 mixin

---

### 2. 页面样式同步

#### 2.1 同步顺序

按优先级依次处理：
1. **首页（Home）** - 核心页面，用户最先看到
2. **个人中心（Profile）** - 高频使用页面
3. **发现页（Discover）** - 搜索和浏览功能
4. **认证页面（Welcome/Login）** - 入口页面
5. **补全缺失页面** - Settings、ProfileEdit、Favorites 等

#### 2.2 同步策略

对于每个页面：
1. **读取 app 中的样式**：从 JSX 中提取 Tailwind 类和内联样式
2. **转换为 LESS**：将 Tailwind 类转换为等效的 LESS 样式
3. **应用 2x 像素值**：根据 Taro rpx 约定，将像素值乘以 2
4. **使用设计系统变量**：优先使用 `variables.less` 中的变量
5. **添加暗色模式支持**：使用 CSS 变量实现主题切换

#### 2.3 示例：首页样式同步

**app 中的样式（Tailwind）**：
```jsx
<div className="bg-bg-page min-h-screen">
  <div className="px-5 py-4">
    <div className="rounded-[24px] bg-bg-card p-4 shadow-[0_2px_6px_rgba(41,37,38,0.06)]">
      {/* 卡片内容 */}
    </div>
  </div>
</div>
```

**转换为 app-taro 的 LESS**：
```less
.home-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  
  .card-container {
    padding: @spacing-4 @spacing-5;
    
    .knowledge-card {
      border-radius: @radius-2xl; // 24px → 48px (2x)
      background-color: var(--color-bg-card);
      padding: @spacing-4; // 16px → 32px (2x)
      box-shadow: @shadow-sm;
    }
  }
}
```

---

### 3. 补全缺失页面

#### 3.1 需要补全的页面

| 页面 | 路径 | 说明 |
|------|------|------|
| Settings | `/pages/settings/index.tsx` | 设置页 |
| ProfileEdit | `/pages/profile/edit/index.tsx` | 编辑资料页 |
| AvatarEdit | `/pages/profile/avatar/index.tsx` | 头像编辑页 |
| NicknameEdit | `/pages/profile/nickname/index.tsx` | 昵称编辑页 |
| SignatureEdit | `/pages/profile/signature/index.tsx` | 签名编辑页 |
| Calendar | `/pages/profile/calendar/index.tsx` | 签到日历页 |
| Favorites | `/pages/profile/favorites/index.tsx` | 收藏页 |
| BrowseHistory | `/pages/profile/history/index.tsx` | 浏览历史页 |
| HotSearch | `/pages/discover/hot/index.tsx` | 热搜页 |
| Report | `/pages/report/index.tsx` | 举报页 |

#### 3.2 页面创建策略

1. **复用组件**：优先使用 app-taro 现有的组件（PageHeader、AuthGuard 等）
2. **样式同步**：从 app 中提取样式，转换为 LESS
3. **路由配置**：更新 `app.config.ts` 添加新页面路由
4. **TabBar 更新**：如需要，更新 TabBar 配置

---

### 4. 动画处理

#### 4.1 简单动画（CSS）

**保持现有 CSS 关键帧动画**，包括：
- 淡入淡出（fadeIn/fadeOut）
- 滑动（slideUp/slideDown）
- 缩放（scaleIn/scaleOut）
- 旋转（spin）

**改动文件**：`app-taro/src/styles/animations.less`

#### 4.2 复杂动画（Lottie）

**引入 Lottie** 处理复杂动画：
- Logo 动画
- 加载动画
- 特殊交互动画

**新增依赖**：`@lottiefiles/taro-lottie` 或 `taro-lottie`

**使用方式**：
```tsx
import Lottie from '@lottiefiles/taro-lottie';
import animationData from './logo-animation.json';

<Lottie animationData={animationData} loop={true} />
```

---

## 实现阶段

### 阶段一：设计系统同步（1-2 天）

**任务清单**：
- [ ] 更新 `variables.less`，添加 CSS 变量映射和暗色模式
- [ ] 创建 `theme.ts` 工具函数
- [ ] 补全 `mixins.less`
- [ ] 更新 `app.tsx`，集成暗色模式切换

**验收标准**：
- 所有颜色变量同时支持 LESS 变量和 CSS 自定义属性
- 暗色模式可以通过 `useDarkMode` hook 切换
- 切换暗色模式后，页面颜色正确变化

### 阶段二：核心页面同步（3-5 天）

**任务清单**：
- [ ] 首页（Home）样式同步
- [ ] 个人中心（Profile）样式同步
- [ ] 发现页（Discover）样式同步
- [ ] 认证页面（Welcome/Login）样式同步

**验收标准**：
- 每个页面的视觉效果与 app 一致
- 像素值按 2x 比例正确缩放
- 暗色模式下样式正确切换

### 阶段三：补全缺失页面（5-7 天）

**任务清单**：
- [ ] 设置页（Settings）
- [ ] 编辑资料页（ProfileEdit）
- [ ] 收藏页（Favorites）
- [ ] 签到日历页（Calendar）
- [ ] 其他页面

**验收标准**：
- 新页面功能完整
- 样式与 app 一致
- 路由配置正确

### 阶段四：动画优化（2-3 天）

**任务清单**：
- [ ] 引入 Lottie 依赖
- [ ] 替换复杂动画为 Lottie 实现
- [ ] 优化现有 CSS 动画

**验收标准**：
- 复杂动画使用 Lottie 实现
- 简单动画保持 CSS 关键帧
- 动画流畅，无卡顿

---

## 关键文件清单

### 需要修改的文件

| 文件路径 | 修改内容 |
|----------|----------|
| `app-taro/src/styles/variables.less` | 添加 CSS 变量映射和暗色模式 |
| `app-taro/src/styles/mixins.less` | 补全 mixins |
| `app-taro/src/styles/animations.less` | 优化动画定义 |
| `app-taro/src/styles/app.less` | 更新全局样式入口 |
| `app-taro/src/app.tsx` | 集成暗色模式切换 |
| `app-taro/src/pages/home/index.less` | 首页样式同步 |
| `app-taro/src/pages/profile/index.less` | 个人中心样式同步 |
| `app-taro/src/pages/discover/index.less` | 发现页样式同步 |
| `app-taro/src/pages/auth/welcome/index.less` | 欢迎页样式同步 |
| `app-taro/src/pages/auth/login/index.less` | 登录页样式同步 |
| `app-taro/src/app.config.ts` | 添加新页面路由 |

### 需要新增的文件

| 文件路径 | 说明 |
|----------|------|
| `app-taro/src/utils/theme.ts` | 暗色模式工具函数 |
| `app-taro/src/pages/settings/index.tsx` | 设置页 |
| `app-taro/src/pages/settings/index.less` | 设置页样式 |
| `app-taro/src/pages/profile/edit/index.tsx` | 编辑资料页 |
| `app-taro/src/pages/profile/edit/index.less` | 编辑资料页样式 |
| `app-taro/src/pages/profile/favorites/index.tsx` | 收藏页 |
| `app-taro/src/pages/profile/favorites/index.less` | 收藏页样式 |
| `app-taro/src/pages/profile/calendar/index.tsx` | 签到日历页 |
| `app-taro/src/pages/profile/calendar/index.less` | 签到日历页样式 |

---

## 验证方法

### 样式一致性验证

1. **视觉对比**：将 app 和 app-taro 的同一页面进行视觉对比
2. **像素测量**：使用开发者工具测量关键元素的尺寸
3. **颜色检查**：验证颜色值是否正确

### 暗色模式验证

1. **切换测试**：切换暗色模式，验证颜色变化
2. **持久化测试**：重启应用后，验证暗色模式偏好是否保存
3. **兼容性测试**：在不同设备上测试暗色模式

### 功能验证

1. **页面跳转**：验证所有页面路由正确
2. **交互功能**：验证页面交互功能正常
3. **动画效果**：验证动画流畅，无卡顿

---

## 风险与缓解措施

### 风险 1：像素值缩放不准确

**描述**：Taro 的 rpx 转换可能导致像素值不准确

**缓解措施**：
- 建立像素值转换对照表
- 在真机上进行视觉验证
- 使用 Taro 的 rpx 单位而非手动计算

### 风险 2：暗色模式兼容性

**描述**：某些组件可能不支持 CSS 变量

**缓解措施**：
- 逐步添加暗色模式支持
- 对于不支持的组件，使用 `@media (prefers-color-scheme: dark)` 媒体查询
- 提供降级方案

### 风险 3：动画性能问题

**描述**：Lottie 动画可能在低端设备上卡顿

**缓解措施**：
- 优化 Lottie 动画文件大小
- 提供动画开关选项
- 对于关键动画，保留 CSS 降级方案

---

## 附录

### A. 像素值转换对照表

| app 像素值 | app-taro 像素值 (2x) | 说明 |
|------------|----------------------|------|
| 10px | 20px | 最小间距 |
| 12px | 24px | 小间距 |
| 14px | 28px | 基础字体大小 |
| 16px | 32px | 中等间距 |
| 17px | 34px | 标题字体大小 |
| 20px | 40px | 大间距 |
| 24px | 48px | 圆角半径 |
| 38px | 76px | 按钮尺寸 |

### B. 设计令牌对照表

| 令牌名称 | app (CSS 变量) | app-taro (LESS 变量) | 值 |
|----------|----------------|----------------------|-----|
| 主色调 | --color-primary | @color-primary | #292526 |
| 主文本 | --color-text-main | @color-text-main | #121111 |
| 次要文本 | --color-text-sub | @color-text-sub | #787676 |
| 弱化文本 | --color-text-muted | @color-text-muted | #878787 |
| 页面背景 | --color-bg-page | @color-bg-page | #F2F2F2 |
| 卡片背景 | --color-bg-card | @color-bg-card | #FDFDFD |
| 边框颜色 | --color-border | @color-border | #DFDEDE |
| 强调色 | --color-accent | @color-accent | #347EFB |

---

*文档版本：v1.0*
*创建日期：2026-05-27*
*作者：Feynman*
