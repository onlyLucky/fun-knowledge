# app-taro 样式还原实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 app-taro 项目的样式还原到与 app 项目一致，并补全缺失页面

**Architecture:** 增量同步方案 - 保持 app-taro 现有 LESS 架构，逐个同步 app 的样式和组件，添加暗色模式支持，补全缺失页面

**Tech Stack:** Taro 4.0.7, React 18, TypeScript, LESS, Zustand, Lottie

---
 
## 文件结构

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

## 任务清单

### Task 1: 更新 variables.less - 添加 CSS 变量映射和暗色模式

**Files:**
- Modify: `app-taro/src/styles/variables.less`

- [ ] **Step 1: 读取当前 variables.less 文件**

```bash
cat app-taro/src/styles/variables.less
```

- [ ] **Step 2: 添加 CSS 变量映射**

在文件末尾添加：

```less
// CSS 自定义属性映射（支持暗色模式）
:root {
  // 颜色变量
  --color-primary: @color-primary;
  --color-primary-soft: @color-primary-soft;
  --color-text-main: @color-text-main;
  --color-text-sub: @color-text-sub;
  --color-text-muted: @color-text-muted;
  --color-text-disabled: @color-text-disabled;
  --color-bg-page: @color-bg-page;
  --color-bg-card: @color-bg-card;
  --color-bg-overlay: @color-bg-overlay;
  --color-border: @color-border;
  --color-border-light: @color-border-light;
  --color-accent: @color-accent;
  --color-brand: @color-brand;
  --color-success: @color-success;
  --color-warning: @color-warning;
  --color-error: @color-error;
  --color-info: @color-info;
  --color-red: @color-red;
  --color-green: @color-green;

  // 字体变量
  --font-family-sans: @font-family-sans;

  // 间距变量
  --spacing-0: @spacing-0;
  --spacing-1: @spacing-1;
  --spacing-2: @spacing-2;
  --spacing-3: @spacing-3;
  --spacing-4: @spacing-4;
  --spacing-5: @spacing-5;
  --spacing-6: @spacing-6;
  --spacing-8: @spacing-8;
  --spacing-10: @spacing-10;
  --spacing-12: @spacing-12;
  --spacing-16: @spacing-16;

  // 圆角变量
  --radius-none: @radius-none;
  --radius-sm: @radius-sm;
  --radius-md: @radius-md;
  --radius-lg: @radius-lg;
  --radius-xl: @radius-xl;
  --radius-2xl: @radius-2xl;
  --radius-3xl: @radius-3xl;
  --radius-full: @radius-full;

  // 阴影变量
  --shadow-sm: @shadow-sm;
  --shadow-md: @shadow-md;
  --shadow-lg: @shadow-lg;
  --shadow-card: @shadow-card;
  --shadow-button: @shadow-button;
  --shadow-sheet: @shadow-sheet;

  // 动画变量
  --duration-fast: @duration-fast;
  --duration-normal: @duration-normal;
  --duration-slow: @duration-slow;
  --ease-default: @ease-default;
  --ease-in: @ease-in;
  --ease-out: @ease-out;
  --ease-in-out: @ease-in-out;
  --ease-spring: @ease-spring;

  // 布局变量
  --max-width: @max-width;
  --tab-bar-height: @tab-bar-height;
  --header-height: @header-height;
}

// 暗色模式
.dark {
  // 颜色变量
  --color-primary: #484848;
  --color-primary-soft: #5a5a5a;
  --color-text-main: #EDEDED;
  --color-text-sub: #A0A0A0;
  --color-text-muted: #707070;
  --color-text-disabled: #5C5A5B;
  --color-bg-page: #1A1A1A;
  --color-bg-card: #252525;
  --color-bg-overlay: rgba(0, 0, 0, 0.7);
  --color-border: #3A3A3A;
  --color-border-light: #2A2A2A;
  --color-accent: #347EFB;
  --color-brand: #347EFB;
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-error: #F87171;
  --color-info: #60A5FA;
  --color-red: #FF4D4F;
  --color-green: #52C41A;
}
```

- [ ] **Step 3: 验证 LESS 编译**

```bash
cd app-taro && npx lessc src/styles/variables.less
```

Expected: 无错误输出

- [ ] **Step 4: 提交更改**

```bash
git add app-taro/src/styles/variables.less
git commit -m "feat(styles): 添加 CSS 变量映射和暗色模式支持"
```

---

### Task 2: 创建 theme.ts - 暗色模式工具函数

**Files:**
- Create: `app-taro/src/utils/theme.ts`

- [ ] **Step 1: 创建 theme.ts 文件**

```typescript
import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';

const DARK_MODE_KEY = 'app_dark_mode';

/**
 * 暗色模式 hook
 * 管理暗色模式状态，包括本地存储和 DOM 类名切换
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return Taro.getStorageSync(DARK_MODE_KEY) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // 切换 document 的 dark 类
    document.documentElement.classList.toggle('dark', isDark);

    // 保存到本地存储
    try {
      Taro.setStorageSync(DARK_MODE_KEY, isDark);
    } catch (e) {
      console.error('Failed to save dark mode preference', e);
    }
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const setDark = useCallback((value: boolean) => {
    setIsDark(value);
  }, []);

  return { isDark, toggleDark, setDark };
}

/**
 * 获取当前暗色模式状态（非 hook 版本）
 */
export function getDarkMode(): boolean {
  try {
    return Taro.getStorageSync(DARK_MODE_KEY) || false;
  } catch {
    return false;
  }
}

/**
 * 设置暗色模式状态（非 hook 版本）
 */
export function setDarkMode(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
  try {
    Taro.setStorageSync(DARK_MODE_KEY, isDark);
  } catch (e) {
    console.error('Failed to save dark mode preference', e);
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd app-taro && npx tsc --noEmit src/utils/theme.ts
```

Expected: 无错误输出

- [ ] **Step 3: 提交更改**

```bash
git add app-taro/src/utils/theme.ts
git commit -m "feat(utils): 添加暗色模式工具函数 useDarkMode"
```

---

### Task 3: 更新 app.tsx - 集成暗色模式切换

**Files:**
- Modify: `app-taro/src/app.tsx`

- [ ] **Step 1: 读取当前 app.tsx 文件**

```bash
cat app-taro/src/app.tsx
```

- [ ] **Step 2: 添加暗色模式初始化**

