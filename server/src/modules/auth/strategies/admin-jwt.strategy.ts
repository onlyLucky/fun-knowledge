import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin.entity';
import { Status } from '../../../common/enums/status.enum';

/**
 * Admin JWT 载荷接口
 */
export interface AdminJwtPayload {
  sub: string;
  role: number;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * 管理端 JWT 策略
 *
 * 从 Authorization: Bearer <token> 中提取并验证 JWT
 */
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
    });
  }

  /**
   * 验证 JWT 载荷，返回管理员信息挂载到 request.user
   */
  async validate(payload: AdminJwtPayload): Promise<Admin> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('无效的令牌类型');
    }

    const admin = await this.adminRepository.findOne({
      where: { id: payload.sub },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    if (admin.status === Status.DISABLED) {
      throw new UnauthorizedException('账号已被禁用');
    }

    return admin;
  }
}
