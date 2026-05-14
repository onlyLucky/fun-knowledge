import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

/**
 * 审核用户信息 DTO
 */
export class ReviewUserReviewDto {
  @ApiProperty({ description: '审核状态', enum: [1, 2] })
  @IsInt()
  @IsIn([1, 2])
  status: number;

  @ApiPropertyOptional({ description: '审核备注' })
  @IsOptional()
  @IsString()
  review_remark?: string;
}
