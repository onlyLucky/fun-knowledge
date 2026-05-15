import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, Min } from 'class-validator';

/**
 * 行为上报 DTO
 */
export class BehaviorReportDto {
  @ApiProperty({ description: '知识卡片 ID' })
  @IsString()
  @IsNotEmpty()
  knowledge_id: string;

  @ApiProperty({ description: '行为类型', enum: ['browse', 'favorite', 'ai_extend'] })
  @IsString()
  @IsIn(['browse', 'favorite', 'ai_extend'])
  action: 'browse' | 'favorite' | 'ai_extend';

  @ApiPropertyOptional({ description: '浏览时长（秒），仅 browse 时有效' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  browse_duration?: number;
}
