# 冷知识星球 - 后台管理系统

基于 React 19 + Ant Design 6 + Vite+ 构建的后台管理前端，提供 i18n 国际化、MSW Mock、RBAC 权限控制、完整 CRUD 和 Playwright E2E 测试。

## 技术栈

| 分类     | 技术                                                                 |
| -------- | -------------------------------------------------------------------- |
| 构建工具 | [Vite+](https://viteplus.dev)（VoidZero 统一工具链）                 |
| UI 框架  | [Ant Design 6.x](https://ant.design)                                 |
| 路由     | [TanStack Router](https://tanstack.com/router)（文件路由，类型安全） |
| 异步状态 | [TanStack Query v5](https://tanstack.com/query)                      |
| 本地状态 | [Zustand](https://zustand.docs.pmnd.rs)（持久化 auth/settings）      |
| 数据校验 | [Zod v4](https://zod.dev)（Schema、API 契约、表单校验）              |
| 国际化   | [LinguiJS](https://lingui.dev)（en + zh）                            |
| 图标     | [lucide-react](https://lucide.dev/guide/packages/lucide-react)       |
| API Mock | [MSW 2.x](https://mswjs.io)（Service Worker 拦截）                   |
| E2E 测试 | [Playwright](https://playwright.dev)                                 |
| 语言     | TypeScript 6.x（严格模式）                                           |

## 功能特性

- **JWT 认证** — access/refresh token 流程，Zustand 持久化
- **动态菜单 & RBAC** — 后端驱动的侧边栏菜单，权限守卫 + 403 页面
- **URL 状态同步** — 表格搜索参数（分页、关键词、排序）同步到 URL
- **国际化** — LinguiJS 支持英文/中文，Ant Design 语言包联动
- **暗色模式** — 一键切换，基于 Ant Design 主题算法
- **完整类型安全** — Zod Schema 在 API 边界做运行时校验
- **零配置 Mock** — MSW 在开发环境拦截 API 请求，无需后端

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org) >= 20
- [Vite+](https://viteplus.dev/guide/) CLI（`vp`）

### 安装与运行

```bash
pnpm install
pnpm run dev
```

打开 [http://localhost:5173](http://localhost:5173)，会自动跳转到登录页。

**默认账号：** `admin` / `admin`

### 构建

```bash
pnpm run build
pnpm run preview
```

### 端口被占用

如果启动时提示端口被占用（如 `Port 5174 is already in use`），可以使用以下命令关闭占用端口的进程：

```bash
# 关闭 5174 端口的进程
lsof -ti:5174 | xargs kill -9

# 或者使用更精确的方式
kill -9 $(lsof -ti:5174)
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
lsof -i:5174

# 查看所有监听端口
lsof -i -P -n | grep LISTEN
```

### 项目初始化

```bash
pnpm run prepare
```

### 代码质量

```bash
pnpm run fmt       # 格式化
pnpm run lint      # Lint 检查
pnpm run check     # 格式化 + Lint + 类型检查
```

### 单元测试

```bash
pnpm run test:unit
```

### E2E 测试

```bash
pnpm run test:e2e
pnpm run test:e2e:ui   # 交互式 UI 模式
```

## 环境变量

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

| 变量                 | 说明                                                                         | 默认值    |
| -------------------- | ---------------------------------------------------------------------------- | --------- |
| `VITE_API_BASE_URL`  | API 接口基础地址。为空时使用相对路径，由 Vite devServer proxy 或部署环境处理 | `""`      |
| `VITE_BRAND_PRIMARY` | 品牌主色调（十六进制色值）                                                   | `#1677ff` |
| `VITE_ENABLE_MOCK`   | 是否在构建产物中启用 MSW Mock（`"true"` 启用）                               | `"false"` |

**使用方式：**

- `VITE_API_BASE_URL` 在 [src/utils/constants.ts](src/utils/constants.ts) 中读取，传给 HTTP 客户端拼接请求地址
- `VITE_BRAND_PRIMARY` 在 [src/hooks/tokenBuilders.ts](src/hooks/tokenBuilders.ts) 中读取，用于 Ant Design 主题色配置
- `VITE_ENABLE_MOCK` 在 [src/main.tsx](src/main.tsx) 中读取，控制生产构建是否启用 MSW

**接口对接示例：**

```bash
# .env
VITE_API_BASE_URL=https://api.example.com
```

HTTP 客户端会将 `VITE_API_BASE_URL` 与接口路径拼接，如 `https://api.example.com/api/auth/login`。

## 项目结构

```
src/
├── api/                          # API 层
│   ├── schemas.ts                # Zod Schema 定义（User, Auth, Menu, 分页等）
│   ├── auth.ts                   # 认证端点常量
│   ├── user.ts                   # 用户端点常量
│   ├── knowledge.ts              # 知识卡片端点常量
│   ├── category.ts               # 分类端点常量
│   ├── correction.ts             # 纠错端点常量
│   ├── admin.ts                  # 管理员端点常量
│   ├── config.ts                 # 系统配置端点常量
│   ├── upload.ts                 # 文件上传端点常量
│   ├── log.ts                    # 操作日志端点常量
│   ├── user-review.ts            # 资料审核端点常量
│   ├── dashboard.ts              # 仪表盘端点常量
│   └── system.ts                 # 系统管理端点常量
│
├── stores/                       # Zustand 状态管理
│   ├── auth.ts                   # 认证状态（tokens, user, menus, permissions）
│   ├── settings.ts               # 应用设置（darkMode, locale, sidebarCollapsed）
│   └── createPersistentStore.ts  # 持久化 Store 工厂函数
│
├── utils/                        # 工具函数
│   ├── http.ts                   # HTTP 客户端（自动 token 刷新、401/403 处理）
│   ├── session.ts                # 会话初始化（获取 user + permissions + menus）
│   ├── appMenu.ts                # 菜单树定义 + 权限过滤
│   ├── constants.ts              # 常量（API_BASE_URL, APP_BRAND_NAME 等）
│   └── utils.ts                  # 公共工具函数（存储单位换算等）
│
├── hooks/                        # 自定义 Hooks
│   ├── useResourceCRUD.ts        # 通用 CRUD Hook（支持乐观更新）
│   ├── useCrudToasts.ts          # CRUD 操作的 Toast 提示
│   ├── useTableFitHeight.ts      # 表格自适应高度计算
│   ├── useAppTheme.ts            # 主题配置 Hook
│   ├── usePermission.ts          # 权限检查 Hook
│   ├── useUrlSearchState.ts      # URL 搜索状态同步
│   └── tokenBuilders.ts          # Ant Design 主题 Token 构建器
│
├── components/                   # 可复用组件
│   ├── Layout/                   # 布局组件
│   │   ├── MainLayout/           # 主布局（侧边栏 + 头部 + 内容区）
│   │   ├── Sidebar/              # 侧边栏导航（响应式，移动端 Drawer）
│   │   ├── Header/               # 顶部栏（面包屑、语言切换、主题切换）
│   │   ├── UserMenu/             # 用户菜单
│   │   └── AppFooter/            # 页脚
│   ├── DataTable/                # 数据表格（骨架屏、空状态、自适应滚动）
│   ├── FilterToolbar/            # 响应式筛选工具栏（溢出自动折叠）
│   ├── FormModal/                # 通用表单弹窗
│   ├── Auth/                     # 权限守卫组件
│   ├── Aurora/                   # 登录页背景动画
│   ├── Icon/                     # 自定义图标（GitHub, Theme）
│   └── NotFound/                 # 404 组件
│
├── routes/                       # TanStack Router 文件路由
│   ├── __root.tsx                # 根布局（i18n, ConfigProvider, QueryClient）
│   ├── _auth.tsx                 # 认证守卫（登录检查 + 权限验证）
│   ├── index.tsx                 # / → 重定向到 /login
│   ├── login/index.tsx           # 登录页
│   ├── register/index.tsx        # 注册页
│   └── _auth/
│       ├── dashboard/            # 仪表盘（推荐效果统计、图表展示）
│       │   ├── index.tsx
│       │   └── index.css
│       ├── knowledge/            # 知识卡片管理（CRUD + 批量导入 + 状态切换）
│       │   ├── index.tsx
│       │   ├── -Toolbar.tsx
│       │   ├── -FormModal.tsx
│       │   ├── -DetailDrawer.tsx
│       │   └── -ImportModal.tsx
│       ├── category/             # 分类管理（CRUD + 排序）
│       │   ├── index.tsx
│       │   └── -FormModal.tsx
│       ├── correction/           # 纠错审核（列表 + 详情 + 审核操作）
│       │   ├── index.tsx
│       │   └── -DetailDrawer.tsx
│       ├── users/                # 用户管理（CRUD + 详情 + 画像展示）
│       │   ├── index.tsx
│       │   ├── -Toolbar.tsx
│       │   ├── -FormModal.tsx
│       │   └── -DetailDrawer.tsx
│       ├── admin/                # 管理员管理（CRUD + 角色分配）
│       │   ├── index.tsx
│       │   └── -FormModal.tsx
│       ├── config/               # 系统配置管理（CRUD + 分组Tab + 类型适配）
│       │   ├── index.tsx
│       │   └── -FormModal.tsx
│       ├── logs/                 # 操作日志（列表 + 详情 + 筛选）
│       │   └── index.tsx
│       ├── user-review/          # 资料审核（列表 + 详情 + 审核操作）
│       │   ├── index.tsx
│       │   └── -DetailDrawer.tsx
│       ├── system/               # 系统管理（存储统计 + 未使用资源清理）
│       │   └── index.tsx
│       └── 403/index.tsx         # 无权限页面
│
├── mocks/                        # MSW Mock 系统
│   ├── browser.ts                # Service Worker 初始化
│   ├── createHandler.ts          # Handler 工具函数（响应封装、Schema 校验）
│   ├── data.ts                   # Mock 数据（20 个用户）
│   ├── utils.ts                  # Mock 工具（筛选、分页）
│   └── handlers/
│       ├── index.ts              # Handler 聚合
│       ├── auth.ts               # 认证 Mock（登录/注册/刷新/用户信息）
│       └── user.ts               # 用户 CRUD Mock
│
├── locales/                      # 国际化
│   ├── en/messages.po            # 英文翻译
│   ├── zh/messages.po            # 中文翻译
│   └── loadLocaleCatalog.ts      # 语言包加载器（带缓存）
│
├── main.tsx                      # 应用入口（MSW 初始化 → 状态恢复 → 渲染）
├── index.css                     # 全局样式
└── routeTree.gen.ts              # TanStack Router 自动生成的路由树

e2e/                              # Playwright E2E 测试
├── helpers.ts                    # 测试辅助函数
├── login.spec.ts                 # 登录流程测试
├── users.spec.ts                 # 用户 CRUD 测试
├── auth-refresh.spec.ts          # Token 刷新测试
├── rbac.spec.ts                  # 权限控制测试
└── url-state.spec.ts             # URL 状态同步测试
```

## 核心架构

### 启动流程

```
main.tsx
  ├─ enableMocking()          # 开发环境启动 MSW Service Worker
  ├─ rehydrate stores         # 从 localStorage 恢复 auth/settings 状态
  ├─ load i18n catalog        # 加载语言包并激活
  └─ ReactDOM.createRoot()    # 渲染 React 应用
       └─ RouterProvider
            └─ __root.tsx     # I18nProvider + ConfigProvider + QueryClient
                 └─ Outlet    # 路由出口
```

### 认证流程

```
/login → 输入账号密码
  ├─ POST /api/auth/login → 获取 accessToken + refreshToken
  ├─ setTokens() → 存入 Zustand（自动持久化到 localStorage）
  └─ fetchSessionAndApplyToStore()
       ├─ GET /api/auth/user → 获取用户信息
       ├─ GET /api/auth/permissions → 获取权限列表
       ├─ UserSchema.parse() → 合并为完整 User 对象
       ├─ filterMenuTreeByPermissions() → 根据权限过滤菜单
       └─ setUser() + setMenus() → 更新 Store
```

### 路由守卫

```
_auth.tsx (beforeLoad)
  ├─ 检查 isAuthenticated → 未登录则重定向 /login
  ├─ 有 tokens 但无 user → 调用 fetchSessionAndApplyToStore()
  └─ canAccessPath() → 无权限则重定向 /403
```

### HTTP 客户端

```
httpClient.get/post/put/delete
  ├─ 自动注入 Authorization: Bearer <accessToken>
  ├─ 401 → 自动刷新 token（防并发：inflightRefresh 锁）
  │    ├─ 成功 → 重试原请求
  │    └─ 失败 → logout() + 跳转 /login
  ├─ 403 → 跳转 /403
  └─ 响应解析 → { code, data, message } 信封格式
       ├─ code === 0 → 返回 data
       └─ code !== 0 → 抛出 ApiError
```

### CRUD 模式

使用 `useResourceCRUD` Hook 实现标准化 CRUD：

```typescript
const { data, isLoading, createMutation, updateMutation, deleteMutation } = useResourceCRUD({
  queryKey: ["users", ...searchParams],   // 查询键
  queryFn: () => httpClient.get(...),      // 查询函数
  select: (raw) => schema.parse(raw),      // Zod 校验
  createFn: (values) => httpClient.post(...),
  updateFn: ({ id, ...values }) => httpClient.put(...),
  deleteFn: (id) => httpClient.delete(...),
  optimistic: { update: true, delete: true }, // 乐观更新
  createLifecycle: { onSuccess: ..., onError: ... },
  updateLifecycle: { onMutate: ..., onSuccess: ..., onError: ... },
  deleteLifecycle: { onMutate: ..., onSuccess: ..., onError: ... },
});
```

- 自动管理 React Query 的缓存失效
- 支持乐观更新（update/delete），失败自动回滚
- 生命周期钩子集成 Toast 提示

### 状态管理

**认证状态** (`stores/auth.ts`)：

- `tokens` — access/refresh token
- `user` — 当前用户（含 permissions）
- `menus` — 根据权限过滤后的菜单树
- 持久化：tokens 和 isAuthenticated 存入 localStorage

**应用设置** (`stores/settings.ts`)：

- `darkMode` — 暗色模式（初始值跟随系统偏好）
- `sidebarCollapsed` — 侧边栏折叠状态
- `locale` — 语言（"en" | "zh"）
- 全部持久化到 localStorage

## 配置文件

| 文件                                         | 说明                                                 |
| -------------------------------------------- | ---------------------------------------------------- |
| [vite.config.ts](vite.config.ts)             | Vite+ 配置（插件、路径别名、构建优化、staged hooks） |
| [tsconfig.json](tsconfig.json)               | TypeScript 配置（严格模式、路径别名 `@/*`）          |
| [lingui.config.ts](lingui.config.ts)         | LinguiJS 国际化配置（en/zh 双语）                    |
| [vitest.config.ts](vitest.config.ts)         | Vitest 单元测试配置                                  |
| [playwright.config.ts](playwright.config.ts) | Playwright E2E 测试配置                              |
| [vercel.json](vercel.json)                   | Vercel 部署配置（SPA fallback）                      |
| [.vite-hooks/](.vite-hooks/)                 | Git hooks（pre-commit 运行 `vp staged`）             |
| [AGENTS.md](AGENTS.md)                       | Vite+ 工具链使用指南                                 |

## 页面路由

| 路由           | 说明                                       |
| -------------- | ------------------------------------------ |
| `/login`       | 登录页（表单校验、Aurora 背景动画）        |
| `/register`    | 注册页                                     |
| `/dashboard`   | 仪表盘（推荐效果统计、图表展示）           |
| `/knowledge`   | 知识卡片管理（CRUD + 批量导入 + 状态切换） |
| `/category`    | 分类管理（CRUD + 排序）                    |
| `/correction`  | 纠错审核（列表 + 详情 + 审核操作）         |
| `/users`       | 用户管理（搜索、分页、创建/编辑/删除）     |
| `/admin`       | 管理员管理（CRUD + 角色分配）              |
| `/config`      | 系统配置管理（CRUD + 分组Tab + 类型适配）  |
| `/logs`        | 操作日志（列表 + 详情 + 筛选）             |
| `/user-review` | 资料审核（列表 + 详情 + 审核操作）         |
| `/system`      | 系统管理（存储统计 + 未使用资源清理）      |
| `/403`         | 无权限页面                                 |
| `/404`         | 页面未找到                                 |

## 国际化

使用 [LinguiJS](https://lingui.dev) 编译时宏，支持英文（`en`）和中文（`zh`）。

```bash
# 提取翻译消息到 .po 文件
vp exec lingui extract -- --clean

# 编译 .po 文件为运行时消息
vp exec lingui compile

# CI 检查：提取并确认无未提交的翻译差异
pnpm run i18n:extract && git diff --exit-code -- src/locales
```

Ant Design 组件语言包通过 `__root.tsx` 中的 `ConfigProvider` 跟随当前语言切换。

## 扩展指南

### 新增 CRUD 资源

参考 `.github/instructions/add-resource.instructions.md`，以 `users` 为模板：

1. 在 `src/api/` 添加 Schema 和端点常量
2. 在 `src/routes/_auth/` 添加路由文件（index、-Toolbar、-FormModal）
3. 在 `src/mocks/handlers/` 添加 Mock Handler
4. 在 `src/utils/appMenu.ts` 的 `APP_MENU_TREE` 中添加菜单项
5. 运行 `pnpm run i18n:extract && pnpm run i18n:compile`
6. 运行 `pnpm run check` 验证

### 对接真实后端

1. 设置环境变量 `VITE_API_BASE_URL=https://your-api.com`
2. 在 `src/main.tsx` 中移除或禁用 MSW 初始化
3. 确保后端 API 响应格式符合 `{ code, data, message }` 信封格式

### 移除国际化

移除 Lingui 相关包、vite/swc 插件，将 `t` 宏替换为纯字符串。

## 开发说明

- 优先使用 Vite+ 命令进行安装、检查和脚本运行
- 运行 `vp check --no-fmt` 进行类型/Lint 验证
- 核心回归测试覆盖在 login 和 users E2E 流程中

## 许可证

MIT
