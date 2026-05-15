import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { Correction } from '../correction/entities/correction.entity';
import { User } from '../user/entities/user.entity';
import { UserInterest } from '../recommend/entities/user-interest.entity';
import { RecommendLog, RecommendLogDocument } from '../recommend/schemas/recommend-log.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Correction)
    private correctionRepo: Repository<Correction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserInterest)
    private userInterestRepo: Repository<UserInterest>,
    @InjectModel(RecommendLog.name)
    private recommendLogModel: Model<RecommendLogDocument>,
  ) {}

  async getRecommendStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      realtime,
      qualityDistribution,
      hotRanking,
      qualityAlerts,
      categoryStats,
      categoryRecommendStats,
      userStats,
    ] = await Promise.all([
      this.getRealtimeStats(todayStart),
      this.getQualityDistribution(),
      this.getHotRanking(),
      this.getQualityAlerts(),
      this.getCategoryStats(),
      this.getCategoryRecommendStats(todayStart),
      this.getUserStats(sevenDaysAgo),
    ]);

    return {
      realtime,
      quality_distribution: qualityDistribution,
      hot_ranking: hotRanking,
      quality_alerts: qualityAlerts,
      category_stats: categoryStats,
      category_recommend_stats: categoryRecommendStats,
      user_stats: userStats,
    };
  }

  private async getRealtimeStats(todayStart: Date) {
    const todayLogs = await this.recommendLogModel.find({
      created_at: { $gte: todayStart },
    });

    const todayRecommendCount = todayLogs.length;
    const clickedLogs = todayLogs.filter((l) => l.is_clicked === 1);
    const todayClickRate = todayRecommendCount > 0
      ? Math.round((clickedLogs.length / todayRecommendCount) * 10000) / 100
      : 0;

    const aiExtendLogs = todayLogs.filter((l) => l.action === 'ai_extend');
    const todayAiExtendRate = todayRecommendCount > 0
      ? Math.round((aiExtendLogs.length / todayRecommendCount) * 10000) / 100
      : 0;

    return {
      today_recommend_count: todayRecommendCount,
      today_click_rate: todayClickRate,
      today_ai_extend_rate: todayAiExtendRate,
    };
  }

  private async getQualityDistribution() {
    const all = await this.knowledgeRepo
      .createQueryBuilder('k')
      .where('k.deleted_at IS NULL')
      .getMany();

    let excellent = 0, normal = 0, low = 0, unevaluated = 0;

    for (const k of all) {
      if (k.view_count < 100) {
        unevaluated++;
      } else if (k.quality_score >= 15) {
        excellent++;
      } else if (k.quality_score >= 5) {
        normal++;
      } else {
        low++;
      }
    }

    return { excellent, normal, low, unevaluated };
  }

  private async getHotRanking() {
    const topView = await this.knowledgeRepo
      .createQueryBuilder('k')
      .where('k.deleted_at IS NULL')
      .select(['k.id', 'k.title', 'k.view_count'])
      .orderBy('k.view_count', 'DESC')
      .limit(10)
      .getMany();

    const topFavorite = await this.knowledgeRepo
      .createQueryBuilder('k')
      .where('k.deleted_at IS NULL')
      .select(['k.id', 'k.title', 'k.favorite_count'])
      .orderBy('k.favorite_count', 'DESC')
      .limit(10)
      .getMany();

    const topAiExtend = await this.knowledgeRepo
      .createQueryBuilder('k')
      .where('k.deleted_at IS NULL')
      .select(['k.id', 'k.title', 'k.ai_extend_count'])
      .orderBy('k.ai_extend_count', 'DESC')
      .limit(10)
      .getMany();

    return {
      top_view: topView,
      top_favorite: topFavorite,
      top_ai_extend: topAiExtend,
    };
  }

  private async getQualityAlerts() {
    const all = await this.knowledgeRepo
      .createQueryBuilder('k')
      .where('k.deleted_at IS NULL')
      .andWhere('k.view_count >= :minViews', { minViews: 100 })
      .getMany();

    const lowFavoriteRate = all
      .filter((k) => k.view_count > 0 && (k.favorite_count / k.view_count) < 0.03)
      .map((k) => ({
        id: k.id,
        title: k.title,
        favorite_rate: Math.round((k.favorite_count / k.view_count) * 10000) / 100,
      }))
      .sort((a, b) => a.favorite_rate - b.favorite_rate)
      .slice(0, 10);

    const lowAiRate = all
      .filter((k) => k.view_count > 0 && (k.ai_extend_count / k.view_count) < 0.05)
      .map((k) => ({
        id: k.id,
        title: k.title,
        ai_extend_rate: Math.round((k.ai_extend_count / k.view_count) * 10000) / 100,
      }))
      .sort((a, b) => a.ai_extend_rate - b.ai_extend_rate)
      .slice(0, 10);

    // High correction: correction_count / view_count > 10%
    const highCorrection = all
      .filter((k) => k.view_count > 0 && (k.correction_count / k.view_count) > 0.1)
      .map((k) => ({
        id: k.id,
        title: k.title,
        correction_count: k.correction_count,
      }))
      .sort((a, b) => b.correction_count - a.correction_count)
      .slice(0, 10);

    return {
      low_favorite_rate: lowFavoriteRate,
      low_ai_rate: lowAiRate,
      high_correction: highCorrection,
    };
  }

  private async getCategoryStats() {
    const categories = await this.knowledgeRepo
      .createQueryBuilder('k')
      .innerJoin('k.category', 'c')
      .where('k.deleted_at IS NULL')
      .select([
        'c.id AS category_id',
        'c.name AS name',
        'COUNT(k.id)::int AS knowledge_count',
        'COALESCE(SUM(k.view_count), 0)::int AS total_views',
        'COALESCE(SUM(k.favorite_count), 0)::int AS total_favorites',
      ])
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('total_views', 'DESC')
      .getRawMany();

    return categories;
  }

  private async getCategoryRecommendStats(todayStart: Date) {
    const logs = await this.recommendLogModel.find({
      created_at: { $gte: todayStart },
    });

    // Group by knowledge_id to get category mapping
    const knowledgeIds = [...new Set(logs.map((l) => l.knowledge_id))];
    if (knowledgeIds.length === 0) return [];

    const knowledges = await this.knowledgeRepo
      .createQueryBuilder('k')
      .where('k.id IN (:...ids)', { ids: knowledgeIds })
      .select(['k.id', 'k.category_id'])
      .getMany();

    const knowledgeCategoryMap = new Map(knowledges.map((k) => [k.id, k.category_id]));

    const categories = await this.categoryRepo.find();
    const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));

    // Aggregate by category
    const categoryStats = new Map<string, { recommend_count: number; click_count: number }>();
    for (const log of logs) {
      const categoryId = knowledgeCategoryMap.get(log.knowledge_id);
      if (!categoryId) continue;

      const existing = categoryStats.get(categoryId) || { recommend_count: 0, click_count: 0 };
      existing.recommend_count++;
      if (log.is_clicked === 1) existing.click_count++;
      categoryStats.set(categoryId, existing);
    }

    return Array.from(categoryStats.entries())
      .map(([categoryId, stats]) => ({
        category_id: categoryId,
        name: categoryNameMap.get(categoryId) || categoryId,
        recommend_count: stats.recommend_count,
        click_count: stats.click_count,
        click_rate: stats.recommend_count > 0
          ? Math.round((stats.click_count / stats.recommend_count) * 10000) / 100
          : 0,
      }))
      .sort((a, b) => b.recommend_count - a.recommend_count);
  }

  private async getUserStats(sevenDaysAgo: Date) {
    const totalUsers = await this.userRepo.count();

    const newUsers7d = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :date', { date: sevenDaysAgo })
      .getCount();

    // Active users: those with recommend logs in last 7 days
    const activeLogs = await this.recommendLogModel.distinct('user_id', {
      created_at: { $gte: sevenDaysAgo },
    });
    const activeUsers7d = activeLogs.length;

    // Top interest categories
    const topInterestCategories = await this.userInterestRepo
      .createQueryBuilder('ui')
      .innerJoin('ui.category', 'c')
      .where('ui.type = :type', { type: 'category' })
      .select([
        'ui.category_id AS category_id',
        'c.name AS name',
        'COUNT(DISTINCT ui.user_id)::int AS user_count',
      ])
      .groupBy('ui.category_id')
      .addGroupBy('c.name')
      .orderBy('user_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top interest tags
    const topInterestTags = await this.userInterestRepo
      .createQueryBuilder('ui')
      .where('ui.type = :type', { type: 'tag' })
      .select([
        'ui.tag_name AS tag_name',
        'COUNT(DISTINCT ui.user_id)::int AS user_count',
      ])
      .groupBy('ui.tag_name')
      .orderBy('user_count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total_users: totalUsers,
      new_users_7d: newUsers7d,
      active_users_7d: activeUsers7d,
      top_interest_categories: topInterestCategories,
      top_interest_tags: topInterestTags,
    };
  }
}
