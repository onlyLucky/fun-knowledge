import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn, MaxLength } from 'class-validator';

/**
 * 导入知识 DTO - 对应 Excel 每一行
 */
export class ImportKnowledgeDto {
  @ApiProperty({ description: '标题', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '内容描述' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '状态：0-下架，1-上架', enum: [0, 1], default: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiPropertyOptional({ description: '资源类型：image/video/audio/model_3d/webpage' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  resource_type?: string;

  @ApiPropertyOptional({ description: '资源 URL（文件名或 http/https 在线地址）' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resource_url?: string;

  @ApiProperty({ description: '类目名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category_name: string;

  @ApiPropertyOptional({ description: '标签（逗号分隔）' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional({ description: '知识来源', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  source?: string;

  @ApiPropertyOptional({ description: 'AI延伸解读方式：ai_model 或 static_data', enum: ['ai_model', 'static_data'] })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ai_extend_type?: string;

  @ApiPropertyOptional({ description: 'AI延伸解读静态数据（JSON 字符串）' })
  @IsOptional()
  @IsString()
  ai_extend_data?: string;
}