在 `useEffect` 中添加暗色模式初始化：

```typescript
import { useDarkMode } from './utils/theme';

function App({ children }: PropsWithChildren) {
  const { isDark } = useDarkMode();

  useEffect(() => {
    // 暗色模式已在 useDarkMode hook 中自动处理
    console.log('Dark mode:', isDark);
  }, [isDark]);

  // ... 其他代码
}
```

- [ ] **Step 3: 验证应用启动**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 应用正常启动，控制台输出暗色模式状态

- [ ] **Step 4: 提交更改**

```bash
git add app-taro/src/app.tsx
git commit -m "feat(app): 集成暗色模式切换功能"
```

---

### Task 4: 补全 mixins.less

**Files:**
- Modify: `app-taro/src/styles/mixins.less`

- [ ] **Step 1: 读取当前 mixins.less 文件**

```bash
cat app-taro/src/styles/mixins.less
```

- [ ] **Step 2: 补全缺失的 mixins**

添加以下 mixins：

```less
// 毛玻璃效果（兼容微信小程序）
.glass(@blur: 20px, @opacity: 0.8) {
  backdrop-filter: blur(@blur);
  -webkit-backdrop-filter: blur(@blur);
  background-color: rgba(255, 255, 255, @opacity);
}

// 暗色模式毛玻璃
.dark .glass(@blur: 20px, @opacity: 0.8) {
  background-color: rgba(30, 30, 30, @opacity);
}

// 卡片样式（使用 CSS 变量）
.card() {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

// 按钮基础样式（使用 CSS 变量）
.button-base() {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-default);

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

// 主按钮样式
.button-primary() {
  .button-base();
  background-color: var(--color-primary);
  color: white;

  &:active {
    background-color: var(--color-primary-soft);
  }
}

// 次要按钮样式
.button-secondary() {
  .button-base();
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);

  &:active {
    background-color: var(--color-bg-page);
  }
}

// 输入框样式
.input-base() {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--color-text-main);
  transition: border-color var(--duration-fast) var(--ease-default);

  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
}

// 禁用状态
.disabled() {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

// 选中状态
.selected() {
  background-color: var(--color-accent);
  color: white;
}

// 骨架屏动画
.skeleton() {
  background: linear-gradient(
    90deg,
    var(--color-bg-page) 25%,
    var(--color-bg-card) 50%,
    var(--color-bg-page) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 文本截断
.ellipsis() {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行文本截断
.ellipsis-lines(@lines: 2) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: @lines;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 隐藏滚动条
.no-scrollbar() {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

// Flex 布局快捷方式
.flex-center() {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between() {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column() {
  display: flex;
  flex-direction: column;
}

// 绝对定位居中
.absolute-center() {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 绝对定位填充
.absolute-fill() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

// 过渡动画
.transition-all() {
  transition: all var(--duration-normal) var(--ease-default);
}

.transition-transform() {
  transition: transform var(--duration-normal) var(--ease-default);
}

.transition-opacity() {
  transition: opacity var(--duration-normal) var(--ease-default);
}
```

- [ ] **Step 3: 验证 LESS 编译**

```bash
cd app-taro && npx lessc src/styles/mixins.less
```

Expected: 无错误输出

- [ ] **Step 4: 提交更改**

```bash
git add app-taro/src/styles/mixins.less
git commit -m "feat(styles): 补全 mixins，添加暗色模式支持的样式混入"
```

---

### Task 5: 首页样式同步

**Files:**
- Modify: `app-taro/src/pages/home/index.less`
- Modify: `app-taro/src/pages/home/index.tsx`

- [ ] **Step 1: 读取 app 中首页的样式**

```bash
cat app/src/pages/home/Home.tsx | grep -A 5 -B 5 "className"
```

- [ ] **Step 2: 更新 index.less 文件**

根据 app 的样式，更新 `app-taro/src/pages/home/index.less`：

```less
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.home-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
}

// 分类按钮
.category-btn {
  .flex-center();
  width: 76px;
  height: 76px;
  border-radius: var(--radius-xl);
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-default);

  &.active {
    .selected();
  }

  &:active {
    transform: scale(0.95);
  }
}

// 分类项
.category-item {
  .flex-column();
  align-items: center;
  gap: var(--spacing-2);

  .category-icon {
    width: 48px;
    height: 48px;
  }

  .category-name {
    font-size: @font-size-xs;
    color: var(--color-text-sub);
  }
}

// 知识卡片
.knowledge-card {
  .card();
  padding: var(--spacing-4);
  margin: var(--spacing-4) var(--spacing-5);
  overflow: hidden;

  .card-image-wrapper {
    width: 100%;
    height: 45%;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-bottom: var(--spacing-3);

    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-content {
    .card-title {
      font-size: @font-size-lg;
      font-weight: 600;
      color: var(--color-text-main);
      margin-bottom: var(--spacing-2);
      .ellipsis-lines(2);
    }

    .card-description {
      font-size: @font-size-sm;
      color: var(--color-text-sub);
      .ellipsis-lines(3);
    }
  }
}

// 卡片操作区
.card-actions {
  .flex-between();
  height: 128px;
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-border-light);

  .action-btn {
    .flex-center();
    width: 80px;
    height: 80px;
    border-radius: var(--radius-full);
    background-color: var(--color-bg-page);

    &:active {
      background-color: var(--color-border-light);
    }

    &.liked {
      color: var(--color-error);
    }

    &.collected {
      color: var(--color-warning);
    }
  }
}

// AI 按钮
.ai-btn {
  .flex-center();
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-accent), #6C63FF);
  color: white;
  box-shadow: var(--shadow-md);

  &:active {
    transform: scale(0.95);
  }
}

// 打卡横幅
.checkin-banner {
  .card();
  .flex-between();
  padding: var(--spacing-4) var(--spacing-5);
  margin: var(--spacing-4) var(--spacing-5);

  .checkin-info {
    .flex-column();
    gap: var(--spacing-1);

    .checkin-title {
      font-size: @font-size-base;
      font-weight: 600;
      color: var(--color-text-main);
    }

    .checkin-desc {
      font-size: @font-size-xs;
      color: var(--color-text-sub);
    }
  }

  .checkin-btn {
    .button-primary();
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-full);
  }
}

// 进度点
.progress-dots {
  .flex-center();
  gap: var(--spacing-2);
  padding: var(--spacing-3);

  .dot {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    background-color: var(--color-border);

    &.active {
      background-color: var(--color-accent);
      width: 24px;
    }
  }
}
```

