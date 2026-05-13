import { Controller, Get, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/query-log.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';

@ApiTags('管理端-日志')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS)
  @ApiOperation({ summary: '获取操作日志列表' })
  async findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @Delete('batch-delete')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '批量删除操作日志（仅超管）' })
  async removeMany(@Body() dto: BatchDeleteDto) {
    return this.logService.removeMany(dto.ids);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除操作日志（仅超管）' })
  @ApiParam({ name: 'id', description: '日志 ID' })
  async remove(@Param('id') id: string) {
    await this.logService.remove(id);
    return { success: true };
  }
}
