import client from './client';
import type { ServerKnowledge, PaginatedData } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function addFavorite(knowledgeId: string): Promise<void> {
  if (USE_MOCK) return;
  return client.post('/v1/favorite', { knowledge_id: knowledgeId });
}

export async function removeFavorite(knowledgeId: string): Promise<void> {
  if (USE_MOCK) return;
  return client.delete(`/v1/favorite/${knowledgeId}`);
}

export async function getFavorites(query: { page?: number; pageSize?: number } = {}): Promise<PaginatedData<ServerKnowledge>> {
  if (USE_MOCK) {
    const { MOCK_CARDS } = await import('../data/mock');
    const subset = MOCK_CARDS.slice(0, 4);
    return {
      list: subset.map((c) => ({
        id: c.id, title: c.title, content: c.description,
        resource_url: c.image, resource_type: 'image',
        category_id: 'cat-1', tags: [], source: c.source,
        status: 1, view_count: 0, favorite_count: 0,
        created_at: new Date().toISOString(),
      })),
      total: subset.length, page: 1, pageSize: 10, totalPages: 1,
    };
  }
  return client.get('/v1/favorite/list', { params: query });
}
