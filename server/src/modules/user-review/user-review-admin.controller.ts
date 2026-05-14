import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { RequestAdmin } from '../../common/interfaces/request.interface';
import { UserReviewAdminService } from './user-review-admin.service';
import { QueryUserReviewDto } from './dto/query-user-review.dto';
import { ReviewUserReviewDto } from './dto/review-user-review.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';
import { LogService } from '../log/log.service';
import { recordOperationLog } from '../../common/utils/operation-log.util';

@ApiTags('管理端-用户信息审核')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/user-review')
export class UserReviewAdminController {
  constructor(
    private readonly userReviewAdminService: UserReviewAdminService,
    private readonly logService: LogService,
  ) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '获取审核列表' })
  async findAll(@Query() query: QueryUserReviewDto) {
    return this.userReviewAdminService.findAll(query);
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '获取审核详情' })
  @ApiParam({ name: 'id', description: '审核记录 UUID' })
  async findOne(@Param('id') id: string) {
    return this.userReviewAdminService.findOne(id);
  }

  @Put(':id/review')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '审核（通过/驳回）' })
  @ApiParam({ name: 'id', description: '审核记录 UUID' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewUserReviewDto,
    @CurrentUser() admin: RequestAdmin,
    @Req() request: Request,
  ) {
    const result = await this.userReviewAdminService.review(id, dto, admin.id);
    recordOperationLog(this.logService, request, {
      module: 'user-review',
      action: 'review',
      description: `用户信息审核${dto.status === 1 ? '通过' : '驳回'}`,
      targetId: id,
    });
    return result;
  }

  @Delete('batch-delete')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '批量删除审核记录' })
  async removeMany(@Body() dto: BatchDeleteDto, @Req() request: Request) {
    const result = await this.userReviewAdminService.removeMany(dto.ids);
    recordOperationLog(this.logService, request, {
      module: 'user-review',
      action: 'batch_delete',
      description: `批量删除审核记录 ${result.success} 条`,
    });
    return result;
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除审核记录' })
  @ApiParam({ name: 'id', description: '审核记录 UUID' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    await this.userReviewAdminService.remove(id);
    recordOperationLog(this.logService, request, {
      module: 'user-review',
      action: 'delete',
      description: '删除审核记录',
      targetId: id,
    });
    return { success: true };
  }
}
