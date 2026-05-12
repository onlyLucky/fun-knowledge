import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/**
 * 上传类型枚举
 */
export enum UploadType {
  AVATAR = 'avatar',
  KNOWLEDGE = 'knowledge',
}

/**
 * 上传类型查询参数 DTO
 */
export class UploadQueryDto {
  @ApiProperty({ description: '上传类型', enum: UploadType })
  @IsEnum(UploadType, { message: 'type 必须是 avatar 或 knowledge' })
  type: UploadType;
}

/**
 * 上传响应 DTO
 */
export class UploadResponseDto {
  @ApiProperty({ description: '文件访问 URL' })
  url: string;

  @ApiProperty({ description: '资源类型（knowledge 类型时返回）', required: false })
  resource_type?: string;
}
