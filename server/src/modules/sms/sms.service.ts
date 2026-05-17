import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class SmsService {
  private readonly redis: Redis;
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD') || undefined,
    });
  }

  async sendCode(phone: string): Promise<void> {
    const lockKey = `sms:lock:${phone}`;
    if (await this.redis.exists(lockKey)) {
      throw new BadRequestException('验证码发送过于频繁，请稍后再试');
    }
    const code = Math.random().toString().slice(2, 8).padStart(6, '0');
    await this.redis.set(`sms:code:${phone}`, code, 'EX', 300);
    await this.redis.set(lockKey, '1', 'EX', 60);
    // TODO: 接入真实 SMS 服务商发送短信
    this.logger.log(`[DEV] 验证码 ${phone}: ${code}`);
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const key = `sms:code:${phone}`;
    const stored = await this.redis.get(key);
    if (!stored) return false;
    if (stored !== code) return false;
    await this.redis.del(key);
    return true;
  }
}
