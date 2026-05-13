import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

/**
 * 批量删除 DTO
 */
export class BatchDeleteDto {
  @ApiProperty({ description: '要删除的 ID 列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: '至少选择一条记录' })
  @ArrayMaxSize(100, { message: '单次最多删除 100 条' })
  ids: string[];
}
