import client from '@/lib/http';
import { HOT_SEARCHES } from '@/data/mock';
import type { HotSearchItem } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getHotSearches(limit: number = 10): Promise<HotSearchItem[]> {
  if (USE_MOCK) return HOT_SEARCHES;
  return client.get('/v1/knowledge/hot-searches', { params: { limit } });
}
