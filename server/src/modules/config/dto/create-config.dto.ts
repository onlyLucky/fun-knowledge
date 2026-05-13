import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ConfigType } from '../../../common/enums/config-type.enum';

export class CreateConfigDto {
  @ApiProperty({ description: '配置键', maxLength: 100, example: 'app_name' })
  @IsString()
  @MaxLength(100)
  config_key: string;

  @ApiProperty({ description: '配置值', example: '冷知识星球' })
  @IsString()
  config_value: string;

  @ApiPropertyOptional({ description: '配置说明', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ description: '配置分组', maxLength: 50, example: 'basic' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  group?: string;

  @ApiPropertyOptional({ description: '配置类型', enum: ConfigType, default: ConfigType.INPUT })
  @IsOptional()
  @IsEnum(ConfigType)
  config_type?: ConfigType;

  @ApiPropertyOptional({
    description: '配置选项 JSON（用于 switch/select 类型）',
    example: '[{"label":"开启","value":"true"},{"label":"关闭","value":"false"}]',
  })
  @IsOptional()
  @IsString()
  options?: string;
}
