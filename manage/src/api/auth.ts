import type {
  AuthTokens,
  LoginRequest,
  Admin,
  MenuItem,
  PermissionsList,
  RegisterRequest,
} from "./schemas";

export const AUTH_ENDPOINTS = {
  login: "/api/admin/v1/auth/login",
  register: "/api/auth/register",
  profile: "/api/admin/v1/auth/profile",
  password: "/api/admin/v1/auth/password",
  // TODO: 服务端暂无 admin token 刷新端点，AuthAdminService.refreshToken() 已实现但未暴露路由
  refresh: "/api/admin/v1/auth/refresh",
  logout: "/api/admin/v1/auth/logout",
  user: "/api/auth/user",
  permissions: "/api/auth/permissions",
} as const;

export type { AuthTokens, LoginRequest, Admin, MenuItem, PermissionsList, RegisterRequest };
