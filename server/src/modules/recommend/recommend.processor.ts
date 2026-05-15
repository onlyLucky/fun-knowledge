import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Job } from 'bull';
import { UserInterest } from './entities/user-interest.entity';

/**
 * 推荐队列处理器 - 兴趣衰减定时任务
 */
@Processor('recommend')
export class RecommendProcessor {
  private readonly logger = new Logger(RecommendProcessor.name);

  constructor(
    @InjectRepository(UserInterest)
    private userInterestRepo: Repository<UserInterest>,
  ) {}

  /**
   * 兴趣衰减任务：每天执行
   * - 所有兴趣分 × 0.95
   * - 清理 score <= 0.01 的记录
   */
  @Process('interest-decay')
  async handleInterestDecay(job: Job) {
    this.logger.log('Starting interest decay...');

    // Decay all scores by 5%
    const decayResult = await this.userInterestRepo
      .createQueryBuilder()
      .update(UserInterest)
      .set({ score: () => '"score" * 0.95' })
      .where('score > :threshold', { threshold: 0.01 })
      .execute();

    this.logger.log(`Decayed ${decayResult.affected} interest records`);

    // Clean up near-zero scores
    const deleteResult = await this.userInterestRepo
      .createQueryBuilder()
      .delete()
      .from(UserInterest)
      .where('score <= :threshold', { threshold: 0.01 })
      .execute();

    this.logger.log(`Cleaned up ${deleteResult.affected} low-score records`);

    return { decayed: decayResult.affected, cleaned: deleteResult.affected };
  }
}
