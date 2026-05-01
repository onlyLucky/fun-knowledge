import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * 管理员登录 DTO
 */
export class AdminLoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: '用户名不能为空' })
  @MinLength(2, { message: '用户名最少 2 个字符' })
  @MaxLength(50, { message: '用户名最多 50 个字符' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'P@ssw0rd123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: '密码不能为空' })
  @MinLength(6, { message: '密码最少 6 个字符' })
  @MaxLength(50, { message: '密码最多 50 个字符' })
  password: string;
}
