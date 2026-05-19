import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSortDto } from './dto/update-sort.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * 类目服务
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Knowledge)
    private readonly knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 查询类目列表（管理端，支持分页和搜索）
   */
  async findAll(options?: {
    page?: number;
    pageSize?: number;
    name?: string;
    status?: number;
  }): Promise<PaginatedResponseDto<any>> {
    const { page = 1, pageSize = 20, name, status } = options || {};

    const qb = this.categoryRepo
      .createQueryBuilder('c')
      .addSelect(
        `(SELECT COUNT(*) FROM t_knowledge k WHERE k.category_id = c.id AND k.deleted_at IS NULL)`,
        'knowledge_count',
      )
      .where('c.deleted_at IS NULL');

    if (name) {
      qb.andWhere('c.name LIKE :name', { name: `%${name}%` });
    }

    if (status !== undefined) {
      qb.andWhere('c.status = :status', { status });
    }

    qb.orderBy('c.sort_order', 'ASC').addOrderBy('c.created_at', 'DESC');

    const total = await qb.getCount();
    const { entities, raw } = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawAndEntities();

    const list = entities.map((entity, i) => ({
      ...entity,
      knowledge_count: parseInt(raw[i]?.knowledge_count ?? '0', 10),
    }));

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 查询所有启用类目（客户端）
   */
  async findEnabled(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { status: 1 },
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  /**
   * 创建类目
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create(dto);
    await this.categoryRepo.save(category);
    this.logger.log(`类目创建成功: ${category.name}`);
    return category;
  }

  /**
   * 更新类目
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    await this.categoryRepo.save(category);
    this.logger.log(`类目更新成功: ${id}`);
    return category;
  }

  /**
   * 切换类目状态（启用/停用）
   */
  async toggleStatus(id: string): Promise<Category> {
    const category = await this.findOne(id);
    const newStatus = category.status === 1 ? 0 : 1;
    category.status = newStatus;
    await this.categoryRepo.save(category);

    // 级联更新关联知识卡片状态
    const knowledgeStatus = newStatus === 1 ? 1 : 0;
    await this.knowledgeRepo.update({ category_id: id }, { status: knowledgeStatus });

    this.logger.log(`类目状态切换: ${id} → ${newStatus === 1 ? '启用' : '停用'}，关联卡片同步更新为${knowledgeStatus === 1 ? '上架' : '下架'}`);
    return category;
  }

  /**
   * 删除类目（软删除）
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.softRemove(category);
    this.logger.log(`类目删除成功: ${id}`);
  }

  /**
   * 批量删除类目（软删除）
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
   * 批量更新排序
   */
  async updateSort(dto: UpdateSortDto): Promise<void> {
    const { items } = dto;
    if (items.length === 0) return;

    const ids = items.map((item) => item.id);
    const categories = await this.categoryRepo.find({
      where: { id: In(ids) },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    for (const item of items) {
      const category = categoryMap.get(item.id);
      if (category) {
        category.sort_order = item.sort_order;
      }
    }

    await this.categoryRepo.save([...categoryMap.values()]);
    this.logger.log(`类目排序更新成功，共 ${items.length} 项`);
  }

  /**
   * 根据 ID 查询类目
   */
  private async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('类目不存在');
    }
    return category;
  }
}
