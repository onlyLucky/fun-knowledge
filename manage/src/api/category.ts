import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const CATEGORY_ENDPOINTS = {
  list: "/api/admin/v1/category/list",
  enabled: "/api/admin/v1/category/enabled",
  create: "/api/admin/v1/category/create",
  detail: (id: string) => `/api/admin/v1/category/${id}`,
  update: (id: string) => `/api/admin/v1/category/${id}`,
  delete: (id: string) => `/api/admin/v1/category/${id}`,
  toggleStatus: (id: string) => `/api/admin/v1/category/${id}/toggle-status`,
  sort: "/api/admin/v1/category/sort",
} as const;

/* ---------- Schemas ---------- */

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sort_order: z.number(),
  weight: z.number().optional(),
  status: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sort_order: z.number().optional(),
  weight: z.number().min(-2).max(2).optional(),
  status: z.number().optional(),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const UpdateCategoryRequestSchema = CreateCategoryRequestSchema.partial();

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

export const SortCategoryRequestSchema = z.object({
  ids: z.array(z.string()),
});

export type SortCategoryRequest = z.infer<typeof SortCategoryRequestSchema>;
