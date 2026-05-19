import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrowseHistory } from './entities/browse-history.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { QueryBrowseHistoryDto } from './dto/query-browse-history.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { KnowledgeStatus } from '../../common/enums/status.enum';

/**
 * 浏览历史服务
 */
@Injectable()
export class BrowseHistoryService {
  constructor(
    @InjectRepository(BrowseHistory)
    private browseHistoryRepo: Repository<BrowseHistory>,
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 添加或更新浏览历史
   */
  async addOrUpdate(userId: string, knowledgeId: string): Promise<BrowseHistory> {
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledgeId, status: KnowledgeStatus.ONLINE },
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    const existing = await this.browseHistoryRepo.findOne({
      where: { user_id: userId, knowledge_id: knowledgeId },
    });

    if (existing) {
      // 更新浏览时间
      existing.viewed_at = new Date();
      return this.browseHistoryRepo.save(existing);
    }

    const record = this.browseHistoryRepo.create({
      user_id: userId,
      knowledge_id: knowledgeId,
    });

    return this.browseHistoryRepo.save(record);
  }

  /**
   * 获取浏览历史列表
   */
  async findAll(userId: string, query: QueryBrowseHistoryDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, pageSize = 10, keyword } = query;

    const qb = this.browseHistoryRepo
      .createQueryBuilder('bh')
      .leftJoinAndSelect('bh.knowledge', 'k')
      .leftJoinAndSelect('k.category', 'c')
      .where('bh.user_id = :userId', { userId })
      .andWhere('k.status = :status', { status: KnowledgeStatus.ONLINE })
      .andWhere('k.deleted_at IS NULL');

    if (keyword) {
      qb.andWhere('(k.title ILIKE :kw OR k.content ILIKE :kw)', { kw: `%${keyword}%` });
    }

    qb.orderBy('bh.viewed_at', 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const formattedList = list.map((item) => ({
      id: item.id,
      knowledge_id: item.knowledge.id,
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
      viewed_at: item.viewed_at,
      created_at: item.knowledge.created_at,
    }));

    return new PaginatedResponseDto(formattedList, total, page, pageSize);
  }

  /**
   * 删除单条浏览历史
   */
  async remove(userId: string, id: string): Promise<void> {
    const record = await this.browseHistoryRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!record) {
      throw new NotFoundException('浏览记录不存在');
    }

    await this.browseHistoryRepo.remove(record);
  }

  /**
   * 批量删除浏览历史
   */
  async batchRemove(userId: string, ids: string[]): Promise<{ deleted: number }> {
    const result = await this.browseHistoryRepo
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids) AND user_id = :userId', { ids, userId })
      .execute();

    return { deleted: result.affected || 0 };
  }
}
