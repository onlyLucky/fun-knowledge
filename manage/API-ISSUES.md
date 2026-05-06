# API 问题报告 — 后台管理系统对接

> 生成时间：2026-05-06
> 前端：`manage/` 后台管理系统（React 19 + Ant Design 6）
> 后端：`server/` NestJS 服务端（`http://localhost:3000`）

## 问题汇总

| #   | 服务端逻辑位置                                                                 | 前端调用位置                                                      | 问题描述                                                      | 严重等级 | 前端处理方式                                |
| --- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------- | -------- | ------------------------------------------- |
| 1   | `transform.interceptor.ts:17-27` / `auth-admin.controller.ts:48-61`            | `src/utils/http.ts:67,157`                                        | 响应码不一致：登录返回 `code: 0`，其他接口返回 `code: 200`    | **中等** | 前端兼容 `code === 0 \|\| code === 200`     |
| 2   | `auth-admin.controller.ts:35-66`                                               | `src/routes/login/index.tsx` / `src/utils/session.ts`             | Admin 登录接口设计：一次返回 `{admin, tokens}`，前端已适配    | **无**   | 前端已适配单次登录响应                      |
| 3   | `auth-admin.controller.ts` (无 refresh 路由) / `auth-admin.service.ts:129-151` | `src/utils/http.ts:40-81`                                         | Admin token 刷新端点缺失：`refreshToken()` 已实现但未暴露路由 | **严重** | 前端标记 TODO，401 时直接跳转登录页         |
| 4   | `category-admin.controller.ts:27-32`                                           | `src/routes/_auth/category/index.tsx`                             | 分类列表未分页：返回全量数组而非 `PaginatedResponseDto`       | **低**   | 前端将数组包装为 `{ list, total }`          |
| 5   | `admin.entity.ts:15-58`                                                        | `src/stores/auth.ts` / `src/components/Layout/UserMenu/index.tsx` | Admin 实体无 `avatar` 和 `email` 字段                         | **低**   | 前端 UserMenu 显示 `username` + `real_name` |
| 6   | `knowledge-admin.controller.ts` / `user.controller.ts`                         | `src/routes/_auth/users/index.tsx`                                | 服务端 `status` 字段使用 `0/1/2`，前端需确认枚举映射          | **低**   | 前端按服务端枚举值定义常量                  |

---

## 问题详情

### 1. 响应码不一致（中等）

**服务端逻辑位置：**

- `server/src/common/interceptors/transform.interceptor.ts:17-27` — 全局拦截器将成功响应包装为 `{ code: 200, message: 'success', data }`
- `server/src/modules/auth/auth-admin.controller.ts:48-61` — 登录端点自行返回 `{ code: 0, message: '登录成功', data: { admin, tokens } }`

**问题：** `TransformInterceptor` 在第 19 行检查响应是否已有 `code` 和 `data` 字段，若有则跳过包装。登录端点返回的 `code: 0` 绕过了拦截器，导致登录响应码为 `0`，而其他所有接口响应码为 `200`。

**前端影响：** HTTP 客户端需要同时兼容两种成功码。

**建议修复：** 统一登录端点使用 `code: 200`，或在 `TransformInterceptor` 中统一覆盖。

---

### 2. Admin 登录响应格式（无问题）

**服务端逻辑位置：**

- `server/src/modules/auth/auth-admin.controller.ts:48-61`

**问题：** 登录接口一次返回 `{ admin: { id, username, real_name, role }, tokens: { accessToken, refreshToken, expiresIn } }`，而非传统的三步流程（login → get user → get permissions）。

**前端处理：** 已完全适配。`adminLogin()` 函数直接解析响应，从 `admin.role` 映射权限列表，无需额外请求。

---

### 3. Admin Token 刷新端点缺失（严重）

**服务端逻辑位置：**

- `server/src/modules/auth/auth-admin.controller.ts` — 仅有 `login` 和 `logout` 两个端点
- `server/src/modules/auth/auth-admin.service.ts:129-151` — `refreshToken()` 方法已完整实现

**问题：** `AuthAdminService.refreshToken()` 方法已实现（接受 refreshToken，验证后返回新 token 对），但 controller 中没有对应的 `@Post('refresh')` 路由。这是一个死代码问题。

**前端影响：** Admin token 过期（默认 2 小时）后，前端无法自动刷新，用户会被强制跳转到登录页。

**建议修复：** 在 `auth-admin.controller.ts` 中添加：

```typescript
@Post('refresh')
async refresh(@Body('refreshToken') refreshToken: string) {
  return this.authService.refreshToken(refreshToken);
}
```

---

### 4. 分类列表未分页（低）

**服务端逻辑位置：**

- `server/src/modules/category/category-admin.controller.ts:27-32`

**问题：** `findAll()` 直接返回 `this.categoryService.findAll()` 的结果，是一个扁平数组，未使用 `PaginatedResponseDto` 包装，也不接受分页参数。

**前端影响：** 分类数据量通常不大，前端将数组包装为 `{ list: arr, total: arr.length }` 即可。

**建议修复：** 如分类数量可能增长，建议后续添加分页支持。

---

### 5. Admin 实体字段差异（低）

**服务端逻辑位置：**

- `server/src/modules/admin/entities/admin.entity.ts:15-58`

**问题：** Admin 实体包含 `username`、`real_name`、`role`、`status`、`last_login_time`、`last_login_ip` 等字段，但没有 `avatar` 和 `email` 字段。

**前端影响：** UserMenu 组件无法显示头像和邮箱，改为显示 `username` 和 `real_name`。

---

### 6. 状态枚举确认（低）

**服务端逻辑位置：**

- 各实体的 `status` 字段

**问题：** 需确认各模块 status 枚举值的含义：

- Admin: `0` = 正常, `1` = 禁用
- Knowledge: `0` = 草稿, `1` = 已发布, `2` = 下线
- Category: `0` = 停用, `1` = 启用
- Correction: `0` = 待审核, `1` = 已通过, `2` = 已拒绝

**前端处理：** 已按上述映射定义常量。

---

## 前端适配措施总结

| 适配项          | 文件                                  | 说明                                             |
| --------------- | ------------------------------------- | ------------------------------------------------ |
| 响应码兼容      | `src/utils/http.ts`                   | `code === 200 \|\| code === 0` 判断成功          |
| Admin 登录      | `src/utils/session.ts`                | `adminLogin()` 一次完成登录+权限+菜单            |
| Token 刷新 TODO | `src/utils/http.ts`                   | 标记 TODO，401 时直接 logout                     |
| 分类数组包装    | `src/routes/_auth/category/index.tsx` | `select` 中包装为 `{ list, total }`              |
| 分页参数        | `src/routes/_auth/*/index.tsx`        | 使用 `page/pageSize`（服务端格式）               |
| Admin 字段适配  | `src/stores/auth.ts` / `UserMenu`     | 使用 `admin` + `real_name` 替代 `user` + `email` |
