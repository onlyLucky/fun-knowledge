import {
  Injectable,
  ForbiddenException,
  NotFoundException,
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

/**
 * AI 服务
 */
@Injectable()
export class AiService {
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

  /**
   * AI 延伸解读
   */
  async extendKnowledge(
    userId: string,
    knowledgeId: string,
  ): Promise<AiExtendLog> {
    // 验证知识卡片是否存在
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: knowledgeId },
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    // 检查 AI 使用上限
    await this.checkAiUsageLimit(userId);

    let aiContent: string;
    let tokensUsed = 0;

    if (knowledge.ai_extend_type === AiExtendType.STATIC_DATA && knowledge.ai_extend_data) {
      // 静态数据模式：直接返回预设内容
      aiContent = JSON.stringify(knowledge.ai_extend_data);
    } else {
      // AI大模型模式：调用AI API（占位实现）
      const aiResult = await this.callAiExtendApi(knowledge);
      aiContent = aiResult.content;
      tokensUsed = aiResult.tokensUsed;
    }

    // 保存延伸解读日志
    const log = this.extendLogRepo.create({
      user_id: userId,
      knowledge_id: knowledgeId,
      ai_content: aiContent,
      tokens_used: tokensUsed,
    });

    const saved = await this.extendLogRepo.save(log);

    // 增加用户 AI 使用次数
    await this.userRepo.increment({ id: userId }, 'ai_usage_count', 1);

    // 增加知识卡片 AI 延伸解读次数
    await this.knowledgeRepo.increment({ id: knowledgeId }, 'ai_extend_count', 1);

    return saved;
  }

  /**
   * AI 图片识别
   */
  async recognizeImage(
    userId: string,
    imageUrl: string,
  ): Promise<AiImageLog> {
    // 检查 AI 使用上限
    await this.checkAiUsageLimit(userId);

    // 调用 AI 视觉 API（占位实现）
    const aiResult = await this.callAiVisionApi(imageUrl);

    // 保存图片识别日志
    const log = this.imageLogRepo.create({
      user_id: userId,
      image_url: imageUrl,
      result: aiResult.content,
      tokens_used: aiResult.tokensUsed,
    });

    const saved = await this.imageLogRepo.save(log);

    // 增加用户 AI 使用次数
    await this.userRepo.increment({ id: userId }, 'ai_usage_count', 1);

    return saved;
  }

  /**
   * 检查 AI 使用上限
   */
  private async checkAiUsageLimit(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['ai_usage_count'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const limit = await this.getAiDailyLimit();

    if (user.ai_usage_count >= limit) {
      throw new ForbiddenException(
        `AI 使用次数已达今日上限（${limit} 次），请明天再试`,
      );
    }
  }

  /**
   * 从系统配置获取 AI 每日使用上限
   */
  private async getAiDailyLimit(): Promise<number> {
    const config = await this.systemConfigRepo.findOne({
      where: { config_key: this.AI_DAILY_LIMIT_KEY },
    });

    if (config) {
      const parsed = parseInt(config.config_value, 10);
      return isNaN(parsed) ? this.DEFAULT_DAILY_LIMIT : parsed;
    }

    // 回退到环境变量或默认值
    return this.configService.get<number>(
      'AI_DAILY_USAGE_LIMIT',
      this.DEFAULT_DAILY_LIMIT,
    );
  }

  /**
   * 调用 AI 延伸解读 API（占位实现）
   * TODO: 接入真实的 AI API
   */
  private async callAiExtendApi(
    knowledge: Knowledge,
  ): Promise<{ content: string; tokensUsed: number }> {
    // 占位实现 - 后续接入 OpenAI / Claude 等 AI 服务
    const content = `【AI 延伸解读】\n\n关于「${knowledge.title}」的深入解读：\n\n${knowledge.content}\n\n（此内容由 AI 生成，仅供学习参考）`;

    return {
      content,
      tokensUsed: 0,
    };
  }

  /**
   * 调用 AI 视觉识别 API（占位实现）
   * TODO: 接入真实的 AI 视觉 API
   */
  private async callAiVisionApi(
    imageUrl: string,
  ): Promise<{ content: string; tokensUsed: number }> {
    // 占位实现 - 后续接入 GPT-4 Vision / Claude Vision 等 AI 服务
    const content = `【AI 图片识别结果】\n\n图片地址：${imageUrl}\n\n识别结果：这是一张图片，包含以下内容...（此内容由 AI 生成，仅供学习参考）`;

    return {
      content,
      tokensUsed: 0,
    };
  }
}
