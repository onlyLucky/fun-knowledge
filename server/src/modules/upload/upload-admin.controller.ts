import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { UploadService } from './upload.service';
import { UploadType } from './dto/upload.dto';

@ApiTags('管理端-文件上传')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/upload')
export class UploadAdminController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.OPERATIONS)
  @ApiOperation({
    summary: '上传文件（管理端）',
    description: '上传头像或知识卡片资源文件。头像支持图片格式（最大 3MB）；知识卡片支持图片/视频/3D模型等，大小限制可在后台配置。',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文件',
        },
      },
    },
  })
  @ApiQuery({
    name: 'type',
    enum: UploadType,
    description: '上传类型：avatar（头像）或 knowledge（知识卡片资源）',
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Query('type') type: UploadType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.upload(file, type);
  }
}
