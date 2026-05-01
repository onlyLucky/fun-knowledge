import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * 更新用户资料 DTO
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: '用户昵称',
    example: '冷知识达人',
    maxLength: 50,
  })
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(50, { message: '昵称最多 50 个字符' })
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    description: '头像 URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 500,
  })
  @IsString({ message: '头像必须是字符串' })
  @MaxLength(500, { message: '头像 URL 最多 500 个字符' })
  @IsOptional()
  avatar?: string;
}
