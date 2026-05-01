import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, ValidateIf } from 'class-validator';
import { LoginPlatform } from '../../../common/enums/status.enum';

/**
 * 绑定平台账号 DTO
 */
export class BindPlatformDto {
  @ApiProperty({
    description: '登录平台',
    enum: LoginPlatform,
    example: LoginPlatform.QQ,
  })
  @IsEnum(LoginPlatform, { message: '不支持的登录平台' })
  platform: LoginPlatform;

  @ApiPropertyOptional({
    description: '授权码（微信/QQ/抖音/Apple 绑定时必填）',
    example: '0a1b2c3d4e5f',
  })
  @ValidateIf((o) => [LoginPlatform.WECHAT, LoginPlatform.QQ, LoginPlatform.DOUYIN, LoginPlatform.APPLE].includes(o.platform))
  @IsString({ message: '授权码不能为空' })
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: '手机号（手机号绑定时必填）',
    example: '13800138000',
  })
  @ValidateIf((o) => o.platform === LoginPlatform.PHONE)
  @IsString({ message: '手机号不能为空' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: '邮箱（邮箱绑定时必填）',
    example: 'user@example.com',
  })
  @ValidateIf((o) => o.platform === LoginPlatform.EMAIL)
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: '密码（邮箱绑定时必填）',
    example: 'P@ssw0rd123',
  })
  @ValidateIf((o) => o.platform === LoginPlatform.EMAIL)
  @IsString({ message: '密码不能为空' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: '短信验证码（手机号绑定时必填）',
    example: '123456',
  })
  @ValidateIf((o) => o.platform === LoginPlatform.PHONE)
  @IsString({ message: '验证码不能为空' })
  @IsOptional()
  smsCode?: string;
}
