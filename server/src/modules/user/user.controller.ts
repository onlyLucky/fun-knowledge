import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LogOperation } from '../../common/decorators/log-operation.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { UserService } from './user.service';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('管理端-用户')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.OPERATIONS)
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.OPERATIONS)
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id/status')
  @Roles(AdminRole.SUPER_ADMIN)
  @LogOperation({ module: 'user', action: 'update', description: '更新用户状态' })
  @ApiOperation({ summary: '更新用户状态' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.userService.updateStatus(id, dto);
  }
}
