import type { ServerKnowledge, ServerCategory } from './types';
import type { KnowledgeCard } from '../types';

// Category name lookup populated by setCategoryMap()
let categoryNameMap: Record<string, string> = {};

export function setCategoryMap(categories: ServerCategory[]) {
  categoryNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
}

// Resolve relative image URLs to absolute
export function resolveImageUrl(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  return `${base}${url}`;
}

// Server knowledge → client KnowledgeCard
export function mapKnowledgeToCard(k: ServerKnowledge): KnowledgeCard {
  return {
    id: k.id,
    title: k.title,
    description: k.content,
    image: resolveImageUrl(k.resource_url),
    category: categoryNameMap[k.category_id] || k.category?.name || '未分类',
    source: k.source || '',
  };
}

// Server category → client category format (with lucide icon name)
const ICON_MAP: Record<string, string> = {
  '生活常识': 'Lightbulb',
  '大自然奥秘': 'Leaf',
  '科学原理': 'FlaskConical',
  '数学趣题': 'Calculator',
  '历史故事': 'BookOpen',
  '人体奥秘': 'User',
  '宇宙探索': 'Globe',
  '美食文化': 'Utensils',
  '地理奇观': 'Map',
  '艺术人文': 'Palette',
};

export function mapServerCategory(c: ServerCategory) {
  return {
    id: c.id,
    name: c.name,
    icon: ICON_MAP[c.name] || 'Sparkles',
  };
}

// Correction type number → human label
const CORRECTION_TYPE_MAP: Record<number, string> = {
  1: '内容描述不准确',
  2: '分类错误',
  3: '图片与内容不符',
  4: '其他问题',
};

export function correctionTypeLabel(type: number): string {
  return CORRECTION_TYPE_MAP[type] || '其他问题';
}

// Map ERROR_REASONS strings to correction type numbers
const REASON_TO_TYPE: Record<string, number> = {
  '内容描述不准确': 1,
  '数据或数字有误': 1,
  '来源引用有误': 4,
  '内容已过时': 1,
  '图片与内容不符': 3,
  '其他问题': 4,
};

export function mapReasonToType(reason: string): number {
  return REASON_TO_TYPE[reason] || 4;
}

// Correction status number → UI status string
export function mapCorrectionStatus(status: number): 'pending' | 'resolved' | 'rejected' {
  if (status === 1) return 'resolved';
  if (status === 2) return 'rejected';
  return 'pending';
}
