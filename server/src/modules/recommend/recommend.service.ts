import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { In, Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Queue } from 'bull';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { UserInterest } from './entities/user-interest.entity';
import { RecommendLog, RecommendLogDocument } from './schemas/recommend-log.schema';
import { RecommendQueryDto } from './dto/recommend-query.dto';
import { RecommendFeedbackDto } from './dto/recommend-feedback.dto';
import { BehaviorReportDto } from './dto/behavior-report.dto';
import { ConfigService } from '../config/config.service';

interface RecommendWeights {
  content: number;
  hot: number;
  new: number;
  random: number;
}

@Injectable()
export class RecommendService implements OnModuleInit {
  private readonly logger = new Logger(RecommendService.name);

  private weightsCache: RecommendWeights | null = null;
  private weightsCacheTime = 0;
  private readonly WEIGHTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    @InjectRepository(UserInterest)
    private userInterestRepo: Repository<UserInterest>,
    @InjectModel(RecommendLog.name)
    private recommendLogModel: Model<RecommendLogDocument>,
    @InjectQueue('recommend')
    private recommendQueue: Queue,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Schedule daily interest decay job at 3:00 AM
    await this.recommendQueue.add('interest-decay', {}, {
      repeat: { cron: '0 3 * * *' },
      removeOnComplete: true,
      removeOnFail: 100,
    });
    this.logger.log('Scheduled daily interest-decay job at 03:00');
  }

  /**
   * Get recommendation weights from system config with in-memory cache
   */
  private async getWeights(): Promise<RecommendWeights> {
    const now = Date.now();
    if (this.weightsCache && now - this.weightsCacheTime < this.WEIGHTS_CACHE_TTL) {
      return this.weightsCache;
    }

    const keys = ['recommend_content_weight', 'recommend_hot_weight', 'recommend_new_weight', 'recommend_random_weight'];
    const defaults: Record<string, number> = {
      recommend_content_weight: 0.4,
      recommend_hot_weight: 0.3,
      recommend_new_weight: 0.2,
      recommend_random_weight: 0.1,
    };

    const results: Record<string, number> = {};
    for (const key of keys) {
      try {
        const config = await this.configService.findByKey(key);
        results[key] = parseFloat(config.config_value) || defaults[key];
      } catch {
        results[key] = defaults[key];
      }
    }

    this.weightsCache = {
      content: results.recommend_content_weight,
      hot: results.recommend_hot_weight,
      new: results.recommend_new_weight,
      random: results.recommend_random_weight,
    };
    this.weightsCacheTime = now;

    return this.weightsCache;
  }

  /**
   * Get dedup days from system config
   */
  private async getDedupDays(): Promise<number> {
    try {
      const config = await this.configService.findByKey('recommend_dedup_days');
      return parseInt(config.config_value, 10) || 7;
    } catch {
      return 7;
    }
  }

  /**
   * Check if behavior dedup is enabled
   */
  private async isBehaviorDedupEnabled(): Promise<boolean> {
    try {
      const config = await this.configService.findByKey('recommend_behavior_dedup_enabled');
      return config.config_value === 'true';
    } catch {
      return true;
    }
  }

  /**
   * Get recommendation list
   */
  async recommend(query: RecommendQueryDto, userId?: string) {
    const { page = 1, pageSize = 10, category_id, refresh = false } = query;

    let strategy = 'hot';
    let knowledges: Knowledge[] = [];

    if (userId) {
      strategy = 'personalized';
      knowledges = await this.getPersonalizedRecommendations(userId, page, pageSize, category_id, refresh);
    } else {
      knowledges = await this.getHotRecommendations(page, pageSize, category_id);
    }

    if (userId && knowledges.length > 0) {
      await this.logRecommendations(userId, knowledges, strategy);
    }

    // Batch check favorite status
    let favoritedIds = new Set<string>();
    if (userId && knowledges.length > 0) {
      const knowledgeIds = knowledges.map((k) => k.id);
      const favorites = await this.favoriteRepo.find({
        where: { user_id: userId, knowledge_id: In(knowledgeIds) },
        select: ['knowledge_id'],
      });
      favoritedIds = new Set(favorites.map((f) => f.knowledge_id));
    }

    return {
      list: knowledges.map((k) => ({
        ...k,
        category_name: k.category?.name,
        is_favorited: favoritedIds.has(k.id),
      })),
      has_more: knowledges.length === pageSize,
      recommend_strategy: strategy,
    };
  }

  /**
   * Personalized recommendation with two-level interests
   */
  private async getPersonalizedRecommendations(
    userId: string,
    page: number,
    pageSize: number,
    categoryId?: string,
    refresh?: boolean,
  ): Promise<Knowledge[]> {
    // Level 1: top 5 category interests
    const categoryInterests = await this.userInterestRepo.find({
      where: { user_id: userId, type: 'category' },
      order: { score: 'DESC' },
      take: 5,
    });

    // Level 2: top 10 tag interests
    const tagInterests = await this.userInterestRepo.find({
      where: { user_id: userId, type: 'tag' },
      order: { score: 'DESC' },
      take: 10,
    });

    // Collect excluded knowledge IDs (recently recommended)
    const dedupDays = await this.getDedupDays();
    const cutoffDate = new Date(Date.now() - dedupDays * 24 * 60 * 60 * 1000);
    const recentLogs = await this.recommendLogModel
      .find({ user_id: userId, created_at: { $gte: cutoffDate } })
      .select('knowledge_id')
      .lean();
    const excludeIds = [...new Set(recentLogs.map((l) => l.knowledge_id))];

    // Candidate recall: category-based + tag-based cross-category
    const candidateMap = new Map<string, Knowledge>();

    // Category-based recall
    if (categoryInterests.length > 0) {
      const catIds = categoryInterests.map((i) => i.category_id).filter(Boolean);
      if (catIds.length > 0) {
        const catCandidates = await this.knowledgeRepo
          .createQueryBuilder('k')
          .leftJoinAndSelect('k.category', 'c')
          .where('k.status = :status', { status: 1 })
          .andWhere('k.deleted_at IS NULL')
          .andWhere('k.category_id IN (:...catIds)', { catIds })
          .orderBy('k.sort_weight', 'DESC')
          .addOrderBy('k.created_at', 'DESC')
          .limit(pageSize * 3)
          .getMany();
        for (const k of catCandidates) {
          candidateMap.set(k.id, k);
        }
      }
    }

    // Tag-based cross-category recall
    if (tagInterests.length > 0) {
      const tagNames = tagInterests.map((i) => i.tag_name).filter(Boolean);
      if (tagNames.length > 0) {
        // tags are stored as jsonb array, use containment check
        const tagCandidates = await this.knowledgeRepo
          .createQueryBuilder('k')
          .leftJoinAndSelect('k.category', 'c')
          .where('k.status = :status', { status: 1 })
          .andWhere('k.deleted_at IS NULL')
          .andWhere('k.tags IS NOT NULL')
          .andWhere(`k.tags ?| array[:...tags]`, { tags: tagNames })
          .orderBy('k.sort_weight', 'DESC')
          .addOrderBy('k.created_at', 'DESC')
          .limit(pageSize * 3)
          .getMany();
        for (const k of tagCandidates) {
          candidateMap.set(k.id, k);
        }
      }
    }

    // If no interests, fall back to hot recommendations
    if (candidateMap.size === 0) {
      return this.getHotRecommendations(page, pageSize, categoryId);
    }

    // Filter exclusions
    let candidates = Array.from(candidateMap.values());
    if (!refresh && excludeIds.length > 0) {
      candidates = candidates.filter((k) => !excludeIds.includes(k.id));
    }
    if (categoryId) {
      candidates = candidates.filter((k) => k.category_id === categoryId);
    }

    // Build interest score maps for scoring
    const categoryScoreMap = new Map<string, number>();
    for (const interest of categoryInterests) {
      if (interest.category_id) {
        categoryScoreMap.set(interest.category_id, interest.score);
      }
    }
    const tagScoreMap = new Map<string, number>();
    for (const interest of tagInterests) {
      if (interest.tag_name) {
        tagScoreMap.set(interest.tag_name, interest.score);
      }
    }

    // Score and sort with mixed formula
    const weights = await this.getWeights();
    const scored = candidates.map((k) => {
      const interestScore = this.calculateInterestScore(k, categoryScoreMap, tagScoreMap);
      const hotScore = this.calculateHotScore(k);
      const newScore = this.calculateNewScore(k);
      const randomScore = Math.random();

      const finalScore =
        interestScore * weights.content +
        hotScore * weights.hot +
        newScore * weights.new +
        randomScore * weights.random +
        (k.weight || 0) * 10;

      return { knowledge: k, score: finalScore };
    });

    scored.sort((a, b) => b.score - a.score);

    const offset = (page - 1) * pageSize;
    return scored.slice(offset, offset + pageSize).map((s) => s.knowledge);
  }

  /**
   * Hot recommendation with new formula
   */
  private async getHotRecommendations(
    page: number,
    pageSize: number,
    categoryId?: string,
  ): Promise<Knowledge[]> {
    const queryBuilder = this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.status = :status', { status: 1 })
      .andWhere('k.deleted_at IS NULL');

    if (categoryId) {
      queryBuilder.andWhere('k.category_id = :categoryId', { categoryId });
    }

    // Hot score formula in SQL:
    // (view_count + favorite_count * 5 + ai_extend_count * 3 + weight * 10) * time_decay
    queryBuilder.addSelect(
      `(k.view_count + k.favorite_count * 5 + k.ai_extend_count * 3 + k.weight * 10)
       * CASE
           WHEN k.created_at >= NOW() - INTERVAL '7 days' THEN 1.5
           WHEN k.created_at >= NOW() - INTERVAL '30 days' THEN 1.0
           ELSE 0.8
         END`,
      'hot_score',
    );
    queryBuilder.orderBy('hot_score', 'DESC');
    queryBuilder.addOrderBy('k.created_at', 'DESC');

    return queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  }

  /**
   * Calculate interest score for a knowledge card
   */
  private calculateInterestScore(
    knowledge: Knowledge,
    categoryScoreMap: Map<string, number>,
    tagScoreMap: Map<string, number>,
  ): number {
    let score = 0;

    // Category interest
    const catScore = categoryScoreMap.get(knowledge.category_id);
    if (catScore) {
      score += catScore;
    }

    // Tag interest (cross-category)
    if (knowledge.tags && knowledge.tags.length > 0) {
      for (const tag of knowledge.tags) {
        const tagScore = tagScoreMap.get(tag);
        if (tagScore) {
          score += tagScore * 0.5; // tag interest weighted lower
        }
      }
    }

    return score;
  }

  /**
   * Calculate hot score (normalized 0-1 range)
   */
  private calculateHotScore(knowledge: Knowledge): number {
    const raw =
      (knowledge.view_count || 0) +
      (knowledge.favorite_count || 0) * 5 +
      (knowledge.ai_extend_count || 0) * 3 +
      (knowledge.weight || 0) * 10;

    // Simple normalization: use sigmoid-like scaling
    return 1 / (1 + Math.exp(-raw / 100));
  }

  /**
   * Calculate freshness score (0-1, newer = higher)
   */
  private calculateNewScore(knowledge: Knowledge): number {
    const now = Date.now();
    const created = new Date(knowledge.created_at).getTime();
    const daysSinceCreation = (now - created) / (24 * 60 * 60 * 1000);

    if (daysSinceCreation <= 1) return 1.0;
    if (daysSinceCreation <= 7) return 0.8;
    if (daysSinceCreation <= 30) return 0.5;
    return 0.2;
  }

  /**
   * Log recommendations
   */
  private async logRecommendations(userId: string, knowledges: Knowledge[], strategy: string) {
    const logs = knowledges.map((k, index) => ({
      user_id: userId,
      knowledge_id: k.id,
      strategy,
      position: index + 1,
      recommended_at: new Date(),
    }));

    await this.recommendLogModel.insertMany(logs);
  }

  /**
   * Report user behavior (browse/favorite/ai_extend)
   */
  async reportBehavior(dto: BehaviorReportDto, userId: string) {
    const { knowledge_id, action, browse_duration } = dto;

    // Verify knowledge exists
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledge_id },
    });
    if (!knowledge) {
      return { success: false, message: '知识卡片不存在' };
    }

    // Dedup check
    const dedupEnabled = await this.isBehaviorDedupEnabled();
    if (dedupEnabled) {
      const dedupDays = await this.getDedupDays();
      const cutoffDate = new Date(Date.now() - dedupDays * 24 * 60 * 60 * 1000);
      const existing = await this.recommendLogModel.findOne({
        user_id: userId,
        knowledge_id,
        action,
        created_at: { $gte: cutoffDate },
      });
      if (existing) {
        return { success: true, message: '行为已记录（去重）', deduplicated: true };
      }
    }

    // Calculate interest score delta
    let scoreDelta = 0;
    if (action === 'browse') {
      if (browse_duration !== undefined) {
        if (browse_duration >= 30) scoreDelta = 3;
        else if (browse_duration >= 10) scoreDelta = 2;
        else if (browse_duration >= 3) scoreDelta = 1;
        // < 3s: no score
      }
    } else if (action === 'favorite') {
      scoreDelta = 5;
    } else if (action === 'ai_extend') {
      scoreDelta = 2;
    }

    // Log behavior
    await this.recommendLogModel.create({
      user_id: userId,
      knowledge_id,
      strategy: action,
      action,
      browse_duration: action === 'browse' ? browse_duration : undefined,
      is_clicked: action === 'browse' ? 1 : 0,
      clicked_at: action === 'browse' ? new Date() : undefined,
      recommended_at: new Date(),
    });

    // Update interests if score delta > 0
    if (scoreDelta > 0) {
      // Update category interest (level 1)
      await this.updateCategoryInterest(userId, knowledge.category_id, scoreDelta);

      // Update tag interests (level 2)
      if (knowledge.tags && knowledge.tags.length > 0) {
        for (const tag of knowledge.tags) {
          await this.updateTagInterest(userId, tag, scoreDelta);
        }
      }
    }

    return { success: true, message: '行为已记录' };
  }

  /**
   * Update category-level interest (level 1) using upsert with score increment
   */
  private async updateCategoryInterest(userId: string, categoryId: string, scoreDelta: number) {
    const existing = await this.userInterestRepo.findOne({
      where: { user_id: userId, type: 'category', category_id: categoryId },
    });

    if (existing) {
      existing.score = Math.max(0, existing.score + scoreDelta);
      await this.userInterestRepo.save(existing);
    } else {
      const interest = this.userInterestRepo.create({
        user_id: userId,
        type: 'category',
        category_id: categoryId,
        score: Math.max(0, scoreDelta),
      });
      await this.userInterestRepo.save(interest);
    }
  }

  /**
   * Update tag-level interest (level 2) using upsert with score increment
   */
  private async updateTagInterest(userId: string, tagName: string, scoreDelta: number) {
    const existing = await this.userInterestRepo.findOne({
      where: { user_id: userId, type: 'tag', tag_name: tagName },
    });

    if (existing) {
      existing.score = Math.max(0, existing.score + scoreDelta);
      await this.userInterestRepo.save(existing);
    } else {
      const interest = this.userInterestRepo.create({
        user_id: userId,
        type: 'tag',
        tag_name: tagName,
        score: Math.max(0, scoreDelta),
      });
      await this.userInterestRepo.save(interest);
    }
  }

  /**
   * Legacy feedback endpoint (backward compatibility)
   */
  async feedback(dto: RecommendFeedbackDto, userId: string) {
    const { knowledge_id, is_liked } = dto;

    await this.recommendLogModel.updateOne(
      { user_id: userId, knowledge_id },
      { is_clicked: 1, clicked_at: new Date() },
    );

    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledge_id },
    });

    if (knowledge) {
      await this.updateCategoryInterest(userId, knowledge.category_id, is_liked ? 2.0 : -1.0);
    }

    return { success: true };
  }

  /**
   * Update user interest score (legacy, kept for backward compatibility)
   */
  async updateUserInterest(userId: string, categoryId: string, scoreDelta: number) {
    await this.updateCategoryInterest(userId, categoryId, scoreDelta);
  }
}
