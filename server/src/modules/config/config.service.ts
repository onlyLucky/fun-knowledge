import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { CreateConfigDto } from './dto/create-config.dto';

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
  async update(
    key: string,
    value: string,
    description?: string,
    configType?: string,
    options?: string,
  ): Promise<SystemConfig> {
    const config = await this.configRepo.findOne({
      where: { config_key: key },
    });

    if (!config) {
      throw new NotFoundException(`配置项 ${key} 不存在`);
    }

    config.config_value = value;
    if (description !== undefined) {
      config.description = description;
    }
    if (configType !== undefined) {
      config.config_type = configType as any;
    }
    if (options !== undefined) {
      config.options = options;
    }
    await this.configRepo.save(config);
    this.logger.log(`配置更新成功: ${key}`);
    return config;
  }

  /**
   * 创建配置
   */
  async create(dto: CreateConfigDto): Promise<SystemConfig> {
    const existing = await this.configRepo.findOne({
      where: { config_key: dto.config_key },
    });
    if (existing) {
      throw new ConflictException(`配置项 ${dto.config_key} 已存在`);
    }

    const config = this.configRepo.create(dto);
    return this.configRepo.save(config);
  }

  /**
   * 删除配置
   */
  async remove(id: string): Promise<void> {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('配置项不存在');
    }
    await this.configRepo.remove(config);
  }

  /**
   * 批量删除配置
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

  /**
   * 获取所有配置分组
   */
  async findGroups(): Promise<string[]> {
    const result = await this.configRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.group', 'group')
      .where('c.group IS NOT NULL')
      .orderBy('c.group', 'ASC')
      .getRawMany();
    return result.map((r) => r.group).filter(Boolean);
  }
}
