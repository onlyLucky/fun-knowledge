import http from '@/utils/http'
import type { ServerKnowledge, PaginatedData } from './types'

export interface FavoriteItem {
  id: string
  knowledge_id: string
  knowledge?: ServerKnowledge
  created_at: string
}

export async function getFavorites(query: { page?: number; pageSize?: number } = {}): Promise<PaginatedData<ServerKnowledge>> {
  return http.get<PaginatedData<ServerKnowledge>>('/v1/favorite/list', query)
}

export async function addFavorite(knowledgeId: string): Promise<FavoriteItem> {
  return http.post<FavoriteItem>('/v1/favorite', { knowledge_id: knowledgeId })
}

export async function removeFavorite(knowledgeId: string): Promise<void> {
  return http.delete(`/v1/favorite/${knowledgeId}`)
}
