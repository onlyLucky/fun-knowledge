import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 创建收藏 DTO
 */
export class CreateFavoriteDto {
  @ApiProperty({ description: '知识卡片 ID' })
  @IsString()
  @IsNotEmpty()
  knowledge_id: string;
}
