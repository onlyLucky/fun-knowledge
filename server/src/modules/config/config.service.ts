import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';

/** 客户端可公开的配置键 */
const PUBLIC_CONFIG_KEYS = [
  'ai_daily_limit',
  'check_in_rules',
  'knowledge_daily_limit',
  'feedback_reward_points',
  'app_version',
  'app_update_url',
  'force_update',
  'privacy_policy_url',
  'user_agreement_url',
];

/**
 * 系统配置服务
 */
@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  /**
   * 获取公开系统配置（客户端使用）
   */
  async getPublicConfigs(): Promise<Record<string, string>> {
    const configs = await this.configRepo.find({
      where: PUBLIC_CONFIG_KEYS.map((key) => ({ config_key: key })),
    });

    const result: Record<string, string> = {};
    for (const config of configs) {
      result[config.config_key] = config.config_value;
    }
    return result;
  }

  /**
   * 查询所有配置（管理端使用）
   */
  async findAll(): Promise<SystemConfig[]> {
    return this.configRepo.find({
      order: { group: 'ASC', config_key: 'ASC' },
    });
  }

  /**
   * 根据键查询配置
   */
  async findByKey(key: string): Promise<SystemConfig> {
    const config = await this.configRepo.findOne({
      where: { config_key: key },
    });
    if (!config) {
      throw new NotFoundException(`配置项 ${key} 不存在`);
    }
    return config;
  }

  /**
   * 更新配置
   */
  async update(key: string, value: string, description?: string): Promise<SystemConfig> {
    let config = await this.configRepo.findOne({
      where: { config_key: key },
    });

    if (!config) {
      throw new NotFoundException(`配置项 ${key} 不存在`);
    }

    config.config_value = value;
    if (description !== undefined) {
      config.description = description;
    }
    await this.configRepo.save(config);
    this.logger.log(`配置更新成功: ${key}`);
    return config;
  }
}
