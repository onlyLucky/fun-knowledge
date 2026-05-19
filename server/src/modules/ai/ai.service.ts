import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiExtendLog } from './entities/ai-extend-log.entity';
import { AiImageLog } from './entities/ai-image-log.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { User } from '../user/entities/user.entity';
import { SystemConfig } from '../config/entities/system-config.entity';
import { AiExtendType } from '../../common/enums/ai-extend-type.enum';

export interface AiUsageInfo {
  daily_limit: number;
  used_count: number;
  remaining: number;
  unlimited: boolean;
}

export interface AiResult<T> {
  limited: boolean;
  log?: T;
  usage: AiUsageInfo;
}

/**
 * AI 服务
 */
@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private midnightTimer: ReturnType<typeof setTimeout> | null = null;

  /** 系统配置键：每日 AI 使用上限 */
  private readonly AI_DAILY_LIMIT_KEY = 'ai_daily_usage_limit';
  /** 默认每日上限 */
  private readonly DEFAULT_DAILY_LIMIT = 10;

  constructor(
    @InjectRepository(AiExtendLog)
    private extendLogRepo: Repository<AiExtendLog>,
    @InjectRepository(AiImageLog)
    private imageLogRepo: Repository<AiImageLog>,
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(SystemConfig)
    private systemConfigRepo: Repository<SystemConfig>,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.scheduleMidnightReset();
  }

  /**
   * 定时任务：每天 00:00 重置所有用户的 AI 使用次数
   */
  private scheduleMidnightReset() {
    const scheduleNext = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 5, 0); // 00:00:05，留 5 秒缓冲
      const delay = next.getTime() - now.getTime();

      this.logger.log(`下次 AI 使用次数重置时间: ${next.toISOString()}（${Math.round(delay / 60000)} 分钟后）`);

      this.midnightTimer = setTimeout(async () => {
        try {
          await this.resetAllUsersDailyUsage();
        } catch (error) {
          this.logger.error('每日 AI 使用次数重置失败', error);
        }
        scheduleNext(); // 安排下一次
      }, delay);
    };

    scheduleNext();
  }

  /**
   * AI 延伸解读
   */
  async extendKnowledge(
    userId: string,
    knowledgeId: string,
  ): Promise<AiResult<AiExtendLog>> {
    // 验证知识卡片是否存在
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledgeId },
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    // 检查 AI 使用上限（含每日重置）
    const usage = await this.checkAndGetUsage(userId);
    if (!usage.unlimited && usage.remaining <= 0) {
      return { limited: true, usage };
    }

    let aiContent: string;
    let tokensUsed = 0;

    if (knowledge.ai_extend_type === AiExtendType.STATIC_DATA && knowledge.ai_extend_data) {
      aiContent = JSON.stringify(knowledge.ai_extend_data);
    } else {
      const aiResult = await this.callAiExtendApi(knowledge);
      aiContent = aiResult.content;
      tokensUsed = aiResult.tokensUsed;
    }

    const log = this.extendLogRepo.create({
      user_id: userId,
      knowledge_id: knowledgeId,
      ai_content: aiContent,
      tokens_used: tokensUsed,
    });

    const saved = await this.extendLogRepo.save(log);

    await this.userRepo.increment({ id: userId }, 'ai_usage_count', 1);
    await this.knowledgeRepo.increment({ id: knowledgeId }, 'ai_extend_count', 1);

    return {
      limited: false,
      log: saved,
      usage: {
        ...usage,
        used_count: usage.used_count + 1,
        remaining: usage.unlimited ? -1 : usage.remaining - 1,
      },
    };
  }

  /**
   * AI 图片识别
   */
  async recognizeImage(
    userId: string,
    imageUrl: string,
  ): Promise<AiResult<AiImageLog>> {
    const usage = await this.checkAndGetUsage(userId);
    if (!usage.unlimited && usage.remaining <= 0) {
      return { limited: true, usage };
    }

    const aiResult = await this.callAiVisionApi(imageUrl);

    const log = this.imageLogRepo.create({
      user_id: userId,
      image_url: imageUrl,
      result: aiResult.content,
      tokens_used: aiResult.tokensUsed,
    });

    const saved = await this.imageLogRepo.save(log);
    await this.userRepo.increment({ id: userId }, 'ai_usage_count', 1);

    return {
      limited: false,
      log: saved,
      usage: {
        ...usage,
        used_count: usage.used_count + 1,
        remaining: usage.unlimited ? -1 : usage.remaining - 1,
      },
    };
  }

  /**
   * 获取用户 AI 使用信息
   */
  async getAiUsageInfo(userId: string): Promise<AiUsageInfo> {
    return this.checkAndGetUsage(userId);
  }

  /**
   * 重置用户 AI 使用次数
   *
   * 管理员可设置每日限额，已使用次数重置为 0
   */
  async resetAiUsage(userId: string, dailyLimit?: number): Promise<AiUsageInfo> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const today = this.getTodayStr();

    if (dailyLimit !== undefined) {
      await this.userRepo.update(userId, {
        ai_usage_count: 0,
        ai_usage_count_reset_at: today,
      });
      await this.setAiDailyLimit(dailyLimit);
    } else {
      await this.userRepo.update(userId, {
        ai_usage_count: 0,
        ai_usage_count_reset_at: today,
      });
    }

    this.logger.log(`用户 ${userId} AI 使用次数已重置，限额: ${dailyLimit ?? '不变'}`);

    return this.checkAndGetUsage(userId);
  }

  /**
   * 批量重置所有用户的每日 AI 使用次数（供定时任务调用）
   */
  async resetAllUsersDailyUsage(): Promise<number> {
    const today = this.getTodayStr();
    const result = await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ ai_usage_count: 0, ai_usage_count_reset_at: today })
      .where('ai_usage_count_reset_at IS NULL OR ai_usage_count_reset_at != :today', { today })
      .execute();

    this.logger.log(`每日 AI 使用次数重置完成，影响 ${result.affected} 个用户`);
    return result.affected || 0;
  }

  /**
   * 检查 AI 使用上限并返回使用信息（含每日自动重置）
   */
  private async checkAndGetUsage(userId: string): Promise<AiUsageInfo> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'ai_usage_count', 'ai_usage_count_reset_at'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const today = this.getTodayStr();

    // 每日重置：如果上次重置日期不是今天，重置计数
    if (user.ai_usage_count_reset_at !== today) {
      await this.userRepo.update(userId, {
        ai_usage_count: 0,
        ai_usage_count_reset_at: today,
      });
      user.ai_usage_count = 0;
    }

    const limit = await this.getAiDailyLimit();
    const unlimited = limit < 0;

    return {
      daily_limit: limit,
      used_count: user.ai_usage_count,
      remaining: unlimited ? -1 : Math.max(0, limit - user.ai_usage_count),
      unlimited,
    };
  }

  /**
   * 从系统配置获取 AI 每日使用上限
   *
   * -1 或小于 0 表示不限制
   */
  private async getAiDailyLimit(): Promise<number> {
    const config = await this.systemConfigRepo.findOne({
      where: { config_key: this.AI_DAILY_LIMIT_KEY },
    });

    if (config) {
      const parsed = parseInt(config.config_value, 10);
      return isNaN(parsed) ? this.DEFAULT_DAILY_LIMIT : parsed;
    }

    return this.configService.get<number>(
      'AI_DAILY_USAGE_LIMIT',
      this.DEFAULT_DAILY_LIMIT,
    );
  }

  /**
   * 设置 AI 每日使用上限
   */
  private async setAiDailyLimit(limit: number): Promise<void> {
    const existing = await this.systemConfigRepo.findOne({
      where: { config_key: this.AI_DAILY_LIMIT_KEY },
    });

    if (existing) {
      existing.config_value = String(limit);
      await this.systemConfigRepo.save(existing);
    } else {
      const config = this.systemConfigRepo.create({
        config_key: this.AI_DAILY_LIMIT_KEY,
        config_value: String(limit),
        description: 'AI 每日使用上限，-1 表示不限制',
      });
      await this.systemConfigRepo.save(config);
    }
  }

  /**
   * 获取今日日期字符串 (YYYY-MM-DD)
   */
  private getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 调用 AI 延伸解读 API（占位实现）
   * TODO: 接入真实的 AI API
   */
  private async callAiExtendApi(
    knowledge: Knowledge,
  ): Promise<{ content: string; tokensUsed: number }> {
    const content = `【AI 延伸解读】\n\n关于「${knowledge.title}」的深入解读：\n\n${knowledge.content}\n\n（此内容由 AI 生成，仅供学习参考）`;
    return { content, tokensUsed: 0 };
  }

  /**
   * 调用 AI 视觉识别 API（占位实现）
   * TODO: 接入真实的 AI 视觉 API
   */
  private async callAiVisionApi(
    imageUrl: string,
  ): Promise<{ content: string; tokensUsed: number }> {
    const content = `【AI 图片识别结果】\n\n图片地址：${imageUrl}\n\n识别结果：这是一张图片，包含以下内容...（此内容由 AI 生成，仅供学习参考）`;
    return { content, tokensUsed: 0 };
  }
}
