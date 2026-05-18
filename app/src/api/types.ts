// Server response envelope (for reference, not used directly after interceptor unwrap)
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Server entity shapes ─────────────────────────────────────────────────────

export interface ServerKnowledge {
  id: string;
  title: string;
  content: string;
  resource_url: string | null;
  resource_type: string | null;
  category_id: string;
  tags: string[] | null;
  source: string | null;
  status: number;
  view_count: number;
  favorite_count: number;
  category?: ServerCategory;
  created_at: string;
}

export interface ServerCategory {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  status: number;
}

export interface ServerUser {
  id: string;
  nickname: string;
  avatar: string | null;
  phone: string | null;
  email: string | null;
  signature?: string | null;
  streak_days: number;
  total_check_in_days: number;
  ai_usage_count: number;
  user_auths?: Record<string, unknown>;
  created_at: string;
}

export interface ServerCorrection {
  id: string;
  knowledge_id: string;
  type: number;
  description: string;
  images: string[] | null;
  status: number; // 0=pending, 1=accepted, 2=rejected
  review_remark: string | null;
  review_time: string | null;
  knowledge?: ServerKnowledge;
  created_at: string;
}

export interface ServerCheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  streak_days: number;
  created_at: string;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
