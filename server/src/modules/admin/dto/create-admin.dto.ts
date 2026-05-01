import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建管理员 DTO
 */
export class CreateAdminDto {
  @ApiProperty({ description: '用户名', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  password: string;

  @ApiPropertyOptional({ description: '真实姓名', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  real_name?: string;

  @ApiProperty({ description: '角色：1-超管，2-内容，3-运营，4-审核', enum: [1, 2, 3, 4] })
  @IsNumber()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  role: number;
}
