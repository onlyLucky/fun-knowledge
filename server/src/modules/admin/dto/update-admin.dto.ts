import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 更新管理员 DTO
 */
export class UpdateAdminDto {
  @ApiPropertyOptional({ description: '用户名', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ description: '密码', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @ApiPropertyOptional({ description: '真实姓名', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  real_name?: string;

  @ApiPropertyOptional({ description: '角色：1-超管，2-内容，3-运营，4-审核', enum: [1, 2, 3, 4] })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  role?: number;
}
