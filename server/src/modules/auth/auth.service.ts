import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

import { User } from '../user/entities/user.entity';
import { LoginPlatform, Status } from '../../common/enums/status.enum';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BindPlatformDto } from './dto/bind-platform.dto';

/**
 * 令牌响应接口
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 微信 code2session 响应接口
 */
interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 客户端认证服务
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 统一登录入口
   */
  async login(loginDto: LoginDto): Promise<{ user: User; tokens: TokenResponse }> {
    let user: User;

    switch (loginDto.platform) {
      case LoginPlatform.WECHAT:
        user = await this.loginByWeChat(loginDto.code!, loginDto.nickname, loginDto.avatar);
        break;
      case LoginPlatform.QQ:
      case LoginPlatform.DOUYIN:
      case LoginPlatform.APPLE:
        user = await this.loginByOAuth(loginDto.platform, loginDto.code!, loginDto.nickname, loginDto.avatar);
        break;
      case LoginPlatform.PHONE:
        user = await this.loginByPhone(loginDto.phone!, loginDto.smsCode!);
        break;
      case LoginPlatform.EMAIL:
        user = await this.loginByEmail(loginDto.email!, loginDto.password!);
        break;
      default:
        throw new BadRequestException('不支持的登录平台');
    }

    const tokens = await this.generateTokens(user.id);
    return { user, tokens };
  }

  /**
   * 微信小程序登录
   *
   * 调用微信 code2session API 获取 openid，查找或创建用户
   */
  async loginByWeChat(code: string, nickname?: string, avatar?: string): Promise<User> {
    if (!code) {
      throw new BadRequestException('微信授权码不能为空');
    }

    const appid = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    if (!appid || !secret) {
      this.logger.error('微信小程序配置缺失：WECHAT_APPID 或 WECHAT_SECRET');
      throw new BadRequestException('微信登录服务暂不可用');
    }

    // 调用微信 code2session 接口
    let sessionData: WechatSessionResponse;
    try {
      const { data } = await axios.get<WechatSessionResponse>(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          params: {
            appid,
            secret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      );
      sessionData = data;
    } catch (error) {
      this.logger.error('调用微信 code2session 接口失败', error);
      throw new BadRequestException('微信登录服务异常，请稍后重试');
    }

    if (sessionData.errcode) {
      this.logger.warn(`微信 code2session 错误: ${sessionData.errcode} - ${sessionData.errmsg}`);
      throw new BadRequestException(`微信登录失败：${sessionData.errmsg}`);
    }

    const { openid, unionid } = sessionData;

    // 查找已有用户
    let user = await this.userRepository.findOne({ where: { openid } });

    if (user) {
      // 已有用户，检查状态
      if (user.status === Status.DISABLED) {
        throw new UnauthorizedException('账号已被禁用');
      }
      return user;
    }

    // 创建新用户
    user = this.userRepository.create({
      openid,
      nickname: nickname || `用户${openid.slice(-6)}`,
      avatar: avatar || '',
      user_auths: {
        wechat: { openid, unionid },
      },
    });

    user = await this.userRepository.save(user);
    this.logger.log(`新用户注册：${user.id}（微信）`);
    return user;
  }

  /**
   * OAuth 平台登录（QQ、抖音、Apple）
   *
   * 通用 OAuth 登录流程，根据平台调用对应的授权验证接口
   */
  async loginByOAuth(
    platform: LoginPlatform,
    code: string,
    nickname?: string,
    avatar?: string,
  ): Promise<User> {
    if (!code) {
      throw new BadRequestException('授权码不能为空');
    }

    // TODO: 调用各平台 OAuth 接口验证 code 并获取用户标识
    // 此处为框架代码，需要根据各平台文档实现具体的 OAuth 流程
    const platformUserId = `mock_${platform}_${code}`;

    // 查找已绑定该平台的用户
    let user = await this.findUserByPlatform(platform, platformUserId);

    if (user) {
      if (user.status === Status.DISABLED) {
        throw new UnauthorizedException('账号已被禁用');
      }
      return user;
    }

    // 创建新用户
    const userAuths: Record<string, any> = {};
    userAuths[platform] = { userId: platformUserId };

    user = this.userRepository.create({
      nickname: nickname || `用户${platformUserId.slice(-6)}`,
      avatar: avatar || '',
      user_auths: userAuths,
    });

    user = await this.userRepository.save(user);
    this.logger.log(`新用户注册：${user.id}（${platform}）`);
    return user;
  }

  /**
   * 手机号 + 短信验证码登录
   */
  async loginByPhone(phone: string, smsCode: string): Promise<User> {
    if (!phone) {
      throw new BadRequestException('手机号不能为空');
    }
    if (!smsCode) {
      throw new BadRequestException('验证码不能为空');
    }

    // TODO: 验证短信验证码（从 Redis 中校验）
    // const isValid = await this.smsService.verifyCode(phone, smsCode);
    // if (!isValid) throw new BadRequestException('验证码错误或已过期');

    // 查找已有用户
    let user = await this.userRepository.findOne({ where: { phone } });

    if (user) {
      if (user.status === Status.DISABLED) {
        throw new UnauthorizedException('账号已被禁用');
      }
      return user;
    }

    // 创建新用户
    user = this.userRepository.create({
      phone,
      nickname: `用户${phone.slice(-4)}`,
      user_auths: {
        phone: { phone },
      },
    });

    user = await this.userRepository.save(user);
    this.logger.log(`新用户注册：${user.id}（手机号）`);
    return user;
  }

  /**
   * 邮箱 + 密码登录
   */
  async loginByEmail(email: string, password: string): Promise<User> {
    if (!email) {
      throw new BadRequestException('邮箱不能为空');
    }
    if (!password) {
      throw new BadRequestException('密码不能为空');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    if (user.status === Status.DISABLED) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 验证密码（存储在 user_auths.email.passwordHash 中）
    const passwordHash = user.user_auths?.email?.passwordHash;
    if (!passwordHash) {
      throw new UnauthorizedException('该邮箱未设置密码，请使用其他方式登录');
    }

    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    return user;
  }

  /**
   * 获取用户资料
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname;
    }
    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar;
    }

    return this.userRepository.save(user);
  }

  /**
   * 绑定平台账号
   */
  async bindPlatform(userId: string, dto: BindPlatformDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.user_auths) {
      user.user_auths = {};
    }

    // 检查是否已绑定该平台
    if (user.user_auths[dto.platform]) {
      throw new ConflictException(`已绑定${this.getPlatformName(dto.platform)}账号`);
    }

    // 根据平台获取用户标识并验证
    let platformData: Record<string, any>;

    switch (dto.platform) {
      case LoginPlatform.WECHAT: {
        const sessionData = await this.getWechatSession(dto.code!);
        platformData = { openid: sessionData.openid, unionid: sessionData.unionid };
        // 检查该 openid 是否已被其他用户绑定
        const existingUser = await this.userRepository.findOne({
          where: { openid: sessionData.openid },
        });
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('该微信账号已被其他用户绑定');
        }
        user.openid = sessionData.openid;
        break;
      }
      case LoginPlatform.PHONE: {
        // TODO: 验证短信验证码
        platformData = { phone: dto.phone };
        const existingPhoneUser = await this.userRepository.findOne({
          where: { phone: dto.phone },
        });
        if (existingPhoneUser && existingPhoneUser.id !== userId) {
          throw new ConflictException('该手机号已被其他用户绑定');
        }
        user.phone = dto.phone!;
        break;
      }
      case LoginPlatform.EMAIL: {
        if (!dto.password || dto.password.length < 6) {
          throw new BadRequestException('密码最少 6 个字符');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        platformData = { email: dto.email, passwordHash };
        const existingEmailUser = await this.userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingEmailUser && existingEmailUser.id !== userId) {
          throw new ConflictException('该邮箱已被其他用户绑定');
        }
        user.email = dto.email!;
        break;
      }
      case LoginPlatform.QQ:
      case LoginPlatform.DOUYIN:
      case LoginPlatform.APPLE: {
        // TODO: 调用各平台 OAuth 接口验证
        const platformUserId = `mock_${dto.platform}_${dto.code}`;
        const existingOAuthUser = await this.findUserByPlatform(dto.platform, platformUserId);
        if (existingOAuthUser && existingOAuthUser.id !== userId) {
          throw new ConflictException(`该${this.getPlatformName(dto.platform)}账号已被其他用户绑定`);
        }
        platformData = { userId: platformUserId };
        break;
      }
      default:
        throw new BadRequestException('不支持的绑定平台');
    }

    user.user_auths[dto.platform] = platformData;
    return this.userRepository.save(user);
  }

  /**
   * 解绑平台账号
   */
  async unbindPlatform(userId: string, platform: LoginPlatform): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.user_auths || !user.user_auths[platform]) {
      throw new BadRequestException(`未绑定${this.getPlatformName(platform)}账号`);
    }

    // 检查是否至少保留一个登录方式
    const boundPlatforms = Object.keys(user.user_auths).filter(
      (key) => user.user_auths[key] && key !== platform,
    );

    if (boundPlatforms.length === 0) {
      throw new BadRequestException('至少需要保留一种登录方式');
    }

    // 清除平台数据
    delete user.user_auths[platform];

    // 清除对应的主字段
    switch (platform) {
      case LoginPlatform.WECHAT:
        user.openid = undefined as any;
        break;
      case LoginPlatform.PHONE:
        user.phone = undefined as any;
        break;
      case LoginPlatform.EMAIL:
        user.email = undefined as any;
        break;
    }

    return this.userRepository.save(user);
  }

  /**
   * 生成 JWT 令牌对（Access Token + Refresh Token）
   */
  async generateTokens(userId: string): Promise<TokenResponse> {
    const accessPayload = { sub: userId, type: 'access' as const };
    const refreshPayload = { sub: userId, type: 'refresh' as const };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret-change-in-production'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // 计算过期时间（秒）
    const expiresIn = this.parseExpiresIn(
      this.configService.get<string>('JWT_EXPIRES_IN', '2h'),
    );

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret-change-in-production'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || user.status === Status.DISABLED) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      return this.generateTokens(payload.sub);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('刷新令牌已过期或无效');
    }
  }

  /**
   * 根据平台标识查找用户
   */
  private async findUserByPlatform(platform: LoginPlatform, platformUserId: string): Promise<User | null> {
    // 使用 JSONB 查询查找绑定了该平台的用户
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where("user.user_auths @> :auth", {
        auth: JSON.stringify({ [platform]: true }),
      })
      .getMany();

    return (
      users.find((u) => {
        const authData = u.user_auths?.[platform];
        if (!authData) return false;
        if (platform === LoginPlatform.WECHAT) return authData.openid === platformUserId;
        return authData.userId === platformUserId;
      }) || null
    );
  }

  /**
   * 调用微信 code2session 获取会话信息
   */
  private async getWechatSession(code: string): Promise<WechatSessionResponse> {
    const appid = this.configService.get<string>('WECHAT_APPID');
    const secret = this.configService.get<string>('WECHAT_SECRET');

    if (!appid || !secret) {
      throw new BadRequestException('微信登录服务暂不可用');
    }

    try {
      const { data } = await axios.get<WechatSessionResponse>(
        'https://api.weixin.qq.com/sns/jscode2session',
        {
          params: { appid, secret, js_code: code, grant_type: 'authorization_code' },
        },
      );

      if (data.errcode) {
        throw new BadRequestException(`微信验证失败：${data.errmsg}`);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('调用微信 code2session 接口失败', error);
      throw new BadRequestException('微信服务异常，请稍后重试');
    }
  }

  /**
   * 获取平台中文名称
   */
  private getPlatformName(platform: LoginPlatform): string {
    const names: Record<LoginPlatform, string> = {
      [LoginPlatform.WECHAT]: '微信',
      [LoginPlatform.QQ]: 'QQ',
      [LoginPlatform.DOUYIN]: '抖音',
      [LoginPlatform.PHONE]: '手机号',
      [LoginPlatform.EMAIL]: '邮箱',
      [LoginPlatform.APPLE]: 'Apple',
    };
    return names[platform] || platform;
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 7200; // 默认 2 小时

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
