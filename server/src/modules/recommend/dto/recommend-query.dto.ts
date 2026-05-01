import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 推荐查询 DTO
 */
export class RecommendQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '类目 ID' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: '是否刷新（忽略去重）', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  refresh?: boolean;
}