- [ ] **Step 3: 更新 index.tsx 文件**

确保 `index.tsx` 使用正确的类名：

```typescript
// 确保类名与 LESS 文件中的选择器匹配
<View className="home-page">
  <View className="category-btn active">
    {/* 分类内容 */}
  </View>
  <View className="knowledge-card">
    {/* 卡片内容 */}
  </View>
</View>
```

- [ ] **Step 4: 验证样式效果**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 首页样式与 app 一致

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/src/pages/home/index.less app-taro/src/pages/home/index.tsx
git commit -m "feat(home): 同步首页样式，使用 CSS 变量支持暗色模式"
```

---

### Task 6: 个人中心样式同步

**Files:**
- Modify: `app-taro/src/pages/profile/index.less`
- Modify: `app-taro/src/pages/profile/index.tsx`

- [ ] **Step 1: 读取 app 中个人中心的样式**

```bash
cat app/src/pages/profile/Profile.tsx | grep -A 5 -B 5 "className"
```

- [ ] **Step 2: 更新 index.less 文件**

根据 app 的样式，更新 `app-taro/src/pages/profile/index.less`：

```less
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.profile-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
}

// 用户卡片
.user-card {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  padding: var(--spacing-6);
  border-radius: var(--radius-3xl);
  position: relative;
  overflow: hidden;

  // 装饰性圆形
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--color-accent), #6C63FF);
    opacity: 0.1;
  }

  &::before {
    width: 200px;
    height: 200px;
    top: -80px;
    right: -60px;
  }

  &::after {
    width: 120px;
    height: 120px;
    bottom: -40px;
    left: -30px;
  }

  .user-info {
    .flex-center();
    flex-direction: column;
    gap: var(--spacing-3);
    position: relative;
    z-index: 1;

    .avatar-wrapper {
      width: 108px;
      height: 108px;
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 4px solid var(--color-bg-card);
      box-shadow: var(--shadow-md);

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-name {
      font-size: @font-size-xl;
      font-weight: 600;
      color: var(--color-text-main);
    }

    .user-signature {
      font-size: @font-size-sm;
      color: var(--color-text-sub);
      .ellipsis();
      max-width: 80%;
    }
  }
}

// 统计行
.stat-row {
  .flex-between();
  padding: var(--spacing-4) var(--spacing-5);

  .stat-item {
    .flex-column();
    align-items: center;
    gap: var(--spacing-1);
    flex: 1;

    .stat-value {
      font-size: @font-size-xl;
      font-weight: 600;
      color: var(--color-text-main);
    }

    .stat-label {
      font-size: @font-size-xs;
      color: var(--color-text-sub);
    }
  }
}

// 打卡卡片
.checkin-card {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  padding: var(--spacing-5);
  border-radius: var(--radius-2xl);

  .checkin-header {
    .flex-between();
    margin-bottom: var(--spacing-4);

    .checkin-title {
      font-size: @font-size-lg;
      font-weight: 600;
      color: var(--color-text-main);
    }

    .checkin-count {
      font-size: @font-size-sm;
      color: var(--color-accent);
    }
  }

  .checkin-calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--spacing-2);

    .calendar-day {
      .flex-center();
      width: 64px;
      height: 64px;
      border-radius: var(--radius-lg);
      font-size: @font-size-sm;
      color: var(--color-text-sub);

      &.checked {
        background-color: var(--color-accent);
        color: white;
      }

      &.today {
        border: 2px solid var(--color-accent);
        color: var(--color-accent);
      }
    }
  }
}

// 菜单分区
.menu-section {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  border-radius: var(--radius-2xl);
  overflow: hidden;

  .menu-section-title {
    font-size: @font-size-xs;
    color: var(--color-text-muted);
    padding: var(--spacing-3) var(--spacing-4) var(--spacing-1);
  }
}

// 菜单项
.menu-item {
  .flex-between();
  height: 112px;
  padding: 0 var(--spacing-4);
  transition: background-color var(--duration-fast) var(--ease-default);

  &:active {
    background-color: var(--color-bg-page);
  }

  .menu-left {
    .flex-center();
    gap: var(--spacing-3);

    .menu-icon-wrapper {
      .flex-center();
      width: 68px;
      height: 68px;
      border-radius: var(--radius-xl);
      background-color: var(--color-bg-page);

      .menu-icon {
        width: 36px;
        height: 36px;
        color: var(--color-text-main);
      }
    }

    .menu-label {
      font-size: @font-size-base;
      color: var(--color-text-main);
    }
  }

  .menu-right {
    .flex-center();

    .menu-arrow {
      width: 32px;
      height: 32px;
      color: var(--color-text-muted);
    }
  }
}
```

- [ ] **Step 3: 更新 index.tsx 文件**

确保 `index.tsx` 使用正确的类名：

```typescript
<View className="profile-page">
  <View className="user-card">
    <View className="user-info">
      <View className="avatar-wrapper">
        <Image src={avatar} />
      </View>
      <Text className="user-name">{nickname}</Text>
      <Text className="user-signature">{signature}</Text>
    </View>
  </View>

  <View className="stat-row">
    <View className="stat-item">
      <Text className="stat-value">{checkinDays}</Text>
      <Text className="stat-label">打卡天数</Text>
    </View>
    {/* 其他统计项 */}
  </View>

  <View className="menu-section">
    <View className="menu-item">
      <View className="menu-left">
        <View className="menu-icon-wrapper">
          <Icon className="menu-icon" />
        </View>
        <Text className="menu-label">收藏</Text>
      </View>
      <View className="menu-right">
        <Icon className="menu-arrow" />
      </View>
    </View>
    {/* 其他菜单项 */}
  </View>
</View>
```

- [ ] **Step 4: 验证样式效果**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 个人中心样式与 app 一致

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/src/pages/profile/index.less app-taro/src/pages/profile/index.tsx
git commit -m "feat(profile): 同步个人中心样式，使用 CSS 变量支持暗色模式"
```

---

### Task 7: 发现页样式同步

**Files:**
- Modify: `app-taro/src/pages/discover/index.less`
- Modify: `app-taro/src/pages/discover/index.tsx`

