import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const ADMIN_ENDPOINTS = {
  list: "/api/admin/v1/admin/list",
  create: "/api/admin/v1/admin/create",
  detail: (id: string) => `/api/admin/v1/admin/${id}`,
  update: (id: string) => `/api/admin/v1/admin/${id}`,
  updateStatus: (id: string) => `/api/admin/v1/admin/${id}/status`,
} as const;

/* ---------- Schemas ---------- */

export const AdminItemSchema = z.object({
  id: z.string(),
  username: z.string(),
  real_name: z.string().nullable().optional(),
  role: z.number(),
  status: z.number(),
  last_login_time: z.string().nullable().optional(),
  last_login_ip: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type AdminItem = z.infer<typeof AdminItemSchema>;

export const CreateAdminRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  real_name: z.string().nullable().optional(),
  role: z.number(),
});

export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export const UpdateAdminRequestSchema = z.object({
  username: z.string().min(1).optional(),
  real_name: z.string().nullable().optional(),
  role: z.number().optional(),
  status: z.number().optional(),
  password: z.string().min(6).optional(),
});

export type UpdateAdminRequest = z.infer<typeof UpdateAdminRequestSchema>;
