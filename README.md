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

## 项目结构

```
FunFact/
├── app/                          # 小程序端（React 18 + Vite + Tailwind CSS）
├── manage/                       # 后台管理系统（React 19 + Ant Design 6 + Vite+）
├── server/                       # 后端服务（NestJS + TypeORM + PostgreSQL）
├── docs/                         # 项目文档
│   ├── TASK.md                   # 开发任务清单
│   ├── DEVLOG.md                 # 开发日志
│   ├── 冷知识星球-软件需求规格说明-v1.0.md
│   └── 冷知识星球-用户交互设计规范.md
└── README.md                     # 本文件
```

## 技术栈

### 小程序端 (app/)

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 4.x | 样式框架 |
| React Router | 7.x | 路由管理 |
| Radix UI + MUI | - | UI 组件库 |
| Framer Motion | 12.x | 动画库 |

### 后台管理 (manage/)

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.x | UI 框架 |
| Ant Design | 6.x | 企业级 UI 组件库 |
| TanStack Router | - | 文件路由，类型安全 |
| TanStack Query | v5 | 异步状态管理 |
| Zustand | - | 本地状态管理 |
| Zod | v4 | 数据校验 |
| LinguiJS | - | 国际化（中英文） |
| Playwright | - | E2E 测试 |

### 后端服务 (server/)

| 技术 | 版本 | 说明 |
|------|------|------|
| NestJS | 10.x | 企业级 Node.js 框架 |
| TypeScript | 5.x | 类型安全 |
| PostgreSQL | 16.x | 主数据库 |
| Redis | 7.x | 缓存、队列、限流 |
| MongoDB | 7.x | 操作日志存储 |
| TypeORM | 0.3.x | PostgreSQL ORM |
| Bull | 4.x | 任务队列 |
| Passport + JWT | - | 身份认证 |
| Swagger | - | API 文档 |

## 快速开始

### 环境要求

- Node.js >= 18
- Docker & Docker Compose（后端基础设施）
- pnpm (推荐)

### 启动后端服务

```bash
cd server

# 启动 PostgreSQL、Redis、MongoDB
docker-compose up -d

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 初始化数据库
pnpm run seed

# 启动开发服务器
pnpm run start:dev
```

### 启动后台管理

```bash
cd manage
pnpm install
pnpm run dev
```

访问 http://localhost:5173，使用 `admin` / `admin` 登录。

### 启动小程序端

```bash
cd app
pnpm install
pnpm run dev
```

访问 http://localhost:5173 查看应用。

## 文档

| 文档 | 说明 |
|------|------|
| [开发任务清单](docs/TASK.md) | 166 个任务，按模块跟踪进度 |
| [开发日志](docs/DEVLOG.md) | 按日期和版本记录开发过程 |
| [PRD 文档](docs/冷知识星球-软件需求规格说明-v1.0.md) | 产品需求规格说明 |
| [设计规范](docs/冷知识星球-用户交互设计规范.md) | 用户交互设计规范 |
| [小程序端 README](app/README.md) | 小程序端详细说明 |
| [后台管理 README](manage/README.md) | 后台管理系统详细说明 |
| [后端服务 README](server/README.md) | 后端服务详细说明及 API 文档 |

## 版本规划

| 版本 | 目标 | 说明 |
|------|------|------|
| v0.1.0 | MVP 版本 | 用户系统、首页卡片流、知识详情页、基础打卡 |
| v0.2.0 | 核心功能 | 收藏、纠错、类目筛选、个人中心 |
| v0.3.0 | AI 功能 | AI 延伸解读、AI 图片识别、广告激励 |
| v0.4.0 | 完善优化 | 性能优化、兼容性适配、安全加固 |
| v1.0.0 | 正式发布 | 全功能上线、生产环境部署 |

## License

Private - 仅限内部使用
