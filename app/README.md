# 冷知识星球 - 小程序端

面向碎片化学习场景的冷知识浏览小程序，以图文卡片形式推送涵盖生活、科学、历史等类目的小知识。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 4.x | 样式框架 |
| React Router | 7.x | 路由管理 |
| Radix UI | - | 无样式组件库 |
| MUI | 7.x | Material Design 组件 |
| Framer Motion | 12.x | 动画库 |

## 快速开始

### 环境准备

- Node.js >= 18
- pnpm (推荐) 或 npm

### 安装与运行

```bash
pnpm install
pnpm run dev
```

### 构建

```bash
pnpm run build
pnpm run preview
```

## 常见问题

### 端口被占用

如果启动时提示端口被占用（如 `Port 5173 is already in use`），可以使用以下命令关闭占用端口的进程：

```bash
# 关闭 5173 端口的进程
lsof -ti:5173 | xargs kill -9

# 或者使用更精确的方式
kill -9 $(lsof -ti:5173)
```

**常用端口说明**：
| 项目 | 端口 | 说明 |
|------|------|------|
| app | 5173 | 小程序端开发服务器 |
| manage | 5174 | 管理后台开发服务器 |

**批量关闭多个端口**：
```bash
lsof -ti:5173,5174,5175 | xargs kill -9
```

**查看端口占用情况**：
```bash
# 查看特定端口
lsof -i:5173

# 查看所有监听端口
lsof -i -P -n | grep LISTEN
```

## 项目结构

```
app/
├── src/
│   ├── app/
│   │   ├── components/           # 通用组件
│   │   ├── context/              # React Context
│   │   ├── pages/                # 页面组件
│   │   │   ├── auth/             # 认证页面（启动页、欢迎页、登录、注册）
│   │   │   ├── home/             # 首页（卡片流、卡片详情、类目详情）
│   │   │   ├── discover/         # 发现页（类目浏览、热搜）
│   │   │   ├── profile/          # 个人中心（资料编辑、收藏列表、打卡日历）
│   │   │   ├── settings/         # 设置相关（设置、关于、联系、协议、隐私）
│   │   │   └── report/           # 纠错相关（纠错列表、详情、举报）
│   │   ├── App.tsx               # 应用入口
│   │   └── routes.tsx            # 路由配置
│   ├── imports/                  # Figma 导入资源
│   ├── styles/                   # 样式文件
│   └── main.tsx                  # 主入口
├── index.html
├── package.json
└── vite.config.ts
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/welcome` | 欢迎页 | 应用引导 |
| `/login` | 登录页 | 微信授权登录 |
| `/register` | 注册页 | 用户注册 |
| `/` | 首页 | 知识卡片流（上下滑动切换） |
| `/discover` | 发现页 | 类目浏览、搜索、热搜 |
| `/profile` | 个人中心 | 用户信息、功能菜单 |
| `/profile/edit` | 资料编辑 | 头像、昵称修改 |
| `/favorites` | 收藏列表 | 已收藏的知识卡片 |
| `/calendar` | 打卡日历 | 打卡记录与统计 |
| `/settings` | 设置页 | 通知、缓存、退出登录 |
| `/about` | 关于页 | 应用介绍 |
| `/category/:id` | 类目详情 | 按类目浏览卡片 |
| `/card/:id` | 卡片详情 | 知识卡片完整内容 |
| `/error-reports` | 纠错列表 | 我的纠错记录 |
| `/error-reports/:id` | 纠错详情 | 纠错记录详情 |
| `/hot-searches` | 热搜榜单 | 热门知识排行 |
| `/user-agreement` | 用户协议 | 协议内容 |
| `/privacy-policy` | 隐私政策 | 隐私条款 |
| `/contact-us` | 联系我们 | 联系方式 |
| `/report-content` | 举报内容 | 内容举报 |

## 路由守卫

| 守卫 | 说明 |
|------|------|
| `AuthGuard` | 主页面守卫，未登录重定向到 `/login` |
| `AuthSubGuard` | 子页面守卫，未登录重定向到 `/login` |
| `SubPageWrapper` | 子页面布局包装器（返回按钮 + 页面标题） |

## 开发规范

- 使用 TypeScript 严格模式
- 使用 Tailwind CSS 编写样式
- 组件采用函数式组件 + Hooks
- 页面组件按功能模块分目录组织
- 每个目录通过 `index.ts` barrel 文件统一导出

---

*此项目由 Claude Code 自动生成，基于冷知识星球 PRD v1.0 文档。*
