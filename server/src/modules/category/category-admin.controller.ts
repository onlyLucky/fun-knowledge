import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { CategoryService } from './category.service';
import { LogService } from '../log/log.service';
import { recordOperationLog } from '../../common/utils/operation-log.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSortDto } from './dto/update-sort.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';

@ApiTags('管理端-类目')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/category')
export class CategoryAdminController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logService: LogService,
  ) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '获取类目列表（分页）' })
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll({
      page: query.page,
      pageSize: query.pageSize,
      name: query.name,
      status: query.status,
    });
  }

  @Get('enabled')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '获取所有启用类目（不分页）' })
  async findEnabled() {
    return this.categoryService.findEnabled();
  }

  @Post('create')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '创建类目' })
  async create(@Body() dto: CreateCategoryDto, @Req() request: Request) {
    const result = await this.categoryService.create(dto);
    recordOperationLog(this.logService, request, {
      module: 'category',
      action: 'create',
      description: '创建类目',
      targetId: result.id,
    });
    return result;
  }

  @Put('sort')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '更新类目排序' })
  async updateSort(@Body() dto: UpdateSortDto, @Req() request: Request) {
    await this.categoryService.updateSort(dto);
    recordOperationLog(this.logService, request, {
      module: 'category',
      action: 'update',
      description: '更新类目排序',
    });
    return { success: true };
  }

  @Put(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '更新类目' })
  @ApiParam({ name: 'id', description: '类目 UUID' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() request: Request) {
    const result = await this.categoryService.update(id, dto);
    recordOperationLog(this.logService, request, {
      module: 'category',
      action: 'update',
      description: '更新类目',
      targetId: id,
    });
    return result;
  }

  @Put(':id/toggle-status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '切换类目状态（启用/停用）' })
  @ApiParam({ name: 'id', description: '类目 UUID' })
  async toggleStatus(@Param('id') id: string, @Req() request: Request) {
    const result = await this.categoryService.toggleStatus(id);
    recordOperationLog(this.logService, request, {
      module: 'category',
      action: 'update',
      description: `类目状态切换为${result.status === 1 ? '启用' : '停用'}`,
      targetId: id,
    });
    return result;
  }

  @Delete('batch-delete')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '批量删除类目' })
  async removeMany(@Body() dto: BatchDeleteDto, @Req() request: Request) {
    const result = await this.categoryService.removeMany(dto.ids);
    recordOperationLog(this.logService, request, {
      module: 'category',
      action: 'batch_delete',
      description: `批量删除类目 ${result.success} 条`,
    });
    return result;
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '删除类目（软删除）' })
  @ApiParam({ name: 'id', description: '类目 UUID' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    await this.categoryService.remove(id);
    recordOperationLog(this.logService, request, {
      module: 'category',
      action: 'delete',
      description: '删除类目',
      targetId: id,
    });
    return { success: true };
  }
}
