import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

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
}
