import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { UserInterest } from './entities/user-interest.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { ConfigService } from '../config/config.service';

/**
 * 推荐队列处理器 - 兴趣衰减 + 质量分计算定时任务
 * 所有算法参数从 t_system_config 读取，支持运营后台灵活配置
 */
@Processor('recommend')
export class RecommendProcessor {
  private readonly logger = new Logger(RecommendProcessor.name);

  constructor(
    @InjectRepository(UserInterest)
    private userInterestRepo: Repository<UserInterest>,
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
    private configService: ConfigService,
  ) {}

  /**
   * 读取配置值（浮点数），失败时使用默认值
   */
  private async getConfigFloat(key: string, defaultVal: number): Promise<number> {
    try {
      const config = await this.configService.findByKey(key);
      return parseFloat(config.config_value) || defaultVal;
    } catch {
      return defaultVal;
    }
  }

  /**
   * 读取配置值（整数），失败时使用默认值
   */
  private async getConfigInt(key: string, defaultVal: number): Promise<number> {
    try {
      const config = await this.configService.findByKey(key);
      return parseInt(config.config_value, 10) || defaultVal;
    } catch {
      return defaultVal;
    }
  }

  /**
   * 记录任务执行时间到 t_system_config
   */
  private async recordTaskExecution(configKey: string) {
    try {
      await this.configService.findByKey(configKey);
      await this.configService.update(configKey, new Date().toISOString());
    } catch {
      // Config doesn't exist, create it
      try {
        await this.configService.create({
          config_key: configKey,
          config_value: new Date().toISOString(),
          description: '定时任务执行时间记录',
          group: 'recommend_internal',
          config_type: 'input' as any,
        });
      } catch {
        this.logger.warn(`Failed to record task execution time for ${configKey}`);
      }
    }
  }

  /**
   * 兴趣衰减任务：每天执行
   * - 所有兴趣分 × decay_rate（默认 0.95）
   * - 清理 score <= cleanup_threshold 的记录
   */
  @Process('interest-decay')
  async handleInterestDecay(job: Job) {
    this.logger.log('Starting interest decay...');

    const decayRate = await this.getConfigFloat('recommend_interest_decay_rate', 0.95);
    const cleanupThreshold = await this.getConfigFloat('recommend_interest_cleanup_threshold', 0.01);

    // Decay all scores by configured rate
    const decayResult = await this.userInterestRepo
      .createQueryBuilder()
      .update(UserInterest)
      .set({ score: () => `"score" * ${decayRate}` })
      .where('score > :threshold', { threshold: cleanupThreshold })
      .execute();

    this.logger.log(`Decayed ${decayResult.affected} interest records (rate=${decayRate})`);

    // Clean up near-zero scores
    const deleteResult = await this.userInterestRepo
      .createQueryBuilder()
      .delete()
      .from(UserInterest)
      .where('score <= :threshold', { threshold: cleanupThreshold })
      .execute();

    this.logger.log(`Cleaned up ${deleteResult.affected} low-score records (threshold=${cleanupThreshold})`);

    // Record execution time for reliability tracking
    await this.recordTaskExecution('last_interest_decay_at');

    return { decayed: decayResult.affected, cleaned: deleteResult.affected };
  }

  /**
   * 质量分计算任务：每天执行
   * quality_score = (favorite_rate) × favorite_weight + (ai_extend_rate) × ai_extend_weight
   * view_count < min_views 的内容不计算（保持 0，dashboard 显示为"待评估"）
   */
  @Process('quality-score-calc')
  async handleQualityScoreCalc(job: Job) {
    this.logger.log('Starting quality score calculation...');

    const minViews = await this.getConfigInt('recommend_quality_min_views', 100);
    const favWeight = await this.getConfigFloat('recommend_quality_favorite_rate_weight', 100);
    const aiWeight = await this.getConfigFloat('recommend_quality_ai_extend_rate_weight', 50);

    const result = await this.knowledgeRepo
      .createQueryBuilder()
      .update(Knowledge)
      .set({
        quality_score: () =>
          `CASE WHEN view_count >= ${minViews}
           THEN (favorite_count::float / view_count) * ${favWeight}
              + (ai_extend_count::float / view_count) * ${aiWeight}
           ELSE 0 END`,
      })
      .where('deleted_at IS NULL')
      .execute();

    this.logger.log(`Updated quality_score for ${result.affected} knowledge records (minViews=${minViews}, favWeight=${favWeight}, aiWeight=${aiWeight})`);

    // Record execution time for reliability tracking
    await this.recordTaskExecution('last_quality_calc_at');

    return { updated: result.affected };
  }
}
