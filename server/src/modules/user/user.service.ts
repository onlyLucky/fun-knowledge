import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UserInterest } from '../recommend/entities/user-interest.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * 用户服务
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserInterest)
    private readonly userInterestRepo: Repository<UserInterest>,
  ) {}

  /**
   * 分页查询用户列表
   */
  async findAll(query: QueryUserDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, pageSize = 10, nickname, status } = query;

    const where: any = {};
    if (nickname) {
      where.nickname = Like(`%${nickname}%`);
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.userRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 查询用户详情（含画像数据）
   */
  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 查询用户兴趣画像
    const interests = await this.userInterestRepo.find({
      where: { user_id: id },
      relations: ['category'],
      order: { score: 'DESC' },
    });

    const categoryInterests = interests
      .filter((i) => i.type === 'category')
      .map((i) => ({
        category_id: i.category_id,
        category_name: i.category?.name ?? null,
        score: i.score,
        updated_at: i.updated_at,
      }));

    const tagInterests = interests
      .filter((i) => i.type === 'tag')
      .map((i) => ({
        tag_name: i.tag_name,
        score: i.score,
        updated_at: i.updated_at,
      }));

    return {
      ...user,
      profile: {
        category_interests: categoryInterests,
        tag_interests: tagInterests,
        total_interest_count: interests.length,
      },
    };
  }

  /**
   * 更新用户状态
   */
  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    user.status = dto.status;
    await this.userRepo.save(user);
    this.logger.log(`用户 ${id} 状态已更新为 ${dto.status}`);
    return user;
  }
}
