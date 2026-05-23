import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserReview } from './entities/user-review.entity';
import { User } from '../user/entities/user.entity';
import { QueryUserReviewDto } from './dto/query-user-review.dto';
import { ReviewUserReviewDto } from './dto/review-user-review.dto';
import { UserReviewStatus } from '../../common/enums/status.enum';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * 用户信息审核管理服务（管理端使用）
 */
@Injectable()
export class UserReviewAdminService {
  private readonly logger = new Logger(UserReviewAdminService.name);

  constructor(
    @InjectRepository(UserReview)
    private readonly reviewRepo: Repository<UserReview>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 查询审核列表（分页）
   */
  async findAll(query: QueryUserReviewDto): Promise<PaginatedResponseDto<UserReview>> {
    const { page = 1, pageSize = 10, status, keyword } = query;

    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .orderBy('review.created_at', 'DESC');

    if (status !== undefined && status !== null) {
      qb.andWhere('review.status = :status', { status });
    }

    if (keyword) {
      qb.andWhere('user.nickname ILIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 查询审核详情
   */
  async findOne(id: string): Promise<UserReview> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException('审核记录不存在');
    }

    return review;
  }

  /**
   * 审核（通过/驳回）
   */
  async review(id: string, dto: ReviewUserReviewDto, reviewerId: string): Promise<UserReview> {
    const review = await this.findOne(id);

    if (review.status !== UserReviewStatus.PENDING) {
      throw new NotFoundException('该审核记录已处理');
    }

    // 使用事务保证原子性
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 更新审核记录
      review.status = dto.status;
      review.review_remark = dto.review_remark || null;
      review.reviewed_by = reviewerId;
      review.review_time = new Date();

      await queryRunner.manager.save(UserReview, review);

      // 获取用户信息
      const user = await this.userRepo.findOne({
        where: { id: review.user_id },
      });

      if (user) {
        const reviewInfo = { ...(user.review_info || {}) };

        if (dto.status === UserReviewStatus.APPROVED) {
          // 审核通过：更新用户字段 + review_info 状态
          if (review.nickname) {
            user.nickname = review.nickname;
            reviewInfo.nickname = { status: 0 };
          }
          if (review.avatar) {
            user.avatar = review.avatar;
            reviewInfo.avatar = { status: 0 };
          }
          if (review.signature) {
            user.signature = review.signature;
            reviewInfo.signature = { status: 0 };
          }
          this.logger.log(`审核通过，已更新用户 ${review.user_id} 的信息`);
        } else if (dto.status === UserReviewStatus.REJECTED) {
          // 审核驳回：更新 review_info 状态和拒绝原因
          if (review.nickname) {
            reviewInfo.nickname = { status: 2, value: review.nickname, msg: dto.review_remark || '审核未通过' };
          }
          if (review.avatar) {
            reviewInfo.avatar = { status: 2, value: review.avatar, msg: dto.review_remark || '审核未通过' };
          }
          if (review.signature) {
            reviewInfo.signature = { status: 2, value: review.signature, msg: dto.review_remark || '审核未通过' };
          }
          this.logger.log(`审核驳回，用户 ${review.user_id}`);
        }

        user.review_info = reviewInfo;
        await queryRunner.manager.save(User, user);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`审核记录 ${id} 已处理，状态: ${dto.status === UserReviewStatus.APPROVED ? '通过' : '驳回'}`);

      return review;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 删除单条审核记录
   */
  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepo.softRemove(review);
  }

  /**
   * 批量删除审核记录
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
}
