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
  APPROVED: 1,
  REJECTED: 2,
} as const;

export type CorrectionStatus = (typeof CorrectionStatus)[keyof typeof CorrectionStatus];

export const CorrectionType = {
  FACT_ERROR: 1,
  TYPO: 2,
  OUTDATED: 3,
  OTHER: 4,
} as const;

export type CorrectionType = (typeof CorrectionType)[keyof typeof CorrectionType];

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
});

export type Correction = z.infer<typeof CorrectionSchema>;

export const ReviewCorrectionRequestSchema = z.object({
  status: z.number(), // 1=approved, 2=rejected
  review_remark: z.string().nullable().optional(),
});

export type ReviewCorrectionRequest = z.infer<typeof ReviewCorrectionRequestSchema>;
