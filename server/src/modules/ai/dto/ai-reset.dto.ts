import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class AiResetDto {
  @ApiProperty({
    description: '每日 AI 使用限额，-1 表示不限制。不传则仅重置使用次数',
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  daily_limit?: number;
}