- [ ] **Step 1: 读取 app 中发现页的样式**

```bash
cat app/src/pages/discover/Discover.tsx | grep -A 5 -B 5 "className"
```

- [ ] **Step 2: 更新 index.less 文件**

根据 app 的样式，更新 `app-taro/src/pages/discover/index.less`：

```less
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.discover-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
}

// 搜索框
.search-box {
  padding: var(--spacing-4) var(--spacing-5);
  background-color: var(--color-bg-card);

  .search-input-wrapper {
    .flex-center();
    height: 80px;
    background-color: var(--color-bg-page);
    border-radius: 28px;
    padding: 0 var(--spacing-4);

    .search-icon {
      width: 36px;
      height: 36px;
      color: var(--color-text-muted);
      margin-right: var(--spacing-2);
    }

    .search-input {
      flex: 1;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-size: @font-size-base;
      color: var(--color-text-main);

      &::placeholder {
        color: var(--color-text-muted);
      }
    }
  }
}

// 搜索结果
.search-results {
  padding: var(--spacing-4) var(--spacing-5);

  .result-item {
    .flex-between();
    padding: var(--spacing-4);
    background-color: var(--color-bg-card);
    border-radius: 32px;
    margin-bottom: var(--spacing-3);

    &:active {
      background-color: var(--color-bg-page);
    }

    .result-content {
      flex: 1;
      .flex-column();
      gap: var(--spacing-1);

      .result-title {
        font-size: @font-size-base;
        font-weight: 500;
        color: var(--color-text-main);
        .ellipsis();
      }

      .result-desc {
        font-size: @font-size-xs;
        color: var(--color-text-sub);
        .ellipsis-lines(2);
      }
    }

    .result-image {
      width: 120px;
      height: 120px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-left: var(--spacing-3);

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

// 热搜卡片
.hot-search-card {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  padding: var(--spacing-5);
  border-radius: 40px;

  .hot-search-header {
    .flex-between();
    margin-bottom: var(--spacing-4);

    .hot-search-title {
      font-size: @font-size-lg;
      font-weight: 600;
      color: var(--color-text-main);
    }

    .hot-search-more {
      font-size: @font-size-xs;
      color: var(--color-text-muted);
    }
  }
}

// 热搜网格
.hot-search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);

  .hot-search-item {
    .flex-center();
    padding: var(--spacing-3) var(--spacing-4);
    background-color: var(--color-bg-page);
    border-radius: var(--radius-xl);
    transition: all var(--duration-fast) var(--ease-default);

    &:active {
      background-color: var(--color-border-light);
    }

    .rank-badge {
      .flex-center();
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      font-size: @font-size-xs;
      font-weight: 600;
      margin-right: var(--spacing-2);

      &.top-1 {
        background-color: #FF4D4F;
        color: white;
      }

      &.top-2 {
        background-color: #FF7A45;
        color: white;
      }

      &.top-3 {
        background-color: #FFA940;
        color: white;
      }

      &.normal {
        background-color: var(--color-bg-card);
        color: var(--color-text-sub);
      }
    }

    .hot-search-text {
      flex: 1;
      font-size: @font-size-sm;
      color: var(--color-text-main);
      .ellipsis();
    }

    .trend-indicator {
      width: 24px;
      height: 24px;
      margin-left: var(--spacing-1);

      &.trend-up {
        color: var(--color-success);
      }

      &.trend-down {
        color: var(--color-error);
      }

      &.trend-same {
        color: var(--color-text-muted);
      }
    }
  }
}
```

- [ ] **Step 3: 更新 index.tsx 文件**

确保 `index.tsx` 使用正确的类名：

```typescript
<View className="discover-page">
  <View className="search-box">
    <View className="search-input-wrapper">
      <Icon className="search-icon" />
      <Input className="search-input" placeholder="搜索冷知识" />
    </View>
  </View>

  <View className="hot-search-card">
    <View className="hot-search-header">
      <Text className="hot-search-title">热搜榜</Text>
      <Text className="hot-search-more">查看更多</Text>
    </View>
    <View className="hot-search-grid">
      {hotSearchList.map((item, index) => (
        <View className="hot-search-item" key={item.id}>
          <View className={`rank-badge ${index < 3 ? `top-${index + 1}` : 'normal'}`}>
            {index + 1}
          </View>
          <Text className="hot-search-text">{item.keyword}</Text>
          <Icon className={`trend-indicator trend-${item.trend}`} />
        </View>
      ))}
    </View>
  </View>
</View>
```

- [ ] **Step 4: 验证样式效果**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 发现页样式与 app 一致

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/src/pages/discover/index.less app-taro/src/pages/discover/index.tsx
git commit -m "feat(discover): 同步发现页样式，使用 CSS 变量支持暗色模式"
```

---

### Task 8: 认证页面样式同步

**Files:**
- Modify: `app-taro/src/pages/auth/welcome/index.less`
- Modify: `app-taro/src/pages/auth/login/index.less`

- [ ] **Step 1: 读取 app 中欢迎页的样式**

```bash
cat app/src/pages/auth/welcome/WelcomePage.tsx | grep -A 5 -B 5 "className"
```

- [ ] **Step 2: 更新欢迎页 index.less 文件**

根据 app 的样式，更新 `app-taro/src/pages/auth/welcome/index.less`：

```less
@import '../../../styles/variables.less';
@import '../../../styles/mixins.less';

.welcome-page {
  .flex-column();
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1C1A1B; // 深色背景，与 app 一致
  padding: var(--spacing-8) var(--spacing-6);
}

// Logo 区域
.logo-section {
  .flex-column();
  align-items: center;
  margin-bottom: var(--spacing-12);

  .logo-image {
    width: 200px;
    height: 200px;
    margin-bottom: var(--spacing-6);
  }

  .app-title {
    font-size: 56px;
    font-weight: 700;
    color: #FDFDFD;
    margin-bottom: var(--spacing-2);
  }

  .app-subtitle {
    font-size: @font-size-lg;
    color: rgba(253, 253, 253, 0.45);
  }
}

// 功能介绍
.features-section {
  .flex-column();
  align-items: center;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-12);

  .feature-item {
    .flex-center();
    gap: var(--spacing-3);

    .feature-icon {
      width: 48px;
      height: 48px;
      color: #347EFB;
    }

    .feature-text {
      font-size: @font-size-base;
      color: rgba(253, 253, 253, 0.65);
    }
  }
}

