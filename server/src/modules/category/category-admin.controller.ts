import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LogOperation } from '../../common/decorators/log-operation.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSortDto } from './dto/update-sort.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';

@ApiTags('管理端-类目')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/category')
export class CategoryAdminController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '获取类目列表' })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Post('create')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'category', action: 'create', description: '创建类目' })
  @ApiOperation({ summary: '创建类目' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put('sort')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'category', action: 'update', description: '更新类目排序' })
  @ApiOperation({ summary: '更新类目排序' })
  async updateSort(@Body() dto: UpdateSortDto) {
    await this.categoryService.updateSort(dto);
    return { success: true };
  }

  @Put(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'category', action: 'update', description: '更新类目' })
  @ApiOperation({ summary: '更新类目' })
  @ApiParam({ name: 'id', description: '类目 UUID' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'category', action: 'delete', description: '删除类目' })
  @ApiOperation({ summary: '删除类目（软删除）' })
  @ApiParam({ name: 'id', description: '类目 UUID' })
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return { success: true };
  }

  @Delete('batch-delete')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'category', action: 'batch_delete', description: '批量删除类目' })
  @ApiOperation({ summary: '批量删除类目' })
  async removeMany(@Body() dto: BatchDeleteDto) {
    return this.categoryService.removeMany(dto.ids);
  }
}
