import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsIn, IsEnum, MaxLength } from 'class-validator';
import { ResourceType } from '../../../common/enums/resource-type.enum';

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
}
