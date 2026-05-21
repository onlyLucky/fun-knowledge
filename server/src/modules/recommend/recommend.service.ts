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

/**
 * 推荐算法完整配置，所有参数从 t_system_config 读取
 */
interface AlgorithmConfig {
  // 混合权重
  contentWeight: number;
  hotWeight: number;
  newWeight: number;
  randomWeight: number;
  weightMultiplier: number;
  // 热度分信号权重
  hotFavoriteWeight: number;
  hotAiExtendWeight: number;
  hotWeightMultiplier: number;
  // 时间衰减
  newContentDays: number;
  newContentBoost: number;
  midContentDays: number;
  oldContentPenalty: number;
  // 候选召回
  recallCategoryLimit: number;
  recallTagLimit: number;
  recallPoolMultiplier: number;
  shuffleRangeMultiplier: number;
  // 多样性
  diversityConsecutiveLimit: number;
  // 热度归一化
  hotScoreSigmoidDivisor: number;
  // 标签兴趣权重
  tagInterestWeight: number;
  // 去重
  dedupDays: number;
  behaviorDedupEnabled: boolean;
  // 行为信号
  browseDurationTiers: number[];
  browseScoreTiers: number[];
  favoriteScore: number;
  aiExtendScore: number;
  // 缓存
  cacheTTLMs: number;
}

/** 配置键 → 默认值映射 */
const CONFIG_DEFAULTS: Record<string, number> = {
  recommend_content_weight: 0.4,
  recommend_hot_weight: 0.3,
  recommend_new_weight: 0.2,
  recommend_random_weight: 0.1,
  recommend_weight_multiplier: 10,
  recommend_hot_favorite_weight: 5,
  recommend_hot_ai_extend_weight: 3,
  recommend_hot_weight_multiplier: 10,
  recommend_new_content_days: 7,
  recommend_new_content_boost: 1.0,
  recommend_mid_content_days: 30,
  recommend_old_content_penalty: 0.8,
  recommend_recall_category_interest_limit: 5,
  recommend_recall_tag_interest_limit: 10,
  recommend_recall_pool_multiplier: 5,
  recommend_shuffle_range_multiplier: 2,
  recommend_diversity_consecutive_limit: 3,
  recommend_hot_score_sigmoid_divisor: 100,
  recommend_tag_interest_weight: 0.5,
  recommend_dedup_days: 7,
  recommend_favorite_score: 5,
  recommend_ai_extend_score: 2,
  recommend_weights_cache_ttl_seconds: 300,
  recommend_browse_duration_tiers: 0, // 特殊处理：逗号分隔字符串
  recommend_browse_score_tiers: 0,    // 特殊处理：逗号分隔字符串
};

@Injectable()
export class RecommendService implements OnModuleInit {
  private readonly logger = new Logger(RecommendService.name);

  private algorithmConfigCache: AlgorithmConfig | null = null;
  private algorithmConfigCacheTime = 0;

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

    // Schedule daily quality score calculation at 3:30 AM
    await this.recommendQueue.add('quality-score-calc', {}, {
      repeat: { cron: '30 3 * * *' },
      removeOnComplete: true,
      removeOnFail: 100,
    });
    this.logger.log('Scheduled daily quality-score-calc job at 03:30');

