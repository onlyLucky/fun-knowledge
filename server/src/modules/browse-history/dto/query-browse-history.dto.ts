import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询浏览历史 DTO
 */
export class QueryBrowseHistoryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键词（模糊搜索标题和内容）' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
