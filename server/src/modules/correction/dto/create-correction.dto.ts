import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsIn } from 'class-validator';

/**
 * 创建纠错 DTO
 */
export class CreateCorrectionDto {
  @ApiProperty({ description: '知识卡片 ID' })
  @IsString()
  @IsNotEmpty()
  knowledge_id: string;

  @ApiProperty({ description: '纠错类型', enum: [1, 2, 3, 4] })
  @IsInt()
  @IsIn([1, 2, 3, 4])
  type: number;

  @ApiProperty({ description: '纠错描述' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: '纠错图片 URL 列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
