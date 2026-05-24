import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * 修改密码 DTO
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldPassword123',
  })
  @IsString({ message: '当前密码不能为空' })
  oldPassword: string;

  @ApiProperty({
    description: '新密码（6-20位）',
    example: 'newPassword456',
  })
  @IsString({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码最少 6 个字符' })
  @MaxLength(20, { message: '新密码最多 20 个字符' })
  newPassword: string;
}
