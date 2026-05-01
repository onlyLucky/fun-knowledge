import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSortDto } from './dto/update-sort.dto';

/**
 * 类目服务
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  /**
   * 查询所有类目
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
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
   * 删除类目（软删除）
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.softRemove(category);
    this.logger.log(`类目删除成功: ${id}`);
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
