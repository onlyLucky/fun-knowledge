import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { RequestAdmin } from '../../common/interfaces/request.interface';
import { ImportService } from './import.service';

@ApiTags('管理端-知识导入')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/knowledge')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('import')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '批量导入知识（上传 ZIP 压缩包）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'ZIP 压缩包（内含 Excel + resources/ 文件夹）',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async startImport(
    @CurrentUser() admin: RequestAdmin,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('请上传 ZIP 压缩包');
    }
    // 校验 MIME 类型
    const allowedMimes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 ZIP 格式的压缩包');
    }
    return this.importService.startImport(admin.id, file);
  }

  @Get('template')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '下载导入模板' })
  async getTemplate(@Res() res: Response) {
    const buffer = this.importService.getTemplate();
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=import-template.zip',
    });
    res.send(buffer);
  }

  @Get('import/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '查询导入任务状态' })
  @ApiParam({ name: 'id', description: '导入任务 UUID' })
  async getImportStatus(@Param('id') id: string) {
    return this.importService.getImportStatus(id);
  }
}
