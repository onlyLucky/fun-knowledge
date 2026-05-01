import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * 更新系统配置 DTO
 */
export class UpdateConfigDto {
  @ApiProperty({ description: '配置键', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  config_key: string;

  @ApiProperty({ description: '配置值' })
  @IsString()
  config_value: string;

  @ApiPropertyOptional({ description: '配置说明', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
