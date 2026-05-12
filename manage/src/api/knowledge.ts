import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const KNOWLEDGE_ENDPOINTS = {
  list: "/api/admin/v1/knowledge/list",
  create: "/api/admin/v1/knowledge/create",
  detail: (id: string) => `/api/admin/v1/knowledge/${id}`,
  update: (id: string) => `/api/admin/v1/knowledge/${id}`,
  delete: (id: string) => `/api/admin/v1/knowledge/${id}`,
  toggleStatus: (id: string) => `/api/admin/v1/knowledge/${id}/status`,
  import: "/api/admin/v1/knowledge/import",
  template: "/api/admin/v1/knowledge/template",
} as const;

/* ---------- Schemas ---------- */

export const KnowledgeStatus = {
  DRAFT: 0,
  PUBLISHED: 1,
  OFFLINE: 2,
} as const;

export type KnowledgeStatus = (typeof KnowledgeStatus)[keyof typeof KnowledgeStatus];

export const ResourceType = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  MODEL_3D: "model_3d",
  WEBPAGE: "webpage",
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const KnowledgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  resource_url: z.string().nullable().optional(),
  resource_type: z.string().nullable().optional(),
  category_id: z.string(),
  tags: z.array(z.string()).nullable().optional(),
  source: z.string().nullable().optional(),
  status: z.number(),
  view_count: z.number().optional(),
  favorite_count: z.number().optional(),
  correction_count: z.number().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  sort_weight: z.number().optional(),
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
});

export type CreateKnowledgeRequest = z.infer<typeof CreateKnowledgeRequestSchema>;

export const UpdateKnowledgeRequestSchema = CreateKnowledgeRequestSchema.partial();

export type UpdateKnowledgeRequest = z.infer<typeof UpdateKnowledgeRequestSchema>;

export const ToggleKnowledgeStatusSchema = z.object({
  status: z.number(),
});

export type ToggleKnowledgeStatus = z.infer<typeof ToggleKnowledgeStatusSchema>;
