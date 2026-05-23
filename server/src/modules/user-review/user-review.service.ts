import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReview } from './entities/user-review.entity';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { UserReviewStatus } from '../../common/enums/status.enum';

export interface CreateReviewResult {
  pending: boolean;
  message?: string;
  review?: UserReview;
}

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
  async create(userId: string, dto: CreateUserReviewDto): Promise<CreateReviewResult> {
    // 检查是否至少修改了一个字段
    if (!dto.nickname && !dto.avatar && !dto.signature) {
      throw new BadRequestException('请至少修改一个字段');
    }

    // 按字段检查是否有同字段的待审核记录
    const pendingReviews = await this.reviewRepo.find({
      where: {
        user_id: userId,
        status: UserReviewStatus.PENDING,
      },
    });

    const hasPendingNickname = pendingReviews.some((r) => r.nickname);
    const hasPendingAvatar = pendingReviews.some((r) => r.avatar);
    const hasPendingSignature = pendingReviews.some((r) => r.signature);

    // 过滤掉被拦截的字段，只保留可提交的字段
    const submitDto: CreateUserReviewDto = {};
    if (dto.nickname && !hasPendingNickname) submitDto.nickname = dto.nickname;
    if (dto.avatar && !hasPendingAvatar) submitDto.avatar = dto.avatar;
    if (dto.signature && !hasPendingSignature) submitDto.signature = dto.signature;

    // 如果所有字段都被拦截
    if (!submitDto.nickname && !submitDto.avatar && !submitDto.signature) {
      const blockedFields: string[] = [];
      if (hasPendingNickname) blockedFields.push('昵称');
      if (hasPendingAvatar) blockedFields.push('头像');
      if (hasPendingSignature) blockedFields.push('签名');
      return {
        pending: true,
        message: `${blockedFields.join('、')}有审核中的申请，请等待审核完成后再提交`,
      };
    }

    const review = this.reviewRepo.create({
      user_id: userId,
      ...submitDto,
      status: UserReviewStatus.PENDING,
    });

    const result = await this.reviewRepo.save(review);
    this.logger.log(`用户 ${userId} 提交信息更新审核，字段: ${Object.keys(submitDto).join(', ')}`);
    return { pending: false, review: result };
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
