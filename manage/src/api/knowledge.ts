import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const KNOWLEDGE_ENDPOINTS = {
  list: "/api/admin/v1/knowledge/list",
  create: "/api/admin/v1/knowledge/create",
  detail: (id: string) => `/api/admin/v1/knowledge/${id}`,
  update: (id: string) => `/api/admin/v1/knowledge/${id}`,
  delete: (id: string) => `/api/admin/v1/knowledge/${id}`,
  batchDelete: "/api/admin/v1/knowledge/batch-delete",
  toggleStatus: (id: string) => `/api/admin/v1/knowledge/${id}/status`,
  import: "/api/admin/v1/knowledge/import",
  importStatus: (id: string) => `/api/admin/v1/knowledge/import/${id}`,
  template: "/api/admin/v1/knowledge/template",
} as const;

/* ---------- Schemas ---------- */

export const KnowledgeStatus = {
  OFFLINE: 0, // 下架
  ONLINE: 1, // 上架
} as const;

export type KnowledgeStatus = (typeof KnowledgeStatus)[keyof typeof KnowledgeStatus];

export const ResourceType = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  MODEL_3D: "model_3d",
  SVG: "svg",
  WEBPAGE: "webpage",
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const AiExtendType = {
  AI_MODEL: "ai_model",
  STATIC_DATA: "static_data",
} as const;

export type AiExtendType = (typeof AiExtendType)[keyof typeof AiExtendType];

export const AiExtendItemSchema = z.object({
  title: z.string(),
  content: z.string(),
  source: z.string().optional(),
});

export type AiExtendItem = z.infer<typeof AiExtendItemSchema>;

export const KnowledgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  resource_url: z.string().nullable().optional(),
  resource_type: z.string().nullable().optional(),
  category_id: z.string(),
  category: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  source: z.string().nullable().optional(),
  status: z.number(),
  view_count: z.number().optional(),
  favorite_count: z.number().optional(),
  correction_count: z.number().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  sort_weight: z.number().optional(),
  weight: z.number().optional(),
  ai_extend_count: z.number().optional(),
  ai_extend_type: z.string().optional(),
  ai_extend_data: z.array(AiExtendItemSchema).nullable().optional(),
  quality_score: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Knowledge = z.infer<typeof KnowledgeSchema>;

export const CreateKnowledgeRequestSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  resource_url: z.string().nullable().optional(),
  resource_type: z.string().nullable().optional(),
  category_id: z.string().min(1),
  tags: z.array(z.string()).nullable().optional(),
  source: z.string().nullable().optional(),
  status: z.number().optional(),
  sort_weight: z.number().optional(),
  weight: z.number().min(-2).max(2).optional(),
  ai_extend_type: z.string().optional(),
  ai_extend_data: z.array(AiExtendItemSchema).nullable().optional(),
});

export type CreateKnowledgeRequest = z.infer<typeof CreateKnowledgeRequestSchema>;

export const UpdateKnowledgeRequestSchema = CreateKnowledgeRequestSchema.partial();

export type UpdateKnowledgeRequest = z.infer<typeof UpdateKnowledgeRequestSchema>;

export const ToggleKnowledgeStatusSchema = z.object({
  status: z.number(),
});

export type ToggleKnowledgeStatus = z.infer<typeof ToggleKnowledgeStatusSchema>;

/* ---------- Import ---------- */

export const ImportStatus = {
  PROCESSING: 0,
  SUCCESS: 1,
  FAILED: 2,
} as const;

export type ImportStatus = (typeof ImportStatus)[keyof typeof ImportStatus];

export const ImportTaskSchema = z.object({
  id: z.string(),
  admin_id: z.string(),
  file_url: z.string().nullable().optional(),
  image_zip_url: z.string().nullable().optional(),
  total_count: z.number(),
  success_count: z.number(),
  fail_count: z.number(),
  status: z.number(),
  error_log: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ImportTask = z.infer<typeof ImportTaskSchema>;
