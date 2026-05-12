import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UploadType } from './dto/upload.dto';

@ApiTags('文件上传')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({
    summary: '上传文件（客户端）',
    description: '客户端用户上传头像等文件',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文件（图片格式，最大 3MB）',
        },
      },
    },
  })
  @ApiQuery({
    name: 'type',
    enum: UploadType,
    description: '上传类型（客户端仅支持 avatar）',
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Query('type') type: UploadType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (type !== UploadType.AVATAR) {
      throw new BadRequestException('客户端仅支持头像上传');
    }
    return this.uploadService.upload(file, type);
  }
}
