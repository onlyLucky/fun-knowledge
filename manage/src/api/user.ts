import type { CreateUserRequest, UpdateUserRequest, User } from "./schemas";

export const USER_ENDPOINTS = {
  list: "/api/admin/v1/user/list",
  detail: (id: string) => `/api/admin/v1/user/${id}`,
  updateStatus: (id: string) => `/api/admin/v1/user/${id}/status`,
} as const;

export type { CreateUserRequest, UpdateUserRequest, User };
