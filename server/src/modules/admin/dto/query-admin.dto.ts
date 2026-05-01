import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 管理员查询 DTO
 */
export class QueryAdminDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户名（模糊搜索）' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '角色：1-超管，2-内容，3-运营，4-审核', enum: [1, 2, 3, 4] })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  role?: number;

  @ApiPropertyOptional({ description: '状态：0-正常，1-禁用', enum: [0, 1] })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  status?: number;
}
