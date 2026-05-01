import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ description: '图片文件名（对应压缩包内图片）' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_name?: string;

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
}
