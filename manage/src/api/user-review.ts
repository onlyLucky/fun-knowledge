import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const USER_REVIEW_ENDPOINTS = {
  list: "/api/admin/v1/user-review/list",
  detail: (id: string) => `/api/admin/v1/user-review/${id}`,
  review: (id: string) => `/api/admin/v1/user-review/${id}/review`,
  delete: (id: string) => `/api/admin/v1/user-review/${id}`,
  batchDelete: "/api/admin/v1/user-review/batch-delete",
} as const;

/* ---------- Status ---------- */

export const USER_REVIEW_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export type UserReviewStatus = (typeof USER_REVIEW_STATUS)[keyof typeof USER_REVIEW_STATUS];

export const USER_REVIEW_STATUS_LABELS: Record<UserReviewStatus, string> = {
  [USER_REVIEW_STATUS.PENDING]: "待审核",
  [USER_REVIEW_STATUS.APPROVED]: "已通过",
  [USER_REVIEW_STATUS.REJECTED]: "已驳回",
};

export const USER_REVIEW_STATUS_COLORS: Record<UserReviewStatus, string> = {
  [USER_REVIEW_STATUS.PENDING]: "processing",
  [USER_REVIEW_STATUS.APPROVED]: "success",
  [USER_REVIEW_STATUS.REJECTED]: "error",
};

/* ---------- Schemas ---------- */

export const UserReviewUserSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  signature: z.string().nullable().optional(),
});

export const UserReviewSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  nickname: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  signature: z.string().nullable().optional(),
  status: z.number(),
  review_remark: z.string().nullable().optional(),
  reviewed_by: z.string().nullable().optional(),
  review_time: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  user: UserReviewUserSchema.optional(),
});

export type UserReview = z.infer<typeof UserReviewSchema>;

export const ReviewUserReviewRequestSchema = z.object({
  status: z.number(),
  review_remark: z.string().optional(),
});

export type ReviewUserReviewRequest = z.infer<typeof ReviewUserReviewRequestSchema>;
