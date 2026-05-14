import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const CORRECTION_ENDPOINTS = {
  list: "/api/admin/v1/correction/list",
  detail: (id: string) => `/api/admin/v1/correction/${id}`,
  review: (id: string) => `/api/admin/v1/correction/${id}/review`,
} as const;

/* ---------- Schemas ---------- */

export const CorrectionStatus = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
} as const;

export type CorrectionStatus = (typeof CorrectionStatus)[keyof typeof CorrectionStatus];

export const CorrectionType = {
  CONTENT_ERROR: 1,
  CATEGORY_ERROR: 2,
  IMAGE_MISMATCH: 3,
  OTHER: 4,
} as const;

export type CorrectionType = (typeof CorrectionType)[keyof typeof CorrectionType];

const CorrectionKnowledgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  resource_url: z.string().nullable().optional(),
  resource_type: z.string().nullable().optional(),
  category_id: z.string(),
  tags: z.array(z.string()).nullable().optional(),
  status: z.number(),
});

const CorrectionUserSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export const CorrectionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  knowledge_id: z.string(),
  type: z.number(),
  description: z.string(),
  images: z.array(z.string()).nullable().optional(),
  status: z.number(),
  review_remark: z.string().nullable().optional(),
  reviewed_by: z.string().nullable().optional(),
  review_time: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  knowledge: CorrectionKnowledgeSchema.nullable().optional(),
  user: CorrectionUserSchema.nullable().optional(),
});

export type Correction = z.infer<typeof CorrectionSchema>;

export const ReviewCorrectionRequestSchema = z.object({
  status: z.number(),
  review_remark: z.string().nullable().optional(),
});

export type ReviewCorrectionRequest = z.infer<typeof ReviewCorrectionRequestSchema>;
