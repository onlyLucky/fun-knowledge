import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 排序项
 */
export class SortItemDto {
  @ApiProperty({ description: '类目 UUID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '排序序号', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sort_order: number;
}

/**
 * 更新排序 DTO
 */
export class UpdateSortDto {
  @ApiProperty({ description: '排序列表', type: [SortItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortItemDto)
  items: SortItemDto[];
}
