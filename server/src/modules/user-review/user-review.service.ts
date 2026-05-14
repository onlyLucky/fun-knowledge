import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReview } from './entities/user-review.entity';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { UserReviewStatus } from '../../common/enums/status.enum';

/**
 * 用户信息审核服务（客户端使用）
 */
@Injectable()
export class UserReviewService {
  private readonly logger = new Logger(UserReviewService.name);

  constructor(
    @InjectRepository(UserReview)
    private readonly reviewRepo: Repository<UserReview>,
  ) {}

  /**
   * 提交用户信息更新审核
   */
  async create(userId: string, dto: CreateUserReviewDto): Promise<UserReview> {
    // 检查是否有待审核的记录
    const pendingReview = await this.reviewRepo.findOne({
      where: {
        user_id: userId,
        status: UserReviewStatus.PENDING,
      },
    });

    if (pendingReview) {
      throw new BadRequestException('您有一条待审核的申请，请等待审核完成后再提交');
    }

    // 检查是否至少修改了一个字段
    if (!dto.nickname && !dto.avatar && !dto.signature) {
      throw new BadRequestException('请至少修改一个字段');
    }

    const review = this.reviewRepo.create({
      user_id: userId,
      ...dto,
      status: UserReviewStatus.PENDING,
    });

    const result = await this.reviewRepo.save(review);
    this.logger.log(`用户 ${userId} 提交信息更新审核`);
    return result;
  }

  /**
   * 获取用户的审核记录列表
   */
  async findMyReviews(userId: string): Promise<UserReview[]> {
    return this.reviewRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
