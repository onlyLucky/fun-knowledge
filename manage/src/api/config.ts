import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const CONFIG_ENDPOINTS = {
  list: "/api/admin/v1/config/list",
  create: "/api/admin/v1/config/create",
  update: "/api/admin/v1/config/update",
  delete: (id: string) => `/api/admin/v1/config/${id}`,
  batchDelete: "/api/admin/v1/config/batch-delete",
  groups: "/api/admin/v1/config/groups",
} as const;

/* ---------- Config Type ---------- */

export const CONFIG_TYPES = [
  "input",
  "number",
  "switch",
  "select",
  "textarea",
  "color",
  "date",
  "json",
  "storage",
] as const;

export type ConfigType = (typeof CONFIG_TYPES)[number];

export const CONFIG_TYPE_LABELS: Record<ConfigType, string> = {
  input: "文本输入",
  number: "数字输入",
  switch: "开关切换",
  select: "下拉选择",
  textarea: "多行文本",
  color: "颜色选择",
  date: "日期选择",
  json: "JSON 编辑",
  storage: "存储大小",
};

/* ---------- Config Option ---------- */

export const ConfigOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type ConfigOption = z.infer<typeof ConfigOptionSchema>;

/* ---------- Schemas ---------- */

export const SystemConfigSchema = z.object({
  id: z.string(),
  config_key: z.string(),
  config_value: z.string(),
  description: z.string().nullable().optional(),
  group: z.string().nullable().optional(),
  config_type: z.enum(CONFIG_TYPES).optional(),
  options: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

export const CreateConfigRequestSchema = z.object({
  config_key: z.string().max(100),
  config_value: z.string(),
  description: z.string().max(200).optional(),
  group: z.string().max(50).optional(),
  config_type: z.enum(CONFIG_TYPES).optional(),
  options: z.string().optional(),
});

export type CreateConfigRequest = z.infer<typeof CreateConfigRequestSchema>;

export const UpdateConfigRequestSchema = z.object({
  config_key: z.string().max(100),
  config_value: z.string(),
  description: z.string().max(200).optional(),
  config_type: z.enum(CONFIG_TYPES).optional(),
  options: z.string().optional(),
});

export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;
