import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/** 允许排序的字段白名单 */
const ALLOWED_SORT_FIELDS = [
  'title',
  'view_count',
  'created_at',
  'sort_weight',
  'favorite_count',
  'correction_count',
  'ai_extend_count',
  'quality_score',
  'weight',
] as const;

export type SortableField = (typeof ALLOWED_SORT_FIELDS)[number];

/**
 * 查询知识卡片 DTO
 */
export class QueryKnowledgeDto extends PaginationDto {
  @ApiPropertyOptional({ description: '标题（模糊搜索）' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '关键词（模糊搜索标题和内容）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '类目 ID' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: '状态', enum: [0, 1] })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: number;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    enum: ALLOWED_SORT_FIELDS as unknown as string[],
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  sortField?: SortableField;

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['ascend', 'descend'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ascend', 'descend'])
  sortOrder?: 'ascend' | 'descend';
}
