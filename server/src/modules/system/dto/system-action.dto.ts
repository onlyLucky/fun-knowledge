import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { SystemManageType } from '../../../common/enums/system-manage-type.enum';

export class SystemActionDto {
  @ApiProperty({ description: '操作类型', enum: SystemManageType })
  @IsEnum(SystemManageType)
  type: SystemManageType;

  @ApiPropertyOptional({ description: '操作参数' })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}
