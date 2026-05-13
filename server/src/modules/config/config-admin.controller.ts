import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { ConfigService } from './config.service';
import { LogService } from '../log/log.service';
import { recordOperationLog } from '../../common/utils/operation-log.util';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';

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
    const result = await this.configService.update(
      dto.config_key,
      dto.config_value,
      dto.description,
      dto.config_type,
      dto.options,
    );
    recordOperationLog(this.logService, request, {
      module: 'config',
      action: 'update',
      description: '更新系统配置',
    });
    return result;
  }

  @Post('create')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '新增配置项' })
  async create(@Body() dto: CreateConfigDto, @Req() request: Request) {
    const result = await this.configService.create(dto);
    recordOperationLog(this.logService, request, {
      module: 'config',
      action: 'create',
      description: '新增配置项',
      targetId: result.id,
    });
    return result;
  }

  @Delete('batch-delete')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '批量删除配置项' })
  async removeMany(@Body() dto: BatchDeleteDto, @Req() request: Request) {
    const result = await this.configService.removeMany(dto.ids);
    recordOperationLog(this.logService, request, {
      module: 'config',
      action: 'batch_delete',
      description: `批量删除配置项 ${result.success} 条`,
    });
    return result;
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除配置项' })
  @ApiParam({ name: 'id', description: '配置项 UUID' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    await this.configService.remove(id);
    recordOperationLog(this.logService, request, {
      module: 'config',
      action: 'delete',
      description: '删除配置项',
      targetId: id,
    });
    return { success: true };
  }

  @Get('groups')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有配置分组' })
  async findGroups() {
    return this.configService.findGroups();
  }
}