// 按钮组
.button-group {
  .flex-column();
  width: 100%;
  gap: var(--spacing-4);

  .login-btn {
    .flex-center();
    width: 100%;
    height: 100px;
    background-color: #347EFB;
    border-radius: var(--radius-xl);
    font-size: @font-size-lg;
    font-weight: 600;
    color: white;
    transition: all var(--duration-fast) var(--ease-default);

    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
  }

  .register-btn {
    .flex-center();
    width: 100%;
    height: 100px;
    background-color: transparent;
    border: 2px solid rgba(253, 253, 253, 0.2);
    border-radius: var(--radius-xl);
    font-size: @font-size-lg;
    font-weight: 600;
    color: rgba(253, 253, 253, 0.65);
    transition: all var(--duration-fast) var(--ease-default);

    &:active {
      background-color: rgba(253, 253, 253, 0.1);
    }
  }
}
```

- [ ] **Step 3: 读取 app 中登录页的样式**

```bash
cat app/src/pages/auth/login/LoginPage.tsx | grep -A 5 -B 5 "className"
```

- [ ] **Step 4: 更新登录页 index.less 文件**

根据 app 的样式，更新 `app-taro/src/pages/auth/login/index.less`：

```less
@import '../../../styles/variables.less';
@import '../../../styles/mixins.less';

.login-page {
  .flex-column();
  min-height: 100vh;
  background-color: var(--color-bg-page);
  padding: var(--spacing-6) var(--spacing-5);
}

// 页面标题
.page-header {
  margin-bottom: var(--spacing-8);

  .page-title {
    font-size: 56px;
    font-weight: 700;
    color: var(--color-text-main);
    margin-bottom: var(--spacing-2);
  }

  .page-subtitle {
    font-size: @font-size-lg;
    color: var(--color-text-sub);
  }
}

// 表单区域
.form-section {
  .flex-column();
  gap: var(--spacing-5);
}

// 输入框
.input-field {
  .flex-column();
  gap: var(--spacing-2);

  .input-label {
    font-size: @font-size-sm;
    font-weight: 500;
    color: var(--color-text-main);
  }

  .input-wrapper {
    .flex-center();
    height: 112px;
    background-color: var(--color-bg-card);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: 0 var(--spacing-4);
    transition: border-color var(--duration-fast) var(--ease-default);

    &.focused {
      border-color: var(--color-accent);
    }

    .input {
      flex: 1;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-size: @font-size-lg;
      color: var(--color-text-main);

      &::placeholder {
        color: var(--color-text-muted);
      }
    }
  }
}

// 验证码输入框
.code-input-wrapper {
  .flex-between();
  gap: var(--spacing-3);

  .code-input {
    flex: 1;
  }

  .send-code-btn {
    .flex-center();
    height: 112px;
    padding: 0 var(--spacing-5);
    background-color: var(--color-bg-page);
    border-radius: var(--radius-xl);
    font-size: @font-size-sm;
    color: var(--color-accent);
    white-space: nowrap;
    transition: all var(--duration-fast) var(--ease-default);

    &:disabled {
      color: var(--color-text-muted);
    }

    &:active {
      background-color: var(--color-border-light);
    }
  }
}

// 提交按钮
.submit-btn {
  .flex-center();
  width: 100%;
  height: 112px;
  background-color: var(--color-primary);
  border-radius: var(--radius-xl);
  font-size: @font-size-lg;
  font-weight: 600;
  color: white;
  margin-top: var(--spacing-4);
  box-shadow: var(--shadow-button);
  transition: all var(--duration-fast) var(--ease-default);

  &:disabled {
    opacity: 0.5;
  }

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

// 底部链接
.footer-links {
  .flex-center();
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);

  .footer-link {
    font-size: @font-size-xs;
    color: var(--color-text-muted);
    text-decoration: underline;

    &:active {
      color: var(--color-text-sub);
    }
  }
}
```

- [ ] **Step 5: 验证样式效果**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 欢迎页和登录页样式与 app 一致

- [ ] **Step 6: 提交更改**

```bash
git add app-taro/src/pages/auth/welcome/index.less app-taro/src/pages/auth/login/index.less
git commit -m "feat(auth): 同步认证页面样式，欢迎页使用深色背景"
```

---

### Task 9: 创建设置页

**Files:**
- Create: `app-taro/src/pages/settings/index.tsx`
- Create: `app-taro/src/pages/settings/index.less`
- Modify: `app-taro/src/app.config.ts`

- [ ] **Step 1: 创建设置页 LESS 文件**

```less
@import '../../styles/variables.less';
@import '../../styles/mixins.less';

.settings-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
}

// 设置分组
.settings-section {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  border-radius: var(--radius-2xl);
  overflow: hidden;

  .section-title {
    font-size: @font-size-xs;
    color: var(--color-text-muted);
    padding: var(--spacing-3) var(--spacing-4) var(--spacing-1);
  }
}

// 设置项
.settings-item {
  .flex-between();
  height: 112px;
  padding: 0 var(--spacing-4);
  transition: background-color var(--duration-fast) var(--ease-default);

  &:active {
    background-color: var(--color-bg-page);
  }

  .item-left {
    .flex-center();
    gap: var(--spacing-3);

    .item-icon-wrapper {
      .flex-center();
      width: 68px;
      height: 68px;
      border-radius: var(--radius-xl);
      background-color: var(--color-bg-page);

      .item-icon {
        width: 36px;
        height: 36px;
        color: var(--color-text-main);
      }
    }

    .item-content {
      .flex-column();
      gap: var(--spacing-1);

      .item-label {
        font-size: @font-size-base;
        color: var(--color-text-main);
      }

      .item-desc {
        font-size: @font-size-xs;
        color: var(--color-text-muted);
      }
    }
  }

  .item-right {
    .flex-center();
    gap: var(--spacing-2);

    .item-value {
      font-size: @font-size-sm;
      color: var(--color-text-muted);
    }

    .item-arrow {
      width: 32px;
      height: 32px;
      color: var(--color-text-muted);
    }

    // 开关样式
    .toggle-switch {
      width: 88px;
      height: 48px;
      border-radius: var(--radius-full);
      background-color: var(--color-border);
      position: relative;
      transition: background-color var(--duration-fast) var(--ease-default);

      &.active {
        background-color: var(--color-accent);
      }

      &::after {
        content: '';
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background-color: white;
        top: 4px;
        left: 4px;
        transition: transform var(--duration-fast) var(--ease-default);
      }

      &.active::after {
        transform: translateX(40px);
      }
    }
  }
}

