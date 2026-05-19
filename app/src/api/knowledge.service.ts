import client from '@/lib/http';
import type { ServerKnowledge, PaginatedData } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface KnowledgeQuery {
  title?: string;
  keyword?: string;
  category_id?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

function mockToServerKnowledge(card: { id: string; title: string; description: string; image: string; category: string; source: string }): ServerKnowledge {
  return {
    id: card.id,
    title: card.title,
    content: card.description,
    resource_url: card.image,
    resource_type: 'image',
    category_id: 'cat-1',
    tags: [],
    source: card.source,
    status: 1,
    view_count: 0,
    favorite_count: 0,
    created_at: new Date().toISOString(),
  };
}

export async function getKnowledgeList(query: KnowledgeQuery = {}): Promise<PaginatedData<ServerKnowledge>> {
  if (USE_MOCK) {
    const { MOCK_CARDS } = await import('../data/mock');
    let filtered = MOCK_CARDS;
    const searchTerm = query.keyword || query.title;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return {
      list: filtered.map(mockToServerKnowledge),
      total: filtered.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
  }
  return client.get('/v1/knowledge/list', { params: query });
}

export async function getKnowledgeById(id: string): Promise<ServerKnowledge> {
  if (USE_MOCK) {
    const { MOCK_CARDS } = await import('../data/mock');
    const card = MOCK_CARDS.find((c) => c.id === id);
    if (!card) throw new Error('Not found');
    return mockToServerKnowledge(card);
  }
  return client.get(`/v1/knowledge/${id}`);
}

export async function getRecommendations(query: { category_id?: string; page?: number; pageSize?: number; refresh?: boolean } = {}): Promise<PaginatedData<ServerKnowledge>> {
  if (USE_MOCK) return getKnowledgeList(query);
  return client.get('/v1/knowledge/recommend', { params: query });
}
