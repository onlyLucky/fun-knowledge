import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建类目 DTO
 */
export class CreateCategoryDto {
  @ApiProperty({ description: '类目名称', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '类目图标 URL', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  icon?: string;

  @ApiPropertyOptional({ description: '类目描述', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ description: '排序序号', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sort_order?: number;

  @ApiPropertyOptional({ description: '运营权重 (-2 到 2)', default: 0, minimum: -2, maximum: 2 })
  @IsOptional()
  @IsInt()
  @Min(-2)
  @Max(2)
  weight?: number;
}
