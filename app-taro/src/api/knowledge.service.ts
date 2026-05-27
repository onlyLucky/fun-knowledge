import http from '@/utils/http'
import type { ServerKnowledge, PaginatedData, HotSearchItem } from './types'

export interface KnowledgeQuery {
  title?: string
  keyword?: string
  category_id?: string
  page?: number
  pageSize?: number
}

export async function getKnowledgeList(query: KnowledgeQuery = {}): Promise<PaginatedData<ServerKnowledge>> {
  return http.get<PaginatedData<ServerKnowledge>>('/v1/knowledge/list', query)
}

export async function getKnowledgeById(id: string): Promise<ServerKnowledge> {
  return http.get<ServerKnowledge>(`/v1/knowledge/${id}`)
}

export async function getRecommendations(query: { category_id?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedData<ServerKnowledge>> {
  return http.get<PaginatedData<ServerKnowledge>>('/v1/knowledge/recommend', query)
}

export async function getHotSearches(limit: number = 10): Promise<HotSearchItem[]> {
  return http.get<HotSearchItem[]>('/v1/knowledge/hot-searches', { limit })
}

export async function reportBehavior(
  knowledgeId: string,
  action: 'browse' | 'favorite' | 'ai_extend',
  browseDuration?: number
): Promise<void> {
  return http.post('/v1/knowledge/recommend/behavior', {
    knowledge_id: knowledgeId,
    action,
    browse_duration: browseDuration
  })
}
