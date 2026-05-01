import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

/**
 * AI 图片识别 DTO
 */
export class AiImageDto {
  @ApiProperty({
    description: '图片 URL',
    example: 'https://example.com/image.jpg',
  })
  @IsUrl({}, { message: 'image_url 必须是有效的 URL' })
  @IsNotEmpty({ message: 'image_url 不能为空' })
  image_url: string;
}
