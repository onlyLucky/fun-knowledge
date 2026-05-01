import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsIn, IsOptional, IsString } from 'class-validator';

/**
 * 审核纠错 DTO
 */
export class ReviewCorrectionDto {
  @ApiPropertyOptional({ description: '审核状态', enum: [1, 2] })
  @IsInt()
  @IsIn([1, 2])
  status: number;

  @ApiPropertyOptional({ description: '审核备注' })
  @IsOptional()
  @IsString()
  review_remark?: string;
}
