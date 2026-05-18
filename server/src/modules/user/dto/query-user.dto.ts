import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/** 允许排序的字段白名单 */
const ALLOWED_SORT_FIELDS = [
  'nickname',
  'email',
  'total_check_in_days',
  'streak_days',
  'ai_usage_count',
  'status',
  'created_at',
] as const;

export type UserSortableField = (typeof ALLOWED_SORT_FIELDS)[number];

/**
 * 用户查询 DTO
 */
export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户昵称（模糊搜索）' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '用户状态：0-正常，1-禁用', enum: [0, 1] })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  status?: number;

  @ApiPropertyOptional({ description: '排序字段', enum: ALLOWED_SORT_FIELDS as unknown as string[] })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_SORT_FIELDS as unknown as string[])
  sortField?: UserSortableField;

  @ApiPropertyOptional({ description: '排序方向', enum: ['ascend', 'descend'] })
  @IsOptional()
  @IsString()
  @IsIn(['ascend', 'descend'])
  sortOrder?: 'ascend' | 'descend';
}
