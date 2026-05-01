import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/query-log.dto';

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
}
