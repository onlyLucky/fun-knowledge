import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Knowledge } from './entities/knowledge.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { SearchKeyword, SearchKeywordDocument } from './schemas/search-keyword.schema';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { KnowledgeStatus } from '../../common/enums/status.enum';

/**
 * 知识卡片客户端服务
 */
@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    @InjectModel(SearchKeyword.name)
    private searchKeywordModel: Model<SearchKeywordDocument>,
  ) {}

  /**
   * 获取知识卡片列表（客户端）
   */
  async findAll(query: QueryKnowledgeDto, userId?: string): Promise<PaginatedResponseDto<any>> {
    const { page = 1, pageSize = 10, title, keyword, category_id, tag, sortField, sortOrder } = query;

    const qb = this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.status = :status', { status: KnowledgeStatus.ONLINE })
      .andWhere('k.deleted_at IS NULL')
      .andWhere('(c.status = :categoryStatus OR c.id IS NULL)', { categoryStatus: 1 });

    if (keyword) {
      // 拆分为单字符模糊匹配，命中 80% 即可
      const chars = [...new Set(keyword.trim())].filter((c) => c !== ' ');
      if (chars.length > 0) {
        const params: Record<string, string | number> = {};
        const caseExprs = chars.map((char, i) => {
          const key = `kw${i}`;
          params[key] = `%${char}%`;
          return `(CASE WHEN k.title ILIKE :${key} OR k.content ILIKE :${key} THEN 1 ELSE 0 END)`;
        });
        const threshold = Math.max(1, Math.floor(chars.length * 0.8));
        params['kw_threshold'] = threshold;
        qb.andWhere(`(${caseExprs.join(' + ')}) >= :kw_threshold`, params);
      }
      // fire-and-forget 记录搜索关键词
      this.recordSearchKeyword(keyword).catch(() => {});
    } else if (title) {
      qb.andWhere('k.title LIKE :title', { title: `%${title}%` });
    }

    if (category_id) {
      qb.andWhere('k.category_id = :category_id', { category_id });
    }

    if (tag) {
      qb.andWhere('k.tags @> :tag', { tag: JSON.stringify([tag]) });
    }

    // 动态排序
    if (sortField && sortOrder) {
      const direction = sortOrder === 'ascend' ? 'ASC' : 'DESC';
      qb.orderBy(`k.${sortField}`, direction);
      if (sortField !== 'sort_weight') {
        qb.addOrderBy('k.sort_weight', 'DESC');
      }
    } else {
      qb.orderBy('k.sort_weight', 'DESC');
      qb.addOrderBy('k.created_at', 'DESC');
    }

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 单独查询收藏状态，避免 getRawAndEntities 索引错位
    if (userId && list.length > 0) {
      const ids = list.map((k) => k.id);
      const favRows = await this.favoriteRepo
        .createQueryBuilder('f')
        .select('f.knowledge_id')
        .where('f.user_id = :userId', { userId })
        .andWhere('f.knowledge_id IN (:...ids)', { ids })
        .getMany();
      const favSet = new Set(favRows.map((f) => f.knowledge_id));
      const result = list.map((k) => ({ ...k, is_favorited: favSet.has(k.id) }));
      return new PaginatedResponseDto(result, total, page, pageSize);
    }

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 记录搜索关键词（upsert）
   */
  async recordSearchKeyword(keyword: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const normalized = keyword.trim().toLowerCase();

    try {
      const existing = await this.searchKeywordModel.findOne({ keyword: normalized });

      if (existing) {
        const lastDate = existing.last_searched_at
          ? existing.last_searched_at.toISOString().split('T')[0]
          : '';

        if (lastDate !== today) {
          // 新的一天，today_count 转为 yesterday_count
          existing.yesterday_count = existing.today_count;
          existing.today_count = 1;
        } else {
          existing.today_count += 1;
        }
        existing.search_count += 1;
        existing.last_searched_at = new Date();
        await existing.save();
      } else {
        await this.searchKeywordModel.create({
          keyword: normalized,
          search_count: 1,
          today_count: 1,
          yesterday_count: 0,
          last_searched_at: new Date(),
        });
      }
    } catch (error) {
      this.logger.warn(`记录搜索关键词失败: ${error}`);
    }
  }

  /**
   * 获取热搜榜单
   */
  async getHotSearches(limit: number = 10) {
    const keywords = await this.searchKeywordModel
      .find()
      .sort({ today_count: -1, search_count: -1 })
      .limit(limit)
      .lean();

    if (keywords.length === 0) {
      return [];
    }

    // 为每个关键词匹配最相关的知识卡片
    const results = await Promise.all(
      keywords.map(async (kw, index) => {
        // 拆分关键词为单字符匹配
        const chars = [...new Set(kw.keyword.trim())].filter((c) => c !== ' ');
        let qb = this.knowledgeRepo
          .createQueryBuilder('k')
          .where('k.status = :status', { status: KnowledgeStatus.ONLINE })
          .andWhere('k.deleted_at IS NULL');

        if (chars.length > 0) {
          const params: Record<string, string | number> = {};
          const caseExprs = chars.map((char, i) => {
            const key = `hkw${index}_${i}`;
            params[key] = `%${char}%`;
            return `(CASE WHEN k.title ILIKE :${key} OR k.content ILIKE :${key} THEN 1 ELSE 0 END)`;
          });
          const threshold = Math.max(1, Math.floor(chars.length * 0.8));
          params[`hkt${index}`] = threshold;
          qb.andWhere(`(${caseExprs.join(' + ')}) >= :hkt${index}`, params);
        }

        const card = await qb
          .orderBy('k.view_count', 'DESC')
          .select(['k.id', 'k.title'])
          .getOne();

        const heat = Math.round(kw.today_count * 2 + kw.search_count * 0.5);
        let trend: 'up' | 'down' | 'same' = 'same';
        if (kw.today_count > kw.yesterday_count) trend = 'up';
        else if (kw.today_count < kw.yesterday_count) trend = 'down';

        return {
          rank: index + 1,
          keyword: kw.keyword,
          heat,
          trend,
          cardId: card?.id,
        };
      }),
    );

    return results;
  }

  /**
   * 获取知识卡片详情（客户端）
   */
  async findOne(id: string, userId?: string): Promise<any> {
    const knowledge = await this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.id = :id', { id })
      .andWhere('k.status = :status', { status: KnowledgeStatus.ONLINE })
      .andWhere('k.deleted_at IS NULL')
      .andWhere('(c.status = :categoryStatus OR c.id IS NULL)', { categoryStatus: 1 })
      .getOne();

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    // 增加浏览次数
    await this.knowledgeRepo.increment({ id }, 'view_count', 1);
    knowledge.view_count += 1;

    let isFavorited = false;
    if (userId) {
      const fav = await this.favoriteRepo.findOne({
        where: { user_id: userId, knowledge_id: id },
      });
      isFavorited = !!fav;
    }

    return { ...knowledge, is_favorited: isFavorited };
  }
}
