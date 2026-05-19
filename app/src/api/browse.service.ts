import client from '@/lib/http';
import type { ServerBrowseHistory, PaginatedData } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function addBrowseHistory(knowledgeId: string): Promise<void> {
  if (USE_MOCK) return;
  return client.post('/v1/browse-history', { knowledge_id: knowledgeId });
}

export async function getBrowseHistory(query: { page?: number; pageSize?: number; keyword?: string } = {}): Promise<PaginatedData<ServerBrowseHistory>> {
  if (USE_MOCK) {
    return { list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }
  return client.get('/v1/browse-history/list', { params: query });
}

export async function removeBrowseHistory(id: string): Promise<void> {
  if (USE_MOCK) return;
  return client.delete(`/v1/browse-history/${id}`);
}

export async function batchRemoveBrowseHistory(ids: string[]): Promise<{ deleted: number }> {
  if (USE_MOCK) return { deleted: ids.length };
  return client.post('/v1/browse-history/batch-delete', { ids });
}
