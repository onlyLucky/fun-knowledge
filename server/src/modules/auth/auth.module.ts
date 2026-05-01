import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../user/entities/user.entity';
import { Admin } from '../admin/entities/admin.entity';

import { AuthController } from './auth.controller';
import { AuthAdminController } from './auth-admin.controller';

import { AuthService } from './auth.service';
import { AuthAdminService } from './auth-admin.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

/**
 * 认证模块
 *
 * 提供客户端和管理端的认证功能：
 * - 客户端：多平台登录（微信/QQ/抖音/手机号/邮箱/Apple）
 * - 管理端：用户名密码登录
 * - JWT 令牌管理（Access Token + Refresh Token）
 * - 平台账号绑定/解绑
 */
@Module({
  imports: [
    // TypeORM 实体注册
    TypeOrmModule.forFeature([User, Admin]),

    // Passport 认证框架
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT 令牌模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '2h'),
        },
      }),
    }),
  ],
  controllers: [AuthController, AuthAdminController],
  providers: [AuthService, AuthAdminService, JwtStrategy, AdminJwtStrategy],
  exports: [AuthService, AuthAdminService, JwtModule],
})
export class AuthModule {}
