import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';

@ApiTags('管理端-管理员')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取管理员列表（仅超管）' })
  async findAll(@Query() query: QueryAdminDto) {
    return this.adminService.findAll(query);
  }

  @Post('create')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '创建管理员（仅超管）' })
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Put(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新管理员（仅超管）' })
  @ApiParam({ name: 'id', description: '管理员 UUID' })
  async update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(id, dto);
  }

  @Put(':id/status')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新管理员状态（仅超管）' })
  @ApiParam({ name: 'id', description: '管理员 UUID' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: number,
  ) {
    return this.adminService.updateStatus(id, status);
  }
}
