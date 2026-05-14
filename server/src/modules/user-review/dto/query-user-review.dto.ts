import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询用户信息审核 DTO
 */
export class QueryUserReviewDto extends PaginationDto {
  @ApiPropertyOptional({ description: '审核状态', enum: [0, 1, 2] })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '关键词搜索（用户昵称）' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
