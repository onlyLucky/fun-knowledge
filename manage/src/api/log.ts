import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const LOG_ENDPOINTS = {
  list: "/api/admin/v1/log/list",
} as const;

/* ---------- Schemas ---------- */

export const OperationLogSchema = z.object({
  id: z.string(),
  admin_id: z.string(),
  admin_username: z.string(),
  module: z.string(),
  action: z.string(),
  target_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  status: z.number().optional(),
  error_message: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  created_at: z.string().optional(),
});

export type OperationLog = z.infer<typeof OperationLogSchema>;
