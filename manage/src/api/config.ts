import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const CONFIG_ENDPOINTS = {
  list: "/api/admin/v1/config/list",
  update: "/api/admin/v1/config/update",
} as const;

/* ---------- Schemas ---------- */

export const SystemConfigSchema = z.object({
  id: z.string(),
  config_key: z.string(),
  config_value: z.string(),
  description: z.string().nullable().optional(),
  group: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

export const UpdateConfigRequestSchema = z.object({
  config_value: z.string(),
});

export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;
