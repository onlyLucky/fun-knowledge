import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { QueryKnowledgeDto } from '../knowledge/dto/query-knowledge.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { KnowledgeStatus } from '../../common/enums/status.enum';

/**
 * 收藏服务
 */
@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 添加收藏
   */
  async add(userId: string, knowledgeId: string): Promise<Favorite> {
    // 检查知识卡片是否存在且已上架
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledgeId, status: KnowledgeStatus.ONLINE },
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    // 检查是否已收藏
    const existing = await this.favoriteRepo.findOne({
      where: { user_id: userId, knowledge_id: knowledgeId },
    });

    if (existing) {
      throw new ConflictException('已收藏该知识卡片');
    }

    const favorite = this.favoriteRepo.create({
      user_id: userId,
      knowledge_id: knowledgeId,
    });

    const saved = await this.favoriteRepo.save(favorite);

    // 增加收藏次数
    await this.knowledgeRepo.increment({ id: knowledgeId }, 'favorite_count', 1);

    return saved;
  }

  /**
   * 取消收藏
   */
  async remove(userId: string, knowledgeId: string): Promise<void> {
    const favorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, knowledge_id: knowledgeId },
    });

    if (!favorite) {
      throw new NotFoundException('收藏记录不存在');
    }

    await this.favoriteRepo.remove(favorite);

    // 减少收藏次数（不低于0）
    await this.knowledgeRepo
      .createQueryBuilder()
      .update(Knowledge)
      .set({ favorite_count: () => 'GREATEST(favorite_count - 1, 0)' })
      .where('id = :id', { id: knowledgeId })
      .execute();
  }

  /**
   * 获取收藏列表
   */
  async findAll(userId: string, query: QueryKnowledgeDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, pageSize = 10, keyword, title } = query;

    const qb = this.favoriteRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.knowledge', 'k')
      .leftJoinAndSelect('k.category', 'c')
      .where('f.user_id = :userId', { userId })
      .andWhere('k.status = :status', { status: KnowledgeStatus.ONLINE })
      .andWhere('k.deleted_at IS NULL');

    if (keyword) {
      qb.andWhere('(k.title ILIKE :kw OR k.content ILIKE :kw)', { kw: `%${keyword}%` });
    }
    if (title) {
      qb.andWhere('k.title ILIKE :title', { title: `%${title}%` });
    }

    qb.orderBy('f.created_at', 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 格式化返回数据，展平为 ServerKnowledge 格式
    const formattedList = list.map((item) => ({
      id: item.knowledge.id,
      title: item.knowledge.title,
      content: item.knowledge.content,
      resource_url: item.knowledge.resource_url,
      resource_type: item.knowledge.resource_type,
      category_id: item.knowledge.category_id,
      category: item.knowledge.category ? { id: item.knowledge.category.id, name: item.knowledge.category.name } : null,
      tags: item.knowledge.tags,
      source: item.knowledge.source,
      status: item.knowledge.status,
      view_count: item.knowledge.view_count,
      favorite_count: item.knowledge.favorite_count,
      created_at: item.knowledge.created_at,
    }));

    return new PaginatedResponseDto(formattedList, total, page, pageSize);
  }
}
