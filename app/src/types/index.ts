export interface KnowledgeCard {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  source: string;
}

export interface HotSearchItem {
  rank: number;
  keyword: string;
  heat: number;
  trend: 'up' | 'down' | 'same';
  cardId?: string;
}
