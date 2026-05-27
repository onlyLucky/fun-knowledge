import http from '@/utils/http'
import type { HotSearchItem, ServerKnowledge, PaginatedData } from './types'

export async function getHotSearches(limit: number = 10): Promise<HotSearchItem[]> {
  return http.get<HotSearchItem[]>('/v1/knowledge/hot-searches', { limit })
}

export async function searchKnowledge(keyword: string, query: { page?: number; pageSize?: number } = {}): Promise<PaginatedData<ServerKnowledge>> {
  return http.get<PaginatedData<ServerKnowledge>>('/v1/knowledge/list', {
    keyword,
    ...query
  })
}
