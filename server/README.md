# 冷知识星球 - 后端服务

基于 NestJS 企业级架构的后端服务，为冷知识星球小程序提供 API 支持。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 10.x | 企业级 Node.js 框架 |
| TypeScript | 5.x | 类型安全 |
| PostgreSQL | 16.x | 主数据库（UUID 主键） |
| Redis | 7.x | 缓存、队列、限流 |
| MongoDB | 7.x | 操作日志、推荐日志 |
| TypeORM | 0.3.x | PostgreSQL ORM |
| Bull | 4.x | Redis 任务队列 |
| Passport + JWT | - | 身份认证 |
| Swagger | - | API 文档 |

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js >= 18
- Docker & Docker Compose
- pnpm (推荐) 或 npm

### 2. 启动基础设施

```bash
# 启动 PostgreSQL、Redis、MongoDB、Elasticsearch
docker-compose up -d
```

### 3. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 4. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 5. 初始化数据库

```bash
# 运行种子数据（创建默认管理员、类目、系统配置）
pnpm run seed
```

### 6. 启动服务

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

### 7. 访问 API 文档

启动后访问：http://localhost:3000/api/docs

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123456 |
| 内容管理员 | content_admin | content123456 |
| 运营人员 | operations | operations123456 |
| 审核人员 | reviewer | reviewer123456 |

## 项目结构

```
server/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── app.module.ts              # 根模块
│   ├── common/                    # 公共模块
│   │   ├── decorators/            # 自定义装饰器
│   │   ├── dto/                   # 通用 DTO
│   │   ├── enums/                 # 枚举定义
│   │   ├── filters/               # 异常过滤器
│   │   ├── guards/                # 认证/授权守卫
│   │   ├── interceptors/          # 拦截器
│   │   ├── interfaces/            # 接口定义
│   │   └── utils/                 # 工具函数
│   ├── config/                    # 配置模块
│   ├── modules/                   # 业务模块
│   │   ├── auth/                  # 认证模块
│   │   ├── user/                  # 用户模块
│   │   ├── knowledge/             # 知识卡片模块
│   │   ├── category/              # 类目模块
│   │   ├── favorite/              # 收藏模块
│   │   ├── correction/            # 纠错模块
│   │   ├── check-in/              # 打卡模块
│   │   ├── ai/                    # AI 模块
│   │   ├── recommend/             # 推荐模块
│   │   ├── admin/                 # 管理员模块
│   │   ├── config/                # 系统配置模块
│   │   ├── import/                # 批量导入模块
│   │   ├── upload/                # 文件上传模块
│   │   ├── log/                   # 操作日志模块
│   │   ├── user-review/           # 用户资料审核模块
│   │   ├── dashboard/             # 仪表盘统计模块
│   │   └── system/                # 系统管理模块
│   └── database/                  # 数据库
│       ├── data-source.ts         # TypeORM 数据源
│       └── seeds/                 # 种子数据
├── docker-compose.yml             # Docker 环境
├── Dockerfile                     # 生产构建
├── .env.example                   # 环境变量示例
├── package.json
└── tsconfig.json
```

## API 接口

> 状态码说明：**200** = 成功，**201** = 创建成功，**400** = 参数错误，**401** = 未认证，**403** = 无权限，**404** = 资源不存在，**409** = 冲突（重复），**500** = 服务端错误

### 客户端接口（/api/v1/）

