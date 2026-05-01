import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * AI 延伸解读 DTO
 */
export class AiExtendDto {
  @ApiProperty({ description: '知识卡片 ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('4', { message: 'knowledge_id 必须是有效的 UUID' })
  @IsNotEmpty({ message: 'knowledge_id 不能为空' })
  knowledge_id: string;
}
