import { Controller, Get, Put, Delete, Param, Body, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { UserService } from './user.service';
import { LogService } from '../log/log.service';
import { recordOperationLog } from '../../common/utils/operation-log.util';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('管理端-用户')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

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

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  async remove(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    await this.userService.remove(id);
    recordOperationLog(this.logService, request, {
      module: 'user',
      action: 'delete',
      description: '删除用户',
      targetId: id,
    });
    return { code: 0, message: '删除成功' };
  }

  @Put(':id/status')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新用户状态' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() request: Request,
  ) {
    const result = await this.userService.updateStatus(id, dto);
    recordOperationLog(this.logService, request, {
      module: 'user',
      action: 'update',
      description: '更新用户状态',
      targetId: id,
    });
    return result;
  }
}
