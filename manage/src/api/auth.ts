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
  refresh: "/api/admin/v1/auth/refresh",
  logout: "/api/admin/v1/auth/logout",
  user: "/api/auth/user",
  permissions: "/api/auth/permissions",
} as const;

export type { AuthTokens, LoginRequest, Admin, MenuItem, PermissionsList, RegisterRequest };
