export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ServerKnowledge {
  id: string
  title: string
  content: string
  resource_url: string | null
  resource_type: string | null
  category_id: string
  tags: string[] | null
  source: string | null
  status: number
  view_count: number
  favorite_count: number
  category?: ServerCategory
  is_favorited?: boolean
  created_at: string
}

export interface ServerCategory {
  id: string
  name: string
  icon: string | null
  description: string | null
  sort_order: number
  status: number
}

export interface ReviewFieldInfo {
  status: number
  value?: string
  msg?: string
}

export interface ServerUser {
  id: string
  nickname: string
  avatar: string | null
  phone: string | null
  email: string | null
  signature?: string | null
  streak_days: number
  total_check_in_days: number
  ai_usage_count: number
  user_auths?: Record<string, unknown>
  review_info?: {
    avatar?: ReviewFieldInfo
    nickname?: ReviewFieldInfo
    signature?: ReviewFieldInfo
  }
  created_at: string
}

export interface ServerCheckIn {
  id: string
  user_id: string
  check_in_date: string
  streak_days: number
  created_at: string
}

export interface LoginTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface HotSearchItem {
  keyword: string
  heat: number
  trend: 'up' | 'down' | 'stable'
  knowledge_id?: string
}
