import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询纠错 DTO
 */
export class QueryCorrectionDto extends PaginationDto {
  @ApiPropertyOptional({ description: '审核状态', enum: [0, 1, 2] })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '关键词（搜索知识标题或纠错描述）' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
