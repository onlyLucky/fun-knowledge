import { z } from "zod/v4";

/* ---------- Endpoints ---------- */

export const DASHBOARD_ENDPOINTS = {
  recommendStats: "/api/admin/v1/dashboard/recommend-stats",
} as const;

/* ---------- Schemas ---------- */

export const RealtimeStatsSchema = z.object({
  today_recommend_count: z.number(),
  today_click_rate: z.number(),
  today_ai_extend_rate: z.number(),
});

export const QualityDistributionSchema = z.object({
  excellent: z.number(),
  normal: z.number(),
  low: z.number(),
  unevaluated: z.number(),
});

export const HotRankingItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const HotRankingSchema = z.object({
  top_view: z.array(HotRankingItemSchema.extend({ view_count: z.number() })),
  top_favorite: z.array(HotRankingItemSchema.extend({ favorite_count: z.number() })),
  top_ai_extend: z.array(HotRankingItemSchema.extend({ ai_extend_count: z.number() })),
});

export const QualityAlertItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const QualityAlertsSchema = z.object({
  low_favorite_rate: z.array(QualityAlertItemSchema.extend({ favorite_rate: z.number() })),
  low_ai_rate: z.array(QualityAlertItemSchema.extend({ ai_extend_rate: z.number() })),
  high_correction: z.array(QualityAlertItemSchema.extend({ correction_count: z.number() })),
});

export const CategoryStatsItemSchema = z.object({
  category_id: z.string(),
  name: z.string(),
  knowledge_count: z.number(),
  total_views: z.number(),
  total_favorites: z.number(),
});

export const CategoryRecommendStatsItemSchema = z.object({
  category_id: z.string(),
  name: z.string(),
  recommend_count: z.number(),
  click_count: z.number(),
  click_rate: z.number(),
});

export const UserStatsSchema = z.object({
  total_users: z.number(),
  new_users_7d: z.number(),
  active_users_7d: z.number(),
  top_interest_categories: z.array(
    z.object({
      category_id: z.string(),
      name: z.string(),
      user_count: z.number(),
    }),
  ),
  top_interest_tags: z.array(
    z.object({
      tag_name: z.string(),
      user_count: z.number(),
    }),
  ),
});

export const RecommendStatsSchema = z.object({
  realtime: RealtimeStatsSchema,
  quality_distribution: QualityDistributionSchema,
  hot_ranking: HotRankingSchema,
  quality_alerts: QualityAlertsSchema,
  category_stats: z.array(CategoryStatsItemSchema),
  category_recommend_stats: z.array(CategoryRecommendStatsItemSchema),
  user_stats: UserStatsSchema,
});

export type RecommendStats = z.infer<typeof RecommendStatsSchema>;
