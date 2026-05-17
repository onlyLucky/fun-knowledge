import client from './client';
import type { ServerCategory } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_CATEGORIES: ServerCategory[] = [
  { id: 'cat-1', name: '生活常识', icon: '', description: '', sort_order: 1, status: 1 },
  { id: 'cat-2', name: '大自然奥秘', icon: '', description: '', sort_order: 2, status: 1 },
  { id: 'cat-3', name: '科学原理', icon: '', description: '', sort_order: 3, status: 1 },
  { id: 'cat-4', name: '数学趣题', icon: '', description: '', sort_order: 4, status: 1 },
  { id: 'cat-5', name: '历史故事', icon: '', description: '', sort_order: 5, status: 1 },
  { id: 'cat-6', name: '人体奥秘', icon: '', description: '', sort_order: 6, status: 1 },
  { id: 'cat-7', name: '宇宙探索', icon: '', description: '', sort_order: 7, status: 1 },
  { id: 'cat-8', name: '美食文化', icon: '', description: '', sort_order: 8, status: 1 },
  { id: 'cat-9', name: '地理奇观', icon: '', description: '', sort_order: 9, status: 1 },
  { id: 'cat-10', name: '艺术人文', icon: '', description: '', sort_order: 10, status: 1 },
];

export async function getCategories(): Promise<ServerCategory[]> {
  if (USE_MOCK) return MOCK_CATEGORIES;
  return client.get('/v1/category/list');
}
