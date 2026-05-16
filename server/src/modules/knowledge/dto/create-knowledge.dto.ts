import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsIn, IsEnum, MaxLength, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '../../../common/enums/resource-type.enum';
import { AiExtendType } from '../../../common/enums/ai-extend-type.enum';
import { AiExtendItemDto } from './ai-extend-item.dto';

/**
 * 创建知识卡片 DTO
 */
export class CreateKnowledgeDto {
  @ApiProperty({ description: '标题', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '内容描述' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '资源 URL', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resource_url?: string;

  @ApiPropertyOptional({ description: '资源类型', enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  resource_type?: ResourceType;

  @ApiProperty({ description: '类目 ID' })
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @ApiPropertyOptional({ description: '标签列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '知识来源', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source?: string;

  @ApiPropertyOptional({ description: '状态', enum: [0, 1], default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiPropertyOptional({ description: '排序权重', default: 0 })
  @IsOptional()
  @IsInt()
  sort_weight?: number;

  @ApiPropertyOptional({ description: '运营权重 (-2 到 2)', default: 0, minimum: -2, maximum: 2 })
  @IsOptional()
  @IsInt()
  @Min(-2)
  @Max(2)
  weight?: number;

  @ApiPropertyOptional({ description: 'AI延伸解读方式', enum: AiExtendType, default: AiExtendType.AI_MODEL })
  @IsOptional()
  @IsEnum(AiExtendType)
  ai_extend_type?: AiExtendType;

  @ApiPropertyOptional({ description: 'AI延伸解读静态数据', type: [AiExtendItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiExtendItemDto)
  ai_extend_data?: AiExtendItemDto[];
}
