import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询打卡历史 DTO
 */
export class QueryCheckInDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '月份筛选，格式：YYYY-MM',
    example: '2026-05',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '月份格式必须为 YYYY-MM' })
  month?: string;
}
