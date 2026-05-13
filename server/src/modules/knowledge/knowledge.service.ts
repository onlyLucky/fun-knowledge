import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Knowledge } from './entities/knowledge.entity';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { KnowledgeStatus } from '../../common/enums/status.enum';

/**
 * 知识卡片客户端服务
 */
@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 获取知识卡片列表（客户端）
   */
  async findAll(query: QueryKnowledgeDto): Promise<PaginatedResponseDto<Knowledge>> {
    const { page = 1, pageSize = 10, title, category_id, tag, sortField, sortOrder } = query;

    const qb = this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.status = :status', { status: KnowledgeStatus.ONLINE })
      .andWhere('k.deleted_at IS NULL');

    if (title) {
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

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 获取知识卡片详情（客户端）
   */
  async findOne(id: string): Promise<Knowledge> {
    const knowledge = await this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.id = :id', { id })
      .andWhere('k.status = :status', { status: KnowledgeStatus.ONLINE })
      .andWhere('k.deleted_at IS NULL')
      .getOne();

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    // 增加浏览次数
    await this.knowledgeRepo.increment({ id }, 'view_count', 1);
    knowledge.view_count += 1;

    return knowledge;
  }
}
