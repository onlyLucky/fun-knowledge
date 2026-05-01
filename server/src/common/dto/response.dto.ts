import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一响应 DTO
 */
export class ResponseDto<T> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '消息', example: 'success' })
  message: string;

  @ApiProperty({ description: '数据' })
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = 'success'): ResponseDto<T> {
    return new ResponseDto(200, message, data);
  }

  static error(message: string, code = 400): ResponseDto<null> {
    return new ResponseDto(code, message, null);
  }
}
