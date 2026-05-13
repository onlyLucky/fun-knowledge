import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { ConfigService } from './config.service';
import { LogService } from '../log/log.service';
import { recordOperationLog } from '../../common/utils/operation-log.util';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('管理端-系统配置')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/config')
export class ConfigAdminController {
  constructor(
    private readonly configService: ConfigService,
    private readonly logService: LogService,
  ) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有系统配置' })
  async findAll() {
    return this.configService.findAll();
  }

  @Put('update')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新系统配置' })
  async update(@Body() dto: UpdateConfigDto, @Req() request: Request) {
    const result = await this.configService.update(dto.config_key, dto.config_value, dto.description);
    recordOperationLog(this.logService, request, {
      module: 'config',
      action: 'update',
      description: '更新系统配置',
    });
    return result;
  }
}
