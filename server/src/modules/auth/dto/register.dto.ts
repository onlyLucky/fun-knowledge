import {
  IsEnum,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  ValidateIf,
  Matches,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RegisterPlatform {
  PHONE = 'phone',
  EMAIL = 'email',
}

export class RegisterDto {
  @ApiProperty({ description: '注册平台', enum: RegisterPlatform })
  @IsEnum(RegisterPlatform)
  platform: RegisterPlatform;

  @ApiProperty({ description: '昵称', example: '知识探索者' })
  @IsString()
  @MinLength(2, { message: '昵称至少 2 个字符' })
  @MaxLength(20, { message: '昵称最多 20 个字符' })
  nickname: string;

  // 手机号注册
  @ApiProperty({ description: '手机号', required: false })
  @ValidateIf((o) => o.platform === RegisterPlatform.PHONE)
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
  phone?: string;

  @ApiProperty({ description: '短信验证码', required: false })
  @ValidateIf((o) => o.platform === RegisterPlatform.PHONE)
  @IsString()
  @Length(6, 6, { message: '验证码为 6 位' })
  smsCode?: string;

  // 邮箱注册
  @ApiProperty({ description: '邮箱', required: false })
  @ValidateIf((o) => o.platform === RegisterPlatform.EMAIL)
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email?: string;

  @ApiProperty({ description: '密码', required: false })
  @ValidateIf((o) => o.platform === RegisterPlatform.EMAIL)
  @MinLength(6, { message: '密码至少 6 位' })
  @MaxLength(50, { message: '密码最多 50 位' })
  password?: string;
}
