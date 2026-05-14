import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Knowledge } from './entities/knowledge.entity';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { KnowledgeStatus } from '../../common/enums/status.enum';

/**
 * 知识卡片管理端服务
 */
@Injectable()
export class KnowledgeAdminService {
  constructor(
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 获取知识卡片列表（管理端）
   */
  async findAll(query: QueryKnowledgeDto): Promise<PaginatedResponseDto<Knowledge>> {
    const { page = 1, pageSize = 10, title, category_id, status, sortField, sortOrder } = query;

    const qb = this.knowledgeRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.category', 'c')
      .where('k.deleted_at IS NULL');

    if (title) {
      qb.andWhere('k.title LIKE :title', { title: `%${title}%` });
    }

    if (category_id) {
      qb.andWhere('k.category_id = :category_id', { category_id });
    }

    if (status !== undefined) {
      qb.andWhere('k.status = :status', { status });
    }

    // 动态排序：前端指定时使用前端排序，否则默认按 sort_weight + created_at 降序
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
   * 创建知识卡片
   */
  async create(dto: CreateKnowledgeDto, adminId: string): Promise<Knowledge> {
    const existing = await this.knowledgeRepo.findOne({
      where: { title: dto.title, category_id: dto.category_id },
    });
    if (existing) {
      throw new ConflictException('该类目下已存在相同标题的知识卡片');
    }

    const knowledge = this.knowledgeRepo.create({
      ...dto,
      created_by: adminId,
      updated_by: adminId,
    });

    return this.knowledgeRepo.save(knowledge);
  }

  /**
   * 更新知识卡片
   */
  async update(id: string, dto: UpdateKnowledgeDto, adminId: string): Promise<Knowledge> {
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    Object.assign(knowledge, dto, { updated_by: adminId });
    return this.knowledgeRepo.save(knowledge);
  }

  /**
   * 删除知识卡片（软删除）
   */
  async remove(id: string): Promise<void> {
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    if (knowledge.deleted_at) {
      throw new NotFoundException('知识卡片不存在');
    }

    await this.knowledgeRepo.softDelete(id);
  }

  /**
   * 批量删除知识卡片（软删除）
   */
  async removeMany(ids: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.remove(id);
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 切换知识卡片状态（上架/下架）
   */
  async toggleStatus(id: string, adminId: string): Promise<Knowledge> {
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id },
      relations: ['category'],
      withDeleted: true,
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    if (knowledge.category && knowledge.category.status === 0) {
      throw new BadRequestException('当前类目停用中，不可切换状态');
    }

    knowledge.status =
      knowledge.status === KnowledgeStatus.ONLINE
        ? KnowledgeStatus.OFFLINE
        : KnowledgeStatus.ONLINE;
    knowledge.updated_by = adminId;

    return this.knowledgeRepo.save(knowledge);
  }
}
