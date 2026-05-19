import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 创建浏览历史 DTO
 */
export class CreateBrowseHistoryDto {
  @ApiProperty({ description: '知识卡片 ID' })
  @IsString()
  @IsNotEmpty({ message: '知识卡片 ID 不能为空' })
  knowledge_id: string;
}
