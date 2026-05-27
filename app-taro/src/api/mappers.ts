import type { ServerKnowledge, ServerCategory, ServerUser } from '@/api/types'
import type { KnowledgeCard, Category } from '@/types'

export function mapServerCategory(serverCategory: ServerCategory): Category {
  return {
    id: serverCategory.id,
    name: serverCategory.name,
    icon: serverCategory.icon || '',
    description: serverCategory.description || '',
    sort: serverCategory.sort_order,
    knowledgeCount: 0
  }
}

export function mapServerKnowledge(serverKnowledge: ServerKnowledge): KnowledgeCard {
  return {
    id: serverKnowledge.id,
    title: serverKnowledge.title,
    description: serverKnowledge.content,
    image: serverKnowledge.resource_url || '',
    categoryId: serverKnowledge.category_id,
    source: serverKnowledge.source || '',
    isFavorited: serverKnowledge.is_favorited || false,
    viewCount: serverKnowledge.view_count,
    favoriteCount: serverKnowledge.favorite_count
  }
}

export function mapServerUser(serverUser: ServerUser) {
  return {
    id: serverUser.id,
    name: serverUser.nickname || serverUser.phone || serverUser.email || '',
    nickname: serverUser.nickname,
    avatar: serverUser.avatar || undefined,
    phone: serverUser.phone || undefined,
    email: serverUser.email || undefined,
    signature: serverUser.signature || undefined,
    loginType: 'phone' as const,
    streak_days: serverUser.streak_days,
    total_check_in_days: serverUser.total_check_in_days
  }
}

export function mapServerCategories(serverCategories: ServerCategory[]): Category[] {
  return serverCategories.map(mapServerCategory)
}

export function mapServerKnowledgeList(serverKnowledgeList: ServerKnowledge[]): KnowledgeCard[] {
  return serverKnowledgeList.map(mapServerKnowledge)
}
