import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 推荐反馈 DTO
 */
export class RecommendFeedbackDto {
  @ApiProperty({ description: '知识卡片 ID' })
  @IsString()
  @IsNotEmpty()
  knowledge_id: string;

  @ApiProperty({ description: '是否喜欢', default: true })
  @IsBoolean()
  @Type(() => Boolean)
  is_liked: boolean;
}
