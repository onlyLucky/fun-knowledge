import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogOperation } from '../../common/decorators/log-operation.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { KnowledgeAdminService } from './knowledge-admin.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';
import { RequestAdmin } from '../../common/interfaces/request.interface';

@ApiTags('管理端-知识卡片')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/knowledge')
export class KnowledgeAdminController {
  constructor(private readonly knowledgeAdminService: KnowledgeAdminService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.OPERATIONS)
  @ApiOperation({ summary: '获取知识卡片列表' })
  async findAll(@Query() query: QueryKnowledgeDto) {
    return this.knowledgeAdminService.findAll(query);
  }

  @Post('create')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'knowledge', action: 'create', description: '创建知识卡片' })
  @ApiOperation({ summary: '创建知识卡片' })
  async create(@Body() dto: CreateKnowledgeDto, @CurrentUser() admin: RequestAdmin) {
    return this.knowledgeAdminService.create(dto, admin.id);
  }

  @Put(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'knowledge', action: 'update', description: '更新知识卡片' })
  @ApiOperation({ summary: '更新知识卡片' })
  @ApiParam({ name: 'id', description: '知识卡片 UUID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeDto,
    @CurrentUser() admin: RequestAdmin,
  ) {
    return this.knowledgeAdminService.update(id, dto, admin.id);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'knowledge', action: 'delete', description: '删除知识卡片' })
  @ApiOperation({ summary: '删除知识卡片' })
  @ApiParam({ name: 'id', description: '知识卡片 UUID' })
  async remove(@Param('id') id: string) {
    return this.knowledgeAdminService.remove(id);
  }

  @Delete('batch-delete')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @LogOperation({ module: 'knowledge', action: 'batch_delete', description: '批量删除知识卡片' })
  @ApiOperation({ summary: '批量删除知识卡片' })
  async removeMany(@Body() dto: BatchDeleteDto) {
    return this.knowledgeAdminService.removeMany(dto.ids);
  }

  @Put(':id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN)
  @ApiOperation({ summary: '切换知识卡片状态（上架/下架）' })
  @ApiParam({ name: 'id', description: '知识卡片 UUID' })
  async toggleStatus(@Param('id') id: string, @CurrentUser() admin: RequestAdmin) {
    return this.knowledgeAdminService.toggleStatus(id, admin.id);
  }
}
