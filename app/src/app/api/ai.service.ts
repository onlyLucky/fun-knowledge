import client from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface AIExtendResult {
  title: string;
  content: string;
  source?: string;
}

export async function extendKnowledge(knowledgeId: string): Promise<AIExtendResult[]> {
  if (USE_MOCK) {
    return [
      { title: '深海生物的奇特生存机制', content: '除了特殊的血液循环系统，深海生物还进化出了许多令人惊叹的生存策略。例如，某些深海鱼类能够通过生物发光来吸引猎物或迷惑天敌。', source: '海洋生物学导论' },
      { title: '动物界的多重器官奇观', content: '不仅是三颗心脏的章鱼，自然界中还有许多多器官的奇特生物。蚯蚓拥有多达五对心脏，而某些昆虫则拥有多个脑节来协调复杂的运动。', source: '自然杂志' },
      { title: '进化压力与器官分工', content: '器官的分化与特化是进化过程中最引人入胜的现象之一。当生物面临特定的生存压力时，器官会朝着更高效的方向演化。', source: '进化生物学概论' },
    ];
  }
  return client.post('/v1/ai/extend', { knowledge_id: knowledgeId });
}

export async function recognizeImage(imageUrl: string): Promise<{ knowledge_id?: string; result?: string }> {
  if (USE_MOCK) return { knowledge_id: '1' };
  return client.post('/v1/ai/image-recognize', { image_url: imageUrl });
}
