// ============================================
// 知识卡片类型
// ============================================

export interface KnowledgeCard {
  id: string
  title: string
  description: string
  image: string
  category: string
  categoryId: string
  source: string
  isFavorited: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// 分类类型
// ============================================

export interface Category {
  id: string
  name: string
  icon: string
  description?: string
  sort: number
  knowledgeCount: number
}

// ============================================
// 热搜类型
// ============================================

export interface HotSearchItem {
  rank: number
  keyword: string
  heat: number
  trend: 'up' | 'down' | 'same'
  cardId?: string
}

// ============================================
// AI 延伸类型
// ============================================

export interface AIExtendResult {
  title: string
  content: string
  source?: string
}

// ============================================
// 纠错类型
// ============================================

export type CorrectionType = 
  | 'content_error'
  | 'image_error'
  | 'source_error'
  | 'other'

export interface Correction {
  id: string
  knowledgeId: string
  type: CorrectionType
  description: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// ============================================
// 浏览历史类型
// ============================================

export interface BrowseHistoryItem {
  id: string
  knowledgeId: string
  title: string
  image: string
  category: string
  viewedAt: string
}

// ============================================
// 签到类型
// ============================================

export interface CheckInRecord {
  date: string
  count: number
}

export interface CheckInStatus {
  checkedIn: boolean
  streak: number
  totalDays: number
  todayReward: number
}

// ============================================
// 用户类型
// ============================================

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  signature?: string
  phone?: string
  email?: string
  createdAt: string
}

// ============================================
// API 响应类型
// ============================================

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// 请求参数类型
// ============================================

export interface KnowledgeQueryParams {
  category_id?: string
  page?: number
  pageSize?: number
}

export interface RecommendParams {
  page?: number
  pageSize?: number
}

// ============================================
// 表单类型
// ============================================

export interface LoginForm {
  phone: string
  code: string
}

export interface RegisterForm {
  phone: string
  code: string
  nickname: string
}

export interface ProfileEditForm {
  nickname?: string
  signature?: string
  avatar?: string
}
