import { HOT_SEARCHES } from '../data/mock';
import type { HotSearchItem } from '../types';

// Server has no hot search endpoint yet — return static mock data
export async function getHotSearches(): Promise<HotSearchItem[]> {
  return HOT_SEARCHES;
}
