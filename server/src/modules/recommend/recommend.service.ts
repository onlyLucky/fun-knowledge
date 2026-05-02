import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { UserInterest } from './entities/user-interest.entity';
import { RecommendLog, RecommendLogDocument } from './schemas/recommend-log.schema';
import { RecommendQueryDto } from './dto/recommend-query.dto';
import { RecommendFeedbackDto } from './dto/recommend-feedback.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class RecommendService {
  private readonly logger = new Logger(RecommendService.name);

  // 推荐策略权重
  private readonly defaultWeights = {
    content: 0.4,    // 内容相似度
    hot: 0.3,        // 热度
    new: 0.2,        // 新卡片
    random: 0.1,     // 随机
  };

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
  ) {}

  /**
   * 获取推荐卡片
   */
  async recommend(query: RecommendQueryDto, userId?: string) {
    const { page = 1, pageSize = 10, category_id, refresh = false } = query;

    let strategy = 'hot';
    let knowledges: Knowledge[] = [];

    if (userId) {
      // 已登录用户 - 个性化推荐
      strategy = 'personalized';
      knowledges = await this.getPersonalizedRecommendations(userId, page, pageSize, category_id, refresh);
    } else {
      // 未登录用户 - 热门推荐
      knowledges = await this.getHotRecommendations(page, pageSize, category_id);
    }

    // 记录推荐日志
    if (userId && knowledges.length > 0) {
      await this.logRecommendations(userId, knowledges, strategy);
    }

    return {
      list: knowledges.map((k) => ({
        ...k,
        category_name: k.category?.name,
      })),
      has_more: knowledges.length === pageSize,
      recommend_strategy: strategy,
    };
  }

  /**
   * 个性化推荐
   */
  private async getPersonalizedRecommendations(
    userId: string,
    page: number,
    pageSize: number,
    categoryId?: string,
    refresh?: boolean,
  ): Promise<Knowledge[]> {
    // 获取用户兴趣标签
    const interests = await this.userInterestRepo.find({
      where: { user_id: userId },
      order: { score: 'DESC' },
      take: 5,
    });

    // 获取用户已收藏的卡片 ID
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
      select: ['knowledge_id'],
    });
    const favoriteIds = favorites.map((f) => f.knowledge_id);

    // 构建查询
    const queryBuilder = this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.status = :status', { status: 1 })
      .andWhere('k.deleted_at IS NULL');

    // 排除已收藏卡片（除非刷新）
    if (!refresh && favoriteIds.length > 0) {
      queryBuilder.andWhere('k.id NOT IN (:...favoriteIds)', { favoriteIds });
    }

    // 类目筛选
    if (categoryId) {
      queryBuilder.andWhere('k.category_id = :categoryId', { categoryId });
    }

    // 如果有用户兴趣，优先推荐相关类目
    if (interests.length > 0) {
      const categoryIds = interests.map((i) => i.category_id);
      queryBuilder.orderBy(
        `CASE k.category_id ${categoryIds.map((id, index) => `WHEN '${id}' THEN ${index}`).join(' ')} ELSE ${categoryIds.length} END`,
      );
      queryBuilder.addOrderBy('k.sort_weight', 'DESC');
      queryBuilder.addOrderBy('k.created_at', 'DESC');
    } else {
      queryBuilder.orderBy('k.sort_weight', 'DESC');
      queryBuilder.addOrderBy('k.created_at', 'DESC');
    }

    return queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  }

  /**
   * 热门推荐
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

    // 热度排序：浏览数 + 收藏数*5
    queryBuilder.addSelect('k.view_count + k.favorite_count * 5', 'hot_score');
    queryBuilder.orderBy('hot_score', 'DESC');
    queryBuilder.addOrderBy('k.created_at', 'DESC');

    return queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  }

  /**
   * 记录推荐日志
   */
  private async logRecommendations(userId: string, knowledges: Knowledge[], strategy: string) {
    const logs = knowledges.map((k, index) => ({
      user_id: userId,
      knowledge_id: k.id,
      strategy,
      position: index + 1,
    }));

    await this.recommendLogModel.insertMany(logs);
  }

  /**
   * 推荐反馈
   */
  async feedback(dto: RecommendFeedbackDto, userId: string) {
    const { knowledge_id, is_liked } = dto;

    // 更新推荐日志
    await this.recommendLogModel.updateOne(
      { user_id: userId, knowledge_id },
      { is_clicked: 1, clicked_at: new Date() },
    );

    // 更新用户兴趣标签
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledge_id },
    });

    if (knowledge) {
      await this.updateUserInterest(userId, knowledge.category_id, is_liked ? 2.0 : -1.0);
    }

    return { success: true };
  }

  /**
   * 更新用户兴趣分数
   */
  async updateUserInterest(userId: string, categoryId: string, scoreDelta: number) {
    let interest = await this.userInterestRepo.findOne({
      where: { user_id: userId, category_id: categoryId },
    });

    if (interest) {
      interest.score = Math.max(0, interest.score + scoreDelta);
      await this.userInterestRepo.save(interest);
    } else {
      interest = this.userInterestRepo.create({
        user_id: userId,
        category_id: categoryId,
        score: Math.max(0, scoreDelta),
      });
      await this.userInterestRepo.save(interest);
    }
  }
}
