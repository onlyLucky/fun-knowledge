import { httpClient } from "@/utils/http";

/* ---------- Endpoints ---------- */

export const UPLOAD_ENDPOINTS = {
  upload: "/api/admin/v1/upload",
} as const;

/* ---------- Types ---------- */

export type UploadType = "avatar" | "knowledge";

export interface UploadResult {
  url: string;
  resource_type?: string;
}

/* ---------- API ---------- */

/**
 * 上传文件
 * @param file 文件对象
 * @param type 上传类型：avatar（头像）或 knowledge（知识卡片资源）
 */
export function uploadFile(file: File, type: UploadType): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return httpClient.upload<UploadResult>(`${UPLOAD_ENDPOINTS.upload}?type=${type}`, formData);
}
