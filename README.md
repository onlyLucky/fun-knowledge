# 冷知识星球

一款面向碎片化学习场景的微信小程序，以图文卡片的形式向用户推送涵盖生活、大自然、科学、数学、历史等多个类目的小知识。

## 项目简介

**冷知识星球** 是一款轻量级知识科普类微信小程序，用户可通过上下滑动浏览知识卡片，利用每天的零散时间轻松获取有趣的知识。产品同时集成 AI 能力，提供知识延伸解读和图片识别功能。

### 核心功能

- **知识卡片流** - 上下滑动浏览，类似抖音/Tinder 交互体验
- **10 大知识类目** - 生活常识、大自然、科学、数学、历史、人体、宇宙、美食、地理、艺术
- **AI 延伸解读** - 基于当前知识卡片生成 2-3 条延伸知识
- **AI 图片识别** - 拍照识别物体并生成相关知识卡片
- **每日打卡** - 浏览 3 张卡片即可打卡，培养学习习惯
- **收藏功能** - 收藏喜欢的知识卡片，随时回顾
- **纠错功能** - 用户可提交内容修正意见

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.3.5 | 构建工具 |
| Tailwind CSS | 4.1.12 | 样式框架 |
| React Router | 7.13.0 | 路由管理 |
| Radix UI | - | 无样式组件库 |
| MUI | 7.3.5 | Material Design 组件 |
| Framer Motion | 12.x | 动画库 |
| Lucide React | 0.487.0 | 图标库 |

## 项目结构

```
FunFact/
├── app/                          # 前端应用
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # 通用组件
│   │   │   │   ├── ui/           # UI 基础组件 (Radix UI)
│   │   │   │   ├── Layout.tsx    # 布局组件
│   │   │   │   └── ...
│   │   │   ├── context/          # React Context
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   └── UserContext.tsx
│   │   │   ├── data/             # Mock 数据
│   │   │   ├── pages/            # 页面组件
│   │   │   │   ├── auth/         # 认证相关页面
│   │   │   │   ├── Home.tsx      # 首页
│   │   │   │   ├── Discover.tsx  # 发现页
│   │   │   │   └── Profile.tsx   # 个人中心
│   │   │   ├── App.tsx           # 应用入口
│   │   │   └── routes.tsx        # 路由配置
│   │   ├── imports/              # Figma 导入资源
│   │   ├── styles/               # 样式文件
│   │   └── main.tsx              # 主入口
│   ├── index.html                # HTML 模板
│   ├── package.json
│   ├── vite.config.ts
│   └── postcss.config.mjs
├── docs/                         # 项目文档
│   ├── 冷知识星球-软件需求规格说明-v1.0.md
│   └── 冷知识星球-用户交互设计规范.md
└── server/                       # 后端服务 (待开发)
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm

### 安装依赖

```bash
cd app
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

## 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 启动页 | - | 应用启动动画 |
| 欢迎页 | /welcome | 登录引导 |
| 登录页 | /login | 用户登录 |
| 注册页 | /register | 用户注册 |
| 首页 | / | 知识卡片流 |
| 发现页 | /discover | 类目浏览 |
| 个人中心 | /profile | 用户信息 |
| 收藏列表 | /favorites | 已收藏卡片 |
| 打卡日历 | /calendar | 打卡记录 |
| 设置页 | /settings | 应用设置 |
| 关于页 | /about | 产品信息 |

## 设计规范

- **主色调**: `#4A90D9` (蓝色)
- **背景色**: `#1C1A1B` (深色)
- **卡片背景**: `#FFFFFF`
- **文字颜色**: `#333333` / `#666666` / `#999999`
- **圆角**: 16rpx (卡片) / 12rpx (图片)
- **移动端适配**: 414px × 896px 设计稿

## 相关文档

- [软件需求规格说明 (PRD)](docs/冷知识星球-软件需求规格说明-v1.0.md)
- [用户交互设计规范](docs/冷知识星球-用户交互设计规范.md)

## 开发说明

本项目由 Figma Make 生成，使用 React + Vite + TypeScript + Tailwind CSS 技术栈。前端采用单页应用 (SPA) 架构，使用 React Router 进行路由管理。

### 主要依赖

- **Radix UI** - 无样式、可访问的 UI 组件
- **MUI** - Material Design 组件库
- **Lucide React** - 轻量级图标库
- **Framer Motion** - 声明式动画库
- **date-fns** - 日期处理工具

## License

Private - 仅限内部使用