// 退出登录按钮
.logout-btn {
  .flex-center();
  width: calc(100% - 40px);
  height: 112px;
  margin: var(--spacing-8) var(--spacing-5);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  font-size: @font-size-lg;
  font-weight: 500;
  color: var(--color-error);
  transition: all var(--duration-fast) var(--ease-default);

  &:active {
    background-color: var(--color-bg-page);
    transform: scale(0.95);
  }
}

// 版本信息
.version-info {
  .flex-column();
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-8) 0;

  .version-label {
    font-size: @font-size-xs;
    color: var(--color-text-muted);
  }

  .version-number {
    font-size: @font-size-sm;
    color: var(--color-text-sub);
  }
}
```

- [ ] **Step 2: 创建设置页 TSX 文件**

```typescript
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDarkMode } from '../../utils/theme';
import PageHeader from '../../components/PageHeader';
import './index.less';

export default function SettingsPage() {
  const { isDark, toggleDark } = useDarkMode();

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          Taro.removeStorageSync('token');
          Taro.removeStorageSync('userInfo');
          Taro.reLaunch({ url: '/pages/auth/welcome/index' });
        }
      }
    });
  };

  return (
    <View className="settings-page">
      <PageHeader title="设置" />

      <View className="settings-section">
        <Text className="section-title">通用设置</Text>

        <View className="settings-item">
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Icon className="item-icon" name="moon" />
            </View>
            <View className="item-content">
              <Text className="item-label">深色模式</Text>
              <Text className="item-desc">切换深色/浅色主题</Text>
            </View>
          </View>
          <View className="item-right">
            <View
              className={`toggle-switch ${isDark ? 'active' : ''}`}
              onClick={toggleDark}
            />
          </View>
        </View>

        <View className="settings-item" onClick={() => Taro.navigateTo({ url: '/pages/settings/about/index' })}>
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Icon className="item-icon" name="info" />
            </View>
            <View className="item-content">
              <Text className="item-label">关于我们</Text>
            </View>
          </View>
          <View className="item-right">
            <Icon className="item-arrow" name="chevron-right" />
          </View>
        </View>
      </View>

      <View className="settings-section">
        <Text className="section-title">账号与安全</Text>

        <View className="settings-item" onClick={() => Taro.navigateTo({ url: '/pages/settings/account/index' })}>
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Icon className="item-icon" name="user" />
            </View>
            <View className="item-content">
              <Text className="item-label">账号管理</Text>
            </View>
          </View>
          <View className="item-right">
            <Icon className="item-arrow" name="chevron-right" />
          </View>
        </View>

        <View className="settings-item" onClick={() => Taro.navigateTo({ url: '/pages/settings/privacy/index' })}>
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Icon className="item-icon" name="shield" />
            </View>
            <View className="item-content">
              <Text className="item-label">隐私设置</Text>
            </View>
          </View>
          <View className="item-right">
            <Icon className="item-arrow" name="chevron-right" />
          </View>
        </View>
      </View>

      <View className="logout-btn" onClick={handleLogout}>
        退出登录
      </View>

      <View className="version-info">
        <Text className="version-label">冷知识星球</Text>
        <Text className="version-number">v1.0.0</Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: 更新 app.config.ts 添加路由**

在 `app.config.ts` 的 `pages` 数组中添加：

```typescript
pages: [
  'pages/home/index',
  'pages/discover/index',
  'pages/profile/index',
  'pages/auth/welcome/index',
  'pages/auth/login/index',
  'pages/settings/index', // 新增
],
```

- [ ] **Step 4: 验证页面功能**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 设置页正常显示，深色模式切换功能正常

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/src/pages/settings/index.tsx app-taro/src/pages/settings/index.less app-taro/src/app.config.ts
git commit -m "feat(settings): 创建设置页，集成深色模式切换功能"
```

---

### Task 10: 创建收藏页

**Files:**
- Create: `app-taro/src/pages/profile/favorites/index.tsx`
- Create: `app-taro/src/pages/profile/favorites/index.less`
- Modify: `app-taro/src/app.config.ts`

- [ ] **Step 1: 创建收藏页 LESS 文件**

```less
@import '../../../styles/variables.less';
@import '../../../styles/mixins.less';

.favorites-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
}

// 收藏列表
.favorites-list {
  padding: var(--spacing-4) var(--spacing-5);
}

// 收藏项
.favorite-item {
  .card();
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-3);
  border-radius: var(--radius-xl);
  transition: all var(--duration-fast) var(--ease-default);

  &:active {
    transform: scale(0.98);
  }

  .favorite-content {
    .flex-column();
    gap: var(--spacing-2);

    .favorite-title {
      font-size: @font-size-lg;
      font-weight: 600;
      color: var(--color-text-main);
      .ellipsis-lines(2);
    }

    .favorite-desc {
      font-size: @font-size-sm;
      color: var(--color-text-sub);
      .ellipsis-lines(3);
    }

    .favorite-meta {
      .flex-between();
      margin-top: var(--spacing-2);

      .favorite-category {
        font-size: @font-size-xs;
        color: var(--color-accent);
        background-color: rgba(52, 126, 251, 0.1);
        padding: var(--spacing-1) var(--spacing-2);
        border-radius: var(--radius-sm);
      }

      .favorite-time {
        font-size: @font-size-xs;
        color: var(--color-text-muted);
      }
    }
  }

  .favorite-image {
    width: 100%;
    height: 200px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-top: var(--spacing-3);

    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

// 空状态
.empty-state {
  .flex-column();
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16) var(--spacing-8);

  .empty-icon {
    width: 120px;
    height: 120px;
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-4);
  }

  .empty-title {
    font-size: @font-size-lg;
    font-weight: 500;
    color: var(--color-text-main);
    margin-bottom: var(--spacing-2);
  }

  .empty-desc {
    font-size: @font-size-sm;
    color: var(--color-text-muted);
    text-align: center;
  }
}
```

- [ ] **Step 2: 创建收藏页 TSX 文件**

```typescript
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';
import './index.less';

interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // TODO: 调用 API 获取收藏列表
      // const res = await api.getFavorites();
      // setFavorites(res.data);
      setFavorites([]);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: FavoriteItem) => {
    Taro.navigateTo({
      url: `/pages/home/detail/index?id=${item.id}`
    });
  };

  return (
    <View className="favorites-page">
      <PageHeader title="我的收藏" />

      {favorites.length > 0 ? (
        <View className="favorites-list">
          {favorites.map((item) => (
            <View
              key={item.id}
              className="favorite-item"
              onClick={() => handleItemClick(item)}
            >
              <View className="favorite-content">
                <Text className="favorite-title">{item.title}</Text>
                <Text className="favorite-desc">{item.description}</Text>
                <View className="favorite-meta">
                  <Text className="favorite-category">{item.category}</Text>
                  <Text className="favorite-time">{item.createdAt}</Text>
                </View>
              </View>
              {item.image && (
                <View className="favorite-image">
                  <Image src={item.image} mode="aspectFill" />
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="empty-state">
          <Icon className="empty-icon" name="heart" />
          <Text className="empty-title">暂无收藏</Text>
          <Text className="empty-desc">浏览知识卡片时，点击收藏按钮即可添加到这里</Text>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 3: 更新 app.config.ts 添加路由**

在 `app.config.ts` 的 `pages` 数组中添加：

```typescript
pages: [
  'pages/home/index',
  'pages/discover/index',
  'pages/profile/index',
  'pages/auth/welcome/index',
  'pages/auth/login/index',
  'pages/settings/index',
  'pages/profile/favorites/index', // 新增
],
```

- [ ] **Step 4: 验证页面功能**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 收藏页正常显示，空状态展示正确

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/src/pages/profile/favorites/index.tsx app-taro/src/pages/profile/favorites/index.less app-taro/src/app.config.ts
git commit -m "feat(favorites): 创建收藏页，支持收藏列表展示"
```

---

### Task 11: 创建签到日历页

**Files:**
- Create: `app-taro/src/pages/profile/calendar/index.tsx`
- Create: `app-taro/src/pages/profile/calendar/index.less`
- Modify: `app-taro/src/app.config.ts`

- [ ] **Step 1: 创建签到日历页 LESS 文件**

```less
@import '../../../styles/variables.less';
@import '../../../styles/mixins.less';

.calendar-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
}

// 月份选择器
.month-selector {
  .flex-between();
  padding: var(--spacing-4) var(--spacing-5);
  background-color: var(--color-bg-card);

  .month-nav-btn {
    .flex-center();
    width: 64px;
    height: 64px;
    border-radius: var(--radius-full);
    background-color: var(--color-bg-page);

    &:active {
      background-color: var(--color-border-light);
    }

    .nav-icon {
      width: 32px;
      height: 32px;
      color: var(--color-text-main);
    }
  }

  .current-month {
    font-size: @font-size-xl;
    font-weight: 600;
    color: var(--color-text-main);
  }
}

// 统计卡片
.stats-card {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  padding: var(--spacing-5);
  border-radius: var(--radius-2xl);

  .stats-row {
    .flex-between();

    .stat-item {
      .flex-column();
      align-items: center;
      flex: 1;

      .stat-value {
        font-size: 48px;
        font-weight: 700;
        color: var(--color-text-main);
        margin-bottom: var(--spacing-1);
      }

      .stat-label {
        font-size: @font-size-xs;
        color: var(--color-text-sub);
      }
    }
  }
}

// 日历网格
.calendar-grid {
  .card();
  margin: var(--spacing-4) var(--spacing-5);
  padding: var(--spacing-4);
  border-radius: var(--radius-2xl);

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: var(--spacing-3);

    .weekday-item {
      .flex-center();
      font-size: @font-size-xs;
      color: var(--color-text-muted);
      padding: var(--spacing-2) 0;
    }
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--spacing-2);

    .day-item {
      .flex-column();
      align-items: center;
      padding: var(--spacing-2) 0;

      .day-number {
        .flex-center();
        width: 64px;
        height: 64px;
        border-radius: var(--radius-full);
        font-size: @font-size-base;
        color: var(--color-text-main);
        margin-bottom: var(--spacing-1);

        &.checked {
          background-color: var(--color-accent);
          color: white;
        }

        &.today {
          border: 2px solid var(--color-accent);
          color: var(--color-accent);
        }

        &.other-month {
          color: var(--color-text-muted);
        }
      }

      .day-dot {
        width: 8px;
        height: 8px;
        border-radius: var(--radius-full);
        background-color: var(--color-accent);

        &.unchecked {
          background-color: transparent;
        }
      }
    }
  }
}

// 签到按钮
.checkin-btn-wrapper {
  padding: var(--spacing-4) var(--spacing-5);

  .checkin-btn {
    .flex-center();
    width: 100%;
    height: 112px;
    background: linear-gradient(135deg, var(--color-accent), #6C63FF);
    border-radius: var(--radius-xl);
    font-size: @font-size-lg;
    font-weight: 600;
    color: white;
    box-shadow: var(--shadow-button);
    transition: all var(--duration-fast) var(--ease-default);

    &:disabled {
      opacity: 0.5;
      background: var(--color-border);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

// 签到成功提示
.checkin-success {
  .flex-column();
  align-items: center;
  padding: var(--spacing-8) var(--spacing-5);

  .success-icon {
    width: 120px;
    height: 120px;
    color: var(--color-success);
    margin-bottom: var(--spacing-4);
  }

  .success-text {
    font-size: @font-size-xl;
    font-weight: 600;
    color: var(--color-text-main);
    margin-bottom: var(--spacing-2);
  }

  .success-desc {
    font-size: @font-size-sm;
    color: var(--color-text-sub);
  }
}
```

- [ ] **Step 2: 创建签到日历页 TSX 文件**

```typescript
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import PageHeader from '../../../components/PageHeader';
import './index.less';

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isChecked: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [checkinDays, setCheckinDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [isTodayChecked, setIsTodayChecked] = useState(false);

  useEffect(() => {
    generateCalendar();
    loadCheckinData();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: CalendarDay[] = [];

    // 上个月的日期
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: false,
        isToday: false,
        isChecked: false,
      });
    }

    // 本月的日期
    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date: i,
        month,
        year,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isChecked: false, // TODO: 从 API 获取签到数据
      });
    }

    // 下个月的日期
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: i,
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: false,
        isToday: false,
        isChecked: false,
      });
    }

    setCalendarDays(days);
  };

  const loadCheckinData = async () => {
    try {
      // TODO: 调用 API 获取签到数据
      // const res = await api.getCheckinData(currentDate);
      // setCheckinDays(res.checkinDays);
      // setTotalDays(res.totalDays);
      // setIsTodayChecked(res.isTodayChecked);
      setCheckinDays(15);
      setTotalDays(30);
      setIsTodayChecked(false);
    } catch (error) {
      console.error('Failed to load checkin data', error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCheckin = async () => {
    try {
      // TODO: 调用 API 进行签到
      // await api.checkin();
      setIsTodayChecked(true);
      setCheckinDays(prev => prev + 1);

      Taro.showToast({
        title: '签到成功',
        icon: 'success',
      });
    } catch (error) {
      console.error('Failed to checkin', error);
      Taro.showToast({
        title: '签到失败',
        icon: 'none',
      });
    }
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  return (
    <View className="calendar-page">
      <PageHeader title="签到日历" />

      <View className="month-selector">
        <View className="month-nav-btn" onClick={handlePrevMonth}>
          <Icon className="nav-icon" name="chevron-left" />
        </View>
        <Text className="current-month">{formatMonth(currentDate)}</Text>
        <View className="month-nav-btn" onClick={handleNextMonth}>
          <Icon className="nav-icon" name="chevron-right" />
        </View>
      </View>

      <View className="stats-card">
        <View className="stats-row">
          <View className="stat-item">
            <Text className="stat-value">{checkinDays}</Text>
            <Text className="stat-label">已签到</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{totalDays}</Text>
            <Text className="stat-label">本月天数</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{Math.round(checkinDays / totalDays * 100)}%</Text>
            <Text className="stat-label">签到率</Text>
          </View>
        </View>
      </View>

      <View className="calendar-grid">
        <View className="weekday-header">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <Text key={day} className="weekday-item">{day}</Text>
          ))}
        </View>
        <View className="days-grid">
          {calendarDays.map((day, index) => (
            <View key={index} className="day-item">
              <View className={`day-number ${day.isChecked ? 'checked' : ''} ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}>
                {day.date}
              </View>
              {day.isCurrentMonth && (
                <View className={`day-dot ${day.isChecked ? '' : 'unchecked'}`} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View className="checkin-btn-wrapper">
        <button
          className="checkin-btn"
          disabled={isTodayChecked}
          onClick={handleCheckin}
        >
          {isTodayChecked ? '今日已签到' : '立即签到'}
        </button>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: 更新 app.config.ts 添加路由**

在 `app.config.ts` 的 `pages` 数组中添加：

```typescript
pages: [
  'pages/home/index',
  'pages/discover/index',
  'pages/profile/index',
  'pages/auth/welcome/index',
  'pages/auth/login/index',
  'pages/settings/index',
  'pages/profile/favorites/index',
  'pages/profile/calendar/index', // 新增
],
```

- [ ] **Step 4: 验证页面功能**

```bash
cd app-taro && npm run dev:weapp
```

Expected: 签到日历页正常显示，日历网格正确，签到按钮功能正常

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/src/pages/profile/calendar/index.tsx app-taro/src/pages/profile/calendar/index.less app-taro/src/app.config.ts
git commit -m "feat(calendar): 创建签到日历页，支持月度签到统计"
```

---

### Task 12: 安装 Lottie 依赖并创建示例动画

**Files:**
- Modify: `app-taro/package.json`
- Create: `app-taro/src/assets/animations/logo.json`
- Create: `app-taro/src/components/LottieView/index.tsx`

- [ ] **Step 1: 安装 Lottie 依赖**

```bash
cd app-taro && npm install @lottiefiles/taro-lottie --save
```

- [ ] **Step 2: 创建 Lottie 组件**

```typescript
// app-taro/src/components/LottieView/index.tsx
import { useEffect, useRef } from 'react';
import { View } from '@tarojs/components';
import lottie from 'lottie-miniprogram';

interface LottieViewProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function LottieView({
  animationData,
  loop = true,
  autoplay = true,
  style,
  className,
}: LottieViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay,
        animationData,
      });
    }

    return () => {
      animRef.current?.destroy();
    };
  }, [animationData, loop, autoplay]);

  return (
    <View
      ref={containerRef}
      className={className}
      style={style}
    />
  );
}
```

- [ ] **Step 3: 创建示例动画数据**

创建一个简单的加载动画 JSON 文件 `app-taro/src/assets/animations/loading.json`：

```json
{
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Loading",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Circle",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 1, "k": [
          { "t": 0, "s": [0] },
          { "t": 60, "s": [360] }
        ]},
        "p": { "a": 0, "k": [100, 100, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "shapes": [
        {
          "ty": "el",
          "d": 1,
          "s": { "a": 0, "k": [80, 80] },
          "p": { "a": 0, "k": [0, 0] },
          "nm": "Ellipse"
        },
        {
          "ty": "st",
          "c": { "a": 0, "k": [0.2, 0.49, 0.98, 1] },
          "o": { "a": 0, "k": 100 },
          "w": { "a": 0, "k": 8 },
          "lc": 2,
          "lj": 1,
          "nm": "Stroke"
        },
        {
          "ty": "tm",
          "s": { "a": 0, "k": 0 },
          "e": { "a": 0, "k": 75 },
          "o": { "a": 0, "k": 0 },
          "m": 1,
          "nm": "Trim"
        }
      ]
    }
  ]
}
```

- [ ] **Step 4: 验证 Lottie 组件**

在某个页面中测试 Lottie 组件：

```typescript
import LottieView from '../../components/LottieView';
import loadingAnimation from '../../assets/animations/loading.json';

// 在组件中使用
<LottieView
  animationData={loadingAnimation}
  loop={true}
  style={{ width: 200, height: 200 }}
/>
```

- [ ] **Step 5: 提交更改**

```bash
git add app-taro/package.json app-taro/src/components/LottieView/index.tsx app-taro/src/assets/animations/
git commit -m "feat(animation): 引入 Lottie 依赖，创建 Lottie 组件和示例动画"
```

---

## 执行选项

Plan complete and saved to `docs/superpowers/plans/2026-05-27-app-taro-style-restoration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
