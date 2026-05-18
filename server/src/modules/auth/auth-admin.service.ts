import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Admin } from '../admin/entities/admin.entity';
import { Status } from '../../common/enums/status.enum';
import { TokenResponse } from './auth.service';

/**
 * 管理端认证服务
 */
@Injectable()
export class AuthAdminService {
  private readonly logger = new Logger(AuthAdminService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 管理员登录
   *
   * 验证用户名密码，更新最后登录信息，返回 JWT 令牌
   */
  async login(
    username: string,
    password: string,
    ip: string,
  ): Promise<{ admin: Omit<Admin, 'password'>; tokens: TokenResponse }> {
    if (!username || !password) {
      throw new BadRequestException('用户名和密码不能为空');
    }

    // 查找管理员（包含密码字段用于验证）
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where('admin.username = :username', { username })
      .getOne();

    if (!admin) {
      throw new BadRequestException('用户名或密码错误');
    }

    if (admin.status === Status.DISABLED) {
      throw new ForbiddenException('账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      this.logger.warn(`管理员登录失败：${username}（密码错误，IP: ${ip}）`);
      throw new BadRequestException('用户名或密码错误');
    }

    // 更新最后登录信息
    admin.last_login_time = new Date();
    admin.last_login_ip = ip;
    await this.adminRepository.save(admin);

    this.logger.log(`管理员登录成功：${admin.username}（ID: ${admin.id}，IP: ${ip}）`);

    // 生成令牌
    const tokens = await this.generateTokens(admin.id, admin.role);

    // 返回时排除密码字段
    const { password: _, ...adminWithoutPassword } = admin;

    return { admin: adminWithoutPassword as Omit<Admin, 'password'>, tokens };
  }

  /**
   * 管理员登出
   *
   * 目前为无状态 JWT，登出仅做日志记录
   * 若需 token 黑名单可在此处添加 Redis 存储
   */
  async logout(adminId: string): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }

    this.logger.log(`管理员登出：${admin.username}（ID: ${admin.id}）`);

    // TODO: 如需 token 黑名单，可在此处将当前 token 加入 Redis 黑名单
    // await this.redisService.set(`token:blacklist:${token}`, '1', 'EX', tokenTTL);
  }

  /**
   * 生成管理员 JWT 令牌对
   */
  async generateTokens(adminId: string, role: number): Promise<TokenResponse> {
    const accessPayload = { sub: adminId, role, type: 'access' as const };
    const refreshPayload = { sub: adminId, role, type: 'refresh' as const };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret-change-in-production'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresIn = this.parseExpiresIn(
      this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
    );

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * 刷新管理员令牌
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret-change-in-production'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      const admin = await this.adminRepository.findOne({ where: { id: payload.sub } });
      if (!admin || admin.status === Status.DISABLED) {
        throw new UnauthorizedException('管理员不存在或已被禁用');
      }

      return this.generateTokens(payload.sub, payload.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('刷新令牌已过期或无效');
    }
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 7200;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 7200;
    }
  }
}
