import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 更新用户状态 DTO
 */
export class UpdateUserStatusDto {
  @ApiProperty({ description: '用户状态：0-正常，1-禁用', enum: [0, 1] })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  status: number;
}
