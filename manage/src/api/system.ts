import { z } from "zod/v4";

/* ---------- 接口地址 ---------- */

export const SYSTEM_ENDPOINTS = {
  data: "/api/admin/v1/system/data",
  action: "/api/admin/v1/system/action",
  deleteResource: (path: string) =>
    `/api/admin/v1/system/resource?path=${encodeURIComponent(path)}`,
} as const;

/* ---------- 系统管理类型 ---------- */

export const SystemManageType = {
  STORAGE_STATS: "storage_stats",
  STORAGE_CLEAN: "storage_clean",
  AVATAR_STORAGE_STATS: "avatar_storage_stats",
  AVATAR_STORAGE_CLEAN: "avatar_storage_clean",
} as const;

export type SystemManageType = (typeof SystemManageType)[keyof typeof SystemManageType];

/* ---------- 数据结构 ---------- */

export const StorageTypeStatsSchema = z.object({
  type: z.string(),
  count: z.number(),
  size: z.number(),
});

export type StorageTypeStats = z.infer<typeof StorageTypeStatsSchema>;

export const UnusedResourceItemSchema = z.object({
  path: z.string(),
  filename: z.string(),
  size: z.number(),
  modified_at: z.string(),
});

export type UnusedResourceItem = z.infer<typeof UnusedResourceItemSchema>;

export const StorageStatsDataSchema = z.object({
  total_files: z.number(),
  total_size: z.number(),
  used_files: z.number(),
  used_size: z.number(),
  unused_files: z.number(),
  unused_size: z.number(),
  types: z.array(StorageTypeStatsSchema),
  unused_items: z.array(UnusedResourceItemSchema),
});

export type StorageStatsData = z.infer<typeof StorageStatsDataSchema>;

export const CleanResultDataSchema = z.object({
  deleted_count: z.number(),
  freed_size: z.number(),
});

export type CleanResultData = z.infer<typeof CleanResultDataSchema>;

/* ---------- 响应结构 ---------- */

export const SystemDataItemSchema = z.object({
  type: z.string(),
  label: z.string(),
  data: z.unknown(),
});

export const SystemDataGroupSchema = z.object({
  key: z.string(),
  label: z.string(),
  items: z.array(SystemDataItemSchema),
});

export const SystemDataResponseSchema = z.object({
  groups: z.array(SystemDataGroupSchema),
});

export type SystemDataGroup = z.infer<typeof SystemDataGroupSchema>;
export type SystemDataItem = z.infer<typeof SystemDataItemSchema>;
