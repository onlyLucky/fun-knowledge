import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Status } from '../../../common/enums/status.enum';

/**
 * JWT 载荷接口
 */
export interface JwtPayload {
  sub: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * 客户端 JWT 策略
 *
 * 从 Authorization: Bearer <token> 中提取并验证 JWT
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
    });
  }

  /**
   * 验证 JWT 载荷，返回用户信息挂载到 request.user
   */
  async validate(payload: JwtPayload): Promise<User> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('无效的令牌类型');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (user.status === Status.DISABLED) {
      throw new ForbiddenException('账号已被禁用');
    }

    return user;
  }
}