| 模块 | 接口 | 说明 | 状态码 |
|------|------|------|--------|
| 认证 | POST /v1/auth/login | 登录（微信/多平台） | 200 |
| 认证 | POST /v1/auth/register | 注册（手机号/邮箱） | 201 |
| 认证 | POST /v1/auth/sms/send | 发送短信验证码 | 200 |
| 认证 | GET /v1/auth/profile | 获取用户信息 | 200 |
| 认证 | PUT /v1/auth/profile | 更新用户信息 | 200 |
| 认证 | POST /v1/auth/bind/:platform | 绑定平台账号 | 200 |
| 认证 | DELETE /v1/auth/unbind/:platform | 解绑平台账号 | 200 |
| 知识 | GET /v1/knowledge/list | 卡片列表 | 200 |
| 知识 | GET /v1/knowledge/:id | 卡片详情 | 200 |
| 知识 | GET /v1/knowledge/recommend | 推荐卡片 | 200 |
| 知识 | POST /v1/knowledge/recommend/feedback | 推荐反馈 | 201 |
| 知识 | POST /v1/knowledge/recommend/behavior | 推荐行为上报 | 201 |
| 类目 | GET /v1/category/list | 类目列表 | 200 |
| 收藏 | POST /v1/favorite | 添加收藏 | 201 |
| 收藏 | DELETE /v1/favorite/:knowledge_id | 取消收藏 | 200 |
| 收藏 | GET /v1/favorite/list | 收藏列表 | 200 |
| 纠错 | POST /v1/correction | 提交纠错 | 201 |
| 纠错 | GET /v1/correction/list | 我的纠错 | 200 |
| 打卡 | POST /v1/check-in | 每日打卡 | 201 |
| 打卡 | GET /v1/check-in/status | 打卡状态 | 200 |
| 打卡 | GET /v1/check-in/history | 打卡历史 | 200 |
| AI | POST /v1/ai/extend | AI 延伸解读 | 201 |
| AI | POST /v1/ai/image-recognize | AI 图片识别 | 201 |
| 资料审核 | POST /v1/user-review | 提交资料审核 | 201 |
| 资料审核 | GET /v1/user-review/list | 我的审核记录 | 200 |
| 上传 | POST /v1/upload?type=avatar | 上传文件 | 201 |
| 配置 | GET /v1/config | 获取系统配置 | 200 |

### 管理端接口（/api/admin/v1/）

