import client from '@/lib/http';
import type { ServerCorrection, PaginatedData } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function submitCorrection(data: {
  knowledge_id: string;
  type: number;
  description: string;
  images?: string[];
}): Promise<void> {
  if (USE_MOCK) return;
  return client.post('/v1/correction', data);
}

export async function getCorrections(query: { page?: number; pageSize?: number; status?: number; keyword?: string } = {}): Promise<PaginatedData<ServerCorrection>> {
  if (USE_MOCK) {
    return { list: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }
  return client.get('/v1/correction/list', { params: query });
}