    // Check for missed tasks during downtime
    await this.checkAndRecoverMissedTasks();
  }

  /**
   * 统一配置读取：带内存缓存，TTL 由 recommend_weights_cache_ttl_seconds 控制
   */
  private async getAlgorithmConfig(): Promise<AlgorithmConfig> {
    const now = Date.now();
    if (this.algorithmConfigCache && now - this.algorithmConfigCacheTime < this.algorithmConfigCache.cacheTTLMs) {
      return this.algorithmConfigCache;
    }

    const getFloat = async (key: string): Promise<number> => {
      try {
        const config = await this.configService.findByKey(key);
        const val = parseFloat(config.config_value);
        return isNaN(val) ? (CONFIG_DEFAULTS[key] ?? 0) : val;
      } catch {
        return CONFIG_DEFAULTS[key] ?? 0;
      }
    };

    const getInt = async (key: string): Promise<number> => {
      try {
        const config = await this.configService.findByKey(key);
        const val = parseInt(config.config_value, 10);
        return isNaN(val) ? (CONFIG_DEFAULTS[key] ?? 0) : val;
      } catch {
        return CONFIG_DEFAULTS[key] ?? 0;
      }
    };

    const getBool = async (key: string, defaultVal: boolean): Promise<boolean> => {
      try {
        const config = await this.configService.findByKey(key);
        return config.config_value === 'true';
      } catch {
        return defaultVal;
      }
    };

    const getString = async (key: string, defaultVal: string): Promise<string> => {
      try {
        const config = await this.configService.findByKey(key);
        return config.config_value || defaultVal;
      } catch {
        return defaultVal;
      }
    };

    // 读取逗号分隔的层级配置
    const browseDurationStr = await getString('recommend_browse_duration_tiers', '3,10,30');
    const browseScoreStr = await getString('recommend_browse_score_tiers', '1,2,3');

    const cacheTTLSeconds = await getInt('recommend_weights_cache_ttl_seconds');

    this.algorithmConfigCache = {
      contentWeight: await getFloat('recommend_content_weight'),
      hotWeight: await getFloat('recommend_hot_weight'),
      newWeight: await getFloat('recommend_new_weight'),
      randomWeight: await getFloat('recommend_random_weight'),
      weightMultiplier: await getInt('recommend_weight_multiplier'),
      hotFavoriteWeight: await getInt('recommend_hot_favorite_weight'),
      hotAiExtendWeight: await getInt('recommend_hot_ai_extend_weight'),
      hotWeightMultiplier: await getInt('recommend_hot_weight_multiplier'),
      newContentDays: await getInt('recommend_new_content_days'),
      newContentBoost: await getFloat('recommend_new_content_boost'),
      midContentDays: await getInt('recommend_mid_content_days'),
      oldContentPenalty: await getFloat('recommend_old_content_penalty'),
      recallCategoryLimit: await getInt('recommend_recall_category_interest_limit'),
      recallTagLimit: await getInt('recommend_recall_tag_interest_limit'),
      recallPoolMultiplier: await getInt('recommend_recall_pool_multiplier'),
      shuffleRangeMultiplier: await getInt('recommend_shuffle_range_multiplier'),
      diversityConsecutiveLimit: await getInt('recommend_diversity_consecutive_limit'),
      hotScoreSigmoidDivisor: await getInt('recommend_hot_score_sigmoid_divisor'),
      tagInterestWeight: await getFloat('recommend_tag_interest_weight'),
      dedupDays: await getInt('recommend_dedup_days'),
      behaviorDedupEnabled: await getBool('recommend_behavior_dedup_enabled', true),
      browseDurationTiers: browseDurationStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)),
      browseScoreTiers: browseScoreStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)),
      favoriteScore: await getInt('recommend_favorite_score'),
      aiExtendScore: await getInt('recommend_ai_extend_score'),
      cacheTTLMs: (cacheTTLSeconds || 300) * 1000,
    };
    this.algorithmConfigCacheTime = now;

    return this.algorithmConfigCache;
  }

  /**
   * Get dedup days (convenience accessor)
   */
  private async getDedupDays(): Promise<number> {
    const config = await this.getAlgorithmConfig();
    return config.dedupDays;
  }

  /**
   * Check if behavior dedup is enabled (convenience accessor)
   */
  private async isBehaviorDedupEnabled(): Promise<boolean> {
    const config = await this.getAlgorithmConfig();
    return config.behaviorDedupEnabled;
  }

  /**
   * Get recommendation list
   */
  async recommend(query: RecommendQueryDto, userId?: string) {
    const { page = 1, pageSize = 10, category_id, refresh = false } = query;

    // Check cache for hot recommendations
    const cacheKey = userId ? null : `hot:${category_id || 'all'}:${page}:${pageSize}`;
    if (cacheKey && !refresh) {
      const cached = this.recommendCache.get(cacheKey);
      if (cached && Date.now() - cached.time < (this.algorithmConfigCache?.cacheTTLMs || 300_000)) {
        return cached.data;
      }
    }

    let strategy = 'hot';
    let knowledges: Knowledge[] = [];

    if (userId) {
      const result = await this.getPersonalizedRecommendations(userId, page, pageSize, category_id, refresh);
      knowledges = result.knowledges;
      strategy = result.strategy;
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

    const result = {
      list: knowledges.map((k) => ({
        ...k,
        category_name: k.category?.name,
        is_favorited: favoritedIds.has(k.id),
      })),
      has_more: knowledges.length === pageSize,
      recommend_strategy: strategy,
    };

    // Cache hot recommendations with size limit
    if (cacheKey && !userId) {
      if (this.recommendCache.size >= this.MAX_CACHE_SIZE) {
        // Evict oldest entry
        const firstKey = this.recommendCache.keys().next().value;
        if (firstKey) this.recommendCache.delete(firstKey);
      }
      this.recommendCache.set(cacheKey, { data: result, time: Date.now() });
    }

    return result;
  }

  /** 推荐结果缓存（仅热门推荐） */
  private recommendCache = new Map<string, { data: any; time: number }>();
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Personalized recommendation with two-level interests
   */
  private async getPersonalizedRecommendations(
    userId: string,
    page: number,
    pageSize: number,
    categoryId?: string,
    refresh?: boolean,
  ): Promise<{ knowledges: Knowledge[]; strategy: string }> {
    const config = await this.getAlgorithmConfig();

    // Level 1: top N category interests
    const categoryInterests = await this.userInterestRepo.find({
      where: { user_id: userId, type: 'category' },
      order: { score: 'DESC' },
      take: config.recallCategoryLimit,
    });

    // Level 2: top N tag interests
    const tagInterests = await this.userInterestRepo.find({
      where: { user_id: userId, type: 'tag' },
      order: { score: 'DESC' },
      take: config.recallTagLimit,
    });

    // Collect excluded knowledge IDs (recently recommended)
    const cutoffDate = new Date(Date.now() - config.dedupDays * 24 * 60 * 60 * 1000);
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
          .limit(pageSize * config.recallPoolMultiplier)
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
        const tagCandidates = await this.knowledgeRepo
          .createQueryBuilder('k')
          .leftJoinAndSelect('k.category', 'c')
          .where('k.status = :status', { status: 1 })
          .andWhere('k.deleted_at IS NULL')
          .andWhere('k.tags IS NOT NULL')
          .andWhere(`k.tags ?| array[:...tags]`, { tags: tagNames })
          .orderBy('k.sort_weight', 'DESC')
          .addOrderBy('k.created_at', 'DESC')
          .limit(pageSize * config.recallPoolMultiplier)
          .getMany();
        for (const k of tagCandidates) {
          candidateMap.set(k.id, k);
        }
      }
    }

    // If no interests, fall back to hot recommendations
    if (candidateMap.size === 0) {
      return { knowledges: await this.getHotRecommendations(page, pageSize, categoryId), strategy: 'hot' };
    }

    // Filter exclusions
    let candidates = Array.from(candidateMap.values());
    if (!refresh && excludeIds.length > 0) {
      candidates = candidates.filter((k) => !excludeIds.includes(k.id));
    }
    if (categoryId) {
      candidates = candidates.filter((k) => k.category_id === categoryId);
    }

    // If all candidates were filtered out (e.g. all recently recommended), fall back to hot
    if (candidates.length === 0) {
      return { knowledges: await this.getHotRecommendations(page, pageSize, categoryId), strategy: 'hot' };
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
    const scored = candidates.map((k) => {
      const interestScore = this.calculateInterestScore(k, categoryScoreMap, tagScoreMap, config);
      const hotScore = this.calculateHotScore(k, config);
      const newScore = this.calculateNewScore(k, config);
      const randomScore = Math.random();

      const finalScore =
        interestScore * config.contentWeight +
        hotScore * config.hotWeight +
        newScore * config.newWeight +
        randomScore * config.randomWeight +
        (k.weight || 0) * config.weightMultiplier;

      return { knowledge: k, score: finalScore };
    });

    scored.sort((a, b) => b.score - a.score);

    // Light shuffle on top results to avoid deterministic top-1
    const shuffleRange = Math.min(scored.length, pageSize * config.shuffleRangeMultiplier);
    for (let i = 1; i < shuffleRange; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      if (j !== i) {
        [scored[i], scored[j]] = [scored[j], scored[i]];
      }
    }

    // Apply diversity constraint
    const diversified = this.applyDiversity(scored, config.diversityConsecutiveLimit);

    const offset = (page - 1) * pageSize;
    const pageResults = diversified.slice(offset, offset + pageSize).map((s) => s.knowledge);

    // If page exceeds candidate pool, fall back to hot for remaining pages
    if (pageResults.length === 0) {
      return { knowledges: await this.getHotRecommendations(page, pageSize, categoryId), strategy: 'hot' };
    }

    return { knowledges: pageResults, strategy: 'personalized' };
  }

  /**
   * Hot recommendation with random perturbation
   */
  private async getHotRecommendations(
    page: number,
    pageSize: number,
    categoryId?: string,
  ): Promise<Knowledge[]> {
    const config = await this.getAlgorithmConfig();

    const queryBuilder = this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.status = :status', { status: 1 })
      .andWhere('k.deleted_at IS NULL');

    if (categoryId) {
      queryBuilder.andWhere('k.category_id = :categoryId', { categoryId });
    }

    // Hot score formula with configurable signal weights and random perturbation
    // Note: INTERVAL and numeric literals are string-interpolated (not parameterized)
    // because PostgreSQL CASE WHEN needs consistent types for inference
    const newDays = Math.max(1, Math.floor(config.newContentDays));
    const midDays = Math.max(1, Math.floor(config.midContentDays));
    const hotFavW = config.hotFavoriteWeight;
    const hotAiW = config.hotAiExtendWeight;
    const hotWtMul = config.hotWeightMultiplier;
    const newBoost = config.newContentBoost;
    const oldPenalty = config.oldContentPenalty;
    const rw = config.randomWeight;

    queryBuilder.addSelect(
      `(k.view_count + k.favorite_count * ${hotFavW} + k.ai_extend_count * ${hotAiW} + k.weight * ${hotWtMul})
       * CASE
           WHEN k.created_at >= NOW() - INTERVAL '${newDays} days' THEN ${newBoost}
           WHEN k.created_at >= NOW() - INTERVAL '${midDays} days' THEN 1.0
           ELSE ${oldPenalty}
         END`,
      'hot_score',
    );
    queryBuilder.orderBy('hot_score', 'DESC');
    queryBuilder.addOrderBy('k.created_at', 'DESC');

    const results = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Apply random perturbation in-memory to avoid SQL random() breaking pagination stability
    if (results.length > 1 && rw > 0) {
      const shuffleCount = Math.max(1, Math.floor(results.length * rw));
      for (let i = shuffleCount; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
      }
    }

    return results;
  }

  /**
   * Calculate interest score for a knowledge card
   */
  private calculateInterestScore(
    knowledge: Knowledge,
    categoryScoreMap: Map<string, number>,
    tagScoreMap: Map<string, number>,
    config: AlgorithmConfig,
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
          score += tagScore * config.tagInterestWeight;
        }
      }
    }

    return score;
  }

  /**
   * Calculate hot score (normalized 0-1 range)
   */
  private calculateHotScore(knowledge: Knowledge, config: AlgorithmConfig): number {
    const raw =
      (knowledge.view_count || 0) +
      (knowledge.favorite_count || 0) * config.hotFavoriteWeight +
      (knowledge.ai_extend_count || 0) * config.hotAiExtendWeight +
      (knowledge.weight || 0) * config.hotWeightMultiplier;

    return 1 / (1 + Math.exp(-raw / config.hotScoreSigmoidDivisor));
  }

  /**
   * Calculate freshness score (0-1, newer = higher)
   */
  private calculateNewScore(knowledge: Knowledge, config: AlgorithmConfig): number {
    const now = Date.now();
    const created = new Date(knowledge.created_at).getTime();
    const daysSinceCreation = (now - created) / (24 * 60 * 60 * 1000);

    if (daysSinceCreation <= 1) return 1.0;
    if (daysSinceCreation <= config.newContentDays) return config.newContentBoost;
    if (daysSinceCreation <= config.midContentDays) return 0.5;
    return config.oldContentPenalty;
  }

  /**
   * Apply category diversity constraint to sorted results.
   * No N consecutive cards from the same category (N = consecutiveLimit).
   */
  private applyDiversity(
    scoredList: { knowledge: Knowledge; score: number }[],
    consecutiveLimit: number,
  ): { knowledge: Knowledge; score: number }[] {
    const result: typeof scoredList = [];
    const remaining = [...scoredList];

    while (remaining.length > 0) {
      let picked = false;
      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const lastN = result.slice(-(consecutiveLimit - 1));
        const sameCount = lastN.filter(
          r => r.knowledge.category_id === candidate.knowledge.category_id,
        ).length;
        if (sameCount < consecutiveLimit - 1) {
          result.push(candidate);
          remaining.splice(i, 1);
          picked = true;
          break;
        }
      }
      if (!picked && remaining.length > 0) {
        result.push(remaining.shift()!);
      }
    }
    return result;
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

    const config = await this.getAlgorithmConfig();

    // Dedup check
    if (config.behaviorDedupEnabled) {
      const cutoffDate = new Date(Date.now() - config.dedupDays * 24 * 60 * 60 * 1000);
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

    // Calculate interest score delta using configurable tiers
    let scoreDelta = 0;
    if (action === 'browse') {
      if (browse_duration !== undefined) {
        const tiers = config.browseDurationTiers;
        const scores = config.browseScoreTiers;
        for (let i = tiers.length - 1; i >= 0; i--) {
          if (browse_duration >= tiers[i]) {
            scoreDelta = scores[i] || 0;
            break;
          }
        }
      }
    } else if (action === 'favorite') {
      scoreDelta = config.favoriteScore;
    } else if (action === 'ai_extend') {
      scoreDelta = config.aiExtendScore;
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

  /**
   * 检测关机期间遗漏的定时任务并补执行
   */
  private async checkAndRecoverMissedTasks() {
    const RECOVERY_THRESHOLD_HOURS = 20;
    const now = Date.now();

    const tasks = [
      { key: 'last_interest_decay_at', jobName: 'interest-decay' },
      { key: 'last_quality_calc_at', jobName: 'quality-score-calc' },
    ];

    for (const task of tasks) {
      try {
        const config = await this.configService.findByKey(task.key);
        const lastRun = new Date(config.config_value).getTime();
        const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);

        if (hoursSinceLastRun > RECOVERY_THRESHOLD_HOURS) {
          this.logger.warn(`${task.jobName} missed (last run ${hoursSinceLastRun.toFixed(1)}h ago), triggering recovery...`);
          await this.recommendQueue.add(task.jobName, { recovery: true }, {
            removeOnComplete: true,
            removeOnFail: 100,
          });
        }
      } catch {
        // Config doesn't exist (first run), trigger task
        this.logger.log(`${task.key} not found, triggering initial run...`);
        await this.recommendQueue.add(task.jobName, { initial: true }, {
          removeOnComplete: true,
          removeOnFail: 100,
        });
      }
    }
  }
}