| 模块 | 接口 | 说明 | 状态码 |
|------|------|------|--------|
| 认证 | POST /admin/v1/auth/login | 管理员登录 | 200 |
| 认证 | POST /admin/v1/auth/logout | 管理员登出 | 200 |
| 知识 | GET /admin/v1/knowledge/list | 卡片列表 | 200 |
| 知识 | POST /admin/v1/knowledge/create | 创建卡片 | 201 |
| 知识 | PUT /admin/v1/knowledge/:id | 更新卡片 | 200 |
| 知识 | DELETE /admin/v1/knowledge/:id | 删除卡片 | 200 |
| 知识 | DELETE /admin/v1/knowledge/batch-delete | 批量删除卡片 | 200 |
| 知识 | PUT /admin/v1/knowledge/:id/status | 上架/下架 | 200 |
| 知识 | POST /admin/v1/knowledge/import | 批量导入 | 201 |
| 知识 | GET /admin/v1/knowledge/template | 下载模板 | 200 |
| 知识 | GET /admin/v1/knowledge/import/:id | 导入状态 | 200 |
| 用户 | GET /admin/v1/user/list | 用户列表 | 200 |
| 用户 | GET /admin/v1/user/:id | 用户详情 | 200 |
| 用户 | PUT /admin/v1/user/:id/status | 用户状态 | 200 |
| 用户 | DELETE /admin/v1/user/:id | 删除用户 | 200 |
| 类目 | GET /admin/v1/category/list | 类目列表 | 200 |
| 类目 | POST /admin/v1/category/create | 创建类目 | 201 |
| 类目 | PUT /admin/v1/category/:id | 更新类目 | 200 |
| 类目 | DELETE /admin/v1/category/:id | 删除类目 | 200 |
| 类目 | DELETE /admin/v1/category/batch-delete | 批量删除类目 | 200 |
| 类目 | PUT /admin/v1/category/sort | 更新排序 | 200 |
| 纠错 | GET /admin/v1/correction/list | 纠错列表 | 200 |
| 纠错 | GET /admin/v1/correction/:id | 纠错详情 | 200 |
| 纠错 | PUT /admin/v1/correction/:id/review | 审核纠错 | 200 |
| 管理员 | GET /admin/v1/admin/list | 管理员列表 | 200 |
| 管理员 | POST /admin/v1/admin/create | 创建管理员 | 201 |
| 管理员 | PUT /admin/v1/admin/:id | 更新管理员 | 200 |
| 管理员 | PUT /admin/v1/admin/:id/status | 管理员状态 | 200 |
| 配置 | GET /admin/v1/config/list | 配置列表 | 200 |
| 配置 | POST /admin/v1/config/create | 创建配置项 | 201 |
| 配置 | PUT /admin/v1/config/update | 更新配置 | 200 |
| 配置 | DELETE /admin/v1/config/:id | 删除配置项 | 200 |
| 配置 | DELETE /admin/v1/config/batch-delete | 批量删除配置项 | 200 |
| 配置 | GET /admin/v1/config/groups | 获取配置分组 | 200 |
| 上传 | POST /admin/v1/upload?type=avatar\|knowledge | 上传文件 | 201 |
| 日志 | GET /admin/v1/log/list | 操作日志 | 200 |
| 日志 | GET /admin/v1/log/:id | 日志详情 | 200 |
| 日志 | DELETE /admin/v1/log/:id | 删除日志 | 200 |
| 日志 | DELETE /admin/v1/log/batch-delete | 批量删除日志 | 200 |
| 资料审核 | GET /admin/v1/user-review/list | 审核列表 | 200 |
| 资料审核 | GET /admin/v1/user-review/:id | 审核详情 | 200 |
| 资料审核 | PUT /admin/v1/user-review/:id/review | 审核操作 | 200 |
| 资料审核 | DELETE /admin/v1/user-review/:id | 删除审核记录 | 200 |
| 资料审核 | DELETE /admin/v1/user-review/batch-delete | 批量删除审核记录 | 200 |
| 仪表盘 | GET /admin/v1/dashboard/recommend-stats | 推荐效果统计 | 200 |
| 系统管理 | GET /admin/v1/system/data | 获取系统管理数据 | 200 |
| 系统管理 | POST /admin/v1/system/action | 执行系统管理操作 | 200 |

### 通用错误响应

所有接口在出错时返回统一格式：

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null,
  "timestamp": "2026-05-14 09:00:00",
  "path": "/api/v1/xxx"
}
```

| 状态码 | 说明 | 常见场景 |
|--------|------|----------|
| 400 | 参数校验失败 | DTO 验证不通过、类型错误、服务错误、消息提示 |
| 401 | 未认证 | Token 缺失、过期、无效 |
| 403 | 无权限 | 角色权限不足 |
| 404 | 资源不存在 | ID 不存在、已删除 |
| 409 | 资源冲突 | 创建重复数据（如重复的配置键） |
| 500 | 服务端错误 | 未捕获异常 |

### 端口占用

如果端口 3000 被占用，可以使用以下命令杀死占用该端口的进程：

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; echo "done"
```

## 开发规范

### Git 提交规范

```
<type>(<scope>): <subject>

示例：
feat(auth): 实现微信登录功能
fix(knowledge): 修复卡片列表分页问题
docs(readme): 更新 API 文档
```

### 数据库迁移

```bash
# 生成迁移文件
pnpm run migration:generate -- src/database/migrations/CreateTables

# 运行迁移
pnpm run migration:run

# 回滚迁移
pnpm run migration:revert
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t funfact-server .

# 运行容器
docker run -d \
  --name funfact-server \
  -p 3000:3000 \
  --env-file .env \
  funfact-server
```

### Docker Compose 部署

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d
```

## 相关文档

- [PRD 文档](../docs/软件需求规格说明-v1.0.md)
- [开发任务清单](../docs/TASK.md)
- [开发日志](../docs/DEVLOG.md)

---

*此服务由 Claude Code 自动生成，基于冷知识星球 PRD v1.3 文档。*
