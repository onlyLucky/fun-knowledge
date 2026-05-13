import {
  Controller,
  Get,
  Put,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { CorrectionAdminService } from './correction-admin.service';
import { LogService } from '../log/log.service';
import { recordOperationLog } from '../../common/utils/operation-log.util';
import { QueryCorrectionDto } from './dto/query-correction.dto';
import { ReviewCorrectionDto } from './dto/review-correction.dto';
import { RequestAdmin } from '../../common/interfaces/request.interface';

@ApiTags('管理端-纠错')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/correction')
export class CorrectionAdminController {
  constructor(
    private readonly correctionAdminService: CorrectionAdminService,
    private readonly logService: LogService,
  ) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '获取所有纠错列表' })
  async findAll(@Query() query: QueryCorrectionDto) {
    return this.correctionAdminService.findAll(query);
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '获取纠错详情' })
  @ApiParam({ name: 'id', description: '纠错 UUID' })
  async findOne(@Param('id') id: string) {
    return this.correctionAdminService.findOne(id);
  }

  @Put(':id/review')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '审核纠错' })
  @ApiParam({ name: 'id', description: '纠错 UUID' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewCorrectionDto,
    @CurrentUser() admin: RequestAdmin,
    @Req() request: Request,
  ) {
    const result = await this.correctionAdminService.review(id, dto, admin.id);
    recordOperationLog(this.logService, request, {
      module: 'correction',
      action: 'review',
      description: '审核纠错',
      targetId: id,
    });
    return result;
  }
}
