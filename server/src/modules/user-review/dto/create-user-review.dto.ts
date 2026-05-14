import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * 创建用户信息审核 DTO
 */
export class CreateUserReviewDto {
  @ApiPropertyOptional({ description: '新昵称', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '新头像 URL', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ description: '新个性签名', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  signature?: string;
}
